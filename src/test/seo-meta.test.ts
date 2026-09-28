import { describe, expect, it } from "vitest";
import { applyMetaToHtml, escapeHtml, resolveStaticMeta } from "../../seo-meta";

const shell = `<!doctype html><html><head>
<title>Fallback</title>
<meta name="description" content="Fallback" />
<meta name="robots" content="index, follow" />
<link rel="canonical" href="https://pasteprompts.co.uk/" />
<meta property="og:title" content="Fallback" />
<meta property="og:description" content="Fallback" />
<meta property="og:url" content="https://pasteprompts.co.uk/" />
<meta name="twitter:title" content="Fallback" />
<meta name="twitter:description" content="Fallback" />
</head></html>`;

describe("server SEO metadata", () => {
  it("creates distinct browse metadata from the selected filters", () => {
    const free = resolveStaticMeta("/browse/free/chatgpt/copywriting");
    const paid = resolveStaticMeta("/browse/paid/claude/business");
    expect(free?.title).not.toBe(paid?.title);
    expect(free?.canonicalPath).toBe("/browse/free/chatgpt/copywriting");
  });

  it("marks private and search result pages noindex", () => {
    expect(resolveStaticMeta("/admin")?.noindex).toBe(true);
    expect(resolveStaticMeta("/browse", "?q=email")?.noindex).toBe(true);
  });

  it("replaces every crawler-visible metadata field", () => {
    const html = applyMetaToHtml(shell, {
      title: "Copywriting AI Prompts",
      description: "Browse copywriting prompts.",
      canonicalPath: "/category/copywriting",
    });
    expect(html).toContain("<title>Copywriting AI Prompts | Paste Prompts</title>");
    expect(html).toContain('href="https://pasteprompts.co.uk/category/copywriting"');
    expect(html).toContain('content="Browse copywriting prompts."');
    expect(html).toContain('<main id="static-fallback"');
    expect(html).not.toContain("Fallback</title>");
  });

  it("escapes database content before inserting it into HTML", () => {
    expect(escapeHtml('A &quot; <script> "test"')).toBe("A &amp;quot; &lt;script&gt; &quot;test&quot;");
  });
});