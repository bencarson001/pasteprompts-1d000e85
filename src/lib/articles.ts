import { supabase } from "@/integrations/supabase/client";
import type { Guide } from "@/lib/guides";

/**
 * Database-backed Learn-hub articles.
 *
 * These are published either from the Admin Hub or by a connected AI agent
 * through the site's MCP server (`publish_article`). They render with exactly
 * the same layout as the hand-written guides in `src/lib/guides.ts`.
 */
export interface ArticleRow {
  slug: string;
  title: string;
  description: string;
  category: string;
  read_minutes: number;
  emoji: string;
  intro: string;
  blocks: unknown;
  takeaways: unknown;
  published_at: string;
  updated_at: string;
}

const SELECT =
  "slug, title, description, category, read_minutes, emoji, intro, blocks, takeaways, published_at, updated_at";

export function articleToGuide(row: ArticleRow): Guide {
  return {
    slug: row.slug,
    title: row.title,
    description: row.description,
    category: row.category,
    readMinutes: row.read_minutes,
    updated: (row.updated_at ?? row.published_at).slice(0, 10),
    emoji: row.emoji,
    intro: row.intro,
    blocks: Array.isArray(row.blocks) ? (row.blocks as Guide["blocks"]) : [],
    takeaways: Array.isArray(row.takeaways) ? (row.takeaways as string[]) : [],
  };
}

export async function fetchPublishedArticles(): Promise<Guide[]> {
  const { data, error } = await supabase
    .from("articles")
    .select(SELECT)
    .eq("status", "published")
    .order("published_at", { ascending: false })
    .limit(100);
  if (error || !data) return [];
  return (data as ArticleRow[]).map(articleToGuide);
}

export async function fetchArticle(slug: string): Promise<Guide | null> {
  const { data, error } = await supabase
    .from("articles")
    .select(SELECT)
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();
  if (error || !data) return null;
  return articleToGuide(data as ArticleRow);
}
