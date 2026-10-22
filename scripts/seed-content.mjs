import { site } from "../data/site.js";
import { getDb } from "../lib/db.js";

function resourceDocs(items, decorate = (item) => item) {
  const now = new Date();
  return items.map((item, index) => {
    const value = decorate({ ...item }, index);
    return {
      ...value,
      order: value.order ?? index + 1,
      createdAt: now,
      updatedAt: now,
    };
  });
}

async function seedContent(db) {
  const now = new Date();
  const docs = {
    global: {
      brand: site.brand,
      seo: site.seo,
      contact: site.contact,
      social: site.social,
      cta: site.cta,
      ui: site.ui,
    },
    navigation: {
      items: site.navigation,
      footer: site.footer,
      announcements: site.announcements,
    },
    homepage: site.homepage,
  };

  for (const slug of Object.keys(site.pages)) {
    docs[`page:${slug}`] = site.pages[slug];
  }

  for (const [key, value] of Object.entries(docs)) {
    await db.collection("site_content").updateOne(
      { _id: key },
      {
        $setOnInsert: {
          value,
          createdAt: now,
          updatedAt: now,
        },
      },
      { upsert: true },
    );
  }

  return Object.keys(docs).length;
}

async function seedResources(db) {
  const definitions = [
    ["categories", site.categories],
    ["collections", site.collections],
    ["products", site.products],
    ["stores", site.stores],
  ];
  const counts = {};

  for (const [name, items] of definitions) {
    const collection = db.collection(name);
    const existing = await collection.countDocuments({});
    if (existing > 0) {
      counts[name] = { skipped: true, existing };
      continue;
    }

    const docs = resourceDocs(items, (item, index) => {
      if (name === "products") {
        return {
          ...item,
          brand: item.brand ?? "",
          description: item.description ?? "",
          price: item.price ?? null,
          variants: item.variants ?? [],
          gallery: item.gallery ?? [],
          storeSlugs: item.storeSlugs ?? [],
          featured: Boolean(item.featured),
          status: item.status ?? "published",
          seo: {
            title: item.seo?.title ?? "",
            description: item.seo?.description ?? "",
          },
          order: index + 1,
        };
      }
      return item;
    });

    if (docs.length > 0) {
      await collection.insertMany(docs);
    }
    counts[name] = { inserted: docs.length };
  }

  return counts;
}

async function main() {
  const db = await getDb();
  const contentCount = await seedContent(db);
  const resourceCounts = await seedResources(db);
  console.log(
    JSON.stringify(
      { contentDocuments: contentCount, resources: resourceCounts },
      null,
      2,
    ),
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("CMS seed failed:", error);
    process.exit(1);
  });
