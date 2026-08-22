/**
 * Agent Data API Client
 * Connects to the Supabase edge function data-api with the provided API key.
 * Allows programmatic access to prompts, articles, categories, and marketplace stats.
 */

const DATA_API_URL =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_DATA_API_URL) ||
  (typeof process !== "undefined" && process.env?.DATA_API_URL) ||
  "https://iwmljuoplkqyhdygajpi.supabase.co/functions/v1/data-api";

function getApiKey(): string {
  if (typeof process !== "undefined" && process.env?.AGENT_API_KEY) {
    return process.env.AGENT_API_KEY;
  }
  if (typeof import.meta !== "undefined" && import.meta.env?.VITE_AGENT_API_KEY) {
    return import.meta.env.VITE_AGENT_API_KEY;
  }
  return "";
}

export interface DataApiStats {
  prompts: number;
  articles: number;
  categories: number;
}

export interface DataApiPrompt {
  id: string;
  slug: string;
  title: string;
  description: string;
  body?: string;
  example_output?: string;
  tags?: string[];
  image_url?: string;
  featured?: boolean;
  status?: string;
  is_free?: boolean;
  model?: string;
}

export interface DataApiArticle {
  id: string;
  slug: string;
  title: string;
  description: string;
  category?: string;
  read_minutes?: number;
  emoji?: string;
  intro?: string;
  blocks?: unknown[];
  takeaways?: string[];
  status?: string;
  author?: string;
}

async function requestDataApi<T>(path: string, options: RequestInit = {}): Promise<T> {
  const url = `${DATA_API_URL}${path.startsWith("/") ? path : `/${path}`}`;
  const apiKey = getApiKey();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(apiKey ? { "x-api-key": apiKey } : {}),
    ...((options.headers as Record<string, string>) || {}),
  };

  const res = await fetch(url, { ...options, headers });
  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    throw new Error(`Data API error ${res.status}: ${errText || res.statusText}`);
  }
  return res.json() as Promise<T>;
}

export const dataApi = {
  getStats: () => requestDataApi<DataApiStats>("/stats"),
  getPrompts: (params?: { limit?: number; offset?: number }) => {
    const q = new URLSearchParams();
    if (params?.limit) q.set("limit", String(params.limit));
    if (params?.offset) q.set("offset", String(params.offset));
    const qs = q.toString();
    return requestDataApi<{ count: number; items: DataApiPrompt[] }>(`/prompts${qs ? `?${qs}` : ""}`);
  },
  getPromptBySlug: (slug: string) => requestDataApi<DataApiPrompt>(`/prompts/${slug}`),
  updatePrompt: (slug: string, patch: Partial<DataApiPrompt>) =>
    requestDataApi<DataApiPrompt>(`/prompts/${slug}`, {
      method: "PATCH",
      body: JSON.stringify(patch),
    }),
  getArticles: () => requestDataApi<{ count: number; items: DataApiArticle[] }>("/articles"),
  getArticleBySlug: (slug: string) => requestDataApi<DataApiArticle>(`/articles/${slug}`),
  createArticle: (article: Partial<DataApiArticle>) =>
    requestDataApi<DataApiArticle>("/articles", {
      method: "POST",
      body: JSON.stringify(article),
    }),
  updateArticle: (slug: string, patch: Partial<DataApiArticle>) =>
    requestDataApi<DataApiArticle>(`/articles/${slug}`, {
      method: "PATCH",
      body: JSON.stringify(patch),
    }),
  getCategories: () => requestDataApi<{ items: { id: string; name: string; slug: string }[] }>("/categories"),
  getCollections: () => requestDataApi<{ items: unknown[] }>("/collections"),
};
