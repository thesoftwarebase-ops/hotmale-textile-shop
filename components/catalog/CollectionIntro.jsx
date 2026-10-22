import Image from "next/image";
import AppLink from "../transitions/AppLink";
import HeaderDecor from "../layout/HeaderDecor";

/**
 * Collection detail opener: the collection's own editorial image in a
 * framed portrait panel (hollow index numeral, gold corner ticks),
 * beside the live introduction — category eyebrow, collection name,
 * description and the store CTA. Copy and image arrive via props from
 * lib/data.js; only the store route is structural.
 */
export default function CollectionIntro({
  collection,
  category,
  label,
  action,
}) {
  return (
    <header className="relative overflow-hidden border-b border-graphite bg-charcoal/60">
      <HeaderDecor />
      <div className="relative w-full mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        <div className="grid items-center gap-8 md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] md:gap-10 lg:gap-16">
          {/* Editorial portrait panel — the image that fronts this
              collection across the site */}
          <div className="relative order-2 mx-auto w-full max-w-md overflow-hidden rounded-md border border-graphite bg-charcoal shadow-[0_30px_70px_-30px_rgba(0,0,0,0.85)] md:order-none md:mx-0 md:max-w-none">
            <div className="relative aspect-[4/5] w-full md:aspect-auto md:h-[460px] lg:h-[520px]">
              <Image
                src={collection.image}
                alt={collection.name}
                fill
                preload
                sizes="(min-width: 768px) 40vw, 100vw"
                className="object-cover brightness-[0.88] saturate-[0.65]"
              />
              {/* Top scrim so the numeral holds on light shots */}
              <span
                aria-hidden="true"
                className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-ink/60 to-transparent"
              />
              {/* Museum-mat keyline */}
              <span
                aria-hidden="true"
                className="absolute inset-3 rounded-sm border border-cream/10"
              />
              {/* Gold register ticks */}
              <span
                aria-hidden="true"
                className="absolute left-3 top-3 h-4 w-4 border-l border-t border-gold/60"
              />
              <span
                aria-hidden="true"
                className="absolute bottom-3 right-3 h-4 w-4 border-b border-r border-gold/60"
              />
              {/* Editorial index numeral, echoing the collections grid */}
              <span
                aria-hidden="true"
                className="text-outline-gold absolute left-5 top-4 font-display text-5xl font-black leading-none opacity-50"
              >
                {String(collection.order).padStart(2, "0")}
              </span>
            </div>
          </div>

          {/* Introduction */}
          <div className="order-1 min-w-0 md:order-none">
            <p className="flex flex-wrap items-center gap-3 text-[11px] font-bold uppercase tracking-[0.24em] text-gold">
              <span
                aria-hidden="true"
                className="h-1.5 w-1.5 rotate-45 bg-gold"
              />
              {label}
              {category && (
                <>
                  <span aria-hidden="true" className="text-gold/40">
                    /
                  </span>
                  <span className="text-silver">{category.name}</span>
                </>
              )}
            </p>
            <h1 className="mt-4 font-display text-5xl font-black uppercase leading-[0.95] tracking-tight text-cream sm:text-6xl lg:text-7xl">
              {collection.name}
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-silver sm:text-lg">
              {collection.description}
            </p>
            <div className="mt-8">
              <AppLink
                href="/stores"
                className="group/intro inline-flex min-h-[44px] items-center gap-3 rounded-sm border border-gold/60 px-5 text-[11px] font-bold uppercase tracking-[0.16em] text-gold transition-colors duration-300 hover:bg-gold hover:text-ink"
              >
                {action}
                <span
                  aria-hidden="true"
                  className="transition-transform duration-300 group-hover/intro:translate-x-1"
                >
                  →
                </span>
              </AppLink>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
