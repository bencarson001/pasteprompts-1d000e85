import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Sparkles } from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { SEO } from "@/components/SEO";
import { PromptGrid } from "@/components/PromptGrid";
import NotFound from "@/pages/NotFound";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { fetchPrompts } from "@/lib/queries";
import { getLandingContent, LANDING_PAGES } from "@/lib/landingContent";

const SITE_URL = "https://pasteprompts.co.uk";

export default function Landing() {
  const { slug = "" } = useParams();
  const content = getLandingContent(slug);

  const { data: prompts, isLoading } = useQuery({
    queryKey: ["landing-prompts", slug],
    enabled: !!content,
    queryFn: () => fetchPrompts(content!.filters),
  });

  if (!content) return <NotFound />;

  const promptList = prompts ?? [];
  const related = (content.related ?? [])
    .map((s) => LANDING_PAGES[s])
    .filter(Boolean);

  const jsonLd: Record<string, unknown>[] = [
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
        { "@type": "ListItem", position: 2, name: "Browse", item: `${SITE_URL}/browse` },
        { "@type": "ListItem", position: 3, name: content.title, item: `${SITE_URL}/prompts/${slug}` },
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: content.faqs.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    },
    {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: content.heading,
      description: content.metaDescription,
      url: `${SITE_URL}/prompts/${slug}`,
    },
  ];

  if (promptList.length) {
    jsonLd.push({
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: content.title,
      itemListElement: promptList.slice(0, 20).map((p, i) => ({
        "@type": "ListItem",
        position: i + 1,
        url: `${SITE_URL}/prompt/${(p as { slug: string }).slug}`,
        name: (p as { title: string }).title,
      })),
    });
  }

  return (
    <Layout>
      <SEO
        title={content.title}
        description={content.metaDescription}
        canonical={`/prompts/${slug}`}
        jsonLd={jsonLd}
      />
      <div className="container-wide py-10">
        <nav className="mb-4 text-sm text-muted-foreground">
          <Link to="/" className="hover:text-foreground">Home</Link> /{" "}
          <Link to="/browse" className="hover:text-foreground">Browse</Link> /{" "}
          <span className="text-foreground">{content.title}</span>
        </nav>

        <header className="mb-8 max-w-2xl">
          <h1 className="font-display text-3xl font-bold sm:text-4xl">{content.heading}</h1>
          <p className="mt-3 text-muted-foreground">{content.lead}</p>
        </header>

        <PromptGrid prompts={promptList as never} loading={isLoading} emptyMessage="No prompts here yet — check back soon." />

        <section className="mt-16 max-w-3xl space-y-10">
          {content.sections.map((s) => (
            <div key={s.h2}>
              <h2 className="mb-3 font-display text-2xl font-bold">{s.h2}</h2>
              <div className="space-y-4 text-muted-foreground">
                {s.paragraphs.map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
            </div>
          ))}

          <div className="flex flex-wrap gap-3 pt-2">
            <Link
              to="/browse?price=free"
              className="rounded-xl bg-gradient-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground btn-glow"
            >
              Browse free prompts
            </Link>
            <Link
              to="/guides"
              className="rounded-xl border border-white/15 px-5 py-2.5 text-sm font-semibold hover:bg-card"
            >
              Learn prompt engineering
            </Link>
          </div>
        </section>

        {related.length > 0 && (
          <section className="mt-16 max-w-3xl">
            <h2 className="mb-4 font-display text-2xl font-bold">Explore more prompts</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {related.map((r) => (
                <Link
                  key={r.slug}
                  to={`/prompts/${r.slug}`}
                  className="group flex items-center justify-between rounded-2xl glass px-5 py-4 transition-colors hover:bg-card"
                >
                  <span className="flex items-center gap-2 font-medium">
                    <Sparkles className="h-4 w-4 text-primary-glow" />
                    {r.heading}
                  </span>
                  <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
                </Link>
              ))}
            </div>
          </section>
        )}

        <section className="mt-16 max-w-3xl">
          <h2 className="mb-4 font-display text-2xl font-bold">Frequently asked questions</h2>
          <Accordion type="single" collapsible className="rounded-2xl glass px-5">
            {content.faqs.map((f, i) => (
              <AccordionItem key={i} value={`item-${i}`} className="border-white/5">
                <AccordionTrigger className="text-left">{f.q}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">{f.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>
      </div>
    </Layout>
  );
}
