import BrandMark from "../brand/BrandMark";

export default function AdminLoadingScreen({
  visible,
  brand,
  status,
  tagline,
}) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={visible ? status : undefined}
      aria-hidden={!visible}
      className={`fixed inset-0 z-[60] flex flex-col items-center justify-center gap-5 bg-ink px-6 text-center transition-opacity duration-300 ${
        visible ? "opacity-100" : "pointer-events-none opacity-0"
      }`}
    >
      <span
        className={`block transition-all duration-500 ${
          visible ? "scale-100 opacity-100" : "scale-95 opacity-0"
        }`}
      >
        <BrandMark
          height={72}
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
      <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-gold">
        {tagline}
      </span>
      <span className="text-[10px] font-medium uppercase tracking-[0.22em] text-muted">
        {status}
      </span>
    </div>
  );
}
