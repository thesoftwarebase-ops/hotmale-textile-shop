"use client";

import Grip from "./Grip";

function IconButton({ label, onClick, disabled, children, danger = false }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex h-8 w-8 items-center justify-center rounded-sm border transition-colors disabled:cursor-not-allowed disabled:opacity-30 ${
        danger
          ? "border-red-400/20 text-red-300 hover:border-red-400/50 hover:bg-red-400/10"
          : "border-white/10 text-muted hover:border-gold/40 hover:text-gold"
      }`}
    >
      {children}
    </button>
  );
}

function Arrow({ direction }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-3.5 w-3.5"
    >
      {direction === "up" ? (
        <path d="m6 14 6-6 6 6" />
      ) : (
        <path d="m6 10 6 6 6-6" />
      )}
    </svg>
  );
}

function Trash() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-3.5 w-3.5"
    >
      <path d="M4 7h16M9 7V4h6v3M7 7l1 13h8l1-13" />
      <path d="M10 11v6M14 11v6" />
    </svg>
  );
}

/**
 * One editable item inside a repeating section: numbered header, optional
 * subtitle, reorder/delete controls and the item body. Rows in a
 * sortable list carry the drag handle, the gold drop marker and the
 * row's drag events; the move buttons stay for keyboard users but stay
 * out of the way until the row is hovered or focused.
 */
export default function ItemShell({
  index,
  title,
  subtitle,
  children,
  onMoveUp,
  onMoveDown,
  onRemove,
  labels,
  first = false,
  last = false,
  removable = true,
  draggable = false,
  dropMarker = null,
  dragging = false,
}) {
  return (
    <article
      className={`group relative overflow-hidden rounded-sm border border-white/[0.09] bg-white/[0.02] transition-opacity duration-200 ${
        dragging ? "opacity-35" : ""
      }`}
    >
      {dropMarker === "before" ? (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 -top-px z-20 h-0.5 bg-gold shadow-[0_0_10px_rgba(230,196,64,0.8)]"
        />
      ) : null}
      {dropMarker === "after" ? (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 -bottom-px z-20 h-0.5 bg-gold shadow-[0_0_10px_rgba(230,196,64,0.8)]"
        />
      ) : null}

      <header className="flex items-center gap-3 border-b border-white/[0.07] bg-black/20 px-3.5 py-3">
        {draggable ? (
          <span
            aria-hidden="true"
            className="cursor-grab text-muted transition-colors group-hover:text-gold active:cursor-grabbing"
          >
            <Grip />
          </span>
        ) : null}

        <span className="inline-flex h-6 min-w-6 shrink-0 items-center justify-center rounded-full border border-gold/25 px-1.5 text-[9px] font-bold tabular-nums text-gold">
          {String(index + 1).padStart(2, "0")}
        </span>

        <div className="min-w-0 flex-1">
          <h4 className="truncate font-display text-sm font-bold uppercase tracking-wide text-cream">
            {title}
          </h4>
          {subtitle ? (
            <p className="mt-0.5 truncate text-[10px] text-muted">{subtitle}</p>
          ) : null}
        </div>

        <div className="flex shrink-0 items-center gap-1.5 opacity-60 transition-opacity duration-200 group-hover:opacity-100 group-focus-within:opacity-100">
          {onMoveUp ? (
            <IconButton
              label={labels.moveUp}
              onClick={onMoveUp}
              disabled={first}
            >
              <Arrow direction="up" />
            </IconButton>
          ) : null}
          {onMoveDown ? (
            <IconButton
              label={labels.moveDown}
              onClick={onMoveDown}
              disabled={last}
            >
              <Arrow direction="down" />
            </IconButton>
          ) : null}
          {onRemove && removable ? (
            <IconButton label={labels.removeItem} onClick={onRemove} danger>
              <Trash />
            </IconButton>
          ) : null}
        </div>
      </header>
      <div className="p-3.5 sm:p-4">{children}</div>
    </article>
  );
}
