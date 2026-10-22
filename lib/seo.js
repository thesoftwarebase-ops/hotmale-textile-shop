import { getBrand, getSeo } from "./data";

export function siteOrigin(seo) {
  const raw =
    typeof seo?.siteUrl === "string" ? seo.siteUrl.trim().replace(/\/+$/, "") : "";
  if (!raw) return "";
  try {
    const url = new URL(raw);
    if (url.protocol !== "http:" && url.protocol !== "https:") return "";
    return `${url.origin}${url.pathname.replace(/\/+$/, "")}`;
  } catch {
    return "";
  }
}

export function absoluteUrl(origin, path = "/") {
  if (!origin) return "";
  if (/^https?:\/\//i.test(path)) return path;
  return `${origin}${path.startsWith("/") ? path : `/${path}`}`;
}

function openGraphLocale(locale) {
  return String(locale || "en-IN").replace("-", "_");
}

export async function buildMetadata({
  title,
  description,
  path,
  image,
  imageAlt,
  type = "website",
  noindex = false,
  applyTitleTemplate = false,
} = {}) {
  const [seo, brand] = await Promise.all([getSeo(), getBrand()]);
  const origin = siteOrigin(seo);
  const resolvedTitle = title || seo.defaultTitle || brand.name;
  const resolvedDescription = description || seo.defaultDescription;
  const resolvedImage = image || seo.defaultImage;
  const resolvedImageAlt =
    imageAlt || seo.defaultImageAlt || resolvedTitle;
  const hasImage = Boolean(origin && resolvedImage);
  const canonical = origin && path ? absoluteUrl(origin, path) : "";

  return {
    ...(origin ? { metadataBase: new URL(origin) } : {}),
    title: applyTitleTemplate
      ? { default: resolvedTitle, template: seo.titleTemplate }
      : resolvedTitle,
    description: resolvedDescription,
    ...(canonical ? { alternates: { canonical } } : {}),
    robots: noindex
      ? { index: false, follow: false }
      : { index: true, follow: true },
    openGraph: {
      type,
      siteName: seo.siteName || brand.name,
      title: resolvedTitle,
      description: resolvedDescription,
      locale: openGraphLocale(seo.locale),
      ...(canonical ? { url: canonical } : {}),
      ...(hasImage
        ? {
            images: [
              {
                url: resolvedImage,
                width: 1200,
                height: 630,
                alt: resolvedImageAlt,
              },
            ],
          }
        : {}),
    },
    twitter: {
      card: hasImage ? "summary_large_image" : "summary",
      title: resolvedTitle,
      description: resolvedDescription,
      ...(seo.twitterHandle
        ? { site: seo.twitterHandle, creator: seo.twitterHandle }
        : {}),
      ...(hasImage ? { images: [resolvedImage] } : {}),
    },
  };
}

export function siteStructuredData({ brand, seo, social }) {
  const origin = siteOrigin(seo);
  const logo = origin ? absoluteUrl(origin, brand.logo) : "";
  const profiles = [social?.instagramUrl].filter(Boolean);

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        name: brand.name,
        description: seo.defaultDescription,
        ...(origin ? { url: origin } : {}),
        ...(logo ? { logo } : {}),
        ...(profiles.length ? { sameAs: profiles } : {}),
        address: {
          "@type": "PostalAddress",
          addressLocality: brand.city,
          addressRegion: brand.region,
          addressCountry: brand.countryCode,
        },
      },
      {
        "@type": "WebSite",
        name: seo.siteName || brand.name,
        ...(origin ? { url: origin } : {}),
        inLanguage: seo.locale,
        publisher: { "@type": "Organization", name: brand.name },
      },
    ],
  };
}

export function storeStructuredData({ store, brand, seo, social }) {
  const origin = siteOrigin(seo);
  const profiles = [social?.instagramUrl].filter(Boolean);
  const phone = store.phone || store.landline;

  return {
    "@context": "https://schema.org",
    "@type": "ClothingStore",
    name: `${brand.name} ${store.name}`,
    description: store.description || store.address,
    ...(phone ? { telephone: phone } : {}),
    address: {
      "@type": "PostalAddress",
      streetAddress: store.address,
      addressLocality: brand.city,
      addressRegion: brand.region,
      addressCountry: brand.countryCode,
    },
    ...(origin
      ? {
          url: absoluteUrl(origin, `/stores/${store.slug}`),
          image: absoluteUrl(origin, store.photo),
        }
      : {}),
    ...(profiles.length ? { sameAs: profiles } : {}),
  };
}

export function serializeJsonLd(value) {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}
