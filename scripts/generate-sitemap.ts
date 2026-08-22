/**
 * Generates public/sitemap.xml at predev/prebuild.
 * Pulls every approved prompt, active creator and category from the database so
 * search engines can discover all content. Falls back to static routes if the
 * database can't be reached, so the build never breaks.
 */
import { writeFileSync, readFileSync, existsSync } from "fs";
import { resolve } from "path";

const BASE_URL = "https://pasteprompts.co.uk";

// Load env from .env (Vite-style) since this runs outside Vite.
function env(key: string): string | undefined {
  if (process.env[key]) return process.env[key];
  const path = resolve(".env");
  if (!existsSync(path)) return undefined;
  for (const line of readFileSync(path, "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && m[1] === key) return m[2].replace(/^["']|["']$/g, "");
  }
  return undefined;
}

interface Entry { path: string; lastmod?: string; changefreq: string; priority: string }

const guideSlugs = [
  "how-to-write-effective-ai-prompts",
  "chatgpt-vs-claude-vs-gemini",
  "advanced-prompt-engineering-techniques",
  "ai-prompts-for-marketing",
  "make-money-selling-ai-prompts",
  "ai-prompts-for-business-productivity",
  "common-prompting-mistakes",
  "anatomy-of-a-perfect-prompt-template",
  "how-to-remove-a-prompt-from-chatgpt",
  "how-to-buy-and-sell-ai-prompts-safely",
  "best-chatgpt-prompts-for-small-business",
];

// High-intent SEO landing pages (mirror of src/lib/landingContent.ts).
const landingSlugs = [
  "chatgpt-prompts",
  "claude-prompts",
  "gemini-prompts",
  "midjourney-prompts",
  "free-ai-prompts",
];

const staticEntries: Entry[] = [
  { path: "/", changefreq: "daily", priority: "1.0" },
  { path: "/browse", changefreq: "daily", priority: "0.9" },
  { path: "/browse/free", changefreq: "daily", priority: "0.8" },
  { path: "/browse/paid", changefreq: "daily", priority: "0.8" },
  ...landingSlugs.map((slug) => ({ path: `/prompts/${slug}`, changefreq: "daily", priority: "0.9" })),
  { path: "/guides", changefreq: "weekly", priority: "0.8" },
  ...guideSlugs.map((slug) => ({ path: `/guides/${slug}`, changefreq: "monthly", priority: "0.7" })),
  { path: "/about", changefreq: "monthly", priority: "0.6" },
  { path: "/contact", changefreq: "monthly", priority: "0.5" },
  { path: "/glossary", changefreq: "monthly", priority: "0.6" },
  { path: "/site-map", changefreq: "weekly", priority: "0.5" },
  { path: "/pro", changefreq: "monthly", priority: "0.6" },
  { path: "/trust", changefreq: "monthly", priority: "0.4" },
  { path: "/legal/terms", changefreq: "yearly", priority: "0.3" },
  { path: "/legal/privacy", changefreq: "yearly", priority: "0.3" },
  { path: "/legal/disclaimer", changefreq: "yearly", priority: "0.3" },
  { path: "/legal/refunds", changefreq: "yearly", priority: "0.3" },
  { path: "/legal/creators", changefreq: "yearly", priority: "0.3" },
];

async function rest(table: string, query: string): Promise<Record<string, string>[]> {
  const url = env("VITE_SUPABASE_URL");
  const key = env("VITE_SUPABASE_PUBLISHABLE_KEY");
  if (!url || !key) return [];
  const res = await fetch(`${url}/rest/v1/${table}?${query}`, {
    headers: { apikey: key, Authorization: `Bearer ${key}` },
  });
  if (!res.ok) return [];
  return (await res.json()) as Record<string, string>[];
}

function xml(entries: Entry[]): string {
  const body = entries
    .map((e) =>
      [
        "  <url>",
        `    <loc>${BASE_URL}${e.path}</loc>`,
        e.lastmod ? `    <lastmod>${e.lastmod}</lastmod>` : null,
        `    <changefreq>${e.changefreq}</changefreq>`,
        `    <priority>${e.priority}</priority>`,
        "  </url>",
      ].filter(Boolean).join("\n"),
    )
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`;
}

async function main() {
  const entries = [...staticEntries];
  try {
    const [categories, prompts, creators] = await Promise.all([
      rest("categories", "select=slug&limit=100"),
      rest("prompts", "select=slug,updated_at&status=eq.approved&limit=5000"),
      rest("profiles", "select=handle,updated_at&is_creator=eq.true&limit=5000"),
    ]);
    for (const c of categories) entries.push({ path: `/category/${c.slug}`, changefreq: "weekly", priority: "0.8" });
    for (const p of prompts) entries.push({ path: `/prompt/${p.slug}`, lastmod: (p.updated_at ?? "").slice(0, 10), changefreq: "weekly", priority: "0.7" });
    for (const c of creators) entries.push({ path: `/creators/${c.handle}`, lastmod: (c.updated_at ?? "").slice(0, 10), changefreq: "weekly", priority: "0.6" });
  } catch (e) {
    console.warn("sitemap: DB fetch failed, writing static routes only —", (e as Error).message);
  }
  writeFileSync(resolve("public/sitemap.xml"), xml(entries));
  console.log(`sitemap.xml written (${entries.length} entries)`);
}

main();
