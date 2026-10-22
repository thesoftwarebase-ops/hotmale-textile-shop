import { contentSchemas } from "./schema";

/**
 * The homepage is edited one section at a time. Each section owns a slice
 * of the homepage document, so saving one block never rewrites another.
 * Every section slice is shaped `{ [fieldName]: value }` — the same key
 * the section uses inside the homepage document.
 *
 * Kept in its own module (instead of schema.js) so the section list and
 * the per-section schemas can be imported on their own.
 */
const homepageFieldMap = Object.fromEntries(
  contentSchemas.homepage.fields.map((field) => [field.name, field]),
);

export const homepageSectionSchemas = {
  hero: {
    key: "hero",
    title: "Hero",
    description:
      "The opening panel: headline, supporting copy, two calls to action and the rotating campaign posters.",
    fields: [homepageFieldMap.hero],
  },
  offers: {
    key: "offers",
    title: "Offers",
    description: "Promotional bands that sit directly under the hero.",
    fields: [homepageFieldMap.offers],
  },
  featured: {
    key: "featured",
    title: "Featured collections",
    description: "The collections highlighted in the collections grid.",
    fields: [homepageFieldMap.featuredCollectionSlugs],
  },
  "featured-categories": {
    key: "featured-categories",
    title: "Featured categories",
    description:
      "The categories that lead the homepage and the stores page. Pick them, then order them — the order is the order they appear in.",
    fields: [homepageFieldMap.featuredCategorySlugs],
  },
  "store-band": {
    key: "store-band",
    title: "Store band",
    description: "The band that pushes visitors towards the store finder.",
    fields: [homepageFieldMap.storesCta],
  },
  faq: {
    key: "faq",
    title: "Frequently asked questions",
    description: "Questions and answers shown near the bottom of the page.",
    fields: [homepageFieldMap.faq],
  },
};

export const homepageSectionList = Object.values(homepageSectionSchemas).map(
  (schema) => ({
    key: schema.key,
    title: schema.title,
    description: schema.description,
    fieldCount: schema.fields.length,
  }),
);

export function getHomepageSectionSchema(key) {
  return homepageSectionSchemas[key] ?? null;
}
