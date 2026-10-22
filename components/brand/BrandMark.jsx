import Image from "next/image";

/**
 * HOTMALE brand mark. The supplied logo is only 94x110px and heavily
 * compressed — never upscale it. Rendered small on dark backgrounds
 * only, per the brief. Anywhere larger, use the text wordmark fallback
 * until HOTMALE supplies the vector file.
 * Name and tagline arrive via props from site.brand (single source).
 */
export default function BrandMark({
  height = 40,
  wordmark = false,
  name,
  tagline,
  logo,
  className = "",
}) {
  const label = `${name} — ${tagline}`;

  if (wordmark) {
    return (
      <span
        className={`font-display font-extrabold uppercase tracking-tight text-cream ${className}`}
        style={{ fontSize: height * 0.7, lineHeight: 1 }}
        aria-label={label}
      >
        {name}
      </span>
    );
  }

  return (
    <Image
      src={logo}
      alt={label}
      width={94}
      height={110}
      style={{ height, width: "auto" }}
      priority={false}
      className={className}
    />
  );
}
