import BrandMark from "../brand/BrandMark";

/**
 * The HOTMALE loader: logo, one quiet progress hairline, one line.
 * Nothing orbits, breathes or staggers — confidence is stillness.
 * Boot plays large (~1s on full loads); transitions replay it compact.
 * All copy arrives via props from site.js — nothing hard-coded.
 */
export default function Loader({ visible, compact = false, brand, ui }) {
  return (
    <div
      role="status"
      aria-label={visible ? ui.loaderStatus : undefined}
      aria-hidden={!visible}
      className={`fixed inset-0 z-[70] flex flex-col items-center justify-center gap-5 bg-ink px-6 text-center transition-opacity duration-300 ${
        visible ? "opacity-100" : "pointer-events-none opacity-0"
      }`}
    >
      <span
        className={`block transition-all duration-500 ${
          visible ? "scale-100 opacity-100" : "scale-95 opacity-0"
        }`}
      >
        <BrandMark
          height={compact ? 72 : 110}
          name={brand.name}
          tagline={brand.tagline}
          logo={brand.logo}
        />
      </span>
      <span className="block h-px w-32 overflow-hidden bg-graphite">
        <span
          className={`block h-full w-full origin-left bg-gold ${
            visible ? "loader-bar" : ""
          }`}
        />
      </span>
      <span className="text-[11px] font-medium uppercase tracking-[0.22em] text-muted">
        {ui.loaderTagline}
      </span>
    </div>
  );
}
