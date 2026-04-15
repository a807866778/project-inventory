/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: [
    "@libsql/client",
    "drizzle-orm",
    "bcryptjs",
    "jose",
    "uuid",
    "date-fns",
  ],
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
