import AppLink from "../transitions/AppLink";

/**
 * Hero statement band — the copy that belongs to the homepage, set
 * directly beneath the campaign carousel.
 *
 * The posters carry their own typography (that is the campaign), so the
 * headline, supporting copy and the two calls to action live here in
 * their own space instead of being painted over the artwork. The band is
 * built like a title card: a blurred echo of the campaign art behind it,
 * a blueprint grid, the brand's flame gold across the type and frame, an
 * index chip, the actions as arrow rows and a technical meta rail.
 */
function backdropSource(src) {
  if (!src) return null;
  const base = src.split("?")[0];
  if (base.includes("ik.imagekit.io")) {
    return `${base}?tr=w-560,q-20,bl-30,fo-auto`;
  }
  return src;
}

function FrameCorner({ position }) {
  const styles = {
    "top-left": "left-0 top-0 border-l border-t",
    "top-right": "right-0 top-0 border-r border-t",
    "bottom-left": "bottom-0 left-0 border-b border-l",
    "bottom-right": "bottom-0 right-0 border-b border-r",
  };

  return (
    <span
      aria-hidden="true"
      className={`pointer-events-none absolute h-7 w-7 border-gold/70 ${styles[position]}`}
    />
  );
}

export default function HeroStatement({ hero, brand }) {
  const hasContent =
    hero.eyebrow || hero.headline || hero.subcopy || hero.primaryCta?.label;

  if (!hasContent) return null;

  const actions = [
    hero.primaryCta?.label ? { ...hero.primaryCta, primary: true } : null,
    hero.secondaryCta?.label ? { ...hero.secondaryCta } : null,
  ].filter(Boolean);

  const backdrop = backdropSource(hero.posters?.[0]?.src);
  const place = [brand?.city, brand?.region].filter(Boolean).join(" · ");

  return (
    <section
      aria-labelledby={hero.headline ? "hero-heading" : undefined}
      className="relative isolate overflow-hidden border-t border-gold/30 bg-ink"
    >
      {/* Blurred echo of the campaign art, so the band feels part of it */}
      {backdrop ? (
        <span
          aria-hidden="true"
          className="absolute inset-0 -z-30 bg-cover bg-right bg-center opacity-30"
          style={{ backgroundImage: `url("${backdrop}")` }}
        />
      ) : null}

      {/* Brand light: a warm flame glow top right, an ember pool below */}
      <span
        aria-hidden="true"
        className="absolute inset-0 -z-20 bg-[radial-gradient(60rem_30rem_at_85%_-10%,rgba(230,196,64,0.20),transparent_60%)]"
      />
      <span
        aria-hidden="true"
        className="absolute inset-0 -z-20 bg-[radial-gradient(45rem_22rem_at_8%_112%,rgba(184,153,31,0.24),transparent_65%)]"
      />

      {/* Blueprint grid */}
      <span
        aria-hidden="true"
        className="absolute inset-0 -z-20 opacity-70 [mask-image:radial-gradient(120%_100%_at_50%_0%,#000_25%,transparent_78%)]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(248,248,232,0.045) 1px, transparent 1px), linear-gradient(90deg, rgba(248,248,232,0.045) 1px, transparent 1px)",
          backgroundSize: "76px 76px",
        }}
      />

      {/* Diagonal gold hairlines on the right half */}
      <span
        aria-hidden="true"
        className="absolute inset-y-0 right-0 -z-20 hidden w-1/2 opacity-60 [mask-image:linear-gradient(to_left,#000,transparent)] lg:block"
        style={{
          backgroundImage:
            "repeating-linear-gradient(135deg, rgba(230,196,64,0.075) 0 1px, transparent 1px 13px)",
        }}
      />

      {/* Flame corner */}
      <span
        aria-hidden="true"
        className="absolute -right-16 -top-20 -z-20 h-72 w-72 opacity-20 [clip-path:polygon(100%_0,0_0,100%_100%)]"
        style={{
          background:
            "linear-gradient(135deg, rgba(242,218,92,0.85), rgba(184,153,31,0.25) 55%, transparent 75%)",
        }}
      />

      {/* Wordmark watermark */}
      {brand?.name ? (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-4 right-0 -z-20 select-none whitespace-nowrap font-display text-[16vw] font-black uppercase leading-none text-transparent opacity-70 lg:text-[13vw]"
          style={{
            WebkitTextStroke: "1px rgba(230,196,64,0.16)",
          }}
        >
          {brand.name}
        </span>
      ) : null}

      {/* Legibility washes */}
      <span
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-gradient-to-r from-ink via-ink/92 to-ink/45"
      />
      <span
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-gradient-to-t from-ink via-ink/15 to-ink/70"
      />

      {/* Viewfinder frame in brand gold */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-3 hidden border border-gold/15 lg:block"
      />
      <FrameCorner position="top-left" />
      <FrameCorner position="top-right" />
      <FrameCorner position="bottom-left" />
      <FrameCorner position="bottom-right" />

      {/* Gold rule across the top */}
      <span
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold/70 to-transparent"
      />
      {/* Gold rail down the left edge */}
      <span
        aria-hidden="true"
        className="absolute inset-y-0 left-0 w-px bg-gradient-to-b from-transparent via-gold/45 to-transparent"
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
          {/* Statement */}
          <div className="relative pt-12 pb-7 sm:pt-14 sm:pb-9 lg:border-r lg:border-white/10 lg:py-16 lg:pr-14">
            {hero.eyebrow ? (
              <p className="mt-6 flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.3em] text-gold-highlight sm:text-[11px]">
                <span aria-hidden="true" className="h-1.5 w-1.5 rotate-45 bg-gold-highlight" />
                {hero.eyebrow}
              </p>
            ) : null}

            {hero.headline ? (
              <h1
                id="hero-heading"
                className="gold-sheen-text mt-5 max-w-[14ch] font-display text-[11vw] font-black uppercase leading-[0.86] tracking-[-0.015em] drop-shadow-[0_6px_28px_rgba(184,153,31,0.25)] sm:text-6xl lg:text-7xl xl:text-[5.5rem]"
              >
                {hero.headline}
              </h1>
            ) : null}

            <div className="mt-7 flex items-center gap-4 sm:mt-9">
              <span
                aria-hidden="true"
                className="h-2.5 w-2.5 rotate-45 bg-gradient-to-br from-gold-highlight to-deep-gold"
              />
              <span
                aria-hidden="true"
                className="h-px flex-1 bg-gradient-to-r from-gold via-gold/35 to-transparent"
              />
            </div>
          </div>

          {/* Copy and actions */}
          <div className="border-t border-white/10 pb-12 pt-7 sm:pb-14 sm:pt-9 lg:border-t-0 lg:py-16 lg:pl-14">
            {hero.subcopy ? (
              <p className="max-w-md text-sm leading-7 text-silver sm:text-base">
                {hero.subcopy}
              </p>
            ) : null}

            {actions.length > 0 ? (
              <div className="mt-7 grid gap-3 sm:mt-9 sm:grid-cols-2">
                {actions.map((action) => (
                  <AppLink
                    key={action.href}
                    href={action.href}
                    className="group relative flex min-h-[128px] flex-col justify-between overflow-hidden border border-white/12 bg-ink/45 p-5 transition-colors hover:border-gold/60"
                  >
                    {/* Gold sweep on hover */}
                    <span
                      aria-hidden="true"
                      className="absolute inset-0 translate-y-full bg-gradient-to-br from-gold via-gold-highlight to-deep-gold transition-transform duration-300 group-hover:translate-y-0"
                    />
                    {/* Corner ticks */}
                    <span
                      aria-hidden="true"
                      className="absolute left-0 top-0 h-4 w-4 border-l border-t border-gold/60 transition-colors group-hover:border-ink/60"
                    />
                    <span
                      aria-hidden="true"
                      className="absolute bottom-0 right-0 h-4 w-4 border-b border-r border-gold/60 transition-colors group-hover:border-ink/60"
                    />

                    <span className="relative z-10 flex items-center gap-2.5">
                      <span
                        aria-hidden="true"
                        className="h-1.5 w-1.5 rotate-45 bg-gold transition-colors group-hover:bg-ink/80"
                      />
                      <span className="text-[9px] font-bold uppercase tracking-[0.28em] text-gold transition-colors group-hover:text-ink/70">
                        {action.href}
                      </span>
                    </span>

                    <span className="relative z-10 mt-6 flex items-end justify-between gap-3">
                      <span className="font-display text-2xl font-black uppercase leading-none tracking-tight text-cream transition-colors group-hover:text-ink sm:text-[1.7rem]">
                        {action.label}
                      </span>
                      <span
                        aria-hidden="true"
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-gold/50 text-gold transition-colors group-hover:border-ink group-hover:bg-ink group-hover:text-gold"
                      >
                        <span className="text-base leading-none transition-transform duration-300 group-hover:translate-x-0.5">
                          →
                        </span>
                      </span>
                    </span>
                  </AppLink>
                ))}
              </div>
            ) : null}

            {place ? (
              <p className="mt-6 text-[9px] font-bold uppercase tracking-[0.28em] text-gold/70">
                {place}
              </p>
            ) : null}
          </div>
        </div>

        {/* Technical meta rail */}
        <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 border-t border-white/10 py-4 text-[9px] font-bold uppercase tracking-[0.3em] text-muted/70">
          <span className="hidden sm:block">{brand?.name}</span>
          <span>{place}</span>
        </div>
      </div>
    </section>
  );
}
