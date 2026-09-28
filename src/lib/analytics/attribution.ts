/**
 * Where a visit came from. Read once per page load and kept in module memory
 * only: no cookies, no localStorage, so it never outlives the tab's page load.
 */
export type Attribution = {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  referrer?: string;
  landing_path?: string;
};

export const ATTRIBUTION_MAX_LENGTH = 200;

let attribution: Attribution | null = null;

function clean(value: string | null | undefined) {
  const text = (value ?? "").replace(/[\u0000-\u001f\u007f]/g, "").trim();
  return text ? text.slice(0, ATTRIBUTION_MAX_LENGTH) : undefined;
}

/** A referrer without its query string or hash, which can carry personal data. */
function referrerOrigin(value: string) {
  try {
    const url = new URL(value);
    return `${url.origin}${url.pathname}`;
  } catch {
    return undefined;
  }
}

/** Reads the URL and referrer on first call; later calls return the same snapshot. */
export function getAttribution(): Attribution {
  if (attribution) return attribution;
  if (typeof window === "undefined") return {};

  const params = new URLSearchParams(window.location.search);
  attribution = {};
  const fields = {
    utm_source: clean(params.get("utm_source")),
    utm_medium: clean(params.get("utm_medium")),
    utm_campaign: clean(params.get("utm_campaign")),
    referrer: clean(referrerOrigin(document.referrer)),
    landing_path: clean(window.location.pathname),
  };
  for (const [key, value] of Object.entries(fields)) {
    if (value) attribution[key as keyof Attribution] = value;
  }
  return attribution;
}
