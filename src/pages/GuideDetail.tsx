import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Clock, CheckCircle2, Quote, AlertCircle, Sparkles, TrendingUp, Info } from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { SEO } from "@/components/SEO";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AdSlot } from "@/components/AdSlot";
import { AD_SLOTS } from "@/lib/ads";
import { getGuide, relatedGuides, type GuideBlock, type Guide } from "@/lib/guides";
import { fetchArticle } from "@/lib/articles";

const SITE_URL = "https://pasteprompts.co.uk";

const GUIDE_SLUG_ALIASES: Record<string, string> = {
  "chatgpt-vs-claude-vs-gemini-prompting": "chatgpt-vs-claude-vs-gemini",
  "midjourney-v6-prompt-formula": "midjourney-v6-prompt-formula-guide",
  "how-to-sell-ai-prompts-and-make-money": "make-money-selling-ai-prompts",
  "how-to-sell-ai-prompts": "make-money-selling-ai-prompts",
  "selling-ai-prompts": "make-money-selling-ai-prompts",
};

function Block({ block }: { block: GuideBlock }) {
  switch (block.type) {
    case "h2":
      return <h2 className="mt-12 font-display text-2xl sm:text-3xl font-bold tracking-tight text-foreground">{block.text}</h2>;
    case "h3":
      return <h3 className="mt-8 font-display text-lg sm:text-xl font-semibold text-foreground/95">{block.text}</h3>;
    case "p":
      return <p className="mt-4 leading-relaxed text-muted-foreground text-base sm:text-lg">{block.text}</p>;
    case "quote":
      return (
        <blockquote className="my-6 flex gap-3 rounded-2xl border-l-2 border-primary/40 bg-card/40 p-5">
          <Quote className="h-5 w-5 shrink-0 text-primary-glow" />
          <p className="font-display text-lg font-medium italic text-foreground/90">{block.text}</p>
        </blockquote>
      );
    case "callout":
      return (
        <div className={`my-6 rounded-2xl border p-5 ${
          block.variant === "warning" 
            ? "border-amber-500/25 bg-amber-500/5 text-amber-200" 
            : block.variant === "tip" 
            ? "border-emerald-500/25 bg-emerald-500/5 text-emerald-200"
            : "border-primary/25 bg-primary/5 text-foreground"
        }`}>
          <div className="flex items-center gap-2 font-display font-semibold text-base mb-2">
            {block.variant === "warning" ? (
              <AlertCircle className="h-4 w-4 text-amber-400" />
            ) : block.variant === "tip" ? (
              <Sparkles className="h-4 w-4 text-emerald-400" />
            ) : (
              <Info className="h-4 w-4 text-primary-glow" />
            )}
            <span className="text-foreground">{block.title}</span>
          </div>
          <p className="text-sm sm:text-base leading-relaxed text-muted-foreground">{block.text}</p>
        </div>
      );
    case "stats_grid":
      return (
        <div className="my-8 grid gap-4 sm:grid-cols-3">
          {block.stats.map((s, idx) => (
            <div key={idx} className="rounded-2xl border border-white/10 bg-card/60 p-5 shadow-sm">
              <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{s.label}</div>
              <div className="mt-2 font-display text-3xl font-extrabold text-foreground">{s.value}</div>
              <div className="mt-1 text-xs text-muted-foreground">{s.desc}</div>
            </div>
          ))}
        </div>
      );
    case "table":
      return (
        <div className="my-8 overflow-x-auto rounded-2xl border border-white/10 bg-card/40">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-white/10 bg-card/80 text-xs uppercase tracking-wider text-foreground">
              <tr>
                {block.headers.map((h, i) => (
                  <th key={i} className="px-4 py-3.5 font-semibold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {block.rows.map((row, rIdx) => (
                <tr key={rIdx} className="hover:bg-white/[0.02] transition-colors">
                  {row.map((cell, cIdx) => (
                    <td key={cIdx} className="px-4 py-3 text-muted-foreground leading-normal">
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    case "list":
      return (
        <ul className="mt-4 space-y-2.5">
          {block.items.map((it, i) => (
            <li key={i} className="flex gap-3 text-muted-foreground text-base">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary-glow" />
              <span className="leading-relaxed">{it}</span>
            </li>
          ))}
        </ul>
      );
    case "steps":
      return (
        <ol className="mt-5 space-y-3.5">
          {block.items.map((it, i) => (
            <li key={i} className="flex gap-3 text-muted-foreground text-base">
              <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-gradient-primary text-xs font-bold text-primary-foreground">
                {i + 1}
              </span>
              <span className="leading-relaxed">{it}</span>
            </li>
          ))}
        </ol>
      );
    case "code":
      return (
        <div className="my-5 overflow-hidden rounded-2xl border border-white/10 bg-card/60">
          {block.label && (
            <div className="border-b border-white/5 px-4 py-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              {block.label}
            </div>
          )}
          <pre className="overflow-x-auto p-4 font-mono text-sm leading-relaxed text-foreground/90">
            {block.text}
          </pre>
        </div>
      );
    case "related_prompts":
      return (
        <div className="my-8 rounded-2xl border border-primary/20 bg-primary/5 p-6">
          <h3 className="mb-4 font-display text-lg font-bold text-primary-glow flex items-center gap-2">
            <ArrowRight className="h-5 w-5" /> Recommended Prompts
          </h3>
          <div className="flex flex-col gap-3">
            {block.prompts.map((p, i) => (
              <Link 
                key={i} 
                to={p.href}
                className="group flex flex-col gap-1 rounded-xl bg-card/60 p-4 transition-colors hover:bg-card border border-white/5 hover:border-primary/30"
              >
                <div className="font-semibold text-foreground group-hover:text-primary-glow transition-colors">{p.title}</div>
                <div className="text-sm text-muted-foreground">{p.description}</div>
              </Link>
            ))}
          </div>
        </div>
      );
    default:
      return null;
  }
}

export default function GuideDetail() {
  const { slug: rawSlug = "" } = useParams();
  const slug = GUIDE_SLUG_ALIASES[rawSlug.toLowerCase()] || rawSlug;
  const staticGuide = getGuide(slug);
  const [article, setArticle] = useState<Guide | null>(null);
  const [loading, setLoading] = useState(!staticGuide);

  // Articles published from the Admin Hub or via the MCP `publish_article`
  // tool live in the database and render with the same layout.
  useEffect(() => {
    if (staticGuide) return;
    let active = true;
    setLoading(true);
    fetchArticle(slug).then((row) => {
      if (!active) return;
      setArticle(row);
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, [slug, staticGuide]);

  const guide = staticGuide ?? article;

  if (!guide) {
    if (loading) {
      return (
        <Layout>
          <div className="container-tight py-24 text-center text-muted-foreground">Loading article…</div>
        </Layout>
      );
    }
    return (
      <Layout>
        <div className="container-tight py-24 text-center">
          <p className="text-muted-foreground">Guide not found.</p>
          <Button asChild variant="outline" className="mt-4 border-white/15">
            <Link to="/guides">Back to all guides</Link>
          </Button>
        </div>
      </Layout>
    );
  }

  const related = relatedGuides(slug);
  const url = `${SITE_URL}/guides/${guide.slug}`;
  // Only monetise genuinely long-form articles. Short guides stay ad-free so an
  // ad never sits on a thin page (AdSense "low value content" compliance).
  const adEligible = guide.blocks.length >= 8 && guide.readMinutes >= 5;
  // Insert one in-article ad roughly a third of the way down the body.
  const adIndex = adEligible
    ? Math.min(Math.max(Math.floor(guide.blocks.length / 3), 3), guide.blocks.length - 1)
    : -1;

  return (
    <Layout>
      <SEO
        title={guide.title}
        description={guide.description}
        canonical={`/guides/${guide.slug}`}
        type="article"
        jsonLd={[
          {
            "@context": "https://schema.org",
            "@type": "Article",
            headline: guide.title,
            description: guide.description,
            datePublished: guide.updated,
            dateModified: guide.updated,
            author: {
              "@type": "Organization",
              name: "Paste Prompts Editorial Team",
              url: `${SITE_URL}/editorial-standards`,
            },
            publisher: {
              "@type": "Organization",
              name: "Paste Prompts",
              url: SITE_URL,
              logo: {
                "@type": "ImageObject",
                url: `${SITE_URL}/favicon.svg`,
              },
            },
            mainEntityOfPage: url,
          },
          {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
              { "@type": "ListItem", position: 2, name: "Learn", item: `${SITE_URL}/guides` },
              { "@type": "ListItem", position: 3, name: guide.title, item: url },
            ],
          },
        ]}
      />

      <div className="container-tight py-10">
        <Breadcrumbs
          items={[
            { name: "Home", to: "/" },
            { name: "Guides", to: "/guides" },
            { name: guide.title },
          ]}
        />

        <Button asChild variant="ghost" size="sm" className="mb-6">
          <Link to="/guides"><ArrowLeft className="mr-1 h-4 w-4" /> All guides</Link>
        </Button>

        <motion.article
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header */}
          <div className="mb-3 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            <Badge className="bg-gradient-primary">{guide.category}</Badge>
            <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {guide.readMinutes} min read</span>
            <span>Updated {new Date(guide.updated).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}</span>
            <span className="inline-flex items-center gap-1.5 font-medium text-foreground/85">
              <span className="h-1.5 w-1.5 rounded-full bg-primary-glow" />
              By Paste Prompts Editorial Team
            </span>
          </div>
          <h1 className="font-display text-3xl font-bold leading-tight sm:text-4xl">{guide.title}</h1>
          <p className="mt-4 text-lg leading-relaxed text-muted-foreground">{guide.intro}</p>

          <div className="my-8 h-px bg-white/5" />

          {/* Body */}
          <div>
            {guide.blocks.map((b, i) => (
              <div key={i}>
                <Block block={b} />
                {i === adIndex && (
                  <AdSlot slot={AD_SLOTS.inArticle} format="fluid" layout="in-article" className="my-8" />
                )}
              </div>
            ))}
          </div>

          {/* Takeaways */}
          <div className="mt-12 rounded-2xl glass-strong p-6">
            <h2 className="font-display text-xl font-bold">Key takeaways</h2>
            <ul className="mt-4 space-y-2.5">
              {guide.takeaways.map((t, i) => (
                <li key={i} className="flex gap-2.5 text-sm text-muted-foreground">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                  <span className="leading-relaxed">{t}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Author Box & Editorial Credentials */}
          <div className="mt-8 rounded-2xl glass p-6 border border-white/10">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-gradient-primary grid place-items-center font-display font-bold text-lg text-primary-foreground shrink-0 shadow-md">
                PP
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-display text-base font-bold text-foreground">Paste Prompts Editorial Team</h3>
                  <Badge variant="outline" className="text-[11px] border-primary/30 text-primary-glow">Verified Prompt Engineers</Badge>
                </div>
                <p className="mt-1 text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  Written, benchmarked, and reviewed by senior AI prompt specialists across ChatGPT (GPT-4o), Claude 3.7 Sonnet, and Google Gemini. Adheres to our strict{" "}
                  <Link to="/editorial-standards" className="text-primary-glow underline hover:text-primary">
                    Editorial Standards & Fact-Checking Guidelines
                  </Link>.
                </p>
              </div>
            </div>
          </div>

          {/* Inline CTA */}
          <div className="mt-8 flex flex-col items-start gap-3 rounded-2xl bg-gradient-glow p-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-display text-lg font-semibold">Put these techniques to work</p>
              <p className="text-sm text-muted-foreground">Browse hundreds of tested prompts — many free.</p>
            </div>
            <Button asChild className="bg-gradient-primary btn-glow">
              <Link to="/browse">Browse prompts <ArrowRight className="ml-1 h-4 w-4" /></Link>
            </Button>
          </div>
        </motion.article>

        {/* Related */}
        {related.length > 0 && (
          <section className="mt-16">
            <h2 className="mb-6 font-display text-2xl font-bold">Keep reading</h2>
            <div className="grid gap-5 sm:grid-cols-3">
              {related.map((g) => (
                <Link key={g.slug} to={`/guides/${g.slug}`} className="card-hover flex h-full flex-col rounded-2xl glass p-5">
                  <div className="mb-3 grid h-10 w-10 place-items-center rounded-xl bg-gradient-glow text-xl">{g.emoji}</div>
                  <span className="text-xs font-medium text-primary-glow">{g.category}</span>
                  <h3 className="mt-1 font-display text-base font-semibold leading-snug">{g.title}</h3>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </Layout>
  );
}
