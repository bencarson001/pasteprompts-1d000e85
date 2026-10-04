// Server-visible metadata for prompt detail pages: fetch the real title and
// description (public, approved prompts only) so crawlers don't see a slug-derived title.
import { dynamicHead, humanize } from "@/lib/route-head";

export interface PromptHeadData { title: string; description: string }

export async function loadPromptHead(slug: string): Promise<PromptHeadData | null> {
  try {
    const url = import.meta.env.VITE_SUPABASE_URL;
    const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
    if (!url || !key) return null;
    const res = await fetch(
      `${url}/rest/v1/prompts?select=title,description&status=eq.approved&slug=eq.${encodeURIComponent(slug)}&limit=1`,
      { headers: { apikey: key, Authorization: `Bearer ${key}` } },
    );
    if (!res.ok) return null;
    const rows = (await res.json()) as PromptHeadData[];
    return rows[0] ?? null;
  } catch {
    return null;
  }
}

export function promptHead(slug: string, data: PromptHeadData | null | undefined) {
  const title = data?.title ? `${data.title} – AI Prompt` : humanize(slug);
  const raw = data?.description?.trim() ||
    "View this AI prompt on Paste Prompts, including what it does, which AI tool it's written for and how to use it.";
  const description = raw.length <= 160 ? raw : `${raw.slice(0, 157).trimEnd()}…`;
  return dynamicHead(title, description, `/prompt/${slug}`);
}
