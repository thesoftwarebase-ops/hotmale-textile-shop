import { getDb } from "../db";
import { renameFooterStoreLink } from "./footer-stores";

export const CONTENT_COLLECTION = "site_content";

export async function getContentDocument(db, key) {
  return db.collection(CONTENT_COLLECTION).findOne({ _id: key });
}

export async function saveContentValue(db, key, value) {
  const now = new Date();
  await db.collection(CONTENT_COLLECTION).updateOne(
    { _id: key },
    {
      $set: { value, updatedAt: now },
      $setOnInsert: { createdAt: now },
    },
    { upsert: true },
  );
}

async function referenceExists(db, resource, slug) {
  if (!slug) return true;
  const doc = await db.collection(resource).findOne(
    { slug },
    { projection: { _id: 1 } },
  );
  return Boolean(doc);
}

async function walkReferences(fields, source, prefix, db, errors) {
  for (const field of fields ?? []) {
    const path = prefix ? `${prefix}.${field.name}` : field.name;
    const value = source?.[field.name];

    if (field.type === "reference" && value) {
      if (!(await referenceExists(db, field.resource, value))) {
        errors[path] = `${field.label} no longer exists.`;
      }
    } else if (field.type === "multiReference" && Array.isArray(value)) {
      for (const slug of value) {
        if (field.allOption && slug === field.allOption) continue;
        if (!(await referenceExists(db, field.resource, slug))) {
          errors[path] = `${field.label} contains a missing item.`;
          break;
        }
      }
    } else if (field.type === "object") {
      await walkReferences(field.fields, value ?? {}, path, db, errors);
    } else if (field.type === "repeater" && Array.isArray(value)) {
      for (let index = 0; index < value.length; index += 1) {
        await walkReferences(
          field.fields,
          value[index] ?? {},
          `${path}.${index}`,
          db,
          errors,
        );
      }
    }
  }
}

export async function validateReferences(fields, value, db) {
  const errors = {};
  await walkReferences(fields, value ?? {}, "", db, errors);
  return errors;
}

async function updateFeaturedCollections(db, oldSlug, newSlug) {
  const doc = await getContentDocument(db, "homepage");
  if (!doc?.value?.featuredCollectionSlugs) return;
  const current = doc.value.featuredCollectionSlugs;
  if (!current.includes(oldSlug)) return;
  const next = current.map((slug) => (slug === oldSlug ? newSlug : slug));
  await saveContentValue(db, "homepage", {
    ...doc.value,
    featuredCollectionSlugs: next,
  });
}

async function updateOfferStores(db, oldSlug, newSlug) {
  const doc = await getContentDocument(db, "homepage");
  if (!doc?.value?.offers) return;
  let changed = false;
  const offers = doc.value.offers.map((offer) => {
    if (!Array.isArray(offer.stores) || !offer.stores.includes(oldSlug)) {
      return offer;
    }
    changed = true;
    return {
      ...offer,
      stores: offer.stores.map((slug) => (slug === oldSlug ? newSlug : slug)),
    };
  });
  if (changed) {
    await saveContentValue(db, "homepage", { ...doc.value, offers });
  }
}

async function updateFooterStoreLink(db, oldSlug, newSlug, name) {
  await renameFooterStoreLink(db, oldSlug, newSlug, name);
}

export async function cascadeSlugChange(
  resource,
  oldSlug,
  newSlug,
  { name } = {},
) {
  if (!oldSlug || !newSlug || oldSlug === newSlug) return;
  const db = await getDb();

  if (resource === "categories") {
    await Promise.all([
      db
        .collection("collections")
        .updateMany({ category: oldSlug }, { $set: { category: newSlug } }),
      db
        .collection("products")
        .updateMany({ category: oldSlug }, { $set: { category: newSlug } }),
    ]);
    return;
  }

  if (resource === "collections") {
    await Promise.all([
      db
        .collection("products")
        .updateMany({ collection: oldSlug }, { $set: { collection: newSlug } }),
      updateFeaturedCollections(db, oldSlug, newSlug),
    ]);
    return;
  }

  if (resource === "stores") {
    const products = await db
      .collection("products")
      .find({ storeSlugs: oldSlug })
      .project({ _id: 1, storeSlugs: 1 })
      .toArray();
    await Promise.all([
      ...products.map((product) =>
        db.collection("products").updateOne(
          { _id: product._id },
          {
            $set: {
              storeSlugs: (product.storeSlugs ?? []).map((slug) =>
                slug === oldSlug ? newSlug : slug,
              ),
            },
          },
        ),
      ),
      updateOfferStores(db, oldSlug, newSlug),
      updateFooterStoreLink(db, oldSlug, newSlug, name),
    ]);
  }
}
