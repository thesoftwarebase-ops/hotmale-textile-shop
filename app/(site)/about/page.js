import Image from "next/image";
import PageHeader from "../../../components/layout/PageHeader";
import SectionHeading from "../../../components/home/SectionHeading";
import {
  getBrand,
  getPage,
  getSocial,
  getStores,
  getUi,
} from "../../../lib/data";
import { buildMetadata } from "../../../lib/seo";

export async function generateMetadata() {
  const page = await getPage("about");
  return buildMetadata({
    title: page.title,
    description: page.intro,
    path: "/about",
  });
}

/**
 * About: the brand story told as an editorial spread — decor header with
 * live stats, a framed home-store portrait beside the narrative, a
 * manifesto band, the journey timeline, the values and a community
 * close with the Instagram invite. Every string, number and image comes
 * from data.
 */
export default async function AboutPage() {
  const [page, stores, brand, ui, social] = await Promise.all([
    getPage("about"),
    getStores(),
    getBrand(),
    getUi(),
    getSocial(),
  ]);

  const homeStore = stores[0] ?? null;
  const customImage = Boolean(page.story?.image);
  const storyImage = page.story?.image || homeStore?.photo || "";
  const storyImageAlt =
    page.story?.imageAlt || homeStore?.name || page.title;
  const storyCredits = [
    page.since ? `${ui.establishedShortLabel} ${page.since}` : null,
    !customImage && homeStore ? homeStore.name : null,
    page.story?.imageCaption,
  ].filter(Boolean);
  const stats = [
    ...(page.since
      ? [{ value: page.since, label: ui.establishedLabel }]
      : []),
    { value: String(stores.length).padStart(2, "0"), label: ui.storePlural },
    { value: brand.city, label: ui.cityLabel },
  ];

  return (
    <>
      <PageHeader
        title={page.title}
        intro={page.intro}
        eyebrow={page.since ? `${ui.sinceLabel} ${page.since} · ${brand.city}` : brand.city}
        decor
        stats={stats}
      />

      <main className="flex-1">
        {/* Story — the framed home store beside the narrative */}
        <section
          aria-labelledby="story-heading"
          className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8"
        >
          <div
            className={`grid gap-10 lg:grid-cols-[minmax(0,320px)_minmax(0,1fr)] lg:items-start lg:gap-10 ${
              storyImage ? "" : "max-w-3xl"
            }`}
          >
            {storyImage && (
              <figure className="mx-auto w-full max-w-xs lg:sticky lg:top-28 lg:mx-0">
                <div className="group relative">
                  <span
                    aria-hidden="true"
                    className="absolute -bottom-2 -right-2 h-full w-full rounded-md border border-gold/25"
                  />
                  <div className="relative overflow-hidden rounded-md border border-graphite bg-charcoal shadow-[0_30px_70px_-30px_rgba(0,0,0,0.85)]">
                    <div className="relative aspect-[9/16] w-full">
                      <Image
                        src={storyImage}
                        alt={storyImageAlt}
                        fill
                        quality={90}
                        sizes="(min-width: 1024px) 320px, 80vw"
                        className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.02]"
                      />
                    </div>
                    <span
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-2 rounded-[2px] border border-cream/10"
                    />
                  </div>
                </div>
                <figcaption className="mt-4 border-t border-graphite pt-3">
                  <div className="flex items-baseline justify-between gap-3 text-[10px] font-semibold uppercase tracking-[0.22em]">
                    <span className="flex items-center gap-2 text-gold">
                      <span aria-hidden="true" className="h-px w-5 bg-gold/60" />
                      {storyCredits[0]}
                    </span>
                    {storyCredits.length > 1 ? (
                      <span className="text-right text-muted">
                        {storyCredits.slice(1).join(" · ")}
                      </span>
                    ) : null}
                  </div>
                </figcaption>
              </figure>
            )}

            <div>
              <p className="flex items-center gap-3 text-[11px] font-bold uppercase tracking-[0.24em] text-gold">
                <span
                  aria-hidden="true"
                  className="h-1.5 w-1.5 rotate-45 bg-gold"
                />
                {ui.storyLabel}
              </p>
              <h2
                id="story-heading"
                className="mt-4 font-display text-4xl font-black uppercase leading-[1.02] tracking-tight text-cream sm:text-5xl"
              >
                {page.story.title}
              </h2>
              <div className="mt-6 space-y-5 text-justify">
                {page.story.paragraphs.map((paragraph, index) => (
                  <p
                    key={index}
                    className={`text-base leading-relaxed text-silver sm:text-lg ${
                      index === 0
                        ? "first-letter:float-left first-letter:mr-3 first-letter:mt-1 first-letter:font-display first-letter:text-6xl first-letter:font-black first-letter:leading-[0.8] first-letter:text-gold"
                        : ""
                    }`}
                  >
                    {paragraph}
                  </p>
                ))}
              </div>
              <blockquote className="relative mt-10 overflow-hidden rounded-md border border-graphite bg-charcoal/70 p-6 pl-7 sm:p-7 sm:pl-8">
                <span
                  aria-hidden="true"
                  className="absolute inset-y-0 left-0 w-0.5 bg-gradient-to-b from-gold/20 via-gold to-gold/20"
                />
                <span
                  aria-hidden="true"
                  className="text-outline-gold absolute -right-1 -top-5 font-display text-[5.5rem] font-black leading-none opacity-30"
                >
                  &ldquo;
                </span>
                <p className="relative font-display text-2xl font-bold uppercase leading-tight tracking-tight text-cream sm:text-3xl">
                  {page.story.quote}
                </p>
                <footer className="relative mt-4 flex items-center gap-2.5 text-[10px] font-semibold uppercase tracking-[0.22em] text-muted">
                  <span aria-hidden="true" className="h-px w-5 bg-gold/60" />
                  {page.story.signature}
                </footer>
              </blockquote>
            </div>
          </div>
        </section>

        {/* Manifesto band */}
        <section className="relative overflow-hidden border-y border-graphite bg-charcoal/60">
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold/70 to-transparent"
          />
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(90%_130%_at_50%_0%,rgba(230,196,64,0.12),transparent_65%)]"
          />
          <div className="relative mx-auto flex max-w-5xl flex-col items-center gap-5 px-4 py-16 text-center sm:px-6 sm:py-20 lg:px-8">
            <blockquote className="max-w-4xl font-display text-4xl font-black uppercase leading-[1.02] tracking-tight text-cream sm:text-5xl lg:text-6xl">
              &ldquo;{page.manifesto.quote}&rdquo;
            </blockquote>
            <p className="max-w-2xl text-base leading-relaxed text-silver sm:text-lg">
              {page.manifesto.body}
            </p>
          </div>
        </section>

        {/* Journey timeline */}
        <section
          aria-labelledby="journey-heading"
          className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8"
        >
          <SectionHeading title={page.timelineTitle} id="journey-heading" />
          <ol className="mt-10 border-t border-graphite">
            {page.timeline.map((milestone) => (
              <li
                key={milestone.year}
                className="grid gap-3 border-b border-graphite py-8 sm:grid-cols-[190px_minmax(0,1fr)] sm:gap-10 lg:py-10"
              >
                <p className="tnum font-display text-4xl font-black uppercase leading-none tracking-tight text-gold sm:text-5xl">
                  {milestone.year}
                </p>
                <div>
                  <h3 className="font-display text-xl font-bold uppercase leading-tight tracking-tight text-cream sm:text-2xl">
                    {milestone.title}
                  </h3>
                  <p className="mt-2 max-w-2xl text-base leading-relaxed text-silver">
                    {milestone.body}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        {/* Values */}
        <section
          aria-labelledby="values-heading"
          className="border-y border-graphite bg-charcoal/40"
        >
          <div className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
            <SectionHeading title={page.valuesTitle} id="values-heading" />
            <div className="mt-10 grid gap-5 md:grid-cols-3">
              {page.values.map((value, index) => (
                <article
                  key={value.title}
                  className="group relative overflow-hidden rounded-md border border-graphite bg-charcoal p-6 transition-colors duration-300 hover:border-gold/50 sm:p-8"
                >
                  <span
                    aria-hidden="true"
                    className="text-outline-gold absolute -right-1 -top-2 font-display text-[5.5rem] font-black leading-none opacity-40 transition-opacity duration-300 group-hover:opacity-60"
                  >
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span
                    aria-hidden="true"
                    className="block h-1.5 w-1.5 rotate-45 bg-gold"
                  />
                  <h3 className="relative mt-6 font-display text-2xl font-bold uppercase leading-tight tracking-tight text-cream">
                    {value.title}
                  </h3>
                  <p className="relative mt-3 text-sm leading-relaxed text-silver">
                    {value.body}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Community — city pride and the Instagram invite */}
        <section
          aria-labelledby="community-heading"
          className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8"
        >
          <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:gap-16">
            <div>
              <p className="flex items-center gap-3 text-[11px] font-bold uppercase tracking-[0.24em] text-gold">
                <span
                  aria-hidden="true"
                  className="h-1.5 w-1.5 rotate-45 bg-gold"
                />
                {page.community.eyebrow}
              </p>
              <h2
                id="community-heading"
                className="mt-4 font-display text-4xl font-black uppercase leading-[1.02] tracking-tight text-cream sm:text-5xl"
              >
                {page.community.title}
              </h2>
              <p className="mt-5 max-w-2xl text-base leading-relaxed text-silver sm:text-lg">
                {page.community.body}
              </p>
              {social.instagramUrl && (
                <a
                  href={social.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-8 inline-flex min-h-[52px] items-center justify-center gap-2 rounded-sm border border-gold px-8 text-xs font-bold uppercase tracking-[0.12em] text-gold transition-colors hover:bg-gold hover:text-ink"
                >
                  {page.community.ctaLabel}
                  <span aria-hidden="true">↗</span>
                </a>
              )}
            </div>
            <div className="relative">
              <p
                aria-hidden="true"
                className="text-outline-gold text-center font-display text-[clamp(3.5rem,12vw,7.5rem)] font-black uppercase leading-none tracking-tight lg:text-right"
              >
                {brand.city}
              </p>
              {social.instagramHandle && (
                <p className="mt-4 text-center text-[10px] font-bold uppercase tracking-[0.24em] text-gold lg:text-right">
                  {social.instagramHandle}
                </p>
              )}
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
