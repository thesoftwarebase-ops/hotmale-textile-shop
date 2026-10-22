import Link from "next/link";
import { getActiveAnnouncement } from "../../lib/data";

/**
 * Announcement marquee, rendered directly under the navbar.
 * Renders nothing when there is no active announcement (empty,
 * invisible, or outside its schedule). Pauses on hover; disabled
 * under prefers-reduced-motion (see globals.css).
 */
export default async function Marquee() {
  const entry = await getActiveAnnouncement();
  if (!entry) return null;

  const speedClass =
    entry.speed === "slow"
      ? "marquee-track-slow"
      : entry.speed === "fast"
        ? "marquee-track-fast"
        : "marquee-track";

  const text = `${entry.emoji ? `${entry.emoji} ` : ""}${entry.message}`;
  const row = (
    <div className={`marquee-inner ${speedClass}`} aria-hidden="false">
      <span className="marquee-chunk">{text}</span>
      <span className="marquee-chunk" aria-hidden="true">
        {text}
      </span>
    </div>
  );

  return (
    <div
      role="marquee"
      aria-label={entry.message}
      className="marquee overflow-hidden border-b border-graphite bg-charcoal py-2"
    >
      {entry.link ? (
        <Link
          href={entry.link}
          className="marquee-link block text-center text-xs font-semibold uppercase tracking-[0.12em] text-gold"
        >
          {row}
        </Link>
      ) : (
        <p className="text-center text-xs font-semibold uppercase tracking-[0.12em] text-gold">
          {row}
        </p>
      )}
    </div>
  );
}
