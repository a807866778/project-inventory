/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "5mb",
    },
    // Tell Next.js not to bundle these packages
    // Cloudflare Pages provides them at runtime
    serverComponentsExternalPackages: [
      "drizzle-orm",
      "@libsql/client",
      "bcryptjs",
      "uuid",
    ],
  },
  images: {
    unoptimized: true,
  },
  // Reduce webpack bundle size
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Don't bundle these in server build
      config.externals = config.externals || [];
      config.externals.push(
        "drizzle-orm",
        "@libsql/client",
        "bcryptjs",
        "uuid"
      );
    }
    return config;
  },
};

export default nextConfig;
