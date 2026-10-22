import PageHeader from "../../../components/layout/PageHeader";
import StoreTile from "../../../components/stores/StoreTile";
import { getBrand, getPage, getStores, getUi } from "../../../lib/data";
import { buildMetadata } from "../../../lib/seo";

export async function generateMetadata() {
  const page = await getPage("stores");
  return buildMetadata({
    title: page.title,
    description: page.intro,
    path: "/stores",
  });
}

/**
 * Stores index: the showcase header carries the showcase chrome and a
 * live stat strip (branches / city / state), then every branch gets a
 * full-height photographic tile with its hours, a WhatsApp shortcut
 * and the link into its detail page. All values derive from data.
 */
export default async function StoresPage() {
  const [page, stores, brand, ui] = await Promise.all([
    getPage("stores"),
    getStores(),
    getBrand(),
    getUi(),
  ]);

  const countLabel = stores.length === 1 ? ui.storeSingular : ui.storePlural;

  return (
    <>
      <PageHeader
        title={page.title}
        intro={page.intro}
        eyebrow={`${stores.length} ${countLabel}`}
        decor
        stats={[
          { value: stores.length, label: countLabel },
          { value: brand.city, label: ui.cityLabel },
          { value: brand.region, label: ui.stateLabel },
        ]}
      />
      <main className="w-full mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-3 border-b border-graphite pb-4">
          <p className="flex items-center gap-2.5 text-[10px] font-bold uppercase tracking-[0.22em] text-gold">
            <span
              aria-hidden="true"
              className="h-1.5 w-1.5 rotate-45 bg-gold"
            />
            {ui.visitLabel}
          </p>
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted">
            <span className="tnum text-gold">
              {String(stores.length).padStart(2, "0")}
            </span>
            <span aria-hidden="true"> · </span>
            {brand.city}
          </p>
        </div>
        <section aria-label={ui.visitLabel}>
          <div className="grid gap-5 sm:gap-6 lg:grid-cols-3">
            {stores.map((store, i) => (
              <StoreTile
                key={store.slug}
                store={store}
                index={i + 1}
                ui={ui}
                delay={i * 70}
              />
            ))}
          </div>
        </section>
      </main>
    </>
  );
}
