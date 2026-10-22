import Image from "next/image";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import HeaderDecor from "../../../../components/layout/HeaderDecor";
import AppLink from "../../../../components/transitions/AppLink";
import PhoneIcon from "../../../../components/social/PhoneIcon";
import WhatsAppIcon from "../../../../components/social/WhatsAppIcon";
import {
  getBrand,
  getContact,
  getSeo,
  getSocial,
  getStoreBySlug,
  getStores,
  getUi,
} from "../../../../lib/data";
import {
  buildMetadata,
  serializeJsonLd,
  storeStructuredData,
} from "../../../../lib/seo";

export async function generateStaticParams() {
  const stores = await getStores();
  return stores.map((store) => ({ slug: store.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const [store, ui] = await Promise.all([
    getStoreBySlug(slug),
    getUi(),
  ]);
  return buildMetadata({
    title: store ? store.name : ui.notFoundTitle,
    ...(store
      ? { description: store.description || store.address }
      : {}),
    path: store ? `/stores/${store.slug}` : undefined,
    noindex: !store,
  });
}

/**
 * Branch detail: an editorial opener (the branch photo in a framed
 * portrait panel with its index numeral, beside the name, address and
 * the live contact actions), then the visit facts — hours and every
 * number the branch carries, tappable — and a compact row per other
 * branch. Everything renders from data; empty fields stay hidden.
 */
export default function StorePage({ params }) {
  return (
    <Suspense
      fallback={<div className="h-72 border-b border-graphite bg-charcoal/60" />}
    >
      <StoreContent params={params} />
    </Suspense>
  );
}

/**
 * The slug is URL data, so it is read inside the Suspense boundary —
 * the shell streams first and the branch detail resolves behind it.
 */
async function StoreContent({ params }) {
  const { slug } = await params;
  const store = await getStoreBySlug(slug);
  if (!store) notFound();

  return <StoreDetail store={store} />;
}

async function StoreDetail({ store }) {
  const [stores, brand, ui, contact, seo, social] = await Promise.all([
    getStores(),
    getBrand(),
    getUi(),
    getContact(),
    getSeo(),
    getSocial(),
  ]);

  const index = stores.findIndex((entry) => entry.slug === store.slug) + 1;
  const paddedIndex = String(index > 0 ? index : store.order).padStart(2, "0");
  const others = stores
    .map((entry, i) => ({ store: entry, index: i + 1 }))
    .filter((entry) => entry.store.slug !== store.slug);

  const primaryPhone = store.phone || contact.phone || "";
  const landline = store.landline || "";
  const digits = (value) => (value || "").replace(/\D/g, "");
  const whatsapp = (store.whatsapp || "").replace(/\D/g, "");

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: serializeJsonLd(
            storeStructuredData({ store, brand, seo, social }),
          ),
        }}
      />
      <header className="relative overflow-hidden border-b border-graphite bg-charcoal/60">
        <HeaderDecor />
        <div className="relative w-full mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
          <div className="grid items-center gap-8 md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] md:gap-10 lg:gap-16">
            {/* Branch photo in a framed portrait panel */}
            <div className="relative order-2 mx-auto w-full max-w-md overflow-hidden rounded-md border border-graphite bg-charcoal shadow-[0_30px_70px_-30px_rgba(0,0,0,0.85)] md:order-none md:mx-0 md:max-w-none">
              <div className="relative aspect-[4/5] w-full md:aspect-auto md:h-[460px] lg:h-[520px]">
                <Image
                  src={store.photo}
                  alt={store.name}
                  fill
                  preload
                  sizes="(min-width: 768px) 40vw, 100vw"
                  className="object-cover brightness-[0.88] saturate-[0.65]"
                />
                <span
                  aria-hidden="true"
                  className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-ink/60 to-transparent"
                />
                <span
                  aria-hidden="true"
                  className="absolute inset-3 rounded-sm border border-cream/10"
                />
                <span
                  aria-hidden="true"
                  className="absolute left-3 top-3 h-4 w-4 border-l border-t border-gold/60"
                />
                <span
                  aria-hidden="true"
                  className="absolute bottom-3 right-3 h-4 w-4 border-b border-r border-gold/60"
                />
                <span
                  aria-hidden="true"
                  className="text-outline-gold absolute left-5 top-4 font-display text-5xl font-black leading-none opacity-50"
                >
                  {paddedIndex}
                </span>
              </div>
            </div>

            {/* Identity and actions */}
            <div className="order-1 min-w-0 md:order-none">
              <p className="flex flex-wrap items-center gap-3 text-[11px] font-bold uppercase tracking-[0.24em] text-gold">
                <span
                  aria-hidden="true"
                  className="h-1.5 w-1.5 rotate-45 bg-gold"
                />
                {ui.storeSingular} {paddedIndex}
                <span aria-hidden="true" className="text-gold/40">
                  /
                </span>
                <span className="text-silver">{brand.city}</span>
              </p>
              <h1 className="mt-4 font-display text-5xl font-black uppercase leading-[0.95] tracking-tight text-cream sm:text-6xl lg:text-7xl">
                {store.name}
              </h1>
              {store.description && (
                <p className="mt-5 max-w-xl text-base leading-relaxed text-silver sm:text-lg">
                  {store.description}
                </p>
              )}
              <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted">
                {store.address}
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                {whatsapp && (
                  <a
                    href={`https://wa.me/${whatsapp}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-[52px] items-center justify-center gap-2.5 rounded-sm bg-gold px-8 text-xs font-bold uppercase tracking-[0.12em] text-ink transition-colors hover:bg-gold-highlight"
                  >
                    <WhatsAppIcon size={16} />
                    {ui.whatsappLabel}
                  </a>
                )}
                {store.mapUrl && (
                  <a
                    href={store.mapUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-[52px] items-center justify-center rounded-sm border border-steel px-8 text-xs font-bold uppercase tracking-[0.12em] text-silver transition-colors hover:border-gold/60 hover:text-gold-highlight"
                  >
                    {ui.directionsLabel}
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="w-full mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        {/* Visit facts — hours and every number, tappable */}
        <dl className="flex flex-wrap gap-x-12 gap-y-8">
          <div>
            <dt className="text-[10px] font-semibold uppercase tracking-[0.22em] text-gold">
              {ui.hoursLabel}
            </dt>
            <dd className="mt-2 text-base leading-relaxed text-silver">
              {store.hours}
            </dd>
          </div>
          {primaryPhone && (
            <div>
              <dt className="text-[10px] font-semibold uppercase tracking-[0.22em] text-gold">
                {ui.phoneLabel}
              </dt>
              <dd className="mt-2">
                <a
                  href={`tel:+${digits(primaryPhone)}`}
                  className="inline-flex items-center gap-2 text-base leading-relaxed text-silver transition-colors hover:text-gold-highlight"
                >
                  <span aria-hidden="true" className="text-gold">
                    <PhoneIcon size={15} />
                  </span>
                  {primaryPhone}
                </a>
              </dd>
            </div>
          )}
          {landline && (
            <div>
              <dt className="text-[10px] font-semibold uppercase tracking-[0.22em] text-gold">
                {ui.landlineLabel}
              </dt>
              <dd className="mt-2">
                <a
                  href={`tel:+${digits(landline)}`}
                  className="inline-flex items-center gap-2 text-base leading-relaxed text-silver transition-colors hover:text-gold-highlight"
                >
                  <span aria-hidden="true" className="text-gold">
                    <PhoneIcon size={15} />
                  </span>
                  {landline}
                </a>
              </dd>
            </div>
          )}
        </dl>

        {/* Other branches */}
        {others.length > 0 && (
          <section aria-label={ui.otherStoresLabel} className="mt-14 border-t border-graphite pt-8">
            <p className="flex items-center gap-2.5 text-[10px] font-bold uppercase tracking-[0.22em] text-gold">
              <span
                aria-hidden="true"
                className="h-1.5 w-1.5 rotate-45 bg-gold"
              />
              {ui.otherStoresLabel}
            </p>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {others.map((entry) => (
                <AppLink
                  key={entry.store.slug}
                  href={`/stores/${entry.store.slug}`}
                  className="group flex items-center gap-4 rounded-md border border-graphite bg-charcoal p-3 transition-all duration-300 hover:-translate-y-0.5 hover:border-gold/60 hover:shadow-[0_18px_40px_-18px_rgba(0,0,0,0.7)]"
                >
                  <div className="relative h-20 w-24 shrink-0 overflow-hidden rounded-sm sm:h-24 sm:w-28">
                    <Image
                      src={entry.store.photo}
                      alt=""
                      fill
                      sizes="112px"
                      className="object-cover brightness-[0.8] saturate-[0.5] transition-all duration-700 ease-out group-hover:scale-[1.05] group-hover:brightness-100 group-hover:saturate-100"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.22em] text-gold">
                      <span aria-hidden="true" className="h-px w-3 bg-gold" />
                      {ui.storeSingular} {String(entry.index).padStart(2, "0")}
                    </p>
                    <h3 className="mt-1 font-display text-2xl font-bold uppercase leading-tight tracking-tight text-cream transition-colors duration-300 group-hover:text-gold-highlight">
                      {entry.store.name}
                    </h3>
                    <p className="mt-1 truncate text-xs text-silver">
                      {entry.store.hours}
                    </p>
                  </div>
                  <span
                    aria-hidden="true"
                    className="pr-2 text-gold transition-transform duration-300 group-hover:translate-x-1"
                  >
                    →
                  </span>
                </AppLink>
              ))}
            </div>
          </section>
        )}
      </main>
    </>
  );
}
