function resolveSiteUrl() {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL;
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3000";
}

export const site = {
  name: "Motiondeck",
  title: "Motiondeck — Presentations that move",
  description:
    "Type a topic. Get a beautifully animated deck in under a minute — ready to present, record, or export as video.",
  tagline: "Animated presentations from a single prompt.",
  url: resolveSiteUrl(),
  // TODO: replace with a real inbox before launch.
  contactEmail: "hello@motiondeck.app",
} as const;
