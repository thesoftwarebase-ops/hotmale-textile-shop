import AppLink from "../../components/transitions/AppLink";
import { getUi } from "../../lib/data";
import { buildMetadata } from "../../lib/seo";

export async function generateMetadata() {
  const ui = await getUi();
  return buildMetadata({ title: ui.notFoundTitle, noindex: true });
}

/**
 * Custom 404: hollow-gold 404 numeral, data-driven copy, one way home.
 */
export default async function NotFound() {
  const ui = await getUi();

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 px-4 py-24 text-center sm:py-32">
      <p
        aria-hidden="true"
        className="text-outline-gold font-display text-[clamp(5rem,20vw,12rem)] font-black leading-none"
      >
        404
      </p>
      <h1 className="font-display text-2xl font-bold uppercase tracking-tight text-cream sm:text-3xl">
        {ui.notFoundTitle}
      </h1>
      <p className="max-w-md text-base leading-relaxed text-silver">{ui.notFoundBody}</p>
      <AppLink
        href="/"
        className="inline-flex min-h-[52px] items-center justify-center rounded-sm bg-gold px-8 text-xs font-bold uppercase tracking-[0.12em] text-ink transition-colors hover:bg-gold-highlight"
      >
        {ui.backHome}
      </AppLink>
    </main>
  );
}