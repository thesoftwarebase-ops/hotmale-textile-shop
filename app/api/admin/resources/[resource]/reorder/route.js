import { ObjectId } from "mongodb";
import { getResourceSchema } from "../../../../../../lib/cms/schema";
import {
  json,
  readJson,
  requireAdmin,
  revalidateContent,
} from "../../../../../../lib/cms/api";
import { getDb } from "../../../../../../lib/db";

const REORDERABLE = new Set([
  "categories",
  "collections",
  "products",
  "stores",
]);

function parseIds(input) {
  if (!Array.isArray(input) || input.length === 0) return null;
  if (input.some((value) => typeof value !== "string" || !ObjectId.isValid(value))) {
    return null;
  }
  if (new Set(input).size !== input.length) return null;
  return input.map((value) => new ObjectId(value));
}

/**
 * Persist the order of one sibling list in a single pass. The client
 * sends every id of the list it shows; if the database holds a
 * different set (another tab added or deleted an item), the request is
 * rejected as stale so a reload settles it instead of colliding.
 */
export async function POST(request, { params }) {
  const auth = await requireAdmin(request, { mutating: true });
  if (auth.error) return auth.error;

  const { resource } = await params;
  const schema = getResourceSchema(resource);
  if (!schema || !REORDERABLE.has(resource)) {
    return json({ ok: false, code: "not_found" }, 404);
  }

  const body = await readJson(request);
  const objectIds = parseIds(body?.ids);
  if (!objectIds) return json({ ok: false, code: "bad_request" }, 400);

  try {
    const db = await getDb();
    const docs = await db
      .collection(schema.collection)
      .find({ _id: { $in: objectIds } })
      .project({ category: 1, collection: 1 })
      .toArray();
    if (docs.length !== objectIds.length) {
      return json({ ok: false, code: "not_found" }, 404);
    }

    let scope = {};
    if (resource === "collections") {
      const parents = new Set(docs.map((doc) => doc.category ?? ""));
      if (parents.size !== 1) return json({ ok: false, code: "bad_request" }, 400);
      scope = { category: docs[0].category ?? "" };
    }
    if (resource === "products") {
      const parents = new Set(docs.map((doc) => doc.collection ?? ""));
      if (parents.size !== 1) return json({ ok: false, code: "bad_request" }, 400);
      scope = { collection: docs[0].collection ?? "" };
    }

    const total = await db.collection(schema.collection).countDocuments(scope);
    if (total !== objectIds.length) {
      return json({ ok: false, code: "stale" }, 409);
    }

    const now = new Date();
    await db.collection(schema.collection).bulkWrite(
      objectIds.map((objectId, index) => ({
        updateOne: {
          filter: { _id: objectId },
          update: { $set: { order: index + 1, updatedAt: now } },
        },
      })),
    );

    revalidateContent();
    return json({ ok: true });
  } catch (error) {
    console.error(`Resource reorder failed (${resource}):`, error.message);
    return json({ ok: false, code: "server_error" }, 500);
  }
}
