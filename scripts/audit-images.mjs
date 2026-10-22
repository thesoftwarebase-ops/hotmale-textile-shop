/**
 * Image audit — the WebP gate.
 *
 * The CMS upload route refuses anything that is not a real WebP, but
 * files can still be pushed straight into ImageKit from its own
 * dashboard. This script is the safety net: it checks every image value
 * in the database (and every asset in /public) and reports anything
 * that is not WebP, so nothing non-WebP reaches the site or our own
 * storage later.
 *
 * Usage: npm run cms:audit-images
 */
import { MongoClient } from "mongodb";
import { readdir, readFile, stat } from "node:fs/promises";
import { join, relative } from "node:path";

const IMAGE_KEYS = new Set([
  "image",
  "photo",
  "src",
  "logo",
  "defaultImage",
  "gallery",
  "posters",
]);

const issues = [];
const checked = { values: 0, remote: 0, local: 0, files: 0 };

function isWebpBuffer(buffer) {
  if (!buffer || buffer.length < 12) return false;
  return (
    buffer.toString("ascii", 0, 4) === "RIFF" &&
    buffer.toString("ascii", 8, 12) === "WEBP"
  );
}

function collect(value, path, out) {
  if (typeof value === "string") {
    if (IMAGE_KEYS.has(path.split(".").pop())) out.push({ path, value });
    return;
  }
  if (Array.isArray(value)) {
    value.forEach((item, index) => collect(item, `${path}.${index}`, out));
    return;
  }
  if (value && typeof value === "object") {
    for (const [key, child] of Object.entries(value)) {
      collect(child, path ? `${path}.${key}` : key, out);
    }
  }
}

async function checkRemote(url, path) {
  const imageKitMatch = url.match(
    /^https:\/\/ik\.imagekit\.io\/[^/]+\/(.+?)(\?|$)/,
  );

  // ImageKit transforms on delivery (it may hand back JPEG even for a
  // WebP original), so the *stored* file is what we check.
  if (imageKitMatch && process.env.IMAGEKIT_PRIVATE_KEY) {
    try {
      const basic = Buffer.from(
        `${process.env.IMAGEKIT_PRIVATE_KEY}:`,
      ).toString("base64");
      const filePath = `/${imageKitMatch[1]}`;
      const listing = await (
        await fetch(
          `https://api.imagekit.io/v1/files?path=${encodeURIComponent(
            filePath.replace(/\/[^/]+$/, ""),
          )}&limit=200`,
          { headers: { Authorization: `Basic ${basic}` } },
        )
      ).json();
      const name = filePath.split("/").pop();
      const file = (listing ?? []).find((entry) => entry.name === name);
      if (!file) {
        issues.push({
          where: path,
          value: url,
          reason: "file is not in the ImageKit folder",
        });
        return;
      }
      if (file.mime !== "image/webp") {
        issues.push({
          where: path,
          value: url,
          reason: `stored as ${file.mime} (not WebP)`,
        });
      }
    } catch (error) {
      issues.push({
        where: path,
        value: url,
        reason: `could not verify: ${error.message}`,
      });
    }
    return;
  }

  try {
    const response = await fetch(url, { method: "GET" });
    const type = response.headers.get("content-type") ?? "";
    const bytes = Buffer.from(await response.arrayBuffer());
    if (!isWebpBuffer(bytes)) {
      issues.push({
        where: path,
        value: url,
        reason: `served as ${type || "unknown"} (not WebP)`,
      });
    }
  } catch (error) {
    issues.push({ where: path, value: url, reason: `unreachable: ${error.message}` });
  }
}

async function checkLocal(value, path) {
  const file = join(process.cwd(), "public", value.replace(/^\/+/, ""));
  try {
    const info = await stat(file);
    if (info.size === 0) {
      issues.push({ where: path, value, reason: "file is empty" });
      return;
    }
    const handle = await readFile(file);
    if (!isWebpBuffer(handle)) {
      issues.push({ where: path, value, reason: "file is not WebP" });
    }
  } catch {
    issues.push({ where: path, value, reason: "file is missing from /public" });
  }
}

async function auditFolder(folder) {
  for (const entry of await readdir(folder, { withFileTypes: true })) {
    const full = join(folder, entry.name);
    if (entry.isDirectory()) {
      // App icons (favicons, manifest art) are PNG by specification and
      // are not content images.
      if (entry.name === "favicon") continue;
      await auditFolder(full);
      continue;
    }
    if (!/\.(png|jpe?g|gif|avif|bmp|tiff?)$/i.test(entry.name)) continue;
    checked.files += 1;
    issues.push({
      where: relative(process.cwd(), full),
      value: entry.name,
      reason: "non-WebP asset sitting in /public",
    });
  }
}

async function main() {
  const client = new MongoClient(process.env.MONGODB_URI);
  await client.connect();
  const db = client.db(process.env.MONGODB_DB || "hotmale");

  const values = [];
  for (const doc of await db.collection("site_content").find({}).toArray()) {
    collect(doc.value, doc._id, values);
  }
  for (const name of ["categories", "collections", "products", "stores"]) {
    for (const doc of await db.collection(name).find({}).toArray()) {
      collect(doc, `${name}:${doc.name ?? doc.slug}`, values);
    }
  }

  for (const entry of values) {
    checked.values += 1;
    if (entry.value.startsWith("http")) {
      checked.remote += 1;
      await checkRemote(entry.value, entry.path);
    } else {
      checked.local += 1;
      await checkLocal(entry.value, entry.path);
    }
  }

  await auditFolder(join(process.cwd(), "public"));
  await client.close();

  console.log(
    JSON.stringify(
      {
        checked,
        issues,
        result: issues.length === 0 ? "all images are WebP" : "fix the issues above",
      },
      null,
      2,
    ),
  );

  process.exit(issues.length === 0 ? 0 : 1);
}

main().catch((error) => {
  console.error("Image audit failed:", error.message);
  process.exit(1);
});
