"use client";

import { usePathname } from "next/navigation";
import CtaSection from "./CtaSection";

/**
 * Renders the closing CTA band on every route except /contact.
 */
export default function SiteCta({ cta }) {
  const pathname = usePathname();
  if (pathname?.startsWith("/contact")) return null;
  return <CtaSection cta={cta} />;
}
