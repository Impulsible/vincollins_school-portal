// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,

  images: {
    // ✅ Allow high-quality values (required in Next.js 15+ when using quality > 75)
    qualities: [75, 90, 95, 100],

    // ✅ Modern formats — sharper images at smaller filesize
    formats: ['image/avif', 'image/webp'],

    // ✅ Better device size coverage — prevents Next from picking a too-small variant
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384, 640, 750],

    // ✅ Cache optimized images for 30 days
    minimumCacheTTL: 60 * 60 * 24 * 30,

    // Keep your remote pattern for external images
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],

    // Allow local images to be optimized (default: false = optimization ON)
    unoptimized: false,
  },
};

export default nextConfig;