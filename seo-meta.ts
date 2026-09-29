export interface PageMeta {
  title: string;
  description: string;
  canonicalPath: string;
  noindex?: boolean;
}

const SITE_NAME = "Paste Prompts";

const STATIC_META: Record<string, Omit<PageMeta, "canonicalPath">> = {
  "/": {
    title: "AI Prompts & ChatGPT Prompts Marketplace | Paste Prompts",
    description: "Discover top AI prompts & ChatGPT prompts. Copy and paste free & 49p prompts for ChatGPT, Claude, Gemini, Midjourney & Flux. Buy or sell prompts on Paste Prompts.",
  },
  "/browse": {
    title: "Browse AI Prompts — Free & 49p Prompt Library",
    description: "Browse AI prompts by price, platform and category. Find free and 49p prompts for ChatGPT, Claude, Gemini, Midjourney and more.",
  },
  "/browse/free": {
    title: "Browse Free AI Prompts",
    description: "Choose a platform and category to find free AI prompts for ChatGPT, Claude, Gemini, Midjourney and other popular AI tools.",
  },
  "/browse/paid": {
    title: "Browse 49p AI Prompts",
    description: "Choose a platform and category to find detailed 49p AI prompts for ChatGPT, Claude, Gemini, Midjourney and other AI tools.",
  },
  "/creators": {
    title: "Discover AI Prompt Creators",
    description: "Browse AI prompt creators, explore their published prompts and follow the people whose work helps you get more from AI tools.",
  },
  "/guides": {
    title: "Learn AI Prompting — Free Guides & Tips",
    description: "Read practical guides to prompt engineering, compare ChatGPT, Claude and Gemini, and learn techniques for getting better results from AI.",
  },
  "/about": {
    title: "About Paste Prompts",
    description: "Learn how Paste Prompts helps people discover, buy, use and sell reusable AI prompts, and how marketplace content is reviewed.",
  },
  "/contact": {
    title: "Contact Paste Prompts",
    description: "Contact Paste Prompts for marketplace support, account questions, copyright concerns, purchases or help with selling AI prompts.",
  },
  "/glossary": {
    title: "AI Prompt Engineering Glossary",
    description: "Plain-English definitions for AI and prompt engineering terms, including tokens, system prompts, few-shot prompting, temperature and RAG.",
  },
  "/site-map": {
    title: "Site Map — Every Public Paste Prompts Page",
    description: "Browse the Paste Prompts site map, including prompt collections, categories, guides, creator pages, company information and policies.",
  },
  "/pro": {
    title: "Paste Prompts Pro Membership",
    description: "Compare Paste Prompts membership options and see the profile, creator and marketplace features included with each available level.",
  },
  "/trust": {
    title: "Trust, Safety & Security at Paste Prompts",
    description: "Read how Paste Prompts approaches account security, payments, prompt moderation, privacy and responsible marketplace operations.",
  },
  "/editorial-standards": {
    title: "Editorial Standards & Prompt Review Process",
    description: "Learn how Paste Prompts reviews marketplace submissions and maintains its editorial, quality, originality and safety standards.",
  },
  "/dmca": {
    title: "DMCA & Copyright Takedown Requests",
    description: "Learn how to report copyright infringement or submit a takedown request for content published on Paste Prompts.",
  },
};

const LEGAL_META: Record<string, Omit<PageMeta, "canonicalPath">> = {
  terms: { title: "Terms of Service", description: "Read the Paste Prompts terms covering accounts, prompt purchases, creator listings, acceptable use and marketplace responsibilities." },
  privacy: { title: "Privacy Policy", description: "Read how Paste Prompts collects, uses, protects and retains account, purchase, support and website usage information." },
  disclaimer: { title: "Disclaimer", description: "Read the Paste Prompts disclaimer covering AI-generated output, professional advice, third-party products, advertising and external links." },
  refunds: { title: "Refund Policy", description: "Read when a Paste Prompts digital purchase may qualify for a refund and how to contact support about a purchase problem." },
  creators: { title: "Creator Agreement", description: "Read the Paste Prompts creator terms covering original work, marketplace review, commission, payouts and creator conduct." },
  cookies: { title: "Cookie Policy", description: "Read how Paste Prompts uses essential, analytics and advertising cookies and how visitors can manage their preferences." },
  "content-policy": { title: "Content & Editorial Policy", description: "Read the Paste Prompts rules for originality, prohibited content, high-stakes topics, moderation and takedown requests." },
};

const PRIVATE_PREFIXES = [
  "/admin", "/auth", "/login", "/signup", "/register", "/checkout", "/dashboard",
  "/library", "/messages", "/profile/edit", "/saved", "/sell", "/settings", "/.lovable",
];

const words = (value: string) => value
  .split("-")
  .filter(Boolean)
  .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
  .join(" ");

export function withSiteName(title: string): string {
  if (title.includes(SITE_NAME)) return title.slice(0, 60);
  const combined = `${title} | ${SITE_NAME}`;
  return combined.length <= 60 ? combined : title.slice(0, 60);
}

export function resolveStaticMeta(pathname: string, search = ""): PageMeta | undefined {
  const path = pathname.length > 1 ? pathname.replace(/\/+$/, "") : pathname;
  if (PRIVATE_PREFIXES.some((prefix) => path === prefix || path.startsWith(`${prefix}/`))) {
    return {
      title: "Account page | Paste Prompts",
      description: "A private Paste Prompts account page.",
      canonicalPath: path,
      noindex: true,
    };
  }

  if (search && path.startsWith("/browse")) {
    return { ...(STATIC_META["/browse"] as Omit<PageMeta, "canonicalPath">), canonicalPath: "/browse", noindex: true };
  }

  const exact = STATIC_META[path];
  if (exact) return { ...exact, canonicalPath: path };

  const legalMatch = path.match(/^\/legal\/([^/]+)$/);
  if (legalMatch) {
    const key = legalMatch[1];
    const legal = LEGAL_META[key];
    if (legal) return { ...legal, canonicalPath: `/legal/${key}` };
  }

  const browseMatch = path.match(/^\/browse\/([^/]+)\/([^/]+)\/([^/]+)$/);
  if (browseMatch) {
    const [, price, model, category] = browseMatch;
    const parts = [price === "all" ? "" : price === "paid" ? "49p" : "Free", category === "all" ? "" : words(category), model === "all" ? "" : words(model)].filter(Boolean);
    const subject = parts.length ? `${parts.join(" ")} AI prompts` : "All AI prompts";
    return {
      title: withSiteName(subject),
      description: `Browse ${subject.toLowerCase()} on Paste Prompts. Compare real listings, choose a free or 49p prompt and open its full marketplace page.`,
      canonicalPath: path,
    };
  }

  return undefined;
}

export function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  })[character] ?? character);
}

function replaceMeta(html: string, selector: "name" | "property", key: string, value: string): string {
  const escaped = escapeHtml(value);
  const pattern = new RegExp(`<meta(?=[^>]*\\b${selector}=["']${key}["'])[^>]*>`, "i");
  const tag = `<meta ${selector}="${key}" content="${escaped}" />`;
  return pattern.test(html) ? html.replace(pattern, tag) : html.replace("</head>", `  ${tag}\n  </head>`);
}

export function applyMetaToHtml(html: string, meta: PageMeta, siteUrl = "https://pasteprompts.co.uk"): string {
  const title = withSiteName(meta.title);
  const canonical = `${siteUrl}${meta.canonicalPath === "/" ? "/" : meta.canonicalPath}`;
  let output = html.replace(/<title>.*?<\/title>/is, `<title>${escapeHtml(title)}</title>`);
  output = replaceMeta(output, "name", "description", meta.description);
  output = replaceMeta(output, "property", "og:title", title);
  output = replaceMeta(output, "property", "og:description", meta.description);
  output = replaceMeta(output, "property", "og:url", canonical);
  output = replaceMeta(output, "name", "twitter:title", title);
  output = replaceMeta(output, "name", "twitter:description", meta.description);
  output = replaceMeta(output, "name", "robots", meta.noindex ? "noindex,nofollow" : "index,follow,max-image-preview:large,max-snippet:-1");
  output = output.replace(/<link(?=[^>]*\brel=["']canonical["'])[^>]*>/i, `<link rel="canonical" href="${escapeHtml(canonical)}" data-static-canonical="true" />`);
  if (meta.canonicalPath !== "/") {
    const fallback = `<div id="root"><main id="static-fallback" style="max-width:760px;margin:0 auto;padding:48px 20px;line-height:1.6"><h1>${escapeHtml(title)}</h1><p>${escapeHtml(meta.description)}</p><nav aria-label="Related pages"><a href="/">Home</a> · <a href="/browse">Browse prompts</a> · <a href="/guides">Guides</a></nav></main></div>\n    `;
    output = output.replace(/<div id="root">[\s\S]*?(?=<script type="module")/, fallback);
  }
  return output;
}