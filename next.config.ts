import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  env: {
    NEXT_PUBLIC_API_URL: "https://api.yasarkirtasiye.com/api",
  },
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
