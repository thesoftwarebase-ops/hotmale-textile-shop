/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  images: {
    remotePatterns: [{ protocol: "https", hostname: "ik.imagekit.io" }],
    // The site is WebP-only: let the optimizer hand modern formats to
    // browsers instead of JPEG, whatever the source file happens to be.
    formats: ["image/avif", "image/webp"],
    qualities: [50, 75, 90],
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
