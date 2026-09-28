import type { NextConfig } from "next";

// PostHog is proxied through /ingest so ad blockers don't drop events. The
// static assets live on a separate "-assets" host, e.g. us-assets.i.posthog.com.
const posthogHost = (process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com").replace(/\/+$/, "");
const posthogAssetsHost = posthogHost.replace(".i.posthog.com", "-assets.i.posthog.com");

const nextConfig: NextConfig = {
  // PostHog endpoints end in a slash (/ingest/e/); don't redirect them.
  skipTrailingSlashRedirect: true,
  async rewrites() {
    return [
      { source: "/ingest/static/:path*", destination: `${posthogAssetsHost}/static/:path*` },
      { source: "/ingest/array/:path*", destination: `${posthogAssetsHost}/array/:path*` },
      { source: "/ingest/:path*", destination: `${posthogHost}/:path*` },
    ];
  },
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
