import PageHeader from "../../../components/layout/PageHeader";
import CollectionExplorer from "../../../components/catalog/CollectionExplorer";
import {
  getCategories,
  getCollections,
  getPage,
  getProducts,
  getStores,
  getUi,
} from "../../../lib/data";
import { buildMetadata } from "../../../lib/seo";

export async function generateMetadata() {
  const page = await getPage("collections");
  return buildMetadata({
    title: page.title,
    description: page.intro,
    path: "/collections",
  });
}

/**
 * Collections index: every published collection, filterable by
 * category. The header carries the showcase treatment with a stat
 * strip (collections / categories / stores), and every tile shows its
 * live product count — all numbers and labels derive from data.
 */
export default async function CollectionsPage() {
  const [page, collections, categories, products, stores, ui] =
    await Promise.all([
      getPage("collections"),
      getCollections(),
      getCategories(),
      getProducts(),
      getStores(),
      getUi(),
    ]);

  const countLabel =
    collections.length === 1 ? ui.collectionSingular : ui.collectionPlural;

  const styleCounts = {};
  for (const product of products) {
    styleCounts[product.collection] = (styleCounts[product.collection] ?? 0) + 1;
  }

  const categoryLabel =
    categories.length === 1 ? ui.categorySingular : ui.categoryPlural;
  const storeLabel = stores.length === 1 ? ui.storeSingular : ui.storePlural;

  return (
    <>
      <PageHeader
        title={page.title}
        intro={page.intro}
        eyebrow={`${collections.length} ${countLabel}`}
        decor
        stats={[
          { value: collections.length, label: countLabel },
          { value: categories.length, label: categoryLabel },
          { value: stores.length, label: storeLabel },
        ]}
      />
      <main className="w-full mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <CollectionExplorer
          collections={collections}
          categories={categories}
          allLabel={ui.all}
          styleCounts={styleCounts}
          countLabels={{
            one: ui.collectionSingular,
            many: ui.collectionPlural,
          }}
          styleCountLabels={{
            one: ui.styleSingular,
            many: ui.stylePlural,
          }}
        />
      </main>
    </>
  );
}
