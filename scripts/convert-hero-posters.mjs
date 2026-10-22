/**
 * One-off maintenance: push the pristine local hero WebPs through the CMS
 * upload gate with clean names, point the homepage at them, and remove
 * every other file from the ImageKit hero folder.
 *
 * Usage: node --env-file-if-exists=.env.local scripts/convert-hero-posters.mjs
 */
import { MongoClient } from "mongodb";
import { SignJWT } from "jose";
import { randomBytes } from "node:crypto";
import { readFile } from "node:fs/promises";

const base = "http://localhost:3000";
const client = new MongoClient(process.env.MONGODB_URI);
await client.connect();
const db = client.db(process.env.MONGODB_DB || "hotmale");
const user = await db.collection("admin_users").findOne({ status: "active" });

const token = await new SignJWT({
  role: user.role,
  ver: Number.isInteger(user.tokenVersion) ? user.tokenVersion : 0,
})
  .setProtectedHeader({ alg: "HS256", typ: "JWT" })
  .setSubject(String(user._id))
  .setIssuer("hotmale-cms")
  .setAudience("hotmale-admin")
  .setJti(randomBytes(16).toString("hex"))
  .setIssuedAt()
  .setExpirationTime("1h")
  .sign(new TextEncoder().encode(process.env.AUTH_JWT_SECRET));

const basic = Buffer.from(`${process.env.IMAGEKIT_PRIVATE_KEY}:`).toString(
  "base64",
);
const kitHeaders = { Authorization: `Basic ${basic}` };

async function api(path, init = {}) {
  const response = await fetch(`${base}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(init.body ? { "Content-Type": "application/json" } : {}),
    },
  });
  return {
    status: response.status,
    body: await response.json().catch(() => null),
  };
}

const doc = await db.collection("site_content").findOne({ _id: "homepage" });
const posters = doc.value.hero.posters ?? [];

// 1. upload the pristine local WebPs
const uploaded = [];
for (const poster of posters) {
  const number = poster.src.match(/hero-?(\d)/)?.[1] ?? "1";
  const name = `hero-${number}`;
  const bytes = await readFile(`public/hero/${name}.webp`);

  const form = new FormData();
  form.append("file", new Blob([bytes], { type: "image/webp" }), `${name}.webp`);
  form.append("section", "hero");

  const response = await fetch(`${base}/api/admin/uploads`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: form,
  });
  const payload = await response.json();
  if (!response.ok || !payload.ok) {
    throw new Error(`Upload failed for ${name}: ${JSON.stringify(payload)}`);
  }
  uploaded.push({ alt: poster.alt, url: payload.url, name: payload.name });
}

// 2. point the homepage at the clean files
const save = await api("/api/admin/homepage/hero", {
  method: "PUT",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    hero: {
      ...doc.value.hero,
      posters: uploaded.map((item) => ({ src: item.url, alt: item.alt })),
    },
  }),
});

// 3. drop every other file from the ImageKit hero folder
const listing = await (
  await fetch(
    "https://api.imagekit.io/v1/files?path=%2Fhotmale%2Fhero&limit=200",
    { headers: kitHeaders },
  )
).json();
const keep = new Set(uploaded.map((item) => item.name));

const removed = [];
for (const file of listing ?? []) {
  if (keep.has(file.name)) continue;
  const deleted = await fetch(
    `https://api.imagekit.io/v1/files/${file.fileId}`,
    { method: "DELETE", headers: kitHeaders },
  );
  removed.push({
    name: file.name,
    status: deleted.status,
    body: deleted.ok ? null : await deleted.text(),
  });
}

console.log(
  JSON.stringify(
    {
      save: { status: save.status, ok: save.body?.ok },
      uploaded: uploaded.map((item) => item.url),
      removed,
    },
    null,
    2,
  ),
);

await client.close();
