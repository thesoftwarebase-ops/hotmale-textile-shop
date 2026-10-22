import Link from "next/link";

/**
 * Homepage category index — a typographic type wall.
 *
 * A category is a classification axis, not merchandise, so it never gets
 * a photo: the artwork belongs to the collections and products. Instead
 * of a grid of cards, the categories are set as one oversized line each
 * — a lookbook contents — with a rule that lights up and a gold sheen
 * that travels across the letterforms on hover. One image grid stays on
 * the page (the featured collections); everything here is type.
 */
export default function CategoryIndex({
  categories,
  counts = {},
  countLabels = {},
  title,
  linkLabel,
  linkHref = "/collections",
  headingId,
  brandName,
}) {
  if (!categories || categories.length === 0) return null;

  const singular = countLabels.one ?? "collection";
  const plural = countLabels.many ?? "collections";

  return (
    <section
      aria-labelledby={headingId}
      className="relative isolate overflow-hidden border-y border-white/10 bg-ink"
    >
      {/* Blueprint grid */}
      <span
        aria-hidden="true"
        className="absolute inset-0 -z-30 opacity-60 [mask-image:radial-gradient(120%_90%_at_20%_0%,#000_20%,transparent_75%)]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(248,248,232,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(248,248,232,0.04) 1px, transparent 1px)",
          backgroundSize: "88px 88px",
        }}
      />

      {/* Gold bloom */}
      <span
        aria-hidden="true"
        className="absolute -left-24 top-1/4 -z-30 h-[34rem] w-[34rem] rounded-full opacity-70 [background:radial-gradient(circle,rgba(230,196,64,0.13),transparent_68%)]"
      />

      {/* Oversized wordmark depth */}
      {brandName ? (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-10 left-0 -z-30 select-none whitespace-nowrap font-display text-[22vw] font-black uppercase leading-none text-transparent opacity-[0.05]"
          style={{ WebkitTextStroke: "1px rgba(230,196,64,0.9)" }}
        >
          {brandName}
        </span>
      ) : null}

      {/* Top hairline */}
      <span
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold/60 to-transparent"
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header row */}
        <div className="flex flex-col gap-3 border-b border-white/10 py-6 sm:flex-row sm:items-end sm:justify-between sm:py-8">
          <h2
            id={headingId}
            className="flex items-center gap-3 text-[11px] font-bold uppercase tracking-[0.3em] text-cream"
          >
            <span aria-hidden="true" className="h-1.5 w-1.5 rotate-45 bg-gold" />
            {title}
          </h2>
          {linkLabel ? (
            <Link
              href={linkHref}
              className="group inline-flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.26em] text-muted transition-colors hover:text-gold"
            >
              {linkLabel}
              <span
                aria-hidden="true"
                className="transition-transform duration-300 group-hover:translate-x-1"
              >
                →
              </span>
            </Link>
          ) : null}
        </div>

        {/* The type wall */}
        <ul>
          {categories.map((category) => {
            const count = counts[category.slug] ?? 0;
            const countLabel = count === 1 ? singular : plural;

            return (
              <li key={category.slug}>
                <Link
                  href={linkHref}
                  className="group relative block overflow-hidden border-b border-white/10 py-6 sm:py-8"
                >
                  {/* Hover wash */}
                  <span
                    aria-hidden="true"
                    className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100 [background:linear-gradient(90deg,rgba(230,196,64,0.09),rgba(230,196,64,0.01)_55%,transparent)]"
                  />

                  {/* Ghost echo of the name */}
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute -bottom-6 left-0 select-none whitespace-nowrap font-display text-[15vw] font-black uppercase leading-none text-transparent opacity-[0.035] transition-opacity duration-500 group-hover:opacity-[0.07] sm:text-[11vw]"
                    style={{ WebkitTextStroke: "1px rgba(230,196,64,0.85)" }}
                  >
                    {category.name}
                  </span>

                  <span className="relative flex items-end justify-between gap-6 sm:gap-10">
                    <span className="sheen-sweep min-w-0 font-display text-[clamp(2rem,7.4vw,5.6rem)] font-black uppercase leading-[0.84] tracking-[-0.02em] transition-transform duration-500 group-hover:translate-x-2 sm:group-hover:translate-x-4">
                      {category.name}
                    </span>

                    <span className="flex shrink-0 items-center gap-4 sm:gap-6">
                      <span className="hidden text-[9px] font-bold uppercase tracking-[0.26em] text-muted transition-colors duration-500 group-hover:text-silver sm:block">
                        {count} {countLabel}
                      </span>
                      <span
                        aria-hidden="true"
                        className="flex h-10 w-10 items-center justify-center rounded-full border border-gold/35 text-sm text-gold transition-all duration-500 group-hover:border-gold group-hover:bg-gold group-hover:text-ink sm:h-12 sm:w-12"
                      >
                        <span className="transition-transform duration-500 group-hover:translate-x-0.5">
                          →
                        </span>
                      </span>
                    </span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
