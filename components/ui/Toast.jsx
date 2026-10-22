"use client";

import { useEffect } from "react";

/**
 * Single toast notification, fixed to the bottom of the viewport.
 * Rendered by client forms after a mutation. Auto-dismisses after 6s;
 * copy and the dismiss label come from data.
 */
export default function Toast({
  open,
  variant = "success",
  title,
  message,
  dismissLabel,
  onDismiss,
}) {
  useEffect(() => {
    if (!open) return undefined;
    const timer = window.setTimeout(onDismiss, 6000);
    return () => window.clearTimeout(timer);
  }, [open, title, message, onDismiss]);

  const isError = variant === "error";

  return (
    <div
      role={isError ? "alert" : "status"}
      aria-live={isError ? "assertive" : "polite"}
      aria-atomic="true"
      className="pointer-events-none fixed inset-x-4 bottom-5 z-[70] flex justify-center sm:inset-x-auto sm:right-6 sm:justify-end"
    >
      {open && (
        <div
          className={`tile-rise pointer-events-auto flex w-full max-w-sm items-start gap-4 rounded-md border bg-charcoal p-4 shadow-[0_24px_60px_-18px_rgba(0,0,0,0.9)] sm:p-5 ${
            isError ? "border-[#c65a4a]/70" : "border-gold/60"
          }`}
        >
          <span
            aria-hidden="true"
            className={`mt-1.5 h-2 w-2 shrink-0 rotate-45 ${
              isError ? "bg-[#e8927f]" : "bg-gold"
            }`}
          />
          <div className="min-w-0 flex-1">
            <p
              className={`font-display text-lg font-black uppercase leading-none tracking-tight ${
                isError ? "text-[#f0a58f]" : "text-gold"
              }`}
            >
              {title}
            </p>
            <p className="mt-2 text-sm leading-relaxed text-silver">{message}</p>
          </div>
          <button
            type="button"
            onClick={onDismiss}
            aria-label={dismissLabel}
            className="-m-1 shrink-0 p-1 text-lg leading-none text-muted transition-colors hover:text-cream"
          >
            <span aria-hidden="true">&times;</span>
          </button>
        </div>
      )}
    </div>
  );
}
