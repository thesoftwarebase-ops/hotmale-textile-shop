import localFont from "next/font/local";
import { getSeo, getTheme } from "../lib/data";
import { buildMetadata } from "../lib/seo";
import "./globals.css";

export const instant = false;

/**
 * Fonts are self-hosted (latin variable files in /fonts) instead of
 * next/font/google: the Google loader needs network access to
 * fonts.googleapis.com at build time and fails the build in locked-down
 * or offline environments. The local files are the same variable fonts
 * Google serves, so rendering is unchanged.
 */
const display = localFont({
  src: "../fonts/big-shoulders-latin-variable.woff2",
  variable: "--font-display",
  weight: "100 900",
  display: "swap",
  // Next ships no automatic fallback metrics for Big Shoulders
  // (hence the build warning) — declare the fallback explicitly.
  adjustFontFallback: false,
  fallback: ["Arial Narrow", "Arial", "sans-serif"],
});

const body = localFont({
  src: "../fonts/inter-latin-variable.woff2",
  variable: "--font-body",
  weight: "100 900",
  display: "swap",
});

/** Site-wide metadata from site.seo (single source of truth). */
export async function generateMetadata() {
  const base = await buildMetadata({ applyTitleTemplate: true });
  return {
    ...base,
    icons: {
      icon: [
        { url: "/favicon/favicon-32x32.png", sizes: "32x32", type: "image/png" },
        { url: "/favicon/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      ],
      apple: [
        { url: "/favicon/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
      ],
    },
    manifest: "/favicon/site.webmanifest",
  };
}

export async function generateViewport() {
  const theme = await getTheme();
  return { themeColor: theme.colors.ink };
}

export default async function RootLayout({ children }) {
  const seo = await getSeo();

  return (
    <html lang={seo.locale} className={`${display.variable} ${body.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
