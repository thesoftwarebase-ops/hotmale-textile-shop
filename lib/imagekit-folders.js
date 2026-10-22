/**
 * Shared, secret-free upload rules. Imported by both the server routes
 * and the browser UI so the folder map lives in exactly one place.
 */

export const WEBP_MIME = "image/webp";
export const WEBP_EXT = ".webp";
export const MAX_UPLOAD_BYTES = 20 * 1024 * 1024;

/** Parent folder for every upload. */
export const ROOT_FOLDER = "hotmale";

/**
 * Section key -> ImageKit folder. The key is what the admin UI sends;
 * the folder is decided server-side so uploads can never escape the tree.
 */
export const SECTION_FOLDERS = {
  hero: `${ROOT_FOLDER}/hero`,
  sections: `${ROOT_FOLDER}/sections`,
  pages: `${ROOT_FOLDER}/pages`,
  offers: `${ROOT_FOLDER}/offers`,
  featured: `${ROOT_FOLDER}/collections`,
  "store-band": `${ROOT_FOLDER}/stores`,
  faq: `${ROOT_FOLDER}/faq`,
  categories: `${ROOT_FOLDER}/categories`,
  collections: `${ROOT_FOLDER}/collections`,
  products: `${ROOT_FOLDER}/products`,
  stores: `${ROOT_FOLDER}/stores`,
  brand: `${ROOT_FOLDER}/brand`,
  og: `${ROOT_FOLDER}/og`,
};

export function folderForSection(section) {
  return SECTION_FOLDERS[section] ?? null;
}
