import { ObjectId } from "mongodb";
import { getResourceSchema } from "../../../../../../lib/cms/schema";
import { normalizeResource } from "../../../../../../lib/cms/sanitize";
import {
  json,
  readJson,
  requireAdmin,
  revalidateContent,
  serializeDoc,
} from "../../../../../../lib/cms/api";
import {
  cascadeSlugChange,
  validateReferences,
} from "../../../../../../lib/cms/server";
import {
  removeFooterStoreLink,
  syncFooterStoreLink,
} from "../../../../../../lib/cms/footer-stores";
import { getDb } from "../../../../../../lib/db";

function parseId(value) {
  return ObjectId.isValid(value) ? new ObjectId(value) : null;
}

export async function GET(request, { params }) {
  const auth = await requireAdmin(request);
  if (auth.error) return auth.error;

  const { resource, id } = await params;
  const schema = getResourceSchema(resource);
  const objectId = parseId(id);
  if (!schema) return json({ ok: false, code: "not_found" }, 404);
  if (!objectId) return json({ ok: false, code: "not_found" }, 404);

  try {
    const db = await getDb();
    const item = await db
      .collection(schema.collection)
      .findOne({ _id: objectId });
    if (!item) return json({ ok: false, code: "not_found" }, 404);
    return json({ ok: true, item: serializeDoc(item) });
  } catch (error) {
    console.error(`Resource read failed (${resource}):`, error.message);
    return json({ ok: false, code: "server_error" }, 500);
  }
}

export async function PATCH(request, { params }) {
  const auth = await requireAdmin(request, { mutating: true });
  if (auth.error) return auth.error;

  const { resource, id } = await params;
  const schema = getResourceSchema(resource);
  const objectId = parseId(id);
  if (!schema) return json({ ok: false, code: "not_found" }, 404);
  if (!objectId) return json({ ok: false, code: "not_found" }, 404);

  const body = await readJson(request);
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return json({ ok: false, code: "bad_request" }, 400);
  }

  try {
    const db = await getDb();
    const current = await db
      .collection(schema.collection)
      .findOne({ _id: objectId });
    if (!current) return json({ ok: false, code: "not_found" }, 404);

    const { value, errors } = normalizeResource(schema, {
      ...current,
      ...body,
    });
    if (Object.keys(errors).length > 0) {
      return json({ ok: false, code: "invalid", errors }, 422);
    }

    const referenceErrors = await validateReferences(schema.fields, value, db);
    if (Object.keys(referenceErrors).length > 0) {
      return json({ ok: false, code: "invalid", errors: referenceErrors }, 422);
    }

    const now = new Date();
    const next = { ...value, updatedAt: now };
    await db
      .collection(schema.collection)
      .updateOne({ _id: objectId }, { $set: next });

    await cascadeSlugChange(resource, current.slug, value.slug, {
      name: value.name,
    });

    // Keep the footer's store links on the routes the stores serve.
    if (resource === "stores") {
      await syncFooterStoreLink(db, { slug: value.slug, name: value.name });
    }

    const paths = [];
    if (resource === "collections") {
      paths.push(`/collections/${current.slug}`, `/collections/${value.slug}`);
    }
    if (resource === "stores") {
      paths.push(`/stores/${current.slug}`, `/stores/${value.slug}`);
    }
    revalidateContent({ paths });

    return json({
      ok: true,
      item: serializeDoc({ ...current, ...next, _id: objectId }),
    });
  } catch (error) {
    if (error?.code === 11000) {
      return json({ ok: false, code: "duplicate_slug" }, 409);
    }
    console.error(`Resource update failed (${resource}):`, error.message);
    return json({ ok: false, code: "server_error" }, 500);
  }
}

export async function DELETE(request, { params }) {
  const auth = await requireAdmin(request, { mutating: true });
  if (auth.error) return auth.error;

  const { resource, id } = await params;
  const schema = getResourceSchema(resource);
  const objectId = parseId(id);
  if (!schema) return json({ ok: false, code: "not_found" }, 404);
  if (!objectId) return json({ ok: false, code: "not_found" }, 404);

  try {
    const db = await getDb();
    const current = await db
      .collection(schema.collection)
      .findOne({ _id: objectId });
    if (!current) return json({ ok: false, code: "not_found" }, 404);

    if (resource === "categories") {
      const [collectionCount, productCount] = await Promise.all([
        db
          .collection("collections")
          .countDocuments({ category: current.slug }),
        db.collection("products").countDocuments({ category: current.slug }),
      ]);
      if (collectionCount > 0 || productCount > 0) {
        return json({ ok: false, code: "in_use" }, 409);
      }
    }

    if (resource === "collections") {
      await Promise.all([
        db
          .collection("products")
          .deleteMany({ collection: current.slug }),
        db.collection("site_content").updateOne(
          { _id: "homepage" },
          { $pull: { "value.featuredCollectionSlugs": current.slug } },
        ),
      ]);
    }

    if (resource === "stores") {
      const [productCount, homepage] = await Promise.all([
        db.collection("products").countDocuments({ storeSlugs: current.slug }),
        db.collection("site_content").findOne({ _id: "homepage" }),
      ]);
      const inOffer = (homepage?.value?.offers ?? []).some((offer) =>
        (offer.stores ?? []).includes(current.slug),
      );
      // The footer link is managed by the CMS, so it never blocks a
      // delete — it is removed with the store.
      if (productCount > 0 || inOffer) {
        return json({ ok: false, code: "in_use" }, 409);
      }
    }

    await db.collection(schema.collection).deleteOne({ _id: objectId });

    if (resource === "stores") {
      await removeFooterStoreLink(db, current.slug);
    }

    const paths = [];
    if (resource === "collections") {
      paths.push(`/collections/${current.slug}`, "/collections", "/");
    }
    if (resource === "stores") {
      paths.push(`/stores/${current.slug}`);
    }
    revalidateContent({ paths });
    return json({ ok: true });
  } catch (error) {
    console.error(`Resource delete failed (${resource}):`, error.message);
    return json({ ok: false, code: "server_error" }, 500);
  }
}
