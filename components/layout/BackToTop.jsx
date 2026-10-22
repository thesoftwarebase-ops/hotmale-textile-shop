"use client";

import { scrollToTop } from "../../lib/scroll";

/**
 * Scrolls the page to the top. Label arrives via props from site.ui.
 * Renders identically on server and client (no scroll listeners),
 * so there is no hydration risk.
 */
export default function BackToTop({ label }) {
  return (
    <button
      type="button"
      onClick={() => scrollToTop("smooth")}
      className="group inline-flex min-h-[44px] items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted transition-colors duration-300 hover:text-cream"
    >
      {label}
      <span
        aria-hidden="true"
        className="flex h-11 w-11 items-center justify-center rounded-[2px] border border-steel text-base text-cream transition-all duration-300 group-hover:-translate-y-0.5 group-hover:border-gold group-hover:text-gold-highlight"
      >
        <span className="block transition-transform duration-300 group-hover:-translate-y-0.5">
          ↑
        </span>
      </span>
    </button>
  );
}
