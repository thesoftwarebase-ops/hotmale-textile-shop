import Image from "next/image";
import AppLink from "../transitions/AppLink";
import SectionHeading from "./SectionHeading";

/**
 * Branch band — the store finder block.
 *
 * The band's own copy (eyebrow, title, intro, the stat line and the
 * call to action) comes from the homepage content; the branches
 * themselves come from the stores catalogue. Each branch is a card: the
 * campaign photo with the branch name, then the details a visitor
 * actually needs before they travel — where it is, when it is open and
 * the two ways to reach it — with the branch page one click away.
 */
function digits(value) {
  return String(value ?? "").replace(/\D/g, "");
}

function BranchCard({ store, ui }) {
  const phone = store.phone || store.landline || "";
  const whatsapp = digits(store.whatsapp || store.phone);
  const tel = phone ? `tel:+${digits(phone)}` : null;
  const wa = whatsapp ? `https://wa.me/${whatsapp}` : null;

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-md border border-graphite bg-charcoal transition-all duration-300 hover:-translate-y-1 hover:border-gold/60 hover:shadow-[0_20px_44px_-18px_rgba(0,0,0,0.65),0_0_28px_rgba(230,196,64,0.08)]">
      <AppLink
        href={`/stores/${store.slug}`}
        className="relative block overflow-hidden"
      >
        <div className="relative aspect-[4/5] w-full overflow-hidden">
          <Image
            src={store.photo}
            alt=""
            fill
            sizes="(min-width: 1024px) 33vw, 50vw"
            className="object-cover brightness-[0.94] transition-all duration-700 ease-out group-hover:scale-[1.05] group-hover:brightness-100"
          />
          {/* Bottom-weighted scrim for the name */}
          <span
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/25 to-transparent"
          />
          {/* Mat keyline that wakes on hover */}
          <span
            aria-hidden="true"
            className="absolute inset-2 rounded-sm border border-cream/10 transition-colors duration-500 group-hover:border-gold/30"
          />
          <h3 className="absolute inset-x-0 bottom-0 z-10 flex items-center gap-2.5 p-4 transition-transform duration-300 group-hover:-translate-y-1 sm:p-5">
            <span
              aria-hidden="true"
              className="h-px w-5 shrink-0 bg-gold transition-all duration-300 group-hover:w-8"
            />
            <span className="font-display text-xl font-bold uppercase leading-tight tracking-tight text-cream sm:text-2xl">
              {store.name}
            </span>
          </h3>
        </div>
      </AppLink>

      {/* The details a visitor needs before travelling */}
      <div className="flex flex-1 flex-col gap-3 border-t border-graphite p-4 sm:p-5">
        <dl className="space-y-2.5 text-[11px] leading-relaxed">
          {store.address ? (
            <div className="flex gap-3">
              <dt className="w-16 shrink-0 text-[9px] font-bold uppercase tracking-[0.2em] text-muted">
                {ui.addressLabel}
              </dt>
              <dd className="min-w-0 flex-1 text-silver">{store.address}</dd>
            </div>
          ) : null}

          {store.hours ? (
            <div className="flex gap-3">
              <dt className="w-16 shrink-0 text-[9px] font-bold uppercase tracking-[0.2em] text-muted">
                {ui.hoursLabel}
              </dt>
              <dd className="min-w-0 flex-1 text-silver">{store.hours}</dd>
            </div>
          ) : null}

          {phone ? (
            <div className="flex gap-3">
              <dt className="w-16 shrink-0 text-[9px] font-bold uppercase tracking-[0.2em] text-muted">
                {ui.phoneLabel}
              </dt>
              <dd className="min-w-0 flex-1">
                {tel ? (
                  <a
                    href={tel}
                    className="text-silver transition-colors hover:text-gold"
                  >
                    {phone}
                  </a>
                ) : (
                  <span className="text-silver">{phone}</span>
                )}
              </dd>
            </div>
          ) : null}
        </dl>

        <div className="mt-auto flex items-center gap-2 pt-1">
          {wa ? (
            <a
              href={wa}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-9 items-center gap-1.5 rounded-sm border border-gold/40 px-3 text-[9px] font-bold uppercase tracking-[0.16em] text-gold transition-colors hover:border-gold hover:bg-gold hover:text-ink"
            >
              {ui.whatsappLabel}
            </a>
          ) : null}

          <AppLink
            href={`/stores/${store.slug}`}
            className="group/branch inline-flex min-h-9 items-center gap-1.5 rounded-sm border border-white/10 px-3 text-[9px] font-bold uppercase tracking-[0.16em] text-silver transition-colors hover:border-gold/50 hover:text-gold"
          >
            {ui.viewBranch}
            <span
              aria-hidden="true"
              className="transition-transform duration-300 group-hover/branch:translate-x-0.5"
            >
              →
            </span>
          </AppLink>
        </div>
      </div>
    </article>
  );
}

export default function StoreCta({ title, stores, storesCta, ui }) {
  if (!stores || stores.length === 0) return null;

  const band = storesCta ?? {};

  // The band can show every branch or a curated subset. An empty list
  // means "no branch chosen yet", which falls back to showing them all.
  const picked = Array.isArray(band.storeSlugs) ? band.storeSlugs : [];
  const allBranches = picked.length === 0 || picked.includes("all");
  const shown = allBranches
    ? stores
    : stores.filter((store) => picked.includes(store.slug));

  const heading = band.title || title;

  return (
    <section aria-labelledby="stores-heading" className="py-10 sm:py-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            <SectionHeading title={heading} id="stores-heading" />
          </div>
          <div className="flex flex-col items-start gap-4 sm:items-end">
            {/* Derived count + headline as a stat block */}
            <p className="flex items-baseline gap-2.5">
              <span className="font-display text-5xl font-black leading-none text-gold">
                {shown.length}
              </span>
              <span className="font-display text-lg font-bold uppercase tracking-[0.16em] text-silver">
                {band.headline}
              </span>
            </p>
            <AppLink
              href={band.ctaHref || "/stores"}
              className="inline-flex min-h-[52px] w-full items-center justify-center rounded-sm border border-gold bg-transparent px-8 text-xs font-bold uppercase tracking-[0.12em] text-gold transition-colors hover:bg-gold hover:text-ink sm:w-auto"
            >
              {band.ctaLabel}
            </AppLink>
          </div>
        </div>

        {/* Branch cards — 2-up mobile, 3-up desktop, wraps for any count */}
        <div className="mt-10 grid grid-cols-2 gap-5 lg:grid-cols-3">
          {shown.map((store) => (
            <BranchCard key={store.slug} store={store} ui={ui} />
          ))}
        </div>
      </div>
    </section>
  );
}
