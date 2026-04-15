/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "5mb",
    },
  },
  // Skip build-time page generation for pages that use database
  pagesDir: false,
};

export default nextConfig;
