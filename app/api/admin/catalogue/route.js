import { json, requireAdmin } from "../../../../lib/cms/api";
import { getDb } from "../../../../lib/db";

/**
 * Catalogue tree — categories, the collections inside them and the
 * products inside those collections, resolved in one aggregation.
 *
 * The references live on the child documents (collection.category,
 * product.collection); this endpoint only joins them for display, so
 * there is no second source of truth to drift.
 */
export async function GET(request) {
  const auth = await requireAdmin(request);
  if (auth.error) return auth.error;

  try {
    const db = await getDb();

    const categories = await db
      .collection("categories")
      .aggregate([
        { $sort: { order: 1, name: 1 } },
        {
          $lookup: {
            from: "collections",
            let: { slug: "$slug" },
            pipeline: [
              {
                $match: {
                  $expr: { $eq: ["$category", "$$slug"] },
                },
              },
              { $sort: { order: 1, name: 1 } },
              {
                $lookup: {
                  from: "products",
                  let: { slug: "$slug" },
                  pipeline: [
                    {
                      $match: {
                        $expr: { $eq: ["$collection", "$$slug"] },
                      },
                    },
                    { $sort: { order: 1, name: 1 } },
                    {
                      $project: {
                        name: 1,
                        slug: 1,
                        status: 1,
                        order: 1,
                        image: 1,
                      },
                    },
                  ],
                  as: "products",
                },
              },
              {
                $project: {
                  name: 1,
                  slug: 1,
                  status: 1,
                  order: 1,
                  image: 1,
                  description: 1,
                  category: 1,
                  featured: 1,
                  products: 1,
                },
              },
            ],
            as: "collections",
          },
        },
        {
          $project: {
            name: 1,
            slug: 1,
            status: 1,
            order: 1,
            description: 1,
            featured: 1,
            collections: 1,
          },
        },
      ])
      .toArray();

    // `_id` is an ObjectId; the editors address items by a plain string
    // id and the cards use the same shape as the resource endpoints.
    const tree = categories.map(
      ({ _id, collections: children = [], ...category }) => {
        const collections = children.map(
          ({ _id: collectionId, products: items = [], ...collection }) => {
            const products = items.map(({ _id: productId, ...product }) => ({
              id: String(productId),
              ...product,
            }));

            return {
              id: String(collectionId),
              ...collection,
              products,
              productCount: products.length,
            };
          },
        );

        return {
          id: String(_id),
          ...category,
          collections,
          collectionCount: collections.length,
          productCount: collections.reduce(
            (total, collection) => total + collection.productCount,
            0,
          ),
        };
      },
    );

    return json({
      ok: true,
      tree,
      totals: {
        categories: tree.length,
        collections: tree.reduce((t, c) => t + c.collectionCount, 0),
        products: tree.reduce((t, c) => t + c.productCount, 0),
      },
    });
  } catch (error) {
    console.error("Catalogue tree failed:", error.message);
    return json({ ok: false, code: "server_error" }, 500);
  }
}
