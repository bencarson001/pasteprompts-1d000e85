import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { marketplaceClient, PROMPT_CARD_SELECT, promptUrl, sanitizeSearchTerm } from "./_shared";

export default defineTool({
  name: "search_prompts",
  title: "Search prompts",
  description:
    "Search the PastePrompts marketplace for approved AI prompts. Filter by keyword, AI model, price band, and sort order.",
  inputSchema: {
    query: z.string().optional().describe("Keyword to match in the title or description."),
    model: z.string().optional().describe("Filter by AI model, e.g. 'gpt-4', 'midjourney', 'claude'."),
    price: z
      .enum(["free", "paid", "under5", "5to15", "over15"])
      .optional()
      .describe("Price band filter."),
    sort: z
      .enum(["trending", "newest", "rated", "popular"])
      .optional()
      .describe("Sort order (default: trending)."),
    category: z.string().optional().describe("Category slug to filter by."),
    limit: z.number().int().min(1).max(50).optional().describe("Max results (default 12)."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ query, model, price, sort, category, limit }) => {
    const supabase = marketplaceClient();
    let q = supabase.from("prompts").select(PROMPT_CARD_SELECT).eq("status", "approved");

    if (query) {
      const term = sanitizeSearchTerm(query);
      if (term) q = q.or(`title.ilike.%${term}%,description.ilike.%${term}%`);
    }
    if (model && model !== "all") q = q.eq("model", model as never);
    if (price === "free") q = q.eq("is_free", true);
    if (price === "paid") q = q.eq("is_free", false);
    if (price === "under5") q = q.lt("price_pence", 500).eq("is_free", false);
    if (price === "5to15") q = q.gte("price_pence", 500).lte("price_pence", 1500);
    if (price === "over15") q = q.gt("price_pence", 1500);

    if (category) {
      const { data: cat } = await supabase.from("categories").select("id").eq("slug", category).maybeSingle();
      if (cat) q = q.eq("category_id", cat.id);
    }

    switch (sort) {
      case "newest":
        q = q.order("created_at", { ascending: false });
        break;
      case "rated":
        q = q.order("rating_avg", { ascending: false }).order("rating_count", { ascending: false });
        break;
      case "popular":
        q = q.order("sales_count", { ascending: false });
        break;
      default:
        q = q.order("trending_score", { ascending: false }).order("sales_count", { ascending: false });
    }

    q = q.limit(limit ?? 12);

    const { data, error } = await q;
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };

    const results = (data ?? []).map((p: Record<string, unknown>) => ({
      slug: p.slug,
      title: p.title,
      description: p.description,
      model: p.model,
      price: p.is_free ? "Free" : `£${(((p.price_pence as number) ?? 0) / 100).toFixed(2)}`,
      rating: p.rating_avg,
      sales: p.sales_count,
      category: (p.category as { name?: string } | null)?.name ?? null,
      creator: (p.creator as { display_name?: string } | null)?.display_name ?? null,
      url: promptUrl(p.slug as string),
    }));

    return {
      content: [{ type: "text", text: JSON.stringify({ count: results.length, results }, null, 2) }],
      structuredContent: { count: results.length, results },
    };
  },
});
