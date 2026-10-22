/**
 * Brand showcase chrome for hero-level headers: gold crown hairline,
 * fabric pinstripe, warm corner glow and the museum-mat keyline.
 * Pure decoration — every layer ignores pointer events.
 */
export default function HeaderDecor() {
  return (
    <>
      {/* Gold crown hairline */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold/80 to-transparent"
      />
      {/* Fabric pinstripe texture — pure gradient, no imagery */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[repeating-linear-gradient(135deg,currentColor_0_1px,transparent_1px_12px)] text-cream opacity-[0.05]"
      />
      {/* Warm glow rising from the quiet corner */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(130%_110%_at_100%_0%,rgba(230,196,64,0.16),transparent_62%)]"
      />
      {/* Museum-mat keyline */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-2 rounded-sm border border-cream/[0.08]"
      />
    </>
  );
}
