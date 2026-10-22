import { getResourceSchema } from "../../../../../lib/cms/schema";
import { normalizeResource } from "../../../../../lib/cms/sanitize";
import {
  json,
  readJson,
  requireAdmin,
  revalidateContent,
  serializeDoc,
} from "../../../../../lib/cms/api";
import { validateReferences } from "../../../../../lib/cms/server";
import { syncFooterStoreLink } from "../../../../../lib/cms/footer-stores";
import { getDb } from "../../../../../lib/db";

export async function GET(request, { params }) {
  const auth = await requireAdmin(request);
  if (auth.error) return auth.error;

  const { resource } = await params;
  const schema = getResourceSchema(resource);
  if (!schema) return json({ ok: false, code: "not_found" }, 404);

  try {
    const db = await getDb();
    const items = await db
      .collection(schema.collection)
      .find({})
      .sort({ order: 1, _id: 1 })
      .toArray();
    return json({ ok: true, items: items.map(serializeDoc) });
  } catch (error) {
    console.error(`Resource list failed (${resource}):`, error.message);
    return json({ ok: false, code: "server_error" }, 500);
  }
}

export async function POST(request, { params }) {
  const auth = await requireAdmin(request, { mutating: true });
  if (auth.error) return auth.error;

  const { resource } = await params;
  const schema = getResourceSchema(resource);
  if (!schema) return json({ ok: false, code: "not_found" }, 404);

  const body = await readJson(request);
  const { value, errors } = normalizeResource(schema, body ?? {}, {
    creating: true,
  });
  if (Object.keys(errors).length > 0) {
    return json({ ok: false, code: "invalid", errors }, 422);
  }

  try {
    const db = await getDb();
    const referenceErrors = await validateReferences(schema.fields, value, db);
    if (Object.keys(referenceErrors).length > 0) {
      return json({ ok: false, code: "invalid", errors: referenceErrors }, 422);
    }

    // Position is owned by the list, not the form: a new item always
    // lands after its last sibling. Reordering is a separate endpoint.
    if (
      resource === "categories" ||
      resource === "collections" ||
      resource === "products" ||
      resource === "stores"
    ) {
      const scope =
        resource === "categories" || resource === "stores"
          ? {}
          : resource === "collections"
            ? { category: value.category }
            : { collection: value.collection };
      const last = await db
        .collection(schema.collection)
        .findOne(scope, { sort: { order: -1 }, projection: { order: 1 } });
      value.order = (typeof last?.order === "number" ? last.order : 0) + 1;
    }

    const now = new Date();
    const doc = {
      ...value,
      createdAt: now,
      updatedAt: now,
    };
    const result = await db.collection(schema.collection).insertOne(doc);

    // A new store gets its footer link straight away, pointing at the
    // route it actually serves.
    if (resource === "stores") {
      await syncFooterStoreLink(db, { slug: value.slug, name: value.name });
    }

    revalidateContent();
    return json(
      {
        ok: true,
        item: serializeDoc({ _id: result.insertedId, ...doc }),
      },
      201,
    );
  } catch (error) {
    if (error?.code === 11000) {
      return json({ ok: false, code: "duplicate_slug" }, 409);
    }
    console.error(`Resource create failed (${resource}):`, error.message);
    return json({ ok: false, code: "server_error" }, 500);
  }
}
