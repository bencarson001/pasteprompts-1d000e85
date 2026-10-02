import { useEffect } from "react";

type JsonLd = Record<string, unknown>;

interface SEOProps {
  title: string;
  description: string;
  canonical?: string;
  type?: "website" | "article" | "product" | "profile";
  image?: string;
  noindex?: boolean;
  keywords?: string;
  jsonLd?: JsonLd | JsonLd[];
}

const SITE = "Paste Prompts";
const SITE_URL = "https://pasteprompts.co.uk";
const DEFAULT_KEYWORDS =
  "AI prompts, ChatGPT prompts, Claude prompts, Gemini prompts, Midjourney prompts, prompt marketplace, prompt engineering, free AI prompts, buy prompts, sell prompts, prompt library";

/** Normalize a canonical URL: absolutize to SITE_URL, strip tracking params,
 *  lowercase host, drop trailing slash (except root) so every route has one
 *  self-referencing canonical and og:url. */
function absolutize(input: string): string {
  try {
    const u = new URL(input, SITE_URL);
    // Force production host — preview/lovable domains should still point at canonical.
    u.protocol = "https:";
    u.host = "pasteprompts.co.uk";
    ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content", "gclid", "fbclid", "ref"].forEach((p) =>
      u.searchParams.delete(p),
    );
    let out = u.toString();
    if (out.endsWith("/") && u.pathname !== "/") out = out.slice(0, -1);
    return out;
  } catch {
    return `${SITE_URL}${input.startsWith("/") ? input : `/${input}`}`;
  }
}

export function SEO({ title, description, canonical, type = "website", image, noindex, keywords, jsonLd }: SEOProps) {
  // Head tags below are React-19-managed (hoisted). Never remove head nodes
  // imperatively here — deleting React-owned nodes crashes later unmounts.

  // Keep titles under ~60 chars: only append the site name when it fits.

  const withSuffix = `${title} | ${SITE}`;
  const fullTitle = title.includes(SITE)
    ? title
    : withSuffix.length <= 60
      ? withSuffix
      : title.length <= 60
        ? title
        : `${title.slice(0, 57).trimEnd()}…`;
  const safeDescription = description.length <= 160
    ? description
    : `${description.slice(0, 157).trimEnd()}…`;
  const schemas = jsonLd ? (Array.isArray(jsonLd) ? jsonLd : [jsonLd]) : [];
  const canonicalUrl = canonical ? absolutize(canonical) : undefined;

  // React 19 hoists <title>/<meta>/<link> to <head> natively, so these render
  // as plain tags (no Helmet — its imperative head mutation conflicts with
  // React-managed head nodes and crashes unmounts during client navigation).
  return (
    <>
      <title>{fullTitle}</title>
      <meta name="description" content={safeDescription} />
      <meta name="keywords" content={keywords ?? DEFAULT_KEYWORDS} />
      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}
      {noindex && <meta name="robots" content="noindex,nofollow" />}

      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={safeDescription} />
      <meta property="og:type" content={type} />
      {canonicalUrl && <meta property="og:url" content={canonicalUrl} />}
      {image && <meta property="og:image" content={image} />}

      <meta name="twitter:card" content={image ? "summary_large_image" : "summary"} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={safeDescription} />
      {image && <meta name="twitter:image" content={image} />}

      {schemas.map((s, i) => (
        <script key={i} type="application/ld+json">
          {JSON.stringify(s)}
        </script>
      ))}
    </>
  );
}

export default SEO;
