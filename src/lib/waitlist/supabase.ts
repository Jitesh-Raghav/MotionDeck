import "server-only";

import { createClient } from "@supabase/supabase-js";

/** Server-side Supabase client, or null when the keys aren't configured. */
export function supabaseAdmin() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  // The client wants the bare project URL. Tolerate a pasted API URL such as
  // "https://<ref>.supabase.co/rest/v1/" by keeping only the origin.
  return createClient(new URL(url).origin, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
