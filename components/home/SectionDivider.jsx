/**
 * Section divider: a hairline that fades in from both edges to a
 * whisper of gold, broken at center by the brand's diamond tick —
 * the same rotate-45 gold square used in the hero eyebrow, section
 * headings and footer. Purely decorative.
 */
export default function SectionDivider() {
  return (
    <div
      aria-hidden="true"
      className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"
    >
      <div className="h-px w-full bg-gradient-to-r from-transparent via-gold/35 to-transparent" />
      <span className="absolute left-1/2 top-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rotate-45 bg-gold/80" />
    </div>
  );
}
