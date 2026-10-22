"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

function Arrow({ className = "h-3.5 w-3.5" }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M5 12h13" />
      <path d="m12 6 6 6-6 6" />
    </svg>
  );
}

/**
 * Featured collections — a scroll-driven collection stage.
 *
 * Large screens: the stage (artwork + one action) sits on the left and
 * locks in place while the collection index on the right scrolls past
 * it; the index row that crosses the stage's activation line is the one
 * on show, and the stage is released when the section ends.
 *
 * Small screens: the same collections as plain cards — the stage is a
 * desktop experience and does not belong on a phone.
 */
export default function FeaturedCollections({
  collections,
  categories = [],
  title,
  linkLabel,
  linkHref = "/collections",
  viewLabel = "View collection",
  countLabels = {},
  headingId = "home-collections-heading",
}) {
  const [active, setActive] = useState(0);
  const indexRef = useRef(null);

  // Scroll driver: the index row that has crossed the stage's
  // activation line is the active one. The line is measured from the
  // live stage box (clamped to the viewport) and the rule is a
  // threshold, not a nearest-match — otherwise the rows below the line
  // would always win and the last collection would never be shown.
  useEffect(() => {
    const container = indexRef.current;
    if (!container) return undefined;

    let frame = 0;

    const update = () => {
      frame = 0;

      const stage = document.querySelector("[data-stage-panel]");
      if (!stage) return;

      const stageRect = stage.getBoundingClientRect();

      // Before layout the boxes measure zero; that would mark every row
      // as crossed and jump the stage to the last collection.
      if (stageRect.width === 0 || stageRect.height === 0) return;

      // While the section is off-screen the stage has no meaningful
      // position, so the active collection is left alone.
      if (stageRect.bottom < 0 || stageRect.top > window.innerHeight) return;

      // The stage has to be locked in place before the artwork starts
      // changing: until then the card is still entering from the
      // bottom, its action is below the fold, and swapping the
      // collection under the visitor's finger would be premature.
      if (stageRect.top > window.innerHeight * 0.2) return;

      // The activation line is the card's own top edge. A row changes
      // the artwork exactly when it reaches the card, so the visitor
      // reads the name and sees the matching picture — and nothing
      // changes while the card is still entering from below.
      const focal = stageRect.top;

      const rows = container.querySelectorAll("[data-collection-index]");
      let best = -1;
      rows.forEach((row, index) => {
        const rect = row.getBoundingClientRect();
        if (rect.top + rect.height / 2 <= focal) best = index;
      });

      if (best < 0) return;
      setActive((current) => (current === best ? current : best));
    };

    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [collections.length]);

  if (!collections || collections.length === 0) return null;

  const plural = countLabels.many ?? "collections";
  const categoryName = (slug) =>
    categories.find((category) => category.slug === slug)?.name ?? "";

  const current = collections[active] ?? collections[0];

  return (
    <section
      aria-labelledby={headingId}
      className="relative isolate border-y border-white/10 bg-ink"
    >
      {/*
        Decorative layers live in their own clipped wrapper. The section
        itself must stay overflow-visible: an ancestor with
        `overflow: hidden` becomes the scrollport for `position: sticky`,
        and since it never scrolls, the stage would slide away with the
        page instead of locking in place.
      */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-30 overflow-hidden"
      >
        <span
          className="absolute inset-0 opacity-60 [mask-image:radial-gradient(120%_90%_at_80%_0%,#000_20%,transparent_75%)]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(248,248,232,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(248,248,232,0.04) 1px, transparent 1px)",
            backgroundSize: "88px 88px",
          }}
        />
        <span className="absolute -right-24 top-24 h-[32rem] w-[32rem] rounded-full opacity-70 [background:radial-gradient(circle,rgba(230,196,64,0.14),transparent_68%)]" />
      </div>

      <span
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold/60 to-transparent"
      />

      <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        {/* Header */}
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <h2
            id={headingId}
            className="flex items-center gap-3 font-display text-4xl font-black uppercase leading-none tracking-tight text-cream sm:text-5xl"
          >
            <span aria-hidden="true" className="h-2 w-2 rotate-45 bg-gold" />
            {title}
          </h2>

          <div className="flex items-center gap-5 sm:gap-7">
            <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-muted">
              {String(collections.length).padStart(2, "0")} {plural}
            </span>
            {linkLabel ? (
              <Link
                href={linkHref}
                className="group inline-flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.26em] text-silver transition-colors hover:text-gold"
              >
                {linkLabel}
                <Arrow className="h-3 w-3 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            ) : null}
          </div>
        </div>

        <div
          aria-hidden="true"
          className="mt-8 h-px bg-gradient-to-r from-gold/70 via-gold/25 to-transparent"
        />

        {/* Small screens: the collections as plain cards */}
        <div className="mt-10 grid grid-cols-2 gap-4 lg:hidden">
          {collections.map((collection, index) => (
            <Link
              key={collection.slug}
              href={`/collections/${collection.slug}`}
              className="group relative block overflow-hidden rounded-md border border-white/10 bg-charcoal transition-all duration-500 hover:-translate-y-1 hover:border-gold/50"
            >
              <div className="@container relative aspect-[4/5] w-full overflow-hidden">
                <Image
                  src={collection.image}
                  alt=""
                  fill
                  sizes="50vw"
                  className="object-cover brightness-[0.72] contrast-[1.06] saturate-[0.28] transition-all duration-700 ease-out group-hover:scale-[1.06] group-hover:brightness-100 group-hover:saturate-100"
                />
                <span
                  aria-hidden="true"
                  className="absolute inset-0 bg-gradient-to-t from-ink via-ink/45 to-ink/10"
                />
                <span
                  aria-hidden="true"
                  className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-ink/75 to-transparent"
                />
                <span
                  aria-hidden="true"
                  className="absolute inset-3 rounded-sm border border-cream/10 transition-colors duration-500 group-hover:border-gold/40"
                />
                <span
                  aria-hidden="true"
                  className="absolute left-4 top-4 h-3 w-3 border-l border-t border-gold/50 transition-colors duration-500 group-hover:border-gold"
                />
                <span
                  aria-hidden="true"
                  className="absolute bottom-4 right-4 h-3 w-3 border-b border-r border-gold/50 transition-colors duration-500 group-hover:border-gold"
                />
                <span className="outline-numeral absolute left-4 top-3 z-10 font-display text-[clamp(2.4rem,15cqw,4.5rem)] font-black leading-none">
                  {String(index + 1).padStart(2, "0")}
                </span>

                {categoryName(collection.category) ? (
                  <p className="absolute right-4 top-5 z-10 max-w-[52%] text-right text-[8px] font-bold uppercase leading-[1.8] tracking-[0.2em] text-gold/85 transition-colors duration-300 group-hover:text-gold-highlight">
                    {categoryName(collection.category)}
                  </p>
                ) : null}

                <div className="absolute inset-x-0 bottom-0 z-10 p-4">
                  <h3 className="font-display text-lg font-bold uppercase leading-[1.05] tracking-tight text-cream transition-colors duration-300 group-hover:text-gold-highlight sm:text-xl">
                    {collection.name}
                  </h3>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Large screens: the stage on the left, the index on the right */}
        <div className="mt-10 hidden gap-12 lg:grid lg:grid-cols-2 lg:gap-16">
          {/* The stage — sticky, so it holds while the index scrolls */}
          <div className="lg:order-first">
            <div className="lg:sticky lg:top-[5.5rem]">
              <div className="relative mx-auto w-full max-w-[30rem]">
                {/* Depth frames behind the stage */}
                <span
                  aria-hidden="true"
                  className="absolute -right-3 -top-3 hidden h-full w-full border border-gold/15 lg:block"
                />
                <span
                  aria-hidden="true"
                  className="absolute -bottom-3 -left-3 hidden h-full w-full border border-white/[0.06] lg:block"
                />

                {/* The stage panel: the artwork, and the one action */}
                <div
                  data-stage-panel
                  className="grid h-[26rem] grid-rows-[1fr_auto] overflow-hidden border border-white/10 bg-charcoal sm:h-[30rem] lg:h-[34rem]"
                >
                  {/* Artwork */}
                  <div className="relative overflow-hidden">
                    <Image
                      key={current.slug}
                      src={current.image}
                      alt=""
                      fill
                      priority={active === 0}
                      sizes="(min-width: 1024px) 30rem, 100vw"
                      className="stage-zoom object-cover brightness-[0.7] contrast-[1.08] saturate-[0.3]"
                    />

                    <span
                      aria-hidden="true"
                      className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/20 to-ink/25"
                    />
                    <span
                      aria-hidden="true"
                      className="absolute inset-3 rounded-sm border border-cream/10"
                    />
                    <span
                      aria-hidden="true"
                      className="absolute left-5 top-5 h-3.5 w-3.5 border-l border-t border-gold/50"
                    />
                    <span
                      aria-hidden="true"
                      className="absolute bottom-5 right-5 h-3.5 w-3.5 border-b border-r border-gold/50"
                    />

                    {/* The active collection's number, bleeding off the edge */}
                    <span className="outline-numeral absolute -left-4 -top-9 select-none font-display text-[8rem] font-black leading-none opacity-60 sm:text-[9.5rem]">
                      {String(active + 1).padStart(2, "0")}
                    </span>
                  </div>

                  {/* The one action */}
                  <div className="border-t border-white/10 p-3">
                    <Link
                      href={`/collections/${current.slug}`}
                      className="group flex w-full items-center justify-between gap-4 bg-gold px-5 py-3.5 text-ink transition-colors duration-300 hover:bg-gold-highlight"
                    >
                      <span className="text-[10px] font-bold uppercase tracking-[0.18em]">
                        {viewLabel}
                      </span>
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-ink/30 transition-transform duration-300 group-hover:translate-x-0.5">
                        <Arrow />
                      </span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* The index — the scroll driver */}
          <div>
            <ol ref={indexRef} className="flex flex-col">
              {collections.map((collection, index) => {
                const isActive = index === active;
                const collectionKicker = categoryName(collection.category);

                return (
                  <li key={collection.slug} data-collection-index={index}>
                    <Link
                      href={`/collections/${collection.slug}`}
                      onFocus={() => setActive(index)}
                      onBlur={() => setActive(index)}
                      aria-current={isActive ? "true" : undefined}
                      className={`group flex items-center gap-4 border-b border-white/10 py-7 transition-colors duration-300 sm:gap-6 sm:py-8 ${
                        isActive ? "border-gold/40" : "hover:border-gold/25"
                      }`}
                    >
                      <span
                        className={`w-8 shrink-0 font-display text-base font-black tabular-nums transition-colors duration-300 ${
                          isActive ? "text-gold" : "text-muted/60"
                        }`}
                      >
                        {String(index + 1).padStart(2, "0")}
                      </span>

                      <span className="min-w-0 flex-1">
                        <span
                          className={`sheen-sweep block font-display text-3xl font-black uppercase leading-[0.92] tracking-tight transition-transform duration-500 sm:text-4xl lg:text-5xl ${
                            isActive
                              ? "translate-x-1.5"
                              : "group-hover:translate-x-1.5"
                          }`}
                        >
                          {collection.name}
                        </span>

                        {collectionKicker ? (
                          <span className="mt-3 block text-[9px] font-bold uppercase tracking-[0.22em] text-gold/80">
                            {collectionKicker}
                          </span>
                        ) : null}
                      </span>

                      <span
                        aria-hidden="true"
                        className={`shrink-0 text-muted transition-all duration-300 ${
                          isActive
                            ? "translate-x-0 text-gold opacity-100"
                            : "-translate-x-1 opacity-0 group-hover:translate-x-0 group-hover:opacity-100"
                        }`}
                      >
                        <Arrow className="h-4 w-4" />
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ol>

            {/*
              Trailing scroll room. The stage is sticky inside the other
              column, so its travel is the row's height minus the
              stage's own height. Without this run-out the stage runs
              out of travel one or two rows before the end of the list,
              and the last collection's artwork is never seen.
            */}
            <div
              aria-hidden="true"
              className="h-[30vh] min-h-[11rem] lg:h-[60vh] lg:min-h-[30rem]"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
