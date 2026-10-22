/**
 * Pure helpers for the footer's store links. Shared by the server
 * (Mongo) and the editor (client state) so both agree on what a store
 * link is and what route it points at.
 */

export const FOOTER_STORE_GROUP_TITLE = "Stores";

export function storeHref(slug) {
  return `/stores/${slug}`;
}

/**
 * A footer link counts as this store when it points at the store page
 * (/stores/slug) or at its anchor on the index (/stores#slug).
 */
export function hrefMatchesStore(href, slug) {
  if (!href || !slug) return false;
  const clean = String(href).split("?")[0].replace(/\/+$/, "");
  return clean === `/stores/${slug}` || clean === `/stores#${slug}`;
}

export function isStoreGroup(group) {
  return (
    String(group?.title ?? "").trim().toLowerCase() ===
    FOOTER_STORE_GROUP_TITLE.toLowerCase()
  );
}

/**
 * Include or remove a store's link in the footer's link groups.
 * Returns the new groups array — the input is never mutated.
 */
export function toggleStoreLink(groups, store, include) {
  const list = Array.isArray(groups) ? groups : [];
  const slug = store?.slug;
  if (!slug) return list;

  if (!include) {
    return list.map((group) => ({
      ...group,
      links: (group.links ?? []).filter(
        (link) => !hrefMatchesStore(link.href, slug),
      ),
    }));
  }

  const link = { label: store.name || slug, href: storeHref(slug) };
  const groupIndex = list.findIndex(isStoreGroup);

  if (groupIndex === -1) {
    return [
      ...list,
      {
        title: FOOTER_STORE_GROUP_TITLE,
        order: list.length + 1,
        links: [link],
      },
    ];
  }

  return list.map((group, index) => {
    if (index !== groupIndex) return group;
    const links = group.links ?? [];
    const existing = links.findIndex((entry) =>
      hrefMatchesStore(entry.href, slug),
    );
    if (existing !== -1) {
      const linksNext = [...links];
      linksNext[existing] = { ...linksNext[existing], ...link };
      return { ...group, links: linksNext };
    }
    return { ...group, links: [...links, link] };
  });
}

/** Is this store currently linked in the footer? */
export function storeIsLinked(groups, slug) {
  return (Array.isArray(groups) ? groups : []).some((group) =>
    (group.links ?? []).some((link) => hrefMatchesStore(link.href, slug)),
  );
}
