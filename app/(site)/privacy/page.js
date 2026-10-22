import PageHeader from "../../../components/layout/PageHeader";
import AppLink from "../../../components/transitions/AppLink";
import { getPage } from "../../../lib/data";
import { buildMetadata } from "../../../lib/seo";

function splitParagraphs(value) {
  return String(value ?? "")
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
}

export async function generateMetadata() {
  const page = await getPage("privacy");
  return buildMetadata({
    title: page.title,
    description: page.intro || page.sections?.[0]?.body || page.body || "",
    path: "/privacy",
  });
}

/**
 * Privacy policy: a decor header, a sticky section index and the full
 * policy broken into editable sections. The contact note closes the page
 * with the route into the enquiry form.
 */
export default async function PrivacyPage() {
  const page = await getPage("privacy");
  const sections =
    Array.isArray(page.sections) && page.sections.length > 0
      ? page.sections.filter(
          (section) => section?.title || section?.body,
        )
      : page.body
        ? [{ title: page.title, body: page.body }]
        : [];
  const contact = page.contact ?? {};
  const updateNote = page.updated
    ? `${page.updatedLabel || "Last updated"}: ${page.updated}`
    : "";
  const eyebrow = [page.eyebrow, updateNote].filter(Boolean).join(" · ");
  const contentsLabel = page.contentsLabel || "On this page";

  return (
    <>
      <PageHeader
        title={page.title}
        intro={page.intro}
        eyebrow={eyebrow || undefined}
        decor
      />

      <main className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,220px)_minmax(0,1fr)] lg:gap-14">
          <aside className="lg:sticky lg:top-28 lg:self-start">
            <p className="flex items-center gap-3 text-[11px] font-bold uppercase tracking-[0.24em] text-gold">
              <span
                aria-hidden="true"
                className="h-1.5 w-1.5 rotate-45 bg-gold"
              />
              {contentsLabel}
            </p>
            <nav
              aria-label={contentsLabel}
              className="mt-4 border-t border-graphite"
            >
              <ol className="divide-y divide-graphite">
                {sections.map((section, index) => (
                  <li key={`${section.title}-${index}`}>
                    <a
                      href={`#policy-${index + 1}`}
                      className="group flex items-baseline gap-3 py-3 text-sm leading-5 text-silver transition-colors hover:text-gold-highlight"
                    >
                      <span className="tnum shrink-0 text-[10px] font-semibold text-gold/70">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <span>{section.title}</span>
                    </a>
                  </li>
                ))}
              </ol>
            </nav>
          </aside>

          <article className="min-w-0">
            {sections.length > 0 ? (
              <div>
                {sections.map((section, index) => (
                  <section
                    key={`${section.title}-${index}`}
                    id={`policy-${index + 1}`}
                    className="scroll-mt-28 border-t border-graphite py-8 first:border-t-0 first:pt-0 last:pb-0"
                  >
                    <div className="flex items-baseline gap-3">
                      <span className="tnum shrink-0 font-display text-lg font-black leading-none text-gold">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <h2 className="font-display text-2xl font-black uppercase leading-tight tracking-tight text-cream sm:text-3xl">
                        {section.title}
                      </h2>
                    </div>
                    <div className="mt-4 space-y-4">
                      {splitParagraphs(section.body).map(
                        (paragraph, paragraphIndex) => (
                          <p
                            key={paragraphIndex}
                            className="whitespace-pre-line text-base leading-relaxed text-silver"
                          >
                            {paragraph}
                          </p>
                        ),
                      )}
                    </div>
                  </section>
                ))}
              </div>
            ) : (
              <p className="text-base leading-relaxed text-silver">
                {page.body || "Privacy policy to be reviewed by HOTMALE."}
              </p>
            )}

            {(contact.title || contact.body) && (
              <section
                aria-labelledby={
                  contact.title ? "privacy-contact-heading" : undefined
                }
                className="relative mt-12 overflow-hidden rounded-md border border-graphite bg-charcoal p-6 sm:p-8"
              >
                <span
                  aria-hidden="true"
                  className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold/70 to-transparent"
                />
                {contact.eyebrow ? (
                  <p className="flex items-center gap-3 text-[11px] font-bold uppercase tracking-[0.24em] text-gold">
                    <span
                      aria-hidden="true"
                      className="h-1.5 w-1.5 rotate-45 bg-gold"
                    />
                    {contact.eyebrow}
                  </p>
                ) : null}
                {contact.title ? (
                  <h2
                    id="privacy-contact-heading"
                    className="mt-4 font-display text-2xl font-black uppercase leading-tight tracking-tight text-cream sm:text-3xl"
                  >
                    {contact.title}
                  </h2>
                ) : null}
                {contact.body ? (
                  <p className="mt-3 max-w-xl text-sm leading-relaxed text-silver sm:text-base">
                    {contact.body}
                  </p>
                ) : null}
                {contact.ctaLabel && contact.ctaHref ? (
                  <AppLink
                    href={contact.ctaHref}
                    className="mt-6 inline-flex min-h-[48px] items-center justify-center gap-2 rounded-sm border border-gold px-6 text-[10px] font-bold uppercase tracking-[0.16em] text-gold transition-colors hover:bg-gold hover:text-ink"
                  >
                    {contact.ctaLabel}
                    <span aria-hidden="true">&rarr;</span>
                  </AppLink>
                ) : null}
              </section>
            )}
          </article>
        </div>
      </main>
    </>
  );
}
