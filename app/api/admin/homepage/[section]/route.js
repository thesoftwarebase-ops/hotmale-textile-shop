import { getHomepage } from "../../../../../lib/data";
import { getHomepageSectionSchema } from "../../../../../lib/cms/homepage-sections";
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
  validateReferences,
} from "../../../../../lib/cms/server";
import { getDb } from "../../../../../lib/db";

const CONTENT_KEY = "homepage";

function sliceOf(schema, homepage) {
  const field = schema.fields[0];
  const value = homepage?.[field.name];
  return { [field.name]: value ?? null };
}

/**
 * Read or write a single homepage section. The request body is the
 * section slice ({ hero: {...} }, { offers: [...] }, …) and only that
 * slice is merged back into the homepage document.
 */
export async function GET(request, { params }) {
  const auth = await requireAdmin(request);
  if (auth.error) return auth.error;

  const { section } = await params;
  const schema = getHomepageSectionSchema(section);
  if (!schema) return json({ ok: false, code: "not_found" }, 404);

  try {
    // The public document and the editor must agree, so the section is
    // read through the data layer: the stored value wins, anything the
    // editor has never touched falls back to data/site.js.
    const homepage = await getHomepage();
    if (!homepage) return json({ ok: false, code: "not_initialized" }, 404);
    return json({ ok: true, value: sliceOf(schema, homepage) });
  } catch (error) {
    console.error(`Homepage section read failed (${section}):`, error.message);
    return json({ ok: false, code: "server_error" }, 500);
  }
}

export async function PUT(request, { params }) {
  const auth = await requireAdmin(request, { mutating: true });
  if (auth.error) return auth.error;

  const { section } = await params;
  const schema = getHomepageSectionSchema(section);
  if (!schema) return json({ ok: false, code: "not_found" }, 404);

  const body = await readJson(request);
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return json({ ok: false, code: "bad_request" }, 400);
  }

  // The body must carry the section slice. Without it the sanitizer
  // would fall back to defaults and wipe the stored section.
  const field = schema.fields[0];
  if (body[field.name] === undefined || body[field.name] === null) {
    return json({ ok: false, code: "bad_request" }, 400);
  }

  const { value, errors } = sanitizeInput(schema.fields, body);
  if (Object.keys(errors).length > 0) {
    return json({ ok: false, code: "invalid", errors }, 422);
  }

  try {
    const db = await getDb();
    const referenceErrors = await validateReferences(schema.fields, value, db);
    if (Object.keys(referenceErrors).length > 0) {
      return json({ ok: false, code: "invalid", errors: referenceErrors }, 422);
    }

    const doc = await getContentDocument(db, CONTENT_KEY);
    if (!doc) return json({ ok: false, code: "not_initialized" }, 404);

    const homepage = { ...doc.value, [field.name]: value[field.name] };
    await saveContentValue(db, CONTENT_KEY, homepage);
    revalidateContent();

    return json({ ok: true, value: { [field.name]: value[field.name] } });
  } catch (error) {
    console.error(`Homepage section update failed (${section}):`, error.message);
    return json({ ok: false, code: "server_error" }, 500);
  }
}
