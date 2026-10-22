import { getSeo } from "../lib/data";
import { siteOrigin } from "../lib/seo";

export default async function robots() {
  const seo = await getSeo();
  const origin = siteOrigin(seo);

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/admin"],
      },
    ],
    ...(origin ? { sitemap: `${origin}/sitemap.xml` } : {}),
  };
}
