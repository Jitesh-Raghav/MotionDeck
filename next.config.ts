import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  experimental: {
    // One small Tailwind stylesheet: inline it so the first paint doesn't
    // wait on a render-blocking request.
    inlineCss: true,
  },
};

export default nextConfig;
