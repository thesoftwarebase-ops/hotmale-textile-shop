"use client";

import Link from "next/link";
import { useTransitionNav } from "./TransitionProvider";

/**
 * Internal links must use this instead of next/link so every page
 * transition plays the loader curtain. External URLs pass straight
 * through. Modifier/auxiliary clicks keep native browser behaviour.
 */
export default function AppLink({ href, onClick, ...props }) {
  const { go } = useTransitionNav();

  if (typeof href !== "string" || !href.startsWith("/")) {
    return <Link href={href} onClick={onClick} {...props} />;
  }

  return (
    <Link
      href={href}
      {...props}
      onClick={(event) => {
        if (
          event.metaKey ||
          event.ctrlKey ||
          event.shiftKey ||
          event.altKey ||
          event.button !== 0
        ) {
          return;
        }
        event.preventDefault();
        if (onClick) onClick(event);
        go(href);
      }}
    />
  );
}
