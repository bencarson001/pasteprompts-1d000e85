import { createClient } from "@supabase/supabase-js";

// Import-safe: read env lazily inside handlers, never at module top level.
export function marketplaceClient() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_PUBLISHABLE_KEY ?? process.env.SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error("Supabase env not configured");
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

// Shared card projection (never includes the paid prompt body).
export const PROMPT_CARD_SELECT =
  "slug, title, description, model, price_pence, is_free, rating_avg, rating_count, sales_count, copies_count, featured, category:categories(slug, name), creator:profiles!prompts_creator_id_fkey(handle, display_name)";

const SITE_URL = "https://www.pasteprompts.co.uk";

export function promptUrl(slug: string) {
  return `${SITE_URL}/prompt/${slug}`;
}

/**
 * Strip characters PostgREST treats as filter syntax so user search text can
 * never inject extra predicates into an `.or()` filter string.
 */
export function sanitizeSearchTerm(raw: string): string {
  return raw
    .replace(/[,.()%*\\"'`:]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 100);
}
