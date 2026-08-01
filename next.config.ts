import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: process.cwd(),
  },
  async rewrites() {
    return [
      { source: "/free-access/links", destination: "/links" },
      { source: "/free-access", destination: "/site" },
    ];
  },
};

export default nextConfig;
