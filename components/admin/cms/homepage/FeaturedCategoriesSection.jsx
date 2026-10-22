"use client";

import { Button, Panel } from "../ui/fields";
import { useSortable } from "../ui/useSortable";
import Grip from "../ui/Grip";

/**
 * Featured categories picker.
 *
 * The featured set is stored data (an ordered list of slugs on the
 * homepage document) so every surface — the homepage now, the stores
 * page next — reads the same curated selection from one place. The order
 * is set by dragging; every category in the catalogue is listed so
 * nothing can be missed, and anything can be unfeatured in one click.
 */
export default function FeaturedCategoriesSection({ value, onChange, options, copy }) {
  const selected = Array.isArray(value?.featuredCategorySlugs)
    ? value.featuredCategorySlugs
    : [];
  const categories = options?.categories ?? [];
  const countLabels = copy.countLabels ?? {
    one: "collection",
    many: "collections",
  };
  const sectionCopy = copy.homepage.sections["featured-categories"];

  const { rowProps, markerFor, dragging, containerRef } = useSortable(
    selected,
    (next) => update(next),
  );

  function update(next) {
    onChange({ featuredCategorySlugs: next });
  }

  function feature(slug) {
    if (selected.includes(slug)) return;
    update([...selected, slug]);
  }

  function unfeature(slug) {
    update(selected.filter((entry) => entry !== slug));
  }

  function clearAll() {
    const confirmed = window.confirm(
      `${sectionCopy.clearTitle}\n\n${sectionCopy.clearBody}`,
    );
    if (confirmed) update([]);
  }

  const bySlug = new Map(categories.map((category) => [category.slug, category]));

  return (
    <div className="flex flex-col gap-5">
      <Panel
        title={sectionCopy.selected}
        description={sectionCopy.dragHint}
        actions={
          <div className="flex items-center gap-3">
            <span className="text-[9px] font-bold uppercase tracking-[0.24em] text-gold">
              {String(selected.length).padStart(2, "0")} /{" "}
              {String(categories.length).padStart(2, "0")}{" "}
              {sectionCopy.countLabel}
            </span>
            {selected.length > 0 ? (
              <Button variant="danger" onClick={clearAll}>
                {sectionCopy.clearAll}
              </Button>
            ) : null}
          </div>
        }
      >
        {selected.length === 0 ? (
          <p className="rounded-sm border border-dashed border-white/10 px-4 py-8 text-center text-xs text-muted">
            {sectionCopy.empty}
          </p>
        ) : null}

        <ul ref={containerRef} className="flex flex-col">
          {selected.map((slug, index) => {
            const category = bySlug.get(slug);
            const name = category?.name ?? slug;
            const draft = category && category.status !== "published";
            const count = category?.collectionCount ?? 0;
            const marker = markerFor(index);

            return (
              <li
                key={slug}
                {...rowProps(index)}
                className={`group relative flex cursor-grab items-center gap-3 border-b border-white/[0.07] py-3.5 pr-1 transition-all duration-200 active:cursor-grabbing sm:gap-4 ${
                  dragging === index ? "opacity-35" : "hover:bg-white/[0.02]"
                }`}
              >
                {marker === "before" ? (
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-x-0 -top-px h-0.5 bg-gold shadow-[0_0_10px_rgba(230,196,64,0.8)]"
                  />
                ) : null}
                {marker === "after" ? (
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-x-0 -bottom-px h-0.5 bg-gold shadow-[0_0_10px_rgba(230,196,64,0.8)]"
                  />
                ) : null}

                <span
                  aria-hidden="true"
                  className="shrink-0 text-muted transition-colors group-hover:text-gold"
                >
                  <Grip />
                </span>

                <span className="inline-flex h-7 min-w-7 shrink-0 items-center justify-center rounded-full border border-gold/25 px-1.5 text-[9px] font-bold tabular-nums text-gold">
                  {String(index + 1).padStart(2, "0")}
                </span>

                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
                    <span className="truncate text-sm font-semibold text-cream">
                      {name}
                    </span>
                    {draft ? (
                      <span className="rounded-sm border border-red-400/30 bg-red-400/[0.06] px-2 py-0.5 text-[8px] font-bold uppercase tracking-[0.16em] text-red-300">
                        {sectionCopy.draftWarning}
                      </span>
                    ) : null}
                  </span>
                  <span className="mt-1 flex flex-wrap items-center gap-x-3 text-[10px] uppercase tracking-[0.16em] text-muted">
                    <span className="truncate">/{slug}</span>
                    <span>
                      {count} {count === 1 ? countLabels.one : countLabels.many}
                    </span>
                  </span>
                </span>

                <button
                  type="button"
                  onClick={() => unfeature(slug)}
                  className="shrink-0 rounded-sm border border-white/10 px-2.5 py-1.5 text-[9px] font-bold uppercase tracking-[0.14em] text-muted transition-colors hover:border-red-400/40 hover:text-red-300"
                >
                  {sectionCopy.unfeature}
                </button>
              </li>
            );
          })}
        </ul>
      </Panel>

      <Panel
        title={sectionCopy.available}
        actions={
          <span className="text-[9px] font-bold uppercase tracking-[0.24em] text-muted">
            {String(categories.length).padStart(2, "0")}
          </span>
        }
      >
        {categories.length === 0 ? (
          <p className="rounded-sm border border-dashed border-white/10 px-4 py-6 text-center text-xs text-muted">
            {copy.form.noItems}
          </p>
        ) : (
          <ul className="divide-y divide-white/[0.07]">
            {categories.map((category) => {
              const isFeatured = selected.includes(category.slug);
              return (
                <li
                  key={category.slug}
                  className="flex items-center gap-3 py-3 sm:gap-4"
                >
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
                      <span
                        className={`truncate text-xs font-semibold ${
                          isFeatured ? "text-gold" : "text-cream"
                        }`}
                      >
                        {category.name}
                      </span>
                      {isFeatured ? (
                        <span className="rounded-sm border border-gold/35 bg-gold/[0.07] px-2 py-0.5 text-[8px] font-bold uppercase tracking-[0.16em] text-gold">
                          {sectionCopy.featuredBadge}
                        </span>
                      ) : null}
                    </span>
                    <span className="mt-0.5 block truncate text-[10px] text-muted">
                      /{category.slug}
                      {category.collectionCount
                        ? ` · ${category.collectionCount} ${category.collectionCount === 1 ? countLabels.one : countLabels.many}`
                        : ` · ${sectionCopy.noCollections}`}
                    </span>
                  </span>

                  <button
                    type="button"
                    onClick={() => feature(category.slug)}
                    disabled={isFeatured}
                    className="shrink-0 rounded-sm border border-white/10 px-3 py-1.5 text-[9px] font-bold uppercase tracking-[0.14em] text-muted transition-colors hover:border-gold/50 hover:text-gold disabled:cursor-not-allowed disabled:border-gold/25 disabled:text-gold/60 disabled:hover:text-gold/60"
                  >
                    {isFeatured ? sectionCopy.featuredBadge : sectionCopy.feature}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </Panel>
    </div>
  );
}
