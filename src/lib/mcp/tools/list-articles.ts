import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser, SITE_URL } from "../supabase";

export default defineTool({
  name: "list_articles",
  title: "List Learn-hub articles",
  description:
    "List articles published to the Paste Prompts Learn hub, newest first. Use before publishing to avoid duplicate topics or slugs.",
  inputSchema: {
    limit: z.number().int().min(1).max(50).optional().describe("Max articles to return (default 20)."),
    status: z.enum(["published", "draft", "any"]).optional().describe("Filter by status (default published)."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ limit, status }, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated." }], isError: true };
    }
    const supabase = supabaseForUser(ctx);
    let query = supabase
      .from("articles")
      .select("slug, title, category, status, published_at")
      .order("published_at", { ascending: false })
      .limit(limit ?? 20);
    if ((status ?? "published") !== "any") query = query.eq("status", status ?? "published");

    const { data, error } = await query;
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };

    const items = (data ?? []).map((a) => ({ ...a, url: `${SITE_URL}/guides/${a.slug}` }));
    const text = items.length
      ? items.map((a) => `- ${a.title} [${a.status}] ${a.url}`).join("\n")
      : "No articles yet.";
    return { content: [{ type: "text", text }], structuredContent: { articles: items } };
  },
});
