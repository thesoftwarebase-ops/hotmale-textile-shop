import Link from "next/link";
import BrandMark from "../../components/brand/BrandMark";
import LoginForm from "../../components/admin/LoginForm";
import { getAdminUi, getBrand } from "../../lib/data";

export const instant = false;

export async function generateMetadata() {
  const admin = await getAdminUi();
  return { title: admin.login.title };
}

export default async function AdminLoginPage() {
  const [admin, brand] = await Promise.all([getAdminUi(), getBrand()]);
  const copy = admin.login;

  return (
    <main className="relative flex min-h-svh flex-1 items-center justify-center overflow-hidden bg-ink px-4 py-10 text-cream">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.55]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(135deg, rgba(230,196,64,0.055) 0 1px, transparent 1px 18px)",
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-40 top-1/4 h-96 w-96 rounded-full bg-gold/10 blur-3xl"
      />

      <div className="relative z-10 grid w-full max-w-5xl overflow-hidden rounded-md border border-graphite bg-charcoal/60 shadow-[0_40px_120px_-40px_rgba(0,0,0,0.9)] backdrop-blur-sm lg:grid-cols-[1.05fr_0.95fr]">
        <aside className="relative flex flex-col justify-between gap-10 border-b border-graphite bg-ink/70 p-8 sm:p-10 lg:border-b-0 lg:border-r">
          <div className="flex items-center gap-4">
            <BrandMark
              height={64}
              name={brand.name}
              tagline={brand.tagline}
              logo={brand.logo}
            />
            <span className="text-[10px] font-semibold uppercase tracking-[0.26em] text-muted">
              {admin.brandLabel}
            </span>
          </div>

          <div>
            <p className="flex items-center gap-3 text-[11px] font-bold uppercase tracking-[0.24em] text-gold">
              <span aria-hidden="true" className="h-1.5 w-1.5 rotate-45 bg-gold" />
              {brand.city} · {brand.region}
            </p>
            <p className="mt-4 font-display text-5xl font-black uppercase leading-[0.92] tracking-tight text-cream sm:text-6xl">
              {brand.name}
            </p>
            <p className="mt-3 text-lg font-medium uppercase tracking-[0.3em] text-gold">
              {brand.tagline}
            </p>
          </div>

          <p className="max-w-xs text-sm leading-relaxed text-muted">
            {copy.intro}
          </p>
        </aside>

        <section className="flex flex-col justify-center p-8 sm:p-10">
          <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-gold">
            {copy.eyebrow}
          </p>
          <h1 className="mt-3 font-display text-4xl font-black uppercase leading-none tracking-tight text-cream">
            {copy.title}
          </h1>

          <LoginForm copy={copy} brand={brand} tagline={admin.brandLabel} />

          <Link
            href="/"
            className="mt-6 inline-flex min-h-[44px] items-center text-xs font-semibold uppercase tracking-[0.18em] text-muted transition-colors hover:text-gold"
          >
            ← {copy.backToSite}
          </Link>
        </section>
      </div>
    </main>
  );
}
