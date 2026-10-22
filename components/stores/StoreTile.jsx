import Image from "next/image";
import AppLink from "../transitions/AppLink";
import WhatsAppIcon from "../social/WhatsAppIcon";

/**
 * Store directory tile: the branch photo on a graded stage (hollow
 * index numeral, live WhatsApp shortcut), the branch name over the
 * bottom scrim, and a hairline footer with the store's hours and the
 * way into its detail page. The whole tile is one stretched link; the
 * WhatsApp shortcut sits above it, so there are no nested anchors.
 * Every value — name, photo, hours, number, labels — arrives via props.
 */
export default function StoreTile({ store, index, ui, delay = 0 }) {
  const whatsapp = (store.whatsapp || "").replace(/\D/g, "");
  const paddedIndex = String(index).padStart(2, "0");

  return (
    <article
      id={store.slug}
      className="tile-rise group relative scroll-mt-28 overflow-hidden rounded-md border border-graphite bg-charcoal transition-all duration-300 hover:-translate-y-1 hover:border-gold/60 hover:shadow-[0_24px_56px_-20px_rgba(0,0,0,0.75),0_0_0_1px_rgba(230,196,64,0.18)]"
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Stretched link — the entire tile opens the branch page */}
      <AppLink
        href={`/stores/${store.slug}`}
        aria-label={`${ui.visitLabel} — ${store.name}`}
        className="absolute inset-0 z-10 rounded-md focus-visible:-outline-offset-4"
      />

      <div className="relative aspect-[4/3] w-full overflow-hidden sm:aspect-[16/10] lg:aspect-[4/5]">
        <Image
          src={store.photo}
          alt=""
          fill
          sizes="(min-width: 1024px) 33vw, 100vw"
          className="object-cover brightness-[0.78] contrast-[1.05] saturate-[0.45] transition-all duration-700 ease-out group-hover:scale-[1.05] group-hover:brightness-100 group-hover:saturate-100"
        />
        {/* Stage scrim: deep base for the name, whisper at the top */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink via-ink/35 to-ink/10"
        />
        {/* Top scrim so the numeral and WhatsApp chip hold on light shots */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-ink/70 to-transparent"
        />
        {/* Museum-mat keyline that wakes on hover */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-3 rounded-sm border border-cream/10 transition-colors duration-500 group-hover:border-gold/35"
        />
        {/* Editorial index numeral */}
        <span
          aria-hidden="true"
          className="text-outline-gold pointer-events-none absolute left-5 top-4 z-10 font-display text-5xl font-black leading-none opacity-50 transition-opacity duration-500 group-hover:opacity-80"
        >
          {paddedIndex}
        </span>

        {/* Live WhatsApp shortcut, above the stretched link */}
        {whatsapp && (
          <a
            href={`https://wa.me/${whatsapp}`}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${ui.whatsappLabel} — ${store.name}`}
            className="absolute right-3 top-3 z-20 inline-flex h-11 w-11 items-center justify-center rounded-full border border-gold/45 bg-ink/55 text-gold backdrop-blur-sm transition-colors duration-300 hover:border-gold hover:bg-gold hover:text-ink"
          >
            <WhatsAppIcon size={19} />
          </a>
        )}

        {/* Branch name */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 p-5">
          <p className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.22em] text-gold">
            <span aria-hidden="true" className="h-px w-4 bg-gold" />
            {ui.storeSingular} {paddedIndex}
          </p>
          <h2 className="mt-2 font-display text-3xl font-black uppercase leading-none tracking-tight text-cream sm:text-4xl">
            {store.name}
          </h2>
        </div>
      </div>

      <div className="flex items-center justify-between gap-4 px-5 py-4">
        <div className="min-w-0">
          <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-muted">
            {ui.hoursLabel}
          </p>
          <p className="mt-1 text-xs leading-relaxed text-silver">{store.hours}</p>
        </div>
        <span className="flex shrink-0 items-center gap-2 text-[10px] font-bold uppercase tracking-[0.16em] text-gold transition-colors duration-300 group-hover:text-gold-highlight">
          {ui.visitLabel}
          <span
            aria-hidden="true"
            className="transition-transform duration-300 group-hover:translate-x-1"
          >
            →
          </span>
        </span>
      </div>
    </article>
  );
}
