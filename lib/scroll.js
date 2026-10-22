/**
 * Shared scroll-to-top helper. Imported by ScrollToTop (every route
 * change) and BackToTop (the footer control). Respects reduced motion.
 * Never called during render — effects and event handlers only.
 *
 * All programmatic scrolling goes through the live Lenis instance when
 * one is registered: mixing native `window.scrollTo` with Lenis leaves
 * the virtual scroll position out of sync, which is what makes the
 * page feel stuck mid-scroll. Native scrolling is only a fallback for
 * the no-Lenis cases (SSR, reduced-motion setups, teardown).
 */
let controller = null;

export function setScrollController(instance) {
  controller = instance;
}

export function scrollToTop(behavior = "auto") {
  if (typeof window === "undefined") return;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const immediate = reduced || behavior !== "smooth";
  if (controller) {
    controller.scrollTo(0, { immediate });
    return;
  }
  window.scrollTo({ top: 0, left: 0, behavior: reduced ? "auto" : behavior });
}
