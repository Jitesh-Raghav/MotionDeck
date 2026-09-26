import "server-only";

import { supabaseAdmin } from "./supabase";

/** Below this, the count isn't shown at all. */
const MIN_PUBLIC_COUNT = 50;

/**
 * The real number of waitlist signups, or null when there's no database or
 * the list is still small. Never an estimate.
 */
export async function getPublicWaitlistCount(): Promise<number | null> {
  const supabase = supabaseAdmin();
  if (!supabase) return null;
  try {
    const { count, error } = await supabase
      .from("waitlist")
      .select("*", { count: "exact", head: true });
    if (error || count === null) return null;
    return count > MIN_PUBLIC_COUNT ? count : null;
  } catch {
    return null;
  }
}
