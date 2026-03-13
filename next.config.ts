import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "5012",
        pathname: "/uploads/**",
      },
      {
        protocol: "https",
        hostname: "yasarkirtasiye.com",
        pathname: "/uploads/**",
      },
    ],
    // Yerel public/uploads görselleri için unoptimized false tutulur
    // Next.js kendi public klasöründen serve edilen görselleri optimize eder
  },
};

export default nextConfig;
