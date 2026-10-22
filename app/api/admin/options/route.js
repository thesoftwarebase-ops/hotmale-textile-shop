import { json, requireAdmin } from "../../../../lib/cms/api";
import { getDb } from "../../../../lib/db";

export async function GET(request) {
  const auth = await requireAdmin(request);
  if (auth.error) return auth.error;

  try {
    const db = await getDb();
    const [categories, collections, stores] = await Promise.all([
      db
        .collection("categories")
        .find({}, { projection: { name: 1, slug: 1, status: 1, order: 1 } })
        .sort({ order: 1, name: 1 })
        .toArray(),
      db
        .collection("collections")
        .find(
          {},
          {
            projection: {
              name: 1,
              slug: 1,
              category: 1,
              status: 1,
              order: 1,
            },
          },
        )
        .sort({ order: 1, name: 1 })
        .toArray(),
      db
        .collection("stores")
        .find(
          {},
          {
            projection: {
              name: 1,
              slug: 1,
              order: 1,
              address: 1,
              hours: 1,
              phone: 1,
              landline: 1,
              whatsapp: 1,
              photo: 1,
              description: 1,
            },
          },
        )
        .sort({ order: 1, name: 1 })
        .toArray(),
    ]);

    // Published collections per category — the editors show these counts
    // so a category that owns nothing is obvious before it is featured.
    const collectionCounts = collections.reduce((acc, collection) => {
      if (collection.status && collection.status !== "published") return acc;
      acc[collection.category] = (acc[collection.category] ?? 0) + 1;
      return acc;
    }, {});

    return json({
      ok: true,
      categories: categories.map(({ _id, ...item }) => ({
        ...item,
        collectionCount: collectionCounts[item.slug] ?? 0,
      })),
      collections: collections.map(({ _id, ...item }) => item),
      stores: stores.map(({ _id, ...item }) => item),
    });
  } catch (error) {
    console.error("CMS options failed:", error.message);
    return json({ ok: false, code: "server_error" }, 500);
  }
}
