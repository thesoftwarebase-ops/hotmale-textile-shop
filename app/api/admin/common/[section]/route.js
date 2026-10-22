import { getCommonSectionSchema } from "../../../../../lib/cms/common-sections";
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
import { reconcileFooterStores } from "../../../../../lib/cms/footer-stores";
import { getDb } from "../../../../../lib/db";

/**
 * A slice can be a whole document key (navigation.footer) or a nested
 * path inside one (global.ui.backToTop), so every read and write walks
 * the path instead of assuming a single key.
 */
function readPath(source, path) {
  let current = source;
  for (const key of path) {
    if (current === null || current === undefined) return undefined;
    current = current[key];
  }
  return current;
}

function writePath(source, path, value) {
  if (path.length === 0) return value;
  const [key, ...rest] = path;
  const base =
    source && typeof source === "object" && !Array.isArray(source) ? source : {};
  return {
    ...base,
    [key]: rest.length ? writePath(base[key], rest, value) : value,
  };
}

function pathOf(field, schema) {
  return field.path ?? [field.name ?? schema.field];
}

/**
 * Read or write one common section (the closing CTA, the navbar links
 * or the footer). Only that slice of the owning document is touched.
 */
export async function GET(request, { params }) {
  const auth = await requireAdmin(request);
  if (auth.error) return auth.error;

  const { section } = await params;
  const schema = getCommonSectionSchema(section);
  if (!schema) return json({ ok: false, code: "not_found" }, 404);

  try {
    const db = await getDb();
    const value = {};
    const docs = new Map();

    for (const field of schema.fields) {
      const docKey = field.doc ?? schema.doc;
      if (!docs.has(docKey)) {
        const doc = await getContentDocument(db, docKey);
        if (!doc) return json({ ok: false, code: "not_initialized" }, 404);
        docs.set(docKey, doc);
      }
      value[field.name] =
        readPath(docs.get(docKey).value, pathOf(field, schema)) ?? null;
    }

    return json({ ok: true, value });
  } catch (error) {
    console.error(`Common section read failed (${section}):`, error.message);
    return json({ ok: false, code: "server_error" }, 500);
  }
}

export async function PUT(request, { params }) {
  const auth = await requireAdmin(request, { mutating: true });
  if (auth.error) return auth.error;

  const { section } = await params;
  const schema = getCommonSectionSchema(section);
  if (!schema) return json({ ok: false, code: "not_found" }, 404);

  const body = await readJson(request);
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return json({ ok: false, code: "bad_request" }, 400);
  }

  // Only the slices the client actually sends are written. A slice that
  // is absent keeps its stored value, so an older editor build can never
  // blank out or fail on a slice it does not know about.
  const presentFields = schema.fields.filter(
    (field) => body[field.name] !== undefined && body[field.name] !== null,
  );
  if (presentFields.length === 0) {
    return json({ ok: false, code: "bad_request" }, 400);
  }

  const { value, errors } = sanitizeInput(presentFields, body);
  if (Object.keys(errors).length > 0) {
    return json({ ok: false, code: "invalid", errors }, 422);
  }

  try {
    const db = await getDb();

    // The footer's branch links and the branch records are one thing: a
    // branch the footer does not link loses its record, page and
    // details, and a branch that is still used keeps its link.
    let warnings = [];
    let removed = [];
    if (section === "footer" && presentFields.some((f) => f.name === "footer")) {
      const result = await reconcileFooterStores(db, value.footer?.groups ?? []);
      removed = result.deleted.map((entry) => entry.name);
      warnings = [
        ...result.kept.map(
          (entry) =>
            `${entry.name} is still used by ${
              entry.products
                ? `${entry.products} ${entry.products === 1 ? "style" : "styles"}`
                : "an offer"
            }, so it stays in the footer.`,
        ),
        ...result.missing.map(
          (slug) =>
            `${slug} is linked in the footer but has no branch record.`,
        ),
      ];
    }

    // A section can span two documents (the navbar and the footer write
    // the global brand), so each target document is read, patched with
    // its own fields and saved on its own.
    const byDoc = new Map();
    for (const field of presentFields) {
      const docKey = field.doc ?? schema.doc;
      if (!byDoc.has(docKey)) byDoc.set(docKey, []);
      byDoc.get(docKey).push(field);
    }

    for (const [docKey, fields] of byDoc) {
      const doc = await getContentDocument(db, docKey);
      if (!doc) return json({ ok: false, code: "not_initialized" }, 404);

      let next = { ...doc.value };
      for (const field of fields) {
        next = writePath(next, pathOf(field, schema), value[field.name]);
      }

      await saveContentValue(db, docKey, next);
    }

    revalidateContent();

    // Answer with the whole section, so the editor refreshes every
    // slice it holds.
    const saved = {};
    const docs = new Map();
    for (const field of schema.fields) {
      const docKey = field.doc ?? schema.doc;
      if (!docs.has(docKey)) {
        docs.set(docKey, await getContentDocument(db, docKey));
      }
      saved[field.name] =
        readPath(docs.get(docKey)?.value, pathOf(field, schema)) ?? null;
    }

    return json({ ok: true, value: saved, warnings, removed });
  } catch (error) {
    console.error(`Common section update failed (${section}):`, error.message);
    return json({ ok: false, code: "server_error" }, 500);
  }
}
