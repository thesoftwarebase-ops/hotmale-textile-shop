/**
 * The common sections — the site-wide chrome that appears on every
 * page: the closing CTA band, the navbar links and the footer.
 *
 * Each section owns one or more slices of a content document:
 *   cta     → global.cta
 *   navbar  → navigation.items + global.brand (the logo and wordmark)
 *   footer  → navigation.footer + global.brand + global.social + global.ui
 *
 * A slice is addressed by `doc` (the document) plus an optional `path`
 * inside it, so a section can own a single nested field as well.
 */
import { contentSchemas } from "./schema";

const linkFields = [
  { name: "label", label: "Label", type: "text", required: true },
  { name: "href", label: "Link", type: "text", required: true },
];

const globalField = (name) =>
  contentSchemas.global.fields.find((field) => field.name === name);

const brandFields = globalField("brand")?.fields ?? [];
const socialFields = globalField("social")?.fields ?? [];
const uiField = (name) =>
  globalField("ui")?.fields.find((field) => field.name === name);

export const commonSectionSchemas = {
  cta: {
    key: "cta",
    title: "Closing CTA",
    description:
      "The band that closes every page: the headline, the supporting line and the two actions.",
    doc: "global",
    field: "cta",
    fields: [
      {
        name: "cta",
        label: "Closing CTA",
        type: "object",
        fields: [
          { name: "eyebrow", label: "Eyebrow", type: "text" },
          { name: "title", label: "Title", type: "text" },
          { name: "subtitle", label: "Subtitle", type: "textarea" },
          {
            name: "primaryCta",
            label: "Primary action",
            type: "object",
            fields: linkFields,
          },
          {
            name: "secondaryCta",
            label: "Secondary action",
            type: "object",
            fields: linkFields,
          },
        ],
      },
    ],
  },
  navbar: {
    key: "navbar",
    title: "Navbar",
    description:
      "The logo, the wordmark and the main navigation links, in the order they appear across the top of every page.",
    doc: "navigation",
    field: "items",
    fields: [
      {
        name: "items",
        label: "Navigation links",
        type: "repeater",
        itemLabel: "Link",
        doc: "navigation",
        fields: [
          { name: "label", label: "Label", type: "text", required: true },
          { name: "href", label: "Link", type: "text", required: true },
          { name: "visible", label: "Visible", type: "boolean", default: true },
          { name: "order", label: "Position", type: "number", min: 1 },
        ],
      },
      {
        name: "brand",
        label: "Logo and wordmark",
        type: "object",
        doc: "global",
        fields: brandFields,
      },
    ],
  },
  footer: {
    key: "footer",
    title: "Footer",
    description:
      "The link groups, the copyright line and the brand mark that closes every page.",
    doc: "navigation",
    field: "footer",
    fields: [
      {
        name: "footer",
        label: "Footer",
        type: "object",
        doc: "navigation",
        fields: [
          {
            name: "copyrightYear",
            label: "Copyright year",
            type: "number",
            min: 2000,
          },
          {
            name: "groups",
            label: "Link groups",
            type: "repeater",
            itemLabel: "Group",
            fields: [
              { name: "title", label: "Title", type: "text", required: true },
              { name: "order", label: "Position", type: "number", min: 1 },
              {
                name: "links",
                label: "Links",
                type: "repeater",
                itemLabel: "Link",
                fields: linkFields,
              },
            ],
          },
        ],
      },
      {
        name: "brand",
        label: "Logo and wordmark",
        type: "object",
        doc: "global",
        fields: brandFields,
      },
      {
        name: "social",
        label: "Instagram",
        type: "object",
        doc: "global",
        fields: socialFields,
      },
      {
        name: "backToTop",
        label: uiField("backToTop")?.label ?? "Back to top",
        type: "text",
        doc: "global",
        path: ["ui", "backToTop"],
      },
      {
        name: "homeLabel",
        label: uiField("homeLabel")?.label ?? "Home link label",
        type: "text",
        doc: "global",
        path: ["ui", "homeLabel"],
      },
    ],
  },
};

export const commonSectionList = Object.values(commonSectionSchemas).map(
  (schema) => ({
    key: schema.key,
    title: schema.title,
    description: schema.description,
  }),
);

export function getCommonSectionSchema(key) {
  return commonSectionSchemas[key] ?? null;
}
