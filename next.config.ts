import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  basePath: '/tempmail-app',
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
