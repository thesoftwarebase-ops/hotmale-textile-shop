import { Fragment } from "react";
import Hero from "../../components/home/Hero";
import HeroStatement from "../../components/home/HeroStatement";
import CategoryIndex from "../../components/home/CategoryIndex";
import FeaturedCollections from "../../components/home/FeaturedCollections";
import SectionDivider from "../../components/home/SectionDivider";
import OffersSection from "../../components/home/OffersSection";
import FaqSection from "../../components/home/FaqSection";
import StoreCta from "../../components/home/StoreCta";
import {
  getBrand,
  getHomepage,
  getHomeSections,
  getUi,
  getCategories,
  getFeaturedCategories,
  getCollections,
  getFeaturedCollections,
  getProducts,
  getStores,
} from "../../lib/data";
import { buildMetadata } from "../../lib/seo";

export async function generateMetadata() {
  return buildMetadata({ path: "/" });
}

/**
 * Home (2b-1): campaign-poster hero carousel, then the section run in
 * the order and with the titles defined in data — offers, categories
 * index, featured collections, store CTA. HOTMALE manufactures its own
 * clothes, so there is no brands concept anywhere. The homepage shows
 * only confirmed data levels (offers and products are clearly labelled
 * placeholders); every string comes from lib/data.js.
 */
export default async function Home() {
  const [
    homepage,
    sections,
    ui,
    brand,
    categories,
    allCategories,
    collections,
    featuredCollections,
    products,
    stores,
  ] = await Promise.all([
    getHomepage(),
    getHomeSections(),
    getUi(),
    getBrand(),
    getFeaturedCategories(),
    getCategories(),
    getCollections(),
    getFeaturedCollections(),
    getProducts(),
    getStores(),
  ]);

  // Published collections per category — drives the category counts.
  const collectionCounts = collections.reduce((acc, collection) => {
    acc[collection.category] = (acc[collection.category] ?? 0) + 1;
    return acc;
  }, {});

  // Published styles per collection — drives the collection counts.
  const styleCounts = products.reduce((acc, product) => {
    acc[product.collection] = (acc[product.collection] ?? 0) + 1;
    return acc;
  }, {});

  const byId = Object.fromEntries(sections.map((section) => [section.id, section]));

  const renderers = {
    offers: () => (
      <OffersSection
        key="offers"
        title={byId.offers.title}
        offers={homepage.offers}
        stores={stores}
        availableAtLabel={ui.availableAtLabel}
        allStoresLabel={ui.allStoresLabel}
      />
    ),
    categories: () => (
      <CategoryIndex
        key="categories"
        categories={categories}
        counts={collectionCounts}
        countLabels={{
          one: ui.collectionSingular,
          many: ui.collectionPlural,
        }}
        title={byId.categories.title}
        linkLabel={byId.categories.linkLabel}
        linkHref={byId.categories.linkHref || "/collections"}
        headingId="home-categories-heading"
        brandName={brand.name}
      />
    ),
    collections: () => (
      <FeaturedCollections
        key="collections"
        collections={featuredCollections}
        categories={allCategories}
        styleCounts={styleCounts}
        title={byId.collections.title}
        linkLabel={byId.collections.linkLabel}
        linkHref={byId.collections.linkHref || "/collections"}
        viewLabel={ui.viewCollection}
        countLabels={{
          one: ui.collectionSingular,
          many: ui.collectionPlural,
        }}
        headingId="home-collections-heading"
      />
    ),
    faq: () => (
      <FaqSection key="faq" title={byId.faq.title} faqs={homepage.faq} />
    ),
    stores: () => (
      <StoreCta
        key="stores"
        title={byId.stores.title}
        stores={stores}
        storesCta={homepage.storesCta}
        ui={ui}
      />
    ),
  };

  return (
    <main id="main" className="flex-1">
      <Hero hero={homepage.hero} ui={ui} />
      <HeroStatement hero={homepage.hero} brand={brand} />
      {sections
        .filter((section) => section.enabled)
        .map((section, index) => (
          <Fragment key={section.id}>
            {index > 0 && <SectionDivider />}
            {renderers[section.id]?.() ?? null}
          </Fragment>
        ))}
    </main>
  );
}
