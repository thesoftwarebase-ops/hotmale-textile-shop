"use client";

import { usePathname, useRouter } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import Loader from "./Loader";
import SmoothScroll from "./SmoothScroll";

const NavContext = createContext({ go: () => {} });
export const useTransitionNav = () => useContext(NavContext);

/**
 * Owns every page transition. Boot curtain on full loads (~1s), compact
 * curtain on client navigations (~340ms out, ~200ms settle). Anchors
 * and reduced-motion go straight through with no curtain. Brand copy
 * arrives via props from site.brand (single source).
 */
export default function TransitionProvider({ children, brand, ui }) {
  const router = useRouter();
  const pathname = usePathname();
  const [boot, setBoot] = useState(true);
  const [leaving, setLeaving] = useState(false);
  const timers = useRef([]);

  useEffect(() => {
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const timer = setTimeout(() => setBoot(false), reduced ? 0 : 1000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (boot) return;
    const timer = setTimeout(() => setLeaving(false), 200);
    timers.current.push(timer);
    return () => clearTimeout(timer);
  }, [pathname, boot ]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const go = useCallback(
    (href) => {
      if (typeof href !== "string" || !href.startsWith("/")) {
        router.push(href);
        return;
      }
      const base = href.split("#")[0] || "/";
      const hash = href.includes("#") ? href.slice(href.indexOf("#")) : "";
      if (base === pathname) {
        // Already here: same URL (or same anchor) is a no-op, a
        // different same-page anchor glides with no curtain.
        if (!href.includes("#") || hash === window.location.hash) return;
        router.push(href);
        return;
      }
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        router.push(href);
        return;
      }
      setLeaving(true);
      timers.current.push(setTimeout(() => router.push(href), 340));
      // Safety net: a failed navigation must never trap the curtain.
      timers.current.push(setTimeout(() => setLeaving(false), 4000));
    },
    [pathname, router],
  );

  return (
    <NavContext.Provider value={{ go }}>
      <Loader
        visible={boot || leaving}
        compact={!boot && leaving}
        brand={brand}
        ui={ui}
      />
      <SmoothScroll>{children}</SmoothScroll>
    </NavContext.Provider>
  );
}
