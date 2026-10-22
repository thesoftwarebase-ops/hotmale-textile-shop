import Image from "next/image";
import AppLink from "../transitions/AppLink";

/**
 * Infinite photo marquee: published collection shots looping edge to
 * edge, each tile linking to its collection. Pure CSS motion — pauses
 * on hover and freezes under reduced motion. The row renders twice
 * (second copy hidden from assistive tech) for a seamless loop.
 */
export default function PhotoMarquee({ collections, label }) {
  if (!collections || collections.length === 0 || !label) return null;

  const row = (hidden) => (
    <div className="flex shrink-0 items-stretch" aria-hidden={hidden || undefined}>
      {collections.map((collection) => (
        <AppLink
          key={`${hidden ? "b-" : ""}${collection.slug}`}
          href={`/collections/${collection.slug}`}
          aria-label={hidden ? undefined : collection.name}
          tabIndex={hidden ? -1 : undefined}
          className="group relative block w-36 shrink-0 overflow-hidden border-r border-graphite sm:w-44"
        >
          <span className="relative block aspect-[4/5]">
            {collection.image && (
              <Image
                src={collection.image}
                alt=""
                fill
                sizes="176px"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
            )}
            <span
              aria-hidden="true"
              className="absolute inset-0 bg-gradient-to-t from-ink/90 via-transparent to-transparent"
            />
          </span>
          <span className="absolute inset-x-0 bottom-0 p-3">
            <span className="block font-display text-sm font-bold uppercase leading-tight text-cream">
              {collection.name}
            </span>
          </span>
        </AppLink>
      ))}
    </div>
  );

  return (
    <section aria-label={label} className="marquee overflow-hidden border-y border-graphite">
      <div className="marquee-inner marquee-track">
        {row(false)}
        {row(true)}
      </div>
    </section>
  );
}
