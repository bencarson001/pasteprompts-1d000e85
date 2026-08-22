import { auth, defineMcp } from "@lovable.dev/mcp-js";
import searchPrompts from "./tools/search-prompts";
import getPrompt from "./tools/get-prompt";
import listCategories from "./tools/list-categories";
import getFeaturedPrompts from "./tools/get-featured-prompts";
import publishArticle from "./tools/publish-article";
import updateArticle from "./tools/update-article";
import listArticles from "./tools/list-articles";


// The OAuth issuer must be the direct Supabase host, built from the project ref
// (Vite inlines VITE_SUPABASE_PROJECT_ID as a literal at build time, so this stays
// import-safe). The fallback keeps the issuer well-formed during manifest extract.
const projectRef = import.meta.env.VITE_SUPABASE_PROJECT_ID ?? "project-ref-unset";

export default defineMcp({
  name: "pasteprompts-mcp",
  title: "PastePrompts MCP",
  version: "0.2.0",
  instructions:
    "Tools for the PastePrompts AI-prompt marketplace (pasteprompts.co.uk). Read: `search_prompts` finds prompts by keyword, model or price; `get_prompt` returns full details for one slug; `list_categories` browses categories; `get_featured_prompts` returns trending picks. Prompt bodies are paid content and are never returned — share the prompt URL instead. Write (admin accounts only): `list_articles` shows existing Learn-hub articles, `publish_article` publishes a new long-form SEO article to /guides/<slug>, and `update_article` edits or unpublishes one. Articles must be original, factual and at least 800 words across the `blocks` array; check `list_articles` first to avoid duplicate topics.",

  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [
    searchPrompts,
    getPrompt,
    listCategories,
    getFeaturedPrompts,
    listArticles,
    publishArticle,
    updateArticle,
  ],

});
