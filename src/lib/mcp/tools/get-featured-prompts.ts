import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { marketplaceClient, PROMPT_CARD_SELECT, promptUrl } from "./_shared";

export default defineTool({
  name: "get_featured_prompts",
  title: "Get featured prompts",
  description: "Get the currently featured / trending prompts on the PastePrompts marketplace.",
  inputSchema: {
    limit: z.number().int().min(1).max(24).optional().describe("Max results (default 8)."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ limit }) => {
    const supabase = marketplaceClient();
    const { data, error } = await supabase
      .from("prompts")
      .select(PROMPT_CARD_SELECT)
      .eq("status", "approved")
      .eq("featured", true)
      .order("trending_score", { ascending: false })
      .limit(limit ?? 8);

    if (error) return { content: [{ type: "text", text: error.message }], isError: true };

    const results = (data ?? []).map((p: Record<string, unknown>) => ({
      slug: p.slug,
      title: p.title,
      description: p.description,
      model: p.model,
      price: p.is_free ? "Free" : `£${(((p.price_pence as number) ?? 0) / 100).toFixed(2)}`,
      rating: p.rating_avg,
      category: (p.category as { name?: string } | null)?.name ?? null,
      url: promptUrl(p.slug as string),
    }));

    return {
      content: [{ type: "text", text: JSON.stringify({ count: results.length, results }, null, 2) }],
      structuredContent: { count: results.length, results },
    };
  },
});
