"use client";

import { useEffect, useRef } from "react";
import AppLink from "../transitions/AppLink";

/* Tone system — every text color is paired with its tile background so
 * contrast is guaranteed per tone (dark type on gold, light type on
 * charcoal/graphite). */
const TONES = {
  gold: {
    tile: "bg-gold text-ink",
    eyebrow: "text-ink/75",
    title: "text-ink",
    description: "text-ink/80",
    glow: "bg-[radial-gradient(130%_100%_at_100%_100%,rgba(20,17,15,0.18),transparent_62%)]",
    wash: "bg-gradient-to-br from-white/30 via-transparent to-transparent",
    aura: "via-ink/25",
    keyline: "border-ink/15 group-hover:border-ink/40",
    divider: "border-ink/15",
    nail: "bg-ink",
    corner: "border-ink/35",
    button: "border-ink/40 text-ink hover:border-ink hover:bg-ink hover:text-gold",
  },
  charcoal: {
    tile: "bg-charcoal text-cream",
    eyebrow: "text-gold",
    title: "text-cream",
    description: "text-silver",
    glow: "bg-[radial-gradient(130%_100%_at_100%_100%,rgba(201,162,75,0.18),transparent_62%)]",
    wash: "bg-gradient-to-br from-white/[0.05] via-transparent to-transparent",
    aura: "via-gold/70",
    keyline: "border-cream/10 group-hover:border-gold/40",
    divider: "border-cream/10",
    nail: "bg-gold",
    corner: "border-gold/50",
    button: "border-gold/40 text-gold hover:border-gold hover:bg-gold hover:text-ink",
  },
  graphite: {
    tile: "bg-graphite text-cream",
    eyebrow: "text-gold",
    title: "text-cream",
    description: "text-silver",
    glow: "bg-[radial-gradient(130%_100%_at_100%_100%,rgba(201,162,75,0.18),transparent_62%)]",
    wash: "bg-gradient-to-br from-white/[0.05] via-transparent to-transparent",
    aura: "via-gold/70",
    keyline: "border-cream/10 group-hover:border-gold/40",
    divider: "border-cream/10",
    nail: "bg-gold",
    corner: "border-gold/50",
    button: "border-cream/30 text-cream hover:border-cream hover:bg-cream hover:text-ink",
  },
};

/**
 * Offer poster. The tone block itself is the design: fabric pinstripe
 * texture, corner glow, mat keyline, editorial corner marks, top aura,
 * display title, reveal rule, copy and the store-scope button. No
 * imagery is ever used — every layer is tone, type or gradient. Only
 * decorative layers are absolutely positioned and they never capture
 * the pointer, so the copy always stays visible and clickable. The
 * same card is used for the single full-width state and inside the
 * marquee.
 */
function OfferCard({
  offer,
  stores,
  availableAtLabel,
  allStoresLabel,
  tabIndex,
  className = "",
  contentClassName = "mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10",
  compact = false,
}) {
  const tone = TONES[offer.tone] ?? TONES.charcoal;
  const scope = offer.stores ?? [];
  const scopeLabel =
    scope.length === 0
      ? ""
      : scope.includes("all")
        ? allStoresLabel
        : scope
            .map((slug) => stores?.find((store) => store.slug === slug)?.name)
            .filter(Boolean)
            .join(", ");

  /* Two type scales: the solo full-bleed poster keeps the big editorial
   * display, the marquee cards step down a notch so several posters can
   * sit on screen at once without the copy crowding out the art. Sizes
   * are container-relative (cqw) so the copy scales with the card, not
   * with the viewport — the text always fits inside the block. */
  const contentClasses = compact
    ? "relative z-10 flex min-h-0 flex-1 flex-col gap-3 whitespace-normal px-5 py-5 sm:px-6 sm:py-6 lg:px-7 lg:py-7"
    : `relative z-10 flex min-h-0 flex-1 flex-col gap-4 whitespace-normal ${contentClassName}`;
  const eyebrowClasses = compact
    ? "flex min-w-0 items-center gap-2.5 text-[clamp(0.58rem,2.4cqw,0.72rem)] font-bold uppercase tracking-[0.2em]"
    : "flex min-w-0 items-center gap-3 text-[11px] font-bold uppercase tracking-[0.24em]";
  const titleClasses = compact
    ? "break-words font-display text-[clamp(1.6rem,9cqw,3.35rem)] font-black uppercase leading-[0.9] tracking-tight"
    : "break-words font-display text-[clamp(2rem,7cqw,4.5rem)] font-black uppercase leading-[0.88] tracking-tight";
  const descriptionClasses = compact
    ? "max-w-md text-[clamp(0.75rem,3.1cqw,0.9rem)] font-medium leading-relaxed"
    : "max-w-xl text-sm font-medium leading-relaxed sm:text-base";
  const scopeClasses = compact
    ? "group/scope inline-flex min-w-0 max-w-full flex-wrap items-center gap-x-2 gap-y-0.5 rounded-sm border px-2.5 py-1 text-[clamp(0.55rem,2.2cqw,0.7rem)] font-bold uppercase tracking-[0.1em] transition-colors"
    : "group/scope inline-flex w-fit max-w-full flex-wrap items-center gap-x-2 gap-y-0.5 rounded-sm border px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em] transition-colors sm:text-[11px]";
  const scopeCaptionClasses = compact
    ? "text-[clamp(0.55rem,2.2cqw,0.7rem)] font-bold uppercase tracking-[0.22em] opacity-60"
    : "text-[9px] font-bold uppercase tracking-[0.24em] opacity-60";

  return (
    <article
      className={`group relative flex flex-col overflow-hidden border-y border-graphite @container ${tone.tile} ${className}`}
    >
      {/* Top aura hairline — the brand's gold crown */}
      <span
        aria-hidden="true"
        className={`pointer-events-none absolute inset-x-0 top-0 z-20 h-px bg-gradient-to-r from-transparent to-transparent ${tone.aura}`}
      />
      {/* Fabric pinstripe texture — pure gradient, no imagery */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[repeating-linear-gradient(135deg,currentColor_0_1px,transparent_1px_14px)] opacity-[0.04]"
      />
      {/* Depth glow rising from the lower corner */}
      <span
        aria-hidden="true"
        className={`pointer-events-none absolute inset-0 ${tone.glow}`}
      />
      {/* Tone wash: light catching the block */}
      <span
        aria-hidden="true"
        className={`pointer-events-none absolute inset-0 ${tone.wash}`}
      />
      {/* Museum-mat keyline, wakes on hover */}
      <span
        aria-hidden="true"
        className={`pointer-events-none absolute inset-2 z-20 rounded-sm border transition-colors duration-300 ${tone.keyline}`}
      />
      {/* Editorial corner marks, echoing the keyline */}
      <span
        aria-hidden="true"
        className={`pointer-events-none absolute left-4 top-4 z-20 h-3 w-3 border-l border-t transition-colors duration-300 ${tone.corner}`}
      />
      <span
        aria-hidden="true"
        className={`pointer-events-none absolute bottom-4 right-4 z-20 h-3 w-3 border-b border-r transition-colors duration-300 ${tone.corner}`}
      />
      {/* Travelling sheen across the block on hover */}
      <span
        aria-hidden="true"
        className="card-sheen pointer-events-none absolute inset-0 z-10"
      />

      <div className={contentClasses}>
        {/* Eyebrow: campaign label */}
        <span className={`${eyebrowClasses} ${tone.eyebrow}`}>
          <span
            aria-hidden="true"
            className={`h-[6px] w-[6px] shrink-0 rotate-45 transition-transform duration-700 group-hover:rotate-[135deg] ${tone.nail}`}
          />
          <span className="min-w-0 break-words">{offer.label}</span>
        </span>

        {/* Poster block — anchored to the base of the block */}
        <div className="mt-auto flex min-w-0 flex-col gap-3 sm:gap-4">
          <h3 className={`${titleClasses} ${tone.title}`}>{offer.title}</h3>
          <span
            aria-hidden="true"
            className={`h-px w-10 transition-all duration-500 group-hover:w-16 ${tone.nail}`}
          />
          <p className={`${descriptionClasses} ${tone.description}`}>
            {offer.description}
          </p>
          {scopeLabel && (
            <div
              className={`mt-1 flex flex-wrap items-center gap-x-3 gap-y-2 border-t pt-3 ${tone.divider}`}
            >
              <span className={scopeCaptionClasses}>{availableAtLabel}</span>
              <AppLink
                href="/stores"
                tabIndex={tabIndex}
                className={`${scopeClasses} ${tone.button}`}
              >
                <span className="min-w-0 break-words font-black">{scopeLabel}</span>
                <span
                  aria-hidden="true"
                  className="transition-transform duration-300 group-hover/scope:translate-x-0.5"
                >
                  →
                </span>
              </AppLink>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}

const MARQUEE_SECONDS_PER_CARD = 8; // seconds for one poster to cross the viewport
const DRAG_CLICK_THRESHOLD = 6; // px dragged before a click counts as a drag

/**
 * Pullable marquee: a rAF-driven track that auto-scrolls calmly, pauses
 * on hover/focus/off-screen and can be dragged with mouse, touch or
 * pen. Position wraps invisibly because both track halves are
 * identical; pointer capture only engages once a real drag starts so
 * plain taps still reach the card links, and clicks right after a drag
 * are swallowed. Auto-scroll never runs under reduced motion, but
 * dragging still works.
 */
function OffersMarquee({ children, count }) {
  const trackRef = useRef(null);
  const halfRef = useRef(0);
  const speedRef = useRef(0);
  const posRef = useRef(0);
  const dragRef = useRef(null);
  const hoverRef = useRef(false);
  const focusRef = useRef(false);
  const onscreenRef = useRef(true);
  const suppressClickRef = useRef(false);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const measure = () => {
      halfRef.current = track.offsetWidth / 2;
      // One copy of the track holds `count` cards, so base the speed on
      // card time (not pixels) — a poster always crosses in the same
      // number of seconds regardless of viewport width.
      speedRef.current =
        count > 0
          ? halfRef.current / (count * MARQUEE_SECONDS_PER_CARD)
          : 0;
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(track);

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame;
    let last = performance.now();

    const tick = (now) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      const half = halfRef.current;
      if (half > 0) {
        const held =
          dragRef.current !== null ||
          hoverRef.current ||
          focusRef.current ||
          !onscreenRef.current ||
          reduced.matches;
        if (!held) posRef.current += speedRef.current * dt;
        const pos = ((posRef.current % half) + half) % half;
        track.style.transform = `translate3d(${-pos}px,0,0)`;
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [count]);

  useEffect(() => {
    const wrap = trackRef.current?.parentElement;
    if (!wrap || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        onscreenRef.current = entry.isIntersecting;
      },
      { threshold: 0 },
    );
    observer.observe(wrap);
    return () => observer.disconnect();
  }, []);

  const onPointerDown = (event) => {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    dragRef.current = {
      startX: event.clientX,
      startPos: posRef.current,
      moved: 0,
      captured: false,
    };
  };

  const onPointerMove = (event) => {
    const drag = dragRef.current;
    if (!drag) return;
    const dx = event.clientX - drag.startX;
    drag.moved = Math.max(drag.moved, Math.abs(dx));
    // Capture only once the gesture is clearly a drag, so plain taps
    // still reach links inside the cards.
    if (!drag.captured && drag.moved > DRAG_CLICK_THRESHOLD) {
      drag.captured = true;
      event.currentTarget.setPointerCapture?.(event.pointerId);
    }
    posRef.current = drag.startPos - dx;
  };

  const endDrag = (event) => {
    const drag = dragRef.current;
    if (!drag) return;
    dragRef.current = null;
    if (drag.moved > DRAG_CLICK_THRESHOLD) {
      suppressClickRef.current = true;
      window.setTimeout(() => {
        suppressClickRef.current = false;
      }, 0);
    }
    if (
      drag.captured &&
      event.currentTarget.hasPointerCapture?.(event.pointerId)
    ) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  const onClickCapture = (event) => {
    if (!suppressClickRef.current) return;
    suppressClickRef.current = false;
    event.preventDefault();
    event.stopPropagation();
  };

  return (
    <div
      className="@container mt-10 cursor-grab touch-pan-y select-none overflow-hidden active:cursor-grabbing"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      onPointerEnter={() => {
        hoverRef.current = true;
      }}
      onPointerLeave={() => {
        hoverRef.current = false;
      }}
      onFocusCapture={() => {
        focusRef.current = true;
      }}
      onBlurCapture={() => {
        focusRef.current = false;
      }}
      onClickCapture={onClickCapture}
    >
      <div ref={trackRef} className="marquee-inner">
        {children}
      </div>
    </div>
  );
}

export default function OffersSection({
  title,
  offers,
  stores,
  availableAtLabel,
  allStoresLabel,
}) {
  const enabled = (offers ?? [])
    .filter((offer) => offer.enabled)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  if (enabled.length === 0) return null;

  const heading = (
    <h2
      id="offers-heading"
      className="flex items-center gap-3 font-display text-4xl font-black uppercase leading-none tracking-tight text-cream sm:text-5xl"
    >
      <span aria-hidden="true" className="h-2 w-2 rotate-45 bg-gold" />
      {title}
    </h2>
  );

  // Marquee cards are smaller than the solo poster: they sit shoulder
  // to shoulder in a scrolling row, so the type steps down a notch and
  // the copy stays comfortably inside the narrower block.
  const cardSize =
    "min-h-[178px] w-[86cqw] shrink-0 sm:min-h-[200px] sm:w-[62cqw] lg:min-h-[232px] lg:w-[46cqw]";

  // One offer: a single full-width poster, edge to edge with no side
  // margins.
  if (enabled.length === 1) {
    return (
      <section aria-labelledby="offers-heading" className="py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">{heading}</div>
        <OfferCard
          offer={enabled[0]}
          stores={stores}
          availableAtLabel={availableAtLabel}
          allStoresLabel={allStoresLabel}
          className="mt-10 w-full"
        />
      </section>
    );
  }

  // Two or more: pullable full-bleed marquee of those exact same
  // full-width posters. Each copy of the list already spans at least
  // two viewports, so blank space can never appear; the second copy is
  // a hidden-AT duplicate that makes the position wrap seamless.
  const row = (hidden) => (
    <div
      className="flex shrink-0 items-stretch gap-3 pr-3 sm:gap-4 sm:pr-4"
      aria-hidden={hidden || undefined}
    >
      {enabled.map((offer) => (
        <OfferCard
          key={`${hidden ? "b" : "a"}-${offer.title}`}
          offer={offer}
          stores={stores}
          availableAtLabel={availableAtLabel}
          allStoresLabel={allStoresLabel}
          tabIndex={hidden ? -1 : undefined}
          className={cardSize}
          compact
        />
      ))}
    </div>
  );

  return (
    <section aria-labelledby="offers-heading" className="py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">{heading}</div>
      <OffersMarquee count={enabled.length}>
        {row(false)}
        {row(true)}
      </OffersMarquee>
    </section>
  );
}
