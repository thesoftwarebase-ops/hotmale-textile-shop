import AppLink from "../transitions/AppLink";
import { getBrand, getContact, getFooter, getUi } from "../../lib/data";
import BackToTop from "./BackToTop";
import BrandMark from "../brand/BrandMark";
import InstagramLink from "../social/InstagramLink";

/**
 * Site footer. Brand block, groups, links, social, watermark and chrome
 * labels all come from lib/data.js — nothing hard-coded. The Company
 * link group already carries About/Contact/Privacy, so the bottom bar
 * is the © line plus back-to-top.
 */
export default async function Footer() {
  const [footer, contact, brand, ui] = await Promise.all([
    getFooter(),
    getContact(),
    getBrand(),
    getUi(),
  ]);
  // Static year lives in data/site.js (Next 16 bans `new Date()` in
  // statically prerendered routes); CMS-driven in Stage B.
  const year = footer.copyrightYear;
  const instagram = contact.social;

  return (
    <footer className="relative overflow-hidden border-t border-graphite bg-ink">
      {/* Gold hairline crowning the footer */}
      <div
        aria-hidden="true"
        className="h-px bg-gradient-to-r from-transparent via-gold/70 to-transparent"
      />

      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-x-6 gap-y-10 px-4 pb-12 pt-12 sm:px-6 lg:grid-cols-4 lg:px-8">
        <div className="col-span-2 flex flex-col items-center text-center sm:items-start sm:text-left lg:col-span-1">
          <AppLink
            href="/"
            aria-label={`${brand.name} ${ui.homeLabel}`}
            className="group relative inline-flex after:absolute after:inset-x-0 after:-bottom-1 after:h-px after:origin-left after:scale-x-0 after:bg-gold after:transition-transform after:duration-300 hover:after:scale-x-100"
          >
            <BrandMark
              height={88}
              name={brand.name}
              tagline={brand.tagline}
              logo={brand.logo}
              className="transition-all duration-300 group-hover:scale-[1.06] group-hover:brightness-110"
            />
          </AppLink>
          <p className="mt-4 text-sm font-medium text-silver">{brand.tagline}</p>
          <p className="mt-1 text-sm text-muted">
            {brand.city}, {brand.region}
          </p>
          {instagram?.instagramUrl && instagram?.instagramHandle && (
            <span className="mt-4 inline-flex min-h-[44px] items-center">
              <InstagramLink
                handle={instagram.instagramHandle}
                url={instagram.instagramUrl}
              />
            </span>
          )}
        </div>

        {footer.groups.map((group) => (
          <nav key={group.title} aria-label={`${group.title}`} className="text-center sm:text-left">
            <h2 className="flex items-center justify-center gap-2.5 text-xs font-bold uppercase tracking-[0.14em] text-cream sm:justify-start">
              <span aria-hidden="true" className="h-px w-5 bg-gold/80" />
              {group.title}
            </h2>
            <ul className="mt-4 space-y-0.5">
              {group.links.map((link) => (
                <li key={link.href + link.label}>
                  <AppLink
                    href={link.href}
                    className="group relative inline-flex min-h-[44px] items-center justify-center text-sm text-silver transition-all duration-300 after:absolute after:bottom-2 after:left-1/2 after:h-px after:w-full after:origin-center after:-translate-x-1/2 after:scale-x-0 after:bg-gold after:transition-transform after:duration-300 hover:text-gold-highlight hover:after:scale-x-100 sm:justify-start sm:after:left-0 sm:after:origin-left sm:after:translate-x-0 sm:hover:translate-x-1"
                  >
                    {link.label}
                  </AppLink>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>

      {/* Watermark band — its own stage between the footer and the bottom bar */}
      <div aria-hidden="true" className="footer-band overflow-hidden border-t border-graphite bg-black/30">
        <p className="footer-metal mx-auto max-w-7xl px-4 pb-8 pt-8 text-center font-display text-[clamp(3.5rem,18vw,15rem)] font-black uppercase leading-[0.85] tracking-tight sm:px-6 lg:px-8">
          {brand.name}
        </p>
      </div>

      <div className="relative border-t border-graphite bg-charcoal/60">
        <span
          aria-hidden="true"
          className="absolute -top-[3px] left-1/2 h-[5px] w-[5px] -translate-x-1/2 rotate-45 bg-gold/70"
        />
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-3 px-4 pb-5 pt-7 text-center text-xs sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:text-left lg:px-8">
          <p className="font-medium tracking-wide text-silver">
            © {year} {brand.name}{" "}
            <span aria-hidden="true" className="text-gold">
              ·
            </span>{" "}
            {brand.tagline}
          </p>
          <BackToTop label={ui.backToTop} />
        </div>
      </div>
    </footer>
  );
}

