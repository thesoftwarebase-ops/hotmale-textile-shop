import Image from "next/image";
import AppLink from "../transitions/AppLink";

/**
 * Product card for collection grids — same card family as the homepage
 * CatalogTile: lift, gold frame, museum-mat keyline, gold reveal line.
 * Renders the product image (or an honest pending-photo state when the
 * CMS has no photo yet) and links to the supplied `href` — an external
 * Instagram link, or an internal route via AppLink. No price is
 * rendered — prices don't exist yet.
 */
export default function ProductCard({ product, photoNote, href, tabIndex }) {
  const image = product.image ?? product.gallery?.[0];
  const external = typeof href === "string" && href.startsWith("http");

  const body = (
    <>
      {image ? (
        <div className="relative aspect-[3/4] w-full overflow-hidden">
          <Image
            src={image}
            alt={product.name}
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover brightness-[0.94] transition-all duration-700 ease-out group-hover:scale-[1.05] group-hover:brightness-100"
          />
          {/* Museum-mat keyline that wakes on hover */}
          <span
            aria-hidden="true"
            className="absolute inset-3 rounded-sm border border-cream/10 transition-colors duration-500 group-hover:border-gold/30"
          />
          {/* Gold reveal line along the image base */}
          <span
            aria-hidden="true"
            className="absolute inset-x-3 bottom-3 z-10 h-px origin-left scale-x-0 bg-gold/80 transition-transform duration-500 group-hover:scale-x-100"
          />
        </div>
      ) : (
        /* Pending-photo state: quiet inner keyline, gold tick, note */
        <div className="relative flex aspect-[3/4] w-full items-center justify-center">
          <span
            aria-hidden="true"
            className="absolute inset-3 rounded-sm border border-graphite transition-colors duration-300 group-hover:border-steel"
          />
          <div className="flex flex-col items-center gap-3 px-6 text-center">
            <span aria-hidden="true" className="h-1.5 w-1.5 rotate-45 bg-gold/70" />
            <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted">
              {photoNote}
            </span>
          </div>
        </div>
      )}
      <div className="product-card-footer flex items-center justify-between gap-2 border-t border-graphite px-4 py-3">
        <h3 className="line-clamp-2 font-display text-base font-bold uppercase leading-tight tracking-tight text-cream sm:text-lg">
          {product.name}
        </h3>
        <span
          aria-hidden="true"
          className="shrink-0 text-sm text-gold opacity-0 transition-all duration-300 group-hover:translate-x-1 group-hover:opacity-100"
        >
          {external ? "↗" : "→"}
        </span>
      </div>
    </>
  );

  if (external) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        tabIndex={tabIndex}
        className="group block overflow-hidden rounded-md border border-graphite bg-charcoal transition-all duration-300 hover:-translate-y-1 hover:border-gold/60 hover:shadow-[0_20px_48px_-16px_rgba(0,0,0,0.65),0_0_0_1px_rgba(230,196,64,0.15)]"
      >
        {body}
      </a>
    );
  }

  return (
    <AppLink
      href={href ?? `/products/${product.slug}`}
      tabIndex={tabIndex}
      className="group block overflow-hidden rounded-md border border-graphite bg-charcoal transition-all duration-300 hover:-translate-y-1 hover:border-gold/60 hover:shadow-[0_20px_48px_-16px_rgba(0,0,0,0.65),0_0_0_1px_rgba(230,196,64,0.15)]"
    >
      {body}
    </AppLink>
  );
}