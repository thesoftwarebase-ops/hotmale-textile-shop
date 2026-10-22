"use client";

/**
 * Grip plus nudges for a reorderable card. The grip owns the drag
 * listeners so tapping the card body still opens the item; the arrows
 * are the precise, always available alternative (and stay hidden on
 * small screens when the card is narrow).
 */
export default function ReorderControls({
  dragLabel,
  upLabel,
  downLabel,
  activatorRef,
  attributes,
  listeners,
  onMove,
  canUp,
  canDown,
  ordering,
  compact = false,
}) {
  const nudgeClass = `relative z-20 h-8 w-8 shrink-0 items-center justify-center rounded-sm border border-white/10 text-[11px] leading-none text-muted transition-colors hover:border-gold/40 hover:text-gold disabled:cursor-not-allowed disabled:opacity-35 ${
    compact ? "hidden sm:inline-flex" : "inline-flex"
  }`;

  return (
    <>
      <button
        ref={activatorRef}
        type="button"
        {...attributes}
        {...listeners}
        aria-label={dragLabel}
        title={dragLabel}
        style={{ touchAction: "none" }}
        className="relative z-20 inline-flex h-8 w-8 shrink-0 cursor-grab items-center justify-center rounded-sm border border-white/10 text-muted transition-colors hover:border-gold/40 hover:text-gold active:cursor-grabbing"
      >
        <svg
          aria-hidden="true"
          viewBox="0 0 16 16"
          fill="currentColor"
          className="h-3.5 w-3.5"
        >
          <circle cx="5" cy="4" r="1.3" />
          <circle cx="11" cy="4" r="1.3" />
          <circle cx="5" cy="8" r="1.3" />
          <circle cx="11" cy="8" r="1.3" />
          <circle cx="5" cy="12" r="1.3" />
          <circle cx="11" cy="12" r="1.3" />
        </svg>
      </button>
      <button
        type="button"
        onClick={() => onMove(-1)}
        disabled={ordering || !canUp}
        aria-label={upLabel}
        title={upLabel}
        className={nudgeClass}
      >
        <span aria-hidden="true">&uarr;</span>
      </button>
      <button
        type="button"
        onClick={() => onMove(1)}
        disabled={ordering || !canDown}
        aria-label={downLabel}
        title={downLabel}
        className={nudgeClass}
      >
        <span aria-hidden="true">&darr;</span>
      </button>
    </>
  );
}
