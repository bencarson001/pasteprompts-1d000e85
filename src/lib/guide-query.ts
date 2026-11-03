import { queryOptions } from "@tanstack/react-query";
import { getGuide } from "./guides";
import { articleToGuide } from "./articles";
import { getPublicArticle } from "./articles.functions";

export const GUIDE_SLUG_ALIASES: Record<string, string> = {
  "chatgpt-vs-claude-vs-gemini-prompting": "chatgpt-vs-claude-vs-gemini",
  "midjourney-v6-prompt-formula": "midjourney-v6-prompt-formula-guide",
  "how-to-sell-ai-prompts-and-make-money": "make-money-selling-ai-prompts",
  "how-to-sell-ai-prompts": "make-money-selling-ai-prompts",
  "selling-ai-prompts": "make-money-selling-ai-prompts",
};

export function resolveGuideSlug(slug: string) {
  return GUIDE_SLUG_ALIASES[slug.toLowerCase()] || slug;
}

export const guideQueryOptions = (rawSlug: string) => queryOptions({
  queryKey: ["public-guide", resolveGuideSlug(rawSlug)],
  staleTime: 60_000,
  queryFn: async () => {
    const slug = resolveGuideSlug(rawSlug);
    const guide = getGuide(slug);
    if (guide) return guide;
    const row = await getPublicArticle({ data: slug });
    return row ? articleToGuide(row) : null;
  },
});