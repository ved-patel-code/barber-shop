import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ["via.placeholder.com"], // 👈 allow external placeholder images
  },
};

export default nextConfig;
