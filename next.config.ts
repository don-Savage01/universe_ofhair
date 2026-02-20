/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "mlcmmbvifmgmrmfptbul.supabase.co",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "via.placeholder.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "**.supabase.co",
        pathname: "/**",
      },
    ],
    // ✅ ADD THIS: Fixes the quality warning
    qualities: [75, 85],

    // Performance optimizations
    deviceSizes: [375, 640, 750, 828, 1080, 1200, 1920],
    imageSizes: [96, 128, 256, 384, 512],
    formats: ["image/webp", "image/avif"],
    minimumCacheTTL: 60 * 60 * 24, // 24 hours
  },

  // Performance optimizations
  reactStrictMode: true,
  // swcMinify: true,

  // Enable compression
  compress: true,

  // Remove console logs in production
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
};

module.exports = nextConfig;
