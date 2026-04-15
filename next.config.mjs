/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "5mb",
    },
  },
  // Exclude build cache from output
  outputFileTracingExcludes: [
    "**/.cache/**",
    "**/node_modules/.cache/**",
  ],
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
