"use client";

import { Panel } from "../ui/fields";
import { getHomepageSectionSchema } from "../../../../lib/cms/homepage-sections";

const featuredField = getHomepageSectionSchema("featured").fields[0];

export default function FeaturedSection({ value, onChange, copy, options }) {
  const collections = options?.collections ?? [];
  const selected = Array.isArray(value?.featuredCollectionSlugs)
    ? value.featuredCollectionSlugs
    : [];

  function toggle(slug) {
    onChange({
      featuredCollectionSlugs: selected.includes(slug)
        ? selected.filter((entry) => entry !== slug)
        : [...selected, slug],
    });
  }

  return (
    <Panel
      title={copy.homepage.sections.featured.copyTitle}
      description={copy.homepage.sections.featured.description}
    >
      {collections.length === 0 ? (
        <p className="rounded-sm border border-dashed border-white/10 px-4 py-8 text-center text-xs text-muted">
          {copy.form.noItems}
        </p>
      ) : null}

      <div className="grid gap-2 sm:grid-cols-2">
        {collections.map((collection) => {
          const checked = selected.includes(collection.slug);
          const position = selected.indexOf(collection.slug);
          return (
            <button
              key={collection.slug}
              type="button"
              onClick={() => toggle(collection.slug)}
              aria-pressed={checked}
              className={`flex min-h-[54px] items-center gap-3 rounded-sm border px-3.5 text-left transition-colors ${
                checked
                  ? "border-gold/50 bg-gold/[0.07]"
                  : "border-white/[0.07] hover:border-white/20"
              }`}
            >
              <span
                aria-hidden="true"
                className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-[2px] border ${
                  checked ? "border-gold bg-gold" : "border-white/20"
                }`}
              >
                {checked ? (
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="var(--ink)"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-3 w-3"
                  >
                    <path d="m5 13 4 4L19 7" />
                  </svg>
                ) : null}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-xs font-semibold text-cream">
                  {collection.name}
                </span>
                <span className="block truncate text-[10px] text-muted">
                  {collection.slug}
                </span>
              </span>
              {checked ? (
                <span className="shrink-0 text-[9px] font-bold uppercase tracking-[0.16em] text-gold">
                  {position + 1}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>

      <p className="mt-4 text-[10px] text-muted">
        {featuredField?.label ?? "Featured collections"}
      </p>
    </Panel>
  );
}
