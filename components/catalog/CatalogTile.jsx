import Image from "next/image";
import AppLink from "../transitions/AppLink";

/**
 * Shared catalogue tile for the collections index — editorial portrait
 * tile: hollow-gold index numeral and the parent category (gold caps,
 * top right) over a graded stage, the collection name and its derived
 * style count below. Every value arrives via props; no copy lives
 * here. The photography rests in a muted mono grade so mixed studio
 * shots read as one curated grid, and wakes to full colour on hover.
 */
export default function CatalogTile({
  href,
  image,
  name,
  index,
  count,
  countLabels,
  kicker,
}) {
  const countLabel =
    count != null && countLabels
      ? count === 1
        ? countLabels.one
        : countLabels.many
      : null;

  return (
    <AppLink
      href={href}
      className="group relative block overflow-hidden rounded-md border border-graphite bg-charcoal transition-all duration-300 hover:-translate-y-1 hover:border-gold/60 hover:shadow-[0_24px_56px_-20px_rgba(0,0,0,0.75),0_0_0_1px_rgba(230,196,64,0.18)]"
    >
      <div className="relative aspect-[3/4] w-full overflow-hidden">
        <Image
          src={image}
          alt=""
          fill
          sizes="(min-width: 1024px) 25vw, 50vw"
          className="object-cover brightness-[0.78] contrast-[1.05] saturate-[0.35] transition-all duration-700 ease-out group-hover:scale-[1.05] group-hover:brightness-100 group-hover:saturate-100"
        />
        {/* Stage scrim: deep base for the type, whisper at the top */}
        <span
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-t from-ink via-ink/40 to-ink/15"
        />
        {/* Top scrim so the numeral and category hold on light shots */}
        <span
          aria-hidden="true"
          className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-ink/60 to-transparent"
        />
        {/* Museum-mat keyline that wakes on hover */}
        <span
          aria-hidden="true"
          className="absolute inset-3 rounded-sm border border-cream/10 transition-colors duration-500 group-hover:border-gold/35"
        />
        {/* Gold reveal line along the base */}
        <span
          aria-hidden="true"
          className="absolute inset-x-3 bottom-3 z-10 h-px origin-left scale-x-0 bg-gold/80 transition-transform duration-500 group-hover:scale-x-100"
        />
        {/* Editorial index numeral */}
        <span
          aria-hidden="true"
          className="text-outline-gold absolute left-5 top-4 z-10 font-display text-4xl font-black leading-none opacity-45 transition-opacity duration-500 group-hover:opacity-80"
        >
          {index}
        </span>
        {/* Parent category — gold caps, top right */}
        {kicker && (
          <p className="absolute right-5 top-5 z-10 max-w-[62%] text-right text-[9px] font-bold uppercase leading-[1.7] tracking-[0.18em] text-gold/90 transition-colors duration-300 group-hover:text-gold-highlight">
            {kicker}
          </p>
        )}
        <div className="absolute inset-x-0 bottom-0 z-10 flex flex-col gap-1.5 p-5">
          <h3 className="font-display text-xl font-bold uppercase leading-tight tracking-tight text-cream sm:text-2xl">
            {name}
          </h3>
          {countLabel && (
            <p className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-silver transition-colors duration-300 group-hover:text-gold-highlight sm:text-[11px]">
              <span
                aria-hidden="true"
                className="h-px w-4 bg-current transition-all duration-300 group-hover:w-6"
              />
              {count} {countLabel}
            </p>
          )}
        </div>
      </div>
    </AppLink>
  );
}
