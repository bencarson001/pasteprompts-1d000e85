import { defineTool } from "@lovable.dev/mcp-js";
import { marketplaceClient } from "./_shared";

export default defineTool({
  name: "list_categories",
  title: "List categories",
  description: "List all prompt categories available on the PastePrompts marketplace.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async () => {
    const supabase = marketplaceClient();
    const { data, error } = await supabase
      .from("categories")
      .select("slug, name, description")
      .order("sort_order");

    if (error) return { content: [{ type: "text", text: error.message }], isError: true };

    const categories = data ?? [];
    return {
      content: [{ type: "text", text: JSON.stringify({ count: categories.length, categories }, null, 2) }],
      structuredContent: { count: categories.length, categories },
    };
  },
});
