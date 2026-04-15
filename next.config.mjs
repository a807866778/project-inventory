/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: [
    "@libsql/client",
    "drizzle-orm",
    "bcryptjs",
    "jose",
    "uuid",
  ],
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
