import {
  FOOTER_STORE_GROUP_TITLE,
  hrefMatchesStore,
  isStoreGroup,
  storeHref,
  toggleStoreLink,
} from "./footer-links";

/**
 * The footer's store links and the store routes are one thing: a link
 * points at /stores/<slug>, the route the store actually serves. The
 * CMS keeps them in step — creating a store adds its link, renaming a
 * store rewrites the link, deleting a store removes it.
 */

const FOOTER_GROUP_TITLE = FOOTER_STORE_GROUP_TITLE;
const CONTENT_KEY = "navigation";
const CONTENT_COLLECTION = "site_content";

export { hrefMatchesStore, storeHref };

async function readFooter(db) {
  const doc = await db
    .collection(CONTENT_COLLECTION)
    .findOne({ _id: CONTENT_KEY });
  const footer = doc?.value?.footer;
  if (!doc || !footer) return null;
  return { doc, footer };
}

async function writeGroups(db, doc, footer, groups) {
  await db.collection(CONTENT_COLLECTION).updateOne(
    { _id: CONTENT_KEY },
    {
      $set: {
        value: { ...doc.value, footer: { ...footer, groups } },
        updatedAt: new Date(),
      },
    },
  );
}

/**
 * Add the link for a store, or refresh the label of the one it already
 * has. Safe to call on every create and update.
 */
export async function syncFooterStoreLink(db, { slug, name }) {
  if (!slug) return;
  const current = await readFooter(db);
  if (!current) return;

  const { doc, footer } = current;
  const groups = Array.isArray(footer.groups) ? footer.groups : [];
  let changed = false;

  const nextGroups = groups.map((group) => {
    const links = group.links ?? [];
    const index = links.findIndex((link) => hrefMatchesStore(link.href, slug));
    if (index === -1) return group;
    changed = true;
    const linksNext = [...links];
    linksNext[index] = {
      ...linksNext[index],
      href: storeHref(slug),
      ...(name ? { label: name } : {}),
    };
    return { ...group, links: linksNext };
  });

  if (changed) {
    await writeGroups(db, doc, footer, nextGroups);
    return;
  }

  // The store is not linked yet — add it to the Stores group.
  const link = { label: name || slug, href: storeHref(slug) };
  const groupIndex = groups.findIndex(isStoreGroup);

  if (groupIndex === -1) {
    await writeGroups(db, doc, footer, [
      ...groups,
      {
        title: FOOTER_GROUP_TITLE,
        order: groups.length + 1,
        links: [link],
      },
    ]);
    return;
  }

  const withLink = groups.map((group, index) =>
    index === groupIndex
      ? { ...group, links: [...(group.links ?? []), link] }
      : group,
  );
  await writeGroups(db, doc, footer, withLink);
}

/**
 * Rewrite the link when a store's slug changes. The link keeps the
 * shape it had — an anchor stays an anchor, a path stays a path.
 */
export async function renameFooterStoreLink(db, oldSlug, newSlug, name) {
  if (!oldSlug || !newSlug) return;
  const current = await readFooter(db);
  if (!current) return;

  const { doc, footer } = current;
  const groups = Array.isArray(footer.groups) ? footer.groups : [];
  let changed = false;

  const nextGroups = groups.map((group) => {
    const links = group.links ?? [];
    let groupChanged = false;
    const nextLinks = links.map((link) => {
      if (!hrefMatchesStore(link.href, oldSlug)) return link;
      groupChanged = true;
      changed = true;
      const keepAnchor = String(link.href).includes("#");
      return {
        ...link,
        href: keepAnchor ? `/stores#${newSlug}` : storeHref(newSlug),
        ...(name ? { label: name } : {}),
      };
    });
    return groupChanged ? { ...group, links: nextLinks } : group;
  });

  if (changed) await writeGroups(db, doc, footer, nextGroups);
}

/** Drop the link for a store that is being deleted. */
export async function removeFooterStoreLink(db, slug) {
  if (!slug) return;
  const current = await readFooter(db);
  if (!current) return;

  const { doc, footer } = current;
  const groups = Array.isArray(footer.groups) ? footer.groups : [];
  let changed = false;

  const nextGroups = groups.map((group) => {
    const links = group.links ?? [];
    const nextLinks = links.filter((link) => !hrefMatchesStore(link.href, slug));
    if (nextLinks.length === links.length) return group;
    changed = true;
    return { ...group, links: nextLinks };
  });

  if (changed) await writeGroups(db, doc, footer, nextGroups);
}

/** The store slugs a set of link groups points at. */
function storeSlugsInGroups(groups) {
  const slugs = new Set();
  for (const group of Array.isArray(groups) ? groups : []) {
    for (const link of group.links ?? []) {
      const match = String(link.href ?? "").match(/^\/stores\/?#?([a-z0-9-]+)$/);
      if (match) slugs.add(match[1]);
    }
  }
  return slugs;
}

/**
 * Where a store is still referenced. A branch that is linked in the
 * footer but still carries styles or an offer cannot simply vanish.
 */
async function storeUsage(db, slug) {
  const [products, homepage] = await Promise.all([
    db.collection("products").countDocuments({ storeSlugs: slug }),
    db.collection(CONTENT_COLLECTION).findOne({ _id: "homepage" }),
  ]);
  const inOffer = (homepage?.value?.offers ?? []).some((offer) =>
    (offer.stores ?? []).includes(slug),
  );
  return { products, inOffer, inUse: products > 0 || inOffer };
}

/**
 * The footer and the store records are one thing: a branch that is not
 * linked in the footer is not a branch. Every store the footer does not
 * link loses its record, page and details. A branch that is still used
 * by styles or an offer keeps its link and is reported back, so the two
 * never drift apart.
 */
export async function reconcileFooterStores(db, nextGroups) {
  const linked = storeSlugsInGroups(nextGroups);
  const stores = await db
    .collection("stores")
    .find({}, { projection: { slug: 1, name: 1 } })
    .toArray();

  const deleted = [];
  const kept = [];

  for (const store of stores) {
    if (linked.has(store.slug)) continue;
    const usage = await storeUsage(db, store.slug);
    if (usage.inUse) {
      kept.push({
        slug: store.slug,
        name: store.name ?? store.slug,
        products: usage.products,
        inOffer: usage.inOffer,
      });
      continue;
    }
    await db.collection("stores").deleteOne({ slug: store.slug });
    deleted.push({ slug: store.slug, name: store.name ?? store.slug });
  }

  // Links that point at a branch which does not exist.
  const missing = [];
  for (const slug of linked) {
    const exists = await db
      .collection("stores")
      .findOne({ slug }, { projection: { _id: 1 } });
    if (!exists) missing.push(slug);
  }

  return { deleted, kept, missing };
}
