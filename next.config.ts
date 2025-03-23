import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    domains: ["images.ctfassets.net", "images.microcms-assets.io"],
  },
};

export default nextConfig;
