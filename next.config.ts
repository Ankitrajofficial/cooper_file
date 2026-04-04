import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typedRoutes: true,
  outputFileTracingRoot: process.cwd(),
  serverExternalPackages: ["jose"],
  experimental: {
    devtoolSegmentExplorer: false,
  },
};

export default nextConfig;
