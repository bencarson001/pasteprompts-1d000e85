import { createServerFn } from "@tanstack/react-start";
import type { ArticleRow } from "./articles";
import type { GuideBlock } from "./guides/types";

type PublicArticle = Omit<ArticleRow, "blocks" | "takeaways"> & {
  blocks: GuideBlock[];
  takeaways: string[];
};

// Published articles are public; never use an admin credential for this read.
export const getPublicArticle = createServerFn({ method: "GET" })
  .inputValidator((slug: string) => {
    if (!/^[a-z0-9-]{1,160}$/.test(slug)) throw new Error("Invalid article slug");
    return slug;
  })
  .handler(async ({ data }) => {
    const url = process.env["SUPABASE_URL"] || import.meta.env["VITE_SUPABASE_URL"];
    const key = process.env["SUPABASE_PUBLISHABLE_KEY"] || import.meta.env["VITE_SUPABASE_PUBLISHABLE_KEY"];
    if (!url || !key) throw new Error("Public article configuration unavailable");
    const query = new URLSearchParams({
      select: "slug,title,description,category,read_minutes,emoji,intro,blocks,takeaways,published_at,updated_at",
      slug: `eq.${data}`,
      status: "eq.published",
      limit: "1",
    });
    const response = await fetch(`${url}/rest/v1/articles?${query}`, { headers: { apikey: key } });
    if (!response.ok) {
      console.error("Published article read failed", response.status);
      throw new Error("This guide could not be loaded. Please try again.");
    }
    const rows = await response.json() as PublicArticle[];
    return rows[0] ?? null;
  });