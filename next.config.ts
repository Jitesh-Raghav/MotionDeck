import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  // Lets phones on the home network open the dev server by its LAN address
  // (e.g. http://192.168.1.8:3100). Dev only; production is unaffected.
  allowedDevOrigins: ["192.168.*.*"],
  experimental: {
    // One small Tailwind stylesheet: inline it so the first paint doesn't
    // wait on a render-blocking request.
    inlineCss: true,
  },
};

export default nextConfig;
