/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
  },
  // Cloudflare Pages 配置
  serverExternalPackages: ['@libsql/client', 'drizzle-orm'],
};

export default nextConfig;
