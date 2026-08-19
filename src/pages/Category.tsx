import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Layout } from "@/components/layout/Layout";
import { SEO } from "@/components/SEO";
import { PromptGrid } from "@/components/PromptGrid";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { ArrowRight, Sparkles } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { fetchPrompts, fetchCategoryBySlug, fetchCategories } from "@/lib/queries";
import { getCategoryContent } from "@/lib/categoryContent";

const SITE_URL = "https://pasteprompts.co.uk";

const DEFAULT_FAQ = [
  { q: "Are these prompts ready to use?", a: "Yes. Every prompt is parameterised and copy-paste ready. Buy once, fill in your details, and run it in your AI tool of choice." },
  { q: "Which AI models do these work with?", a: "Prompts are tagged by their recommended model — ChatGPT, Claude, Gemini, Midjourney and more — but most work across modern LLMs." },
  { q: "Do I get free updates?", a: "When a creator improves a prompt you own, the updated version appears in your library automatically." },
];

export default function Category() {
  const { slug = "" } = useParams();
  const { data: category } = useQuery({ queryKey: ["category", slug], queryFn: () => fetchCategoryBySlug(slug) });
  const { data: prompts, isLoading } = useQuery({
    queryKey: ["category-prompts", slug],
    queryFn: () => fetchPrompts({ categorySlug: slug, sort: "trending", limit: 48 }),
  });
  const { data: allCategories } = useQuery({ queryKey: ["categories"], queryFn: fetchCategories });
  const relatedCategories = (allCategories ?? [])
    .filter((c) => c.slug !== slug)
    .slice(0, 6);

  const content = getCategoryContent(slug);
  const name = category?.name ?? slug;
  const faqs = content?.faqs ?? DEFAULT_FAQ;

  const heading = content?.title ?? `${name} prompts`;
  const lead =
    content?.lead ??
    category?.description ??
    `Browse our curated collection of ${name.toLowerCase()} prompts. Each one is engineered for real-world results — parameterised, tested, and ready to paste straight into your favourite AI model.`;

  const seoTitle = content?.title ?? `${name} prompts`;
  const seoDescription =
    content?.metaDescription ??
    category?.description ??
    `Discover high-performing ${name} AI prompts — vetted, parameterised and ready to copy and paste.`;

  const promptList = prompts ?? [];

  const jsonLd: Record<string, unknown>[] = [
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
        { "@type": "ListItem", position: 2, name: "Browse", item: `${SITE_URL}/browse` },
        { "@type": "ListItem", position: 3, name, item: `${SITE_URL}/category/${slug}` },
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faqs.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    },
  ];

  if (promptList.length) {
    jsonLd.push({
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: `${name} AI prompts`,
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
        title={seoTitle}
        description={seoDescription}
        canonical={`/category/${slug}`}
        jsonLd={jsonLd}
      />
      <div className="container-wide py-10">
        <Breadcrumbs
          items={[
            { name: "Home", to: "/" },
            { name: "Browse", to: "/browse" },
            { name },
          ]}
        />

        <header className="mb-8 max-w-2xl">
          <h1 className="font-display text-3xl font-bold sm:text-4xl">{heading}</h1>
          <p className="mt-3 text-muted-foreground">{lead}</p>
        </header>

        <PromptGrid prompts={promptList as never} loading={isLoading} emptyMessage="No prompts in this category yet." />

        {content && (
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
                to={`/browse?price=free&category=${slug}`}
                className="rounded-xl bg-gradient-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground btn-glow"
              >
                Browse free {name} prompts
              </Link>
              <Link
                to="/guides"
                className="rounded-xl border border-white/15 px-5 py-2.5 text-sm font-semibold hover:bg-card"
              >
                Learn prompt engineering
              </Link>
            </div>
          </section>
        )}

        {relatedCategories.length > 0 && (
          <section className="mt-16">
            <div className="mb-6 flex items-end justify-between gap-4">
              <div>
                <h2 className="font-display text-2xl font-bold">Explore related categories</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Keep browsing — every category is packed with copy-ready AI prompts.
                </p>
              </div>
              <Link
                to="/browse"
                className="hidden shrink-0 rounded-xl border border-white/15 px-4 py-2 text-sm font-medium hover:bg-card sm:inline-block"
              >
                See all categories →
              </Link>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {relatedCategories.map((c) => (
                <Link
                  key={c.slug}
                  to={`/category/${c.slug}`}
                  className="card-hover group flex items-center justify-between rounded-2xl glass p-5"
                >
                  <span className="flex items-center gap-2 font-medium">
                    <Sparkles className="h-4 w-4 text-primary-glow" />
                    {c.name} prompts
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
            {faqs.map((f, i) => (
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
