import HeaderDecor from "./HeaderDecor";

/**
 * Shared page header for interior routes: a charcoal band with the
 * page title (Big Shoulders), an optional gold eyebrow and an optional
 * intro, all from data. `decor` adds the brand's showcase chrome
 * (HeaderDecor) — used by hero-level listing pages like /collections.
 * `stats` ([{ value, label }]) renders a hairline stat strip under the
 * intro, e.g. the live catalogue counts.
 */
export default function PageHeader({
  title,
  intro,
  eyebrow,
  decor = false,
  stats = [],
}) {
  return (
    <header className="relative overflow-hidden border-b border-graphite bg-charcoal/60">
      {decor && <HeaderDecor />}
      <div className="relative w-full mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        {eyebrow && (
          <p className="mb-4 flex items-center gap-3 text-[11px] font-bold uppercase tracking-[0.24em] text-gold">
            <span
              aria-hidden="true"
              className="h-1.5 w-1.5 rotate-45 bg-gold"
            />
            {eyebrow}
          </p>
        )}
        <h1 className="font-display text-4xl font-black uppercase leading-none tracking-tight text-cream sm:text-5xl lg:text-6xl">
          {title}
        </h1>
        {intro && (
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-silver sm:text-lg">
            {intro}
          </p>
        )}
        {stats.length > 0 && (
          <dl className="relative mt-8 flex flex-wrap gap-x-8 gap-y-5 border-t border-graphite pt-6 sm:gap-x-12">
            {stats.map((stat, index) => (
              <div
                key={`${stat.label}-${index}`}
                className="flex flex-col-reverse"
              >
                <dt className="mt-1 whitespace-nowrap text-[9px] font-semibold uppercase tracking-[0.22em] text-silver sm:text-[10px]">
                  {stat.label}
                </dt>
                <dd className="tnum whitespace-nowrap font-display text-2xl font-black leading-none text-gold sm:text-3xl">
                  {stat.value}
                </dd>
              </div>
            ))}
          </dl>
        )}
      </div>
    </header>
  );
}
