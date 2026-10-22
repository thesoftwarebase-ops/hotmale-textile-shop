import { getPageSchema } from "../../../../../lib/cms/schema";
import { sanitizeInput } from "../../../../../lib/cms/sanitize";
import {
  json,
  readJson,
  requireAdmin,
  revalidateContent,
} from "../../../../../lib/cms/api";
import {
  getContentDocument,
  saveContentValue,
} from "../../../../../lib/cms/server";
import { getDb } from "../../../../../lib/db";

export async function GET(request, { params }) {
  const auth = await requireAdmin(request);
  if (auth.error) return auth.error;

  const { slug } = await params;
  const schema = getPageSchema(slug);
  if (!schema) return json({ ok: false, code: "not_found" }, 404);

  try {
    const db = await getDb();
    const doc = await getContentDocument(db, `page:${slug}`);
    if (!doc) return json({ ok: false, code: "not_initialized" }, 404);
    return json({ ok: true, value: doc.value, updatedAt: doc.updatedAt });
  } catch (error) {
    console.error(`Page content read failed (${slug}):`, error.message);
    return json({ ok: false, code: "server_error" }, 500);
  }
}

export async function PUT(request, { params }) {
  const auth = await requireAdmin(request, { mutating: true });
  if (auth.error) return auth.error;

  const { slug } = await params;
  const schema = getPageSchema(slug);
  if (!schema) return json({ ok: false, code: "not_found" }, 404);

  const body = await readJson(request);
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return json({ ok: false, code: "bad_request" }, 400);
  }

  const { value, errors } = sanitizeInput(schema.fields, body);
  if (Object.keys(errors).length > 0) {
    return json({ ok: false, code: "invalid", errors }, 422);
  }

  try {
    const db = await getDb();
    await saveContentValue(db, `page:${slug}`, value);
    revalidateContent();
    return json({ ok: true, value });
  } catch (error) {
    console.error(`Page content update failed (${slug}):`, error.message);
    return json({ ok: false, code: "server_error" }, 500);
  }
}
