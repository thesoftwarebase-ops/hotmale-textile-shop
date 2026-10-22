"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import Lenis from "lenis";
import { setScrollController } from "../../lib/scroll";

/**
 * Lenis smooth scrolling, integrated with the site's page transitions.
 * The instance lives for the app's lifetime and is never stopped for
 * the transition curtain — pausing Lenis around route changes can wedge
 * the virtual scroll position and leave the page stuck mid-scroll. All
 * programmatic scrolling (route resets, anchors, the footer back-to-top
 * control) is routed through this same instance via lib/scroll, so
 * native and virtual scrolling never fight each other.
 */
/** Resolve a location hash to its element; malformed hashes never throw. */
function resolveHash(hash) {
  if (!hash) return null;
  try {
    return document.querySelector(hash);
  } catch {
    return null;
  }
}

export default function SmoothScroll({ children }) {
  const lenisRef = useRef(null);
  const pathname = usePathname();

  useEffect(() => {
    const lenis = new Lenis({
      lerp: 0.1,
      smoothWheel: true,
      respectReducedMotion: true,
      autoRaf: true,
    });
    lenisRef.current = lenis;
    setScrollController(lenis);

    // Page height changes (fonts swapping in, images decoding, content
    // streaming in after navigation) never fire a window resize, and
    // the `html` element itself stays viewport-tall — so Lenis's cached
    // scroll limit goes stale and scrolling wedges mid-page or short of
    // the footer. Re-measure whenever the body box changes, on load and
    // on bfcache restores.
    let frame = 0;
    const refresh = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => lenis.resize());
    };
    const observer =
      typeof ResizeObserver === "undefined" ? null : new ResizeObserver(refresh);
    observer?.observe(document.body);
    window.addEventListener("load", refresh);
    window.addEventListener("pageshow", refresh);

    const anchorTimer = window.location.hash
      ? setTimeout(() => {
          const target = resolveHash(window.location.hash);
          if (target) lenis.scrollTo(target, { offset: -96, lerp: 0.12 });
        }, 150)
      : null;

    return () => {
      if (anchorTimer) clearTimeout(anchorTimer);
      cancelAnimationFrame(frame);
      observer?.disconnect();
      window.removeEventListener("load", refresh);
      window.removeEventListener("pageshow", refresh);
      setScrollController(null);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  useEffect(() => {
    const lenis = lenisRef.current;
    if (!lenis) return;
    // New route, new page height — re-measure before anything scrolls.
    lenis.resize();
    const hash = window.location.hash;
    if (!hash) return;
    const timer = setTimeout(() => {
      const target = resolveHash(hash);
      if (target) lenis.scrollTo(target, { offset: -96, lerp: 0.12 });
    }, 150);
    return () => clearTimeout(timer);
  }, [pathname]);

  useEffect(() => {
    const onHashChange = () => {
      const hash = window.location.hash;
      const lenis = lenisRef.current;
      const target = resolveHash(hash);
      if (hash && lenis && target) {
        lenis.scrollTo(target, { offset: -96, lerp: 0.12 });
      }
    };
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  return children;
}
