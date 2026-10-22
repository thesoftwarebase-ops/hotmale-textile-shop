import Footer from "../../components/layout/Footer";
import Marquee from "../../components/layout/Marquee";
import Navbar from "../../components/layout/Navbar";
import ScrollToTop from "../../components/layout/ScrollToTop";
import SiteCta from "../../components/layout/SiteCta";
import TransitionMain from "../../components/transitions/TransitionMain";
import TransitionProvider from "../../components/transitions/TransitionProvider";
import {
  getBrand,
  getCta,
  getFooter,
  getNavigation,
  getSeo,
  getUi,
} from "../../lib/data";
import { serializeJsonLd, siteStructuredData } from "../../lib/seo";

export const instant = false;

export default async function SiteLayout({ children }) {
  const [navigation, brand, ui, footer, cta, seo] = await Promise.all([
    getNavigation(),
    getBrand(),
    getUi(),
    getFooter(),
    getCta(),
    getSeo(),
  ]);
  const structuredData = siteStructuredData({
    brand,
    seo,
    social: footer.social,
  });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: serializeJsonLd(structuredData),
        }}
      />
      <TransitionProvider brand={brand} ui={ui}>
        <Navbar items={navigation} brand={brand} ui={ui} social={footer.social} />
        <ScrollToTop />
        <Marquee />
        <TransitionMain>{children}</TransitionMain>
        <SiteCta cta={cta} />
        <Footer />
      </TransitionProvider>
    </>
  );
}
