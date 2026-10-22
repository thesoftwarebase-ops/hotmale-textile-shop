"use client";

import { usePathname } from "next/navigation";

/**
 * Central enter-animation wrapper owned by the root layout. Keyed by
 * pathname so every new page rises in on mount — routes carry zero
 * loader or animation code themselves. Query-only changes (filters)
 * keep the same key and never replay the animation.
 */
export default function TransitionMain({ children }) {
  const pathname = usePathname();
  return (
    <div key={pathname} className="page-enter flex flex-1 flex-col">
      {children}
    </div>
  );
}
