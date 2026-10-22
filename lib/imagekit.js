import { createHmac, randomBytes } from "node:crypto";
import {
  MAX_UPLOAD_BYTES,
  SECTION_FOLDERS,
  WEBP_EXT,
  WEBP_MIME,
} from "./imagekit-folders";

/**
 * ImageKit integration for the CMS.
 *
 * Rules enforced here (never in the browser):
 *  - only WebP files are accepted (magic-byte check, not just the mime type)
 *  - every upload lands under the parent folder "hotmale" in a subfolder
 *    chosen from SECTION_FOLDERS — the client never picks the path
 *  - the private key stays on the server: uploads are signed here and
 *    forwarded to ImageKit by the API route
 */

export const IMAGEKIT_UPLOAD_URL =
  "https://upload.imagekit.io/api/v1/files/upload";

export { MAX_UPLOAD_BYTES, SECTION_FOLDERS, WEBP_EXT, WEBP_MIME };
export { ROOT_FOLDER } from "./imagekit-folders";

export function getImageKitConfig() {
  const urlEndpoint = process.env.IMAGEKIT_URL_ENDPOINT;
  const publicKey = process.env.IMAGEKIT_PUBLIC_KEY;
  const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;

  if (!urlEndpoint || !publicKey || !privateKey) {
    throw new Error("ImageKit is not configured.");
  }

  return {
    urlEndpoint: urlEndpoint.replace(/\/+$/, ""),
    publicKey,
    privateKey,
  };
}

export function isImageKitConfigured() {
  return Boolean(
    process.env.IMAGEKIT_URL_ENDPOINT &&
      process.env.IMAGEKIT_PUBLIC_KEY &&
      process.env.IMAGEKIT_PRIVATE_KEY,
  );
}

export function getFolderForSection(section) {
  const folder = SECTION_FOLDERS[section];
  if (!folder) {
    throw new Error("Unknown upload section.");
  }
  return folder;
}
/** True when the bytes really are a RIFF/WEBP container. */
export function isWebpBuffer(buffer) {
  if (!buffer || buffer.length < 12) return false;
  return (
    buffer.toString("ascii", 0, 4) === "RIFF" &&
    buffer.toString("ascii", 8, 12) === "WEBP"
  );
}

export function hasWebpExtension(name) {
  return String(name ?? "").toLowerCase().endsWith(WEBP_EXT);
}

/** Signed upload parameters for the ImageKit upload API. */
export function createUploadSignature({ folder, expiresInSeconds = 1800 }) {
  const { publicKey, privateKey } = getImageKitConfig();
  const token = randomBytes(24).toString("hex");
  const expire = Math.floor(Date.now() / 1000) + expiresInSeconds;
  const signature = createHmac("sha1", privateKey)
    .update(`${token}${expire}`)
    .digest("hex");

  return { token, signature, expire, publicKey, folder };
}

/** Absolute CDN URL for a stored ImageKit path. */
export function imageKitUrl(pathOrUrl, { width, quality } = {}) {
  const { urlEndpoint } = getImageKitConfig();
  const base = pathOrUrl?.startsWith("http")
    ? pathOrUrl
    : `${urlEndpoint}/${String(pathOrUrl ?? "").replace(/^\/+/, "")}`;

  const transforms = [];
  if (width) transforms.push(`w-${width}`);
  if (quality) transforms.push(`q-${quality}`);

  if (transforms.length === 0) return base;
  return `${base}${base.includes("?") ? "&" : "?"}tr=${transforms.join(",")}`;
}
