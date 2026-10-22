"use cache";

/**
 * HOTMALE data-access layer.
 *
 * This is the ONLY file allowed to import data/site.js. Public pages and
 * routes read through these async functions. Content lives in MongoDB and
 * falls back to the original site.js document when the database is not
 * reachable, which keeps local builds and previews resilient.
 *
 * Every function returns plain objects (deep-cloned), safe to pass from
 * Server Components.
 */

import { cacheLife, cacheTag } from "next/cache";
import { site } from "../data/site.js";
import { getDb } from "./db";
import { CMS_CACHE_TAG } from "./cms/cache";

const CONTENT_COLLECTION = "site_content";

let warnedAboutDatabase = false;

function cachedContent() {
  cacheTag(CMS_CACHE_TAG);
  cacheLife("max");
}

function plain(value) {
  return value === undefined ? undefined : JSON.parse(JSON.stringify(value));
}

function isPublished(doc) {
  return doc.status === "published";
}

function byOrder(a, b) {
  return (a.order ?? 0) - (b.order ?? 0);
}

function warnDatabase(error) {
  if (warnedAboutDatabase) return;
  warnedAboutDatabase = true;
  console.error(
    "CMS database unavailable; using data/site.js fallback:",
    error.message,
  );
}

/**
 * Merge a stored value over its static fallback. Keys the editor has
 * never touched keep the value from data/site.js, so a newly added
 * field shows up with its default instead of rendering as undefined.
 * Arrays are replaced, never merged — removing an item must stay removed.
 */
function mergeWithFallback(value, fallback) {
  if (value === undefined) return fallback;
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    return value;
  }
  if (
    !fallback ||
    typeof fallback !== "object" ||
    Array.isArray(fallback)
  ) {
    return value;
  }

  const merged = { ...fallback };
  for (const [key, child] of Object.entries(value)) {
    merged[key] = mergeWithFallback(child, fallback[key]);
  }
  return merged;
}

async function contentValue(key, fallback) {
  cachedContent();
  try {
    const db = await getDb();
    const doc = await db
      .collection(CONTENT_COLLECTION)
      .findOne({ _id: key });
    return plain(mergeWithFallback(doc?.value, fallback));
  } catch (error) {
    warnDatabase(error);
    return plain(fallback);
  }
}

async function resourceList(name, fallback) {
  cachedContent();
  try {
    const db = await getDb();
    const docs = await db
      .collection(name)
      .find({})
      .sort({ order: 1, _id: 1 })
      .toArray();
    return plain(docs.map(({ _id, ...doc }) => doc));
  } catch (error) {
    warnDatabase(error);
    return plain(fallback);
  }
}

/* ---------------- Site ---------------- */

export async function getSite() {
  return plain(site);
}

export async function getTheme() {
  return plain(site.theme);
}

export async function getBrand() {
  const global = await contentValue("global", {
    brand: site.brand,
    seo: site.seo,
    contact: site.contact,
    social: site.social,
    cta: site.cta,
    ui: site.ui,
  });
  return plain(global.brand);
}

export async function getUi() {
  const global = await contentValue("global", {
    ui: site.ui,
  });
  return plain(global.ui);
}

export async function getSeo() {
  const global = await contentValue("global", {
    seo: site.seo,
  });
  return plain(global.seo);
}

export async function getAdminUi() {
  return plain(site.admin);
}

export async function getContact() {
  const global = await contentValue("global", {
    contact: site.contact,
    social: site.social,
  });
  return plain({ ...global.contact, social: global.social ?? site.social });
}

export async function getSocial() {
  const global = await contentValue("global", {
    social: site.social,
  });
  return plain(global.social);
}

/** Site-wide closing CTA band (rendered above the footer). */
export async function getCta() {
  const global = await contentValue("global", {
    cta: site.cta,
  });
  return plain(global.cta);
}

/* ---------------- Navigation & footer ---------------- */

export async function getNavigation() {
  const navigation = await contentValue("navigation", {
    items: site.navigation,
    footer: site.footer,
    announcements: site.announcements,
  });
  return plain(
    (navigation.items ?? [])
      .filter((item) => item.visible !== false)
      .sort(byOrder),
  );
}

export async function getFooter() {
  const [navigation, global] = await Promise.all([
    contentValue("navigation", {
      footer: site.footer,
      announcements: site.announcements,
    }),
    contentValue("global", { social: site.social }),
  ]);
  return plain({
    groups: [...(navigation.footer?.groups ?? [])].sort(byOrder),
    social: global.social ?? site.social,
    copyrightYear: navigation.footer?.copyrightYear ?? site.footer.copyrightYear,
  });
}

/* ---------------- Announcements (marquee) ---------------- */

export async function getAnnouncements() {
  const navigation = await contentValue("navigation", {
    announcements: site.announcements,
  });
  return plain(navigation.announcements ?? []);
}

/**
 * The single marquee entry to render, or null when none is active.
 * Pass an ISO timestamp to enforce start/end schedules; when omitted
 * (static prerender), only the `visible` flag is evaluated.
 */
export async function getActiveAnnouncement(nowIso = null) {
  cachedContent();
  const announcements = await getAnnouncements();
  const now = nowIso ? new Date(nowIso) : null;
  const current = announcements.find((entry) => {
    if (!entry.visible) return false;
    if (now && entry.startsAt && new Date(entry.startsAt) > now) return false;
    if (now && entry.endsAt && new Date(entry.endsAt) < now) return false;
    return true;
  });
  return plain(current ?? null);
}

/* ---------------- Homepage ---------------- */

export async function getHomepage() {
  return contentValue("homepage", site.homepage);
}

export async function getHomeSections() {
  cachedContent();
  const homepage = await getHomepage();
  return plain([...(homepage.sections ?? [])].sort(byOrder));
}

/* ---------------- Categories ---------------- */

export async function getCategories({ includeDrafts = false } = {}) {
  const list = await resourceList("categories", site.categories);
  const filtered = includeDrafts ? list : list.filter(isPublished);
  return plain([...filtered].sort(byOrder));
}

export async function getCategoryBySlug(slug) {
  cachedContent();
  const list = await getCategories();
  return plain(list.find((entry) => entry.slug === slug) ?? null);
}

/**
 * Featured categories combine the curated slug order saved on the homepage
 * document with every category flagged "featured" in the catalogue. The
 * curated list wins the ordering; a category flagged later is appended, so
 * toggling Featured in the catalogue always surfaces on the homepage.
 */
export async function getFeaturedCategories() {
  cachedContent();
  const [homepage, list] = await Promise.all([getHomepage(), getCategories()]);
  const slugs = Array.isArray(homepage.featuredCategorySlugs)
    ? homepage.featuredCategorySlugs
    : [];

  const curated = slugs
    .map((slug) => list.find((entry) => entry.slug === slug))
    .filter(Boolean);
  const seen = new Set(curated.map((entry) => entry.slug));
  const flagged = list.filter(
    (entry) => entry.featured && !seen.has(entry.slug),
  );

  return plain([...curated, ...flagged]);
}

/* ---------------- Collections (cloth types) ---------------- */

export async function getCollections({ category, includeDrafts = false } = {}) {
  const list = await resourceList("collections", site.collections);
  let filtered = includeDrafts ? list : list.filter(isPublished);
  if (category) {
    filtered = filtered.filter((entry) => entry.category === category);
  }
  return plain([...filtered].sort(byOrder));
}

export async function getCollectionBySlug(slug) {
  cachedContent();
  const list = await getCollections();
  return plain(list.find((entry) => entry.slug === slug) ?? null);
}

export async function getCollectionsByCategory(categorySlug) {
  cachedContent();
  return getCollections({ category: categorySlug });
}

/* ---------------- Products ---------------- */

export async function getProducts(filters = {}) {
  const { category, collection, brand, size, min, max, sort, featured } = filters;

  let list = (await resourceList("products", site.products)).filter(
    isPublished,
  );

  if (category) {
    list = list.filter((product) => product.category === category);
  }
  if (collection) {
    list = list.filter((product) => product.collection === collection);
  }
  if (brand) {
    list = list.filter((product) => product.brand === brand);
  }
  if (size) {
    list = list.filter((product) =>
      (product.variants ?? []).some((variant) => variant.size === size),
    );
  }
  if (min !== undefined && min !== "" && min !== null) {
    list = list.filter(
      (product) => product.price !== null && product.price >= Number(min),
    );
  }
  if (max !== undefined && max !== "" && max !== null) {
    list = list.filter(
      (product) => product.price !== null && product.price <= Number(max),
    );
  }
  if (featured !== undefined) {
    list = list.filter((product) => product.featured === featured);
  }

  if (sort === "price-asc") {
    list = [...list].sort((a, b) => (a.price ?? Infinity) - (b.price ?? Infinity));
  } else if (sort === "price-desc") {
    list = [...list].sort((a, b) => (b.price ?? -Infinity) - (a.price ?? -Infinity));
  } else if (sort === "name") {
    list = [...list].sort((a, b) => a.name.localeCompare(b.name));
  }

  return plain(list);
}

export async function getProductBySlug(slug) {
  cachedContent();
  const list = await getProducts();
  return plain(list.find((entry) => entry.slug === slug) ?? null);
}

export async function getFeaturedCollections() {
  cachedContent();
  const [homepage, collections] = await Promise.all([
    getHomepage(),
    getCollections(),
  ]);
  const slugs = homepage.featuredCollectionSlugs ?? [];
  return plain(
    slugs
      .map((slug) => collections.find((entry) => entry.slug === slug))
      .filter(Boolean),
  );
}

export async function getRelatedProducts(slug, limit = 4) {
  cachedContent();
  const list = await getProducts();
  const current = list.find((entry) => entry.slug === slug);
  if (!current) return [];
  const published = list.filter((entry) => entry.slug !== slug);
  const sameCollection = published.filter(
    (entry) => entry.collection === current.collection,
  );
  const sameCategory = published.filter(
    (entry) =>
      entry.collection !== current.collection &&
      entry.category === current.category,
  );
  return plain([...sameCollection, ...sameCategory].slice(0, limit));
}

/* ---------------- Stores ---------------- */

export async function getStores() {
  const list = await resourceList("stores", site.stores);
  return plain([...list].sort(byOrder));
}

export async function getStoreBySlug(slug) {
  cachedContent();
  const list = await getStores();
  return plain(list.find((entry) => entry.slug === slug) ?? null);
}

/* ---------------- Pages ---------------- */

export async function getPage(slug) {
  return contentValue(`page:${slug}`, site.pages[slug] ?? null);
}
