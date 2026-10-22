import Link from "next/link";
import { getAdminUi } from "../../../../../lib/data";
import { homepageSectionList } from "../../../../../lib/cms/homepage-sections";

export const instant = false;

export default async function AdminHomepagePage() {
  const admin = await getAdminUi();
  const copy = admin.cms;

  return (
    <div className="flex flex-col gap-7">
      <header className="flex flex-col gap-5 border-b border-white/10 pb-7 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="flex items-center gap-3 text-[9px] font-bold uppercase tracking-[0.3em] text-gold">
            <span aria-hidden="true" className="h-px w-7 bg-gold/60" />
            {copy.homepage.eyebrow}
          </p>
          <h1 className="mt-4 font-display text-4xl font-black uppercase leading-[0.98] tracking-tight text-cream sm:text-5xl">
            {copy.homepage.title}
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-silver">
            {copy.homepage.intro}
          </p>
        </div>
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-[44px] shrink-0 items-center gap-2 self-start rounded-sm border border-white/10 px-4 text-[9px] font-bold uppercase tracking-[0.16em] text-silver transition-colors hover:border-gold/50 hover:text-gold sm:self-auto"
        >
          {copy.homepage.viewPage}
          <span aria-hidden="true">↗</span>
        </a>
      </header>

      <div className="grid gap-4 lg:grid-cols-2">
        {homepageSectionList.map((section, index) => (
          <Link
            key={section.key}
            href={`/admin/content/homepage/${section.key}`}
            className="group relative overflow-hidden rounded-md border border-white/10 bg-[#0b0b0b] p-5 transition-colors hover:border-gold/40 sm:p-6"
          >
            <span
              aria-hidden="true"
              className="pointer-events-none absolute -right-2 -top-4 font-display text-8xl font-black leading-none text-white/[0.03] transition-colors group-hover:text-gold/[0.07]"
            >
              {String(index + 1).padStart(2, "0")}
            </span>
            <span
              aria-hidden="true"
              className="block h-2 w-2 rotate-45 border border-gold/50 transition-colors group-hover:bg-gold"
            />
            <h2 className="mt-5 font-display text-2xl font-black uppercase leading-none tracking-tight text-cream transition-colors group-hover:text-gold">
              {section.title}
            </h2>
            <p className="mt-3 max-w-sm text-sm leading-6 text-muted">
              {section.description}
            </p>
            <span className="mt-5 inline-flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.18em] text-silver transition-colors group-hover:text-gold">
              {copy.homepage.edit}
              <span
                aria-hidden="true"
                className="transition-transform group-hover:translate-x-1"
              >
                →
              </span>
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
