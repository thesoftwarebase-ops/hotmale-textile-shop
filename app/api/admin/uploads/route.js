import {
  IMAGEKIT_UPLOAD_URL,
  MAX_UPLOAD_BYTES,
  WEBP_MIME,
  createUploadSignature,
  getFolderForSection,
  hasWebpExtension,
  isWebpBuffer,
} from "../../../../lib/imagekit";
import { json, requireAdmin } from "../../../../lib/cms/api";

export const maxDuration = 60;

/**
 * Upload a single image to ImageKit.
 *
 * The browser posts the file here; this route is the gate that enforces
 * the CMS upload rules (WebP only, folder decided server-side) and then
 * forwards the file to ImageKit with a freshly signed token. The private
 * key never leaves the server.
 */
export async function POST(request) {
  const auth = await requireAdmin(request, { mutating: true });
  if (auth.error) return auth.error;

  let form;
  try {
    form = await request.formData();
  } catch {
    return json({ ok: false, code: "bad_request" }, 400);
  }

  const file = form.get("file");
  const section = String(form.get("section") ?? "");

  if (!(file instanceof File) || file.size === 0) {
    return json({ ok: false, code: "no_file" }, 400);
  }

  if (file.size > MAX_UPLOAD_BYTES) {
    return json({ ok: false, code: "too_large" }, 413);
  }

  if (file.type !== WEBP_MIME || !hasWebpExtension(file.name)) {
    return json({ ok: false, code: "not_webp" }, 415);
  }

  const bytes = Buffer.from(await file.arrayBuffer());
  if (!isWebpBuffer(bytes)) {
    return json({ ok: false, code: "not_webp" }, 415);
  }

  let folder;
  try {
    folder = getFolderForSection(section);
  } catch {
    return json({ ok: false, code: "unknown_section" }, 400);
  }

  try {
    const signature = createUploadSignature({ folder });
    const payload = new FormData();
    payload.append("file", new Blob([bytes], { type: WEBP_MIME }), file.name);
    payload.append("fileName", file.name);
    payload.append("folder", folder);
    payload.append("publicKey", signature.publicKey);
    payload.append("token", signature.token);
    payload.append("signature", signature.signature);
    payload.append("expire", String(signature.expire));
    payload.append("useUniqueFileName", "true");

    const response = await fetch(IMAGEKIT_UPLOAD_URL, {
      method: "POST",
      body: payload,
    });
    const result = await response.json().catch(() => null);

    if (!response.ok || !result?.url) {
      console.error("ImageKit upload failed:", result?.message ?? response.status);
      return json({ ok: false, code: "upload_failed" }, 502);
    }

    return json({
      ok: true,
      url: result.url,
      filePath: result.filePath,
      name: result.name,
      width: result.width,
      height: result.height,
      size: result.size,
      folder: result.folder ?? folder,
    });
  } catch (error) {
    console.error("ImageKit upload error:", error.message);
    return json({ ok: false, code: "upload_failed" }, 502);
  }
}
