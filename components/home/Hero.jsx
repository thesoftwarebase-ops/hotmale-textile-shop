"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import AppLink from "../transitions/AppLink";

/**
 * Homepage hero carousel: full-bleed campaign posters crossfading
 * behind one persistent CTA overlay. Mobile gets a cinematic story
 * frame — the landscape poster shown in full (never cropped) over a
 * blurred, dimmed copy of itself while the CTA panel flows beneath;
 * desktop gets the same self-matte treatment full viewport with the
 * overlay pinned to the quiet zone. Auto-advances every 2s, pausing on
 * hover, focus, off-screen, hidden tabs and reduced motion, with the
 * active dot acting as an autoplay progress bar. Swipeable,
 * keyboard-operable, dots use each poster's own alt text. First poster
 * paints first (LCP).
 */
const AUTOPLAY_MS = 2000;
const SWIPE_PX = 40;

export default function Hero({ hero, ui }) {
  const posters = hero.posters || [];
  const [index, setIndex] = useState(0);
  const [held, setHeld] = useState(false);
  const [onscreen, setOnscreen] = useState(true);
  const frame = useRef(null);
  const touchX = useRef(null);
  const count = posters.length;

  const go = (next) => setIndex(((next % count) + count) % count);

  useEffect(() => {
    const node = frame.current;
    if (!node || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(
      ([entry]) => setOnscreen(entry.isIntersecting),
      { threshold: 0.1 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (held || !onscreen || count < 2) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (document.hidden) return;
    const timer = setInterval(() => {
      setIndex((current) => (current + 1) % count);
    }, AUTOPLAY_MS);
    return () => clearInterval(timer);
  }, [held, onscreen, count]);

  return (
    <section
      ref={frame}
      aria-roledescription={ui.carouselRoleDescription}
      aria-label={hero.eyebrow || hero.headline}
      className="relative overflow-hidden bg-ink"
      onMouseEnter={() => setHeld(true)}
      onMouseLeave={() => setHeld(false)}
      onFocus={() => setHeld(true)}
      onBlur={() => setHeld(false)}
      onTouchStart={(event) => {
        touchX.current = event.touches[0].clientX;
      }}
      onTouchEnd={(event) => {
        if (touchX.current === null) return;
        const delta = event.changedTouches[0].clientX - touchX.current;
        touchX.current = null;
        if (Math.abs(delta) < SWIPE_PX) return;
        go(index + (delta < 0 ? 1 : -1));
      }}
    >
      {/* Stage: story frame on mobile (tall, poster fully visible over
          its own blur), full viewport on desktop */}
      <div className="relative aspect-[4/5] max-h-[68svh] w-full md:aspect-auto md:h-[92svh] md:max-h-none md:min-h-[540px]">
        {posters.map((poster, slide) => {
          const active = slide === index;
          return (
            <div
              key={poster.src}
              aria-hidden={!active}
              className={`absolute inset-0 transition-opacity duration-500 ${
                active ? "z-10 opacity-100" : "z-0 opacity-0"
              }`}
            >
              <Image
                src={poster.src}
                alt={active ? poster.alt : ""}
                fill
                preload={slide === 0}
                loading={slide === 0 ? undefined : "eager"}
                fetchPriority={slide === 0 ? "high" : undefined}
                sizes="100vw"
                className={`object-contain object-center drop-shadow-[0_24px_50px_rgba(0,0,0,0.55)] transition-transform duration-700 ease-out ${
                  active ? "translate-y-0" : "translate-y-2.5"
                }`}
              />
            </div>
          );
        })}

        {/* Blurred self-matte — the poster floats on its own campaign
            artwork, dimmed and softened (all breakpoints) */}
        <span
          aria-hidden="true"
          className="absolute inset-0 overflow-hidden"
        >
          <Image
            src={posters[index]?.src}
            alt=""
            fill
            loading="eager"
            sizes="100vw"
            className="scale-110 object-cover blur-2xl brightness-[0.45]"
          />
        </span>

        {/* Scrim (desktop overlay legibility) */}
        <span
          aria-hidden="true"
          className="absolute inset-0 z-20 hidden bg-gradient-to-t from-ink via-ink/25 to-transparent md:block"
        />
      </div>

      {/* Arrows (desktop) */}
      {count > 1 && (
        <>
          <button
            type="button"
            aria-label={ui.carouselPrev}
            onClick={() => go(index - 1)}
            className="absolute left-2 top-1/2 z-30 flex min-h-[44px] min-w-[44px] -translate-y-1/2 items-center justify-center rounded-full border border-cream/30 bg-ink/40 text-xl text-cream backdrop-blur-sm transition-colors hover:border-gold hover:text-gold-highlight md:left-4"
          >
            <span aria-hidden="true">←</span>
          </button>
          <button
            type="button"
            aria-label={ui.carouselNext}
            onClick={() => go(index + 1)}
            className="absolute right-2 top-1/2 z-30 flex min-h-[44px] min-w-[44px] -translate-y-1/2 items-center justify-center rounded-full border border-cream/30 bg-ink/40 text-xl text-cream backdrop-blur-sm transition-colors hover:border-gold hover:text-gold-highlight md:right-4"
          >
            <span aria-hidden="true">→</span>
          </button>
        </>
      )}

      {/* Dots + autoplay toggle: in-flow on mobile, pinned on desktop */}
      {count > 1 && (
        <div className="flex items-center justify-center gap-2 px-4 pb-6 md:absolute md:bottom-5 md:right-4 md:z-30 md:px-0 md:pb-0 lg:right-8">
          {posters.map((poster, slide) => (
            <button
              key={poster.src}
              type="button"
              aria-label={poster.alt}
              aria-current={slide === index || undefined}
              onClick={() => go(slide)}
              className="flex min-h-[44px] min-w-[44px] items-center justify-center"
            >
              <span
                aria-hidden="true"
                className={`relative h-1 overflow-hidden rounded-full transition-all duration-300 ${
                  slide === index ? "w-8 bg-gold/25" : "w-3 bg-steel hover:bg-silver"
                }`}
              >
                {slide === index && (
                  <span
                    className={`hero-progress absolute inset-y-0 left-0 rounded-full bg-gold ${
                      held || !onscreen ? "[animation-play-state:paused]" : ""
                    }`}
                    style={{ animationDuration: `${AUTOPLAY_MS}ms` }}
                  />
                )}
              </span>
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
