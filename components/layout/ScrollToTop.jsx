"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { scrollToTop } from "../../lib/scroll";

/**
 * Mounted once in the root layout. Every route change starts at the
 * top of the page — unless the URL carries a hash (e.g. /#brands),
 * in which case the anchor destination wins and we stay out of the way.
 */
export default function ScrollToTop() {
  const pathname = usePathname();

  useEffect(() => {
    if (window.location.hash) return;
    scrollToTop("auto");
  }, [pathname]);

  return null;
}
