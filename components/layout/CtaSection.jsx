import AppLink from "../transitions/AppLink";

/**
 * Closing CTA band above the footer: eyebrow, big display title,
 * subtitle and two calls to action, all from data. Full-width
 * charcoal panel with a gold aura framing it. Rendered site-wide from
 * the root layout — hidden on the contact page.
 */
export default function CtaSection({ cta }) {
  return (
    <section className="relative overflow-hidden border-t border-graphite bg-charcoal">
      {/* Gold aura crowning the band */}
      <span
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold/70 to-transparent"
      />
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-6 px-4 py-16 text-center sm:px-6 sm:py-20 lg:px-8">
        <p className="flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-gold">
          <span aria-hidden="true" className="h-[5px] w-[5px] rotate-45 bg-gold" />
          {cta.eyebrow}
        </p>
        <h2 className="max-w-3xl font-display text-4xl font-black uppercase leading-tight tracking-tight text-cream sm:text-5xl lg:text-6xl">
          {cta.title}
        </h2>
        <p className="max-w-xl text-base leading-relaxed text-silver sm:text-lg">
          {cta.subtitle}
        </p>
        <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
          <AppLink
            href={cta.primaryCta.href}
            className="inline-flex min-h-[52px] w-full items-center justify-center rounded-sm bg-gold px-8 text-xs font-bold uppercase tracking-[0.12em] text-ink transition-colors hover:bg-gold-highlight sm:w-auto"
          >
            {cta.primaryCta.label}
          </AppLink>
          <AppLink
            href={cta.secondaryCta.href}
            className="inline-flex min-h-[52px] w-full items-center justify-center rounded-sm border border-gold bg-transparent px-8 text-xs font-bold uppercase tracking-[0.12em] text-gold transition-colors hover:bg-gold hover:text-ink sm:w-auto"
          >
            {cta.secondaryCta.label}
          </AppLink>
        </div>
      </div>
    </section>
  );
}
