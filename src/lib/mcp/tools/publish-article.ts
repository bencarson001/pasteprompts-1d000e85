import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser, slugify, SITE_URL } from "../supabase";

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
  name: "publish_article",
  title: "Publish SEO article",
  description:
    "Publish a long-form SEO article to the Paste Prompts Learn hub at /guides/<slug>. Requires an admin account. Articles must be original, substantial (8+ blocks) and genuinely useful.",
  inputSchema: {
    title: z.string().trim().min(10).max(120).describe("Article H1 / SEO title."),
    description: z.string().trim().min(50).max(300).describe("Meta description (50-160 chars ideal)."),
    intro: z.string().trim().min(120).describe("Opening paragraph shown under the title."),
    blocks: z.array(blockSchema).min(6).describe("Body content blocks in reading order."),
    takeaways: z.array(z.string().min(5)).min(3).max(8).describe("Key takeaway bullet points."),
    slug: z.string().trim().optional().describe("URL slug; derived from the title when omitted."),
    category: z.string().trim().max(40).optional().describe("Topic label, e.g. 'Fundamentals'."),
    emoji: z.string().trim().max(4).optional(),
    read_minutes: z.number().int().min(2).max(30).optional(),
    status: z.enum(["published", "draft"]).optional(),
  },
  annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: false },
  handler: async (input, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated." }], isError: true };
    }
    const supabase = supabaseForUser(ctx);
    const slug = slugify(input.slug || input.title);
    const words = [
      input.intro,
      ...input.blocks.map((b) => {
        const anyBlock = b as { text?: string; items?: string[] };
        return anyBlock.text ?? (anyBlock.items ?? []).join(" ");
      }),
    ]
      .join(" ")
      .split(/\s+/).length;


    const { data, error } = await supabase
      .from("articles")
      .insert({
        slug,
        title: input.title,
        description: input.description,
        intro: input.intro,
        blocks: input.blocks,
        takeaways: input.takeaways,
        category: input.category ?? "Guides",
        emoji: input.emoji ?? "📘",
        read_minutes: input.read_minutes ?? Math.max(3, Math.round(words / 200)),
        status: input.status ?? "published",
        created_by: ctx.getUserId(),
      })
      .select("slug, status")
      .single();

    if (error) {
      const hint = error.code === "23505" ? " (an article with this slug already exists — use update_article)" : "";
      return { content: [{ type: "text", text: `Could not publish: ${error.message}${hint}` }], isError: true };
    }

    const url = `${SITE_URL}/guides/${data.slug}`;
    return {
      content: [{ type: "text", text: `Published "${input.title}" (${data.status}) at ${url}` }],
      structuredContent: { slug: data.slug, status: data.status, url },
    };
  },
});
