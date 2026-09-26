import "server-only";

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { supabaseAdmin } from "./supabase";
import type { WaitlistSource } from "./types";

export type AddResult = "joined" | "already_joined";

export class StoreUnavailableError extends Error {}

const UNIQUE_VIOLATION = "23505";

async function addToSupabase(
  supabase: NonNullable<ReturnType<typeof supabaseAdmin>>,
  email: string,
  source: WaitlistSource,
): Promise<AddResult> {
  const { error } = await supabase.from("waitlist").insert({ email, source });
  if (!error) return "joined";
  if (error.code === UNIQUE_VIOLATION) return "already_joined";
  throw new Error(`Supabase insert failed: ${error.code} ${error.message}`);
}

// Local development only: lets the form be tested before Supabase is set up.
const DEV_STORE = path.join(process.cwd(), ".data", "waitlist.dev.json");

type DevEntry = { email: string; source: WaitlistSource; created_at: string };

async function addToDevStore(email: string, source: WaitlistSource): Promise<AddResult> {
  let entries: DevEntry[] = [];
  try {
    entries = JSON.parse(await readFile(DEV_STORE, "utf8")) as DevEntry[];
  } catch {
    // First signup: the file doesn't exist yet.
  }
  if (entries.some((entry) => entry.email === email)) return "already_joined";

  entries.push({ email, source, created_at: new Date().toISOString() });
  await mkdir(path.dirname(DEV_STORE), { recursive: true });
  await writeFile(DEV_STORE, JSON.stringify(entries, null, 2));
  console.info(`[waitlist] dev store: added ${email} (${source})`);
  return "joined";
}

export async function addToWaitlist(email: string, source: WaitlistSource): Promise<AddResult> {
  const supabase = supabaseAdmin();
  if (supabase) return addToSupabase(supabase, email, source);
  if (process.env.NODE_ENV === "development") return addToDevStore(email, source);
  throw new StoreUnavailableError(
    "SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in production.",
  );
}
