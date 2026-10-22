import { Suspense } from "react";
import { notFound } from "next/navigation";
import CollectionIntro from "../../../../components/catalog/CollectionIntro";
import ProductCarousel from "../../../../components/catalog/ProductCarousel";
import {
  getCategories,
  getCollectionBySlug,
  getCollections,
  getPage,
  getProducts,
  getUi,
} from "../../../../lib/data";
import { buildMetadata } from "../../../../lib/seo";

export async function generateStaticParams() {
  const collections = await getCollections();
  return collections.map((collection) => ({ slug: collection.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const [collection, ui] = await Promise.all([
    getCollectionBySlug(slug),
    getUi(),
  ]);
  return buildMetadata({
    title: collection ? collection.name : ui.notFoundTitle,
    description: collection?.description,
    path: collection ? `/collections/${collection.slug}` : undefined,
    noindex: !collection,
  });
}

/**
 * Collection detail. A slug resolves as a published collection and
 * nothing else — category pages were retired in favour of the
 * /collections index, so unknown slugs 404 before the shell streams.
 * The intro pairs the collection's own image with its live details;
 * the product grid streams inside Suspense so resolving it never
 * blocks the navigation.
 */
export default function CollectionPage({ params }) {
  return (
    <Suspense fallback={<div className="h-40" />}>
      <CollectionContent params={params} />
    </Suspense>
  );
}

/**
 * The slug is URL data, so it is read inside the Suspense boundary —
 * the shell streams first and the collection resolves behind it.
 */
async function CollectionContent({ params }) {
  const { slug } = await params;
  const [collection, categories, ui] = await Promise.all([
    getCollectionBySlug(slug),
    getCategories(),
    getUi(),
  ]);

  if (!collection) notFound();

  const category = categories.find(
    (entry) => entry.slug === collection.category,
  );

  return (
    <>
      <CollectionIntro
        collection={collection}
        category={category}
        label={ui.collectionLabel}
        action={ui.findStore}
      />
      <Suspense fallback={<div className="h-40" />}>
        <CollectionProducts collection={collection} ui={ui} />
      </Suspense>
    </>
  );
}

async function CollectionProducts({ collection, ui }) {
  const [products, page] = await Promise.all([
    getProducts({ collection: collection.slug }),
    getPage("collections"),
  ]);
  const styleLabel =
    products.length === 1 ? ui.styleSingular : ui.stylePlural;

  return (
    <main className="w-full mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
      {products.length === 0 ? (
        <p className="text-sm text-muted">{page.emptyState}</p>
      ) : (
        <>
          <div className="mb-8 flex items-center justify-between gap-4 border-b border-graphite pb-5">
            <p className="flex items-center gap-3 text-[11px] font-bold uppercase tracking-[0.24em] text-gold">
              <span
                aria-hidden="true"
                className="h-1.5 w-1.5 rotate-45 bg-gold"
              />
              {ui.collectionLabel}
            </p>
            <p className="flex items-baseline gap-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-silver">
              <span className="tnum font-display text-lg font-black leading-none text-gold">
                {products.length}
              </span>
              {styleLabel}
            </p>
          </div>
          <ProductCarousel
            products={products}
            photoNote={ui.photoPending}
            href="/stores"
            label={ui.collectionLabel}
            roleDescription={ui.carouselRoleDescription}
            prevLabel={ui.carouselPrev}
            nextLabel={ui.carouselNext}
          />
        </>
      )}
    </main>
  );
}
