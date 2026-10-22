import Image from "next/image";
import PageHeader from "../../../components/layout/PageHeader";
import AppLink from "../../../components/transitions/AppLink";
import ContactForm from "../../../components/contact/ContactForm";
import PhoneIcon from "../../../components/social/PhoneIcon";
import { getContact, getPage, getStores, getUi } from "../../../lib/data";
import { buildMetadata } from "../../../lib/seo";

export async function generateMetadata() {
  const page = await getPage("contact");
  return buildMetadata({
    title: page.title,
    description: page.intro,
    path: "/contact",
  });
}

/**
 * Contact page: enquiry form (toast feedback, JSON API) beside the
 * direct channels (phone/email — hidden while empty) and the store
 * directory. All copy comes from data via pages.contact.
 */
export default async function ContactPage() {
  const [page, contact, stores, ui] = await Promise.all([
    getPage("contact"),
    getContact(),
    getStores(),
    getUi(),
  ]);

  const phoneDigits = (contact.phone || "").replace(/\D/g, "");
  const email = contact.email || "";

  return (
    <>
      <PageHeader
        title={page.title}
        intro={page.intro}
        eyebrow={page.eyebrow}
        decor
      />

      <main className="w-full mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:items-start lg:gap-8">
          <section
            aria-labelledby="enquiry-heading"
            className="rounded-md border border-graphite bg-charcoal p-6 sm:p-8 lg:p-10"
          >
            <p className="flex items-center gap-3 text-[11px] font-bold uppercase tracking-[0.24em] text-gold">
              <span
                aria-hidden="true"
                className="h-1.5 w-1.5 rotate-45 bg-gold"
              />
              {page.form.eyebrow}
            </p>
            <h2
              id="enquiry-heading"
              className="mt-4 font-display text-3xl font-black uppercase leading-none tracking-tight text-cream sm:text-4xl"
            >
              {page.form.title}
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-silver sm:text-base">
              {page.form.intro}
            </p>

            <ContactForm form={page.form} dismissLabel={ui.dismissLabel} />
          </section>

          <aside className="flex flex-col gap-6">
            {(contact.phone || email) && (
              <section className="rounded-md border border-graphite bg-charcoal p-6 sm:p-7">
                <p className="flex items-center gap-3 text-[11px] font-bold uppercase tracking-[0.24em] text-gold">
                  <span
                    aria-hidden="true"
                    className="h-1.5 w-1.5 rotate-45 bg-gold"
                  />
                  {page.detailsTitle}
                </p>
                <div className="mt-4 divide-y divide-graphite border-t border-graphite">
                  {contact.phone && (
                    <a
                      href={`tel:+${phoneDigits}`}
                      className="group flex items-center justify-between gap-4 py-3.5"
                    >
                      <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted">
                        {ui.phoneLabel}
                      </span>
                      <span className="flex items-center gap-2 text-sm text-cream transition-colors group-hover:text-gold-highlight">
                        <PhoneIcon size={14} />
                        {contact.phone}
                      </span>
                    </a>
                  )}
                  {email && (
                    <a
                      href={`mailto:${email}`}
                      className="group flex items-center justify-between gap-4 py-3.5"
                    >
                      <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted">
                        {ui.emailLabel}
                      </span>
                      <span className="text-sm text-cream transition-colors group-hover:text-gold-highlight">
                        {email}
                      </span>
                    </a>
                  )}
                </div>
              </section>
            )}

            <section className="rounded-md border border-graphite bg-charcoal p-6 sm:p-7">
              <p className="flex items-center gap-3 text-[11px] font-bold uppercase tracking-[0.24em] text-gold">
                <span
                  aria-hidden="true"
                  className="h-1.5 w-1.5 rotate-45 bg-gold"
                />
                {ui.visitLabel}
              </p>
              <p className="mt-3 text-sm leading-relaxed text-silver">
                {page.storesNote}
              </p>

              <ul className="mt-5 divide-y divide-graphite border-t border-graphite">
                {stores.map((store) => (
                  <li key={store.slug}>
                    <AppLink
                      href={`/stores/${store.slug}`}
                      className="group flex items-center gap-4 py-4"
                    >
                      <span className="relative h-14 w-14 shrink-0 overflow-hidden rounded-sm border border-graphite">
                        <Image
                          src={store.photo}
                          alt=""
                          fill
                          sizes="56px"
                          className="object-cover brightness-[0.8] saturate-[0.5] transition-all duration-500 group-hover:brightness-100 group-hover:saturate-100"
                        />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block font-display text-lg font-bold uppercase leading-tight tracking-tight text-cream transition-colors group-hover:text-gold-highlight">
                          {store.name}
                        </span>
                        <span className="mt-0.5 block truncate text-xs text-muted">
                          {store.address}
                        </span>
                        {store.phone && (
                          <span className="mt-1 flex items-center gap-1.5 text-xs text-silver">
                            <PhoneIcon size={12} />
                            {store.phone}
                          </span>
                        )}
                      </span>
                      <span
                        aria-hidden="true"
                        className="text-gold transition-transform duration-300 group-hover:translate-x-1"
                      >
                        &rarr;
                      </span>
                    </AppLink>
                  </li>
                ))}
              </ul>
            </section>
          </aside>
        </div>
      </main>
    </>
  );
}
