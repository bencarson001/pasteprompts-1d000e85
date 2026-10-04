// Shared route head() metadata builder.
// Source of truth for crawler-visible titles/descriptions is seo-meta.ts at the
// project root (kept aligned with each page's React <SEO> values per AGENTS.md).
import { resolveStaticMeta, withSiteName, type PageMeta } from "../../seo-meta";

const SITE_URL = "https://pasteprompts.co.uk";

interface RouteHead {
  meta?: Array<Record<string, string>>;
  links?: Array<Record<string, string>>;
}

export function headFromMeta(meta: PageMeta): RouteHead {
  const title = withSiteName(meta.title);
  const canonical = `${SITE_URL}${meta.canonicalPath === "/" ? "/" : meta.canonicalPath}`;
  return {
    meta: [
      { title },
      { name: "description", content: meta.description },
      { property: "og:title", content: title },
      { property: "og:description", content: meta.description },
      { property: "og:url", content: canonical },
      { name: "twitter:title", content: title },
      { name: "twitter:description", content: meta.description },
      // Exactly one robots tag per page (root no longer sets one).
      { name: "robots", content: meta.noindex ? "noindex,nofollow" : "index, follow, max-image-preview:large, max-snippet:-1" },
    ],
    links: meta.noindex ? [] : [{ rel: "canonical", href: canonical }],
  };
}

/** Head for a route whose metadata is defined statically in seo-meta.ts. */
export function staticHead(path: string): RouteHead {
  const meta = resolveStaticMeta(path);
  return meta ? headFromMeta(meta) : {};
}

/** "chatgpt-marketing-plan" -> "Chatgpt Marketing Plan" */
export function humanize(slug: string): string {
  return slug
    .split("-")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

/** Head for a dynamic route; full metadata is refined client-side by <SEO>. */
export function dynamicHead(
  title: string,
  description: string,
  canonicalPath: string,
  noindex = false,
): RouteHead {
  return headFromMeta({ title, description, canonicalPath, noindex });
}
