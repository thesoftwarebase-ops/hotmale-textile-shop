import { getCollections, getSeo, getStores } from "../lib/data";
import { absoluteUrl, siteOrigin } from "../lib/seo";

const staticPaths = [
  { path: "/", changeFrequency: "weekly", priority: 1 },
  { path: "/collections", changeFrequency: "weekly", priority: 0.8 },
  { path: "/stores", changeFrequency: "monthly", priority: 0.8 },
  { path: "/about", changeFrequency: "monthly", priority: 0.6 },
  { path: "/contact", changeFrequency: "monthly", priority: 0.6 },
  { path: "/privacy", changeFrequency: "yearly", priority: 0.3 },
];

export default async function sitemap() {
  const [seo, collections, stores] = await Promise.all([
    getSeo(),
    getCollections(),
    getStores(),
  ]);
  const origin = siteOrigin(seo);
  if (!origin) return [];

  const collectionEntries = collections.map((collection) => ({
    path: `/collections/${collection.slug}`,
    changeFrequency: "weekly",
    priority: 0.7,
  }));
  const storeEntries = stores.map((store) => ({
    path: `/stores/${store.slug}`,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  return [...staticPaths, ...collectionEntries, ...storeEntries].map(
    ({ path, changeFrequency, priority }) => ({
      url: absoluteUrl(origin, path),
      changeFrequency,
      priority,
    }),
  );
}
