import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { marketplaceClient, promptUrl } from "./_shared";

const PROMPT_DETAIL_SELECT =
  "slug, title, description, example_output, model, price_pence, is_free, rating_avg, rating_count, sales_count, copies_count, views, featured, tags, created_at, category:categories(slug, name), creator:profiles!prompts_creator_id_fkey(handle, display_name, bio, total_sales)";

export default defineTool({
  name: "get_prompt",
  title: "Get prompt details",
  description:
    "Get full public details for a single PastePrompts marketplace prompt by its slug. The paid prompt body is not returned — link users to the prompt page to purchase or copy it.",
  inputSchema: {
    slug: z.string().min(1).describe("The prompt slug, e.g. 'cinematic-portrait-midjourney'."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ slug }) => {
    const supabase = marketplaceClient();
    const { data, error } = await supabase
      .from("prompts")
      .select(PROMPT_DETAIL_SELECT)
      .eq("slug", slug)
      .eq("status", "approved")
      .maybeSingle();

    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    if (!data) return { content: [{ type: "text", text: `No approved prompt found for slug "${slug}".` }], isError: true };

    const p = data as Record<string, unknown>;
    const detail = {
      slug: p.slug,
      title: p.title,
      description: p.description,
      example_output: p.example_output,
      model: p.model,
      price: p.is_free ? "Free" : `£${(((p.price_pence as number) ?? 0) / 100).toFixed(2)}`,
      rating: p.rating_avg,
      rating_count: p.rating_count,
      sales: p.sales_count,
      views: p.views,
      tags: p.tags,
      category: (p.category as { name?: string } | null)?.name ?? null,
      creator: (p.creator as { display_name?: string } | null)?.display_name ?? null,
      created_at: p.created_at,
      url: promptUrl(p.slug as string),
    };

    return {
      content: [{ type: "text", text: JSON.stringify(detail, null, 2) }],
      structuredContent: detail,
    };
  },
});
