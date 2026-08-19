import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser, SITE_URL } from "../supabase";

const blockSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("p"), text: z.string().min(1) }),
  z.object({ type: z.literal("h2"), text: z.string().min(1) }),
  z.object({ type: z.literal("h3"), text: z.string().min(1) }),
  z.object({ type: z.literal("list"), items: z.array(z.string().min(1)).min(1) }),
  z.object({ type: z.literal("steps"), items: z.array(z.string().min(1)).min(1) }),
  z.object({ type: z.literal("quote"), text: z.string().min(1) }),
  z.object({ type: z.literal("code"), label: z.string().optional(), text: z.string().min(1) }),
]);

export default defineTool({
  name: "update_article",
  title: "Update or unpublish article",
  description:
    "Edit an existing Learn-hub article by slug, or change its status to draft/published. Requires an admin account. Only the supplied fields change.",
  inputSchema: {
    slug: z.string().trim().min(1).describe("Slug of the article to update."),
    title: z.string().trim().min(10).max(120).optional(),
    description: z.string().trim().min(50).max(300).optional(),
    intro: z.string().trim().min(60).optional(),
    blocks: z.array(blockSchema).min(6).optional(),
    takeaways: z.array(z.string().min(5)).min(3).max(8).optional(),
    category: z.string().trim().max(40).optional(),
    emoji: z.string().trim().max(4).optional(),
    read_minutes: z.number().int().min(2).max(30).optional(),
    status: z.enum(["published", "draft"]).optional(),
  },
  annotations: { readOnlyHint: false, destructiveHint: true, openWorldHint: false },
  handler: async ({ slug, ...fields }, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated." }], isError: true };
    }
    const patch = Object.fromEntries(Object.entries(fields).filter(([, v]) => v !== undefined));
    if (Object.keys(patch).length === 0) {
      return { content: [{ type: "text", text: "Nothing to update." }], isError: true };
    }

    const supabase = supabaseForUser(ctx);
    const { data, error } = await supabase
      .from("articles")
      .update(patch)
      .eq("slug", slug)
      .select("slug, status")
      .maybeSingle();

    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    if (!data) {
      return { content: [{ type: "text", text: `No article found with slug "${slug}" (or you lack admin rights).` }], isError: true };
    }

    return {
      content: [{ type: "text", text: `Updated ${data.slug} (${data.status}) — ${SITE_URL}/guides/${data.slug}` }],
      structuredContent: { slug: data.slug, status: data.status },
    };
  },
});
