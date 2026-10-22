"use client";

import { useMemo, useState } from "react";
import CatalogTile from "../catalog/CatalogTile";

/**
 * Filterable collection explorer: category chips (All + every category
 * that actually holds published collections, with derived counts) over
 * a staggered grid of collection tiles. Switching a filter replays the
 * tile-rise stagger and announces the result count (reduced-motion
 * safe via the global rule). Chips, labels, counts and per-tile style
 * counts all derive from data; only the active filter is client state.
 */
export default function CollectionExplorer({
  collections,
  categories,
  allLabel,
  countLabels,
  styleCounts,
  styleCountLabels,
}) {
  const [active, setActive] = useState("all");

  const categoriesById = useMemo(
    () =>
      Object.fromEntries(
        categories.map((category) => [category.slug, category]),
      ),
    [categories],
  );

  // A chip can never lead to an empty grid: categories only appear
  // when they own at least one published collection.
  const chips = useMemo(() => {
    const counts = collections.reduce((acc, collection) => {
      acc[collection.category] = (acc[collection.category] ?? 0) + 1;
      return acc;
    }, {});
    return categories
      .filter((category) => counts[category.slug] > 0)
      .map((category) => ({ ...category, count: counts[category.slug] }));
  }, [collections, categories]);

  const filtered =
    active === "all"
      ? collections
      : collections.filter((collection) => collection.category === active);

  const chipClass = (selected) =>
    `group/chip inline-flex min-h-[44px] items-center rounded-sm border px-4 text-xs font-bold uppercase tracking-[0.14em] transition-colors duration-300 ${
      selected
        ? "border-gold bg-gold text-ink shadow-[0_0_20px_rgba(230,196,64,0.2)]"
        : "border-steel bg-charcoal/50 text-silver hover:border-gold/60 hover:text-gold-highlight"
    }`;

  const countLabel =
    filtered.length === 1 ? countLabels.one : countLabels.many;

  return (
    <div>
      <div className="flex flex-col gap-6 border-b border-graphite pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setActive("all")}
            aria-pressed={active === "all"}
            className={chipClass(active === "all")}
          >
            {allLabel}
            <span
              aria-hidden="true"
              className="tnum ml-2 text-[11px] font-semibold opacity-60"
            >
              {collections.length}
            </span>
          </button>
          {chips.map((category) => (
            <button
              key={category.slug}
              type="button"
              onClick={() => setActive(category.slug)}
              aria-pressed={active === category.slug}
              className={chipClass(active === category.slug)}
            >
              {category.name}
              <span
                aria-hidden="true"
                className="tnum ml-2 text-[11px] font-semibold opacity-60"
              >
                {category.count}
              </span>
            </button>
          ))}
        </div>
        <p
          aria-live="polite"
          className="flex items-baseline gap-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-silver"
        >
          <span className="tnum font-display text-lg font-black leading-none text-gold">
            {filtered.length}
          </span>
          {countLabel}
        </p>
      </div>

      <div
        key={active}
        className="mt-10 grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4"
      >
        {filtered.map((collection, index) => {
          const styleCount = styleCounts[collection.slug] ?? 0;
          return (
            <div
              key={collection.slug}
              className="tile-rise"
              style={{ animationDelay: `${Math.min(index, 11) * 45}ms` }}
            >
              <CatalogTile
                href={`/collections/${collection.slug}`}
                image={collection.image}
                name={collection.name}
                index={String(collection.order).padStart(2, "0")}
                kicker={categoriesById[collection.category]?.name}
                count={styleCount > 0 ? styleCount : undefined}
                countLabels={styleCountLabels}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
