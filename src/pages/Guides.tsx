import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, BookOpen, Clock, GraduationCap } from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { GUIDES, type Guide } from "@/lib/guides";
import { fetchPublishedArticles } from "@/lib/articles";

const SITE_URL = "https://pasteprompts.co.uk";

export default function Guides() {
  const [articles, setArticles] = useState<Guide[]>([]);

  useEffect(() => {
    let active = true;
    fetchPublishedArticles().then((rows) => {
      if (active) setArticles(rows);
    });
    return () => {
      active = false;
    };
  }, []);

  // Newest published articles sit alongside the hand-written evergreen guides.
  const all: Guide[] = [...articles, ...GUIDES];
  const [featured, ...rest] = all;
  const categories = Array.from(new Set(all.map((g) => g.category)));

  return (
    <Layout>
      <SEO
        title="Learn AI prompting — free guides & prompt engineering tips"
        description="Free, in-depth guides to prompt engineering: how to write effective AI prompts, compare ChatGPT, Claude & Gemini, and get better results from AI."
        canonical="/guides"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "Blog",
          name: "Paste Prompts Learn",
          description:
            "In-depth guides to prompt engineering and getting better results from AI.",
          url: `${SITE_URL}/guides`,
          blogPost: all.map((g) => ({
            "@type": "BlogPosting",
            headline: g.title,
            description: g.description,
            url: `${SITE_URL}/guides/${g.slug}`,
            datePublished: g.updated,
            dateModified: g.updated,
          })),
        }}
      />

      <div className="container-wide py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-2xl"
        >
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-card/60 px-4 py-1.5 text-xs font-medium text-muted-foreground">
            <GraduationCap className="h-3.5 w-3.5 text-primary-glow" /> The Paste Prompts Learn hub
          </div>
          <h1 className="font-display text-4xl font-bold leading-tight sm:text-5xl">
            Learn to get <span className="text-gradient">better results</span> from AI
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Free, in-depth guides to prompt engineering — written for beginners and power users alike.
            No fluff, no hype: just practical techniques you can use today.
          </p>
        </motion.div>

        {/* Category pills */}
        <div className="mt-8 flex flex-wrap gap-2">
          {categories.map((c) => (
            <Badge key={c} variant="outline" className="border-white/10 text-muted-foreground">
              {c}
            </Badge>
          ))}
        </div>

        {/* Featured */}
        {featured && (
          <Link to={`/guides/${featured.slug}`} className="mt-10 block">
            <motion.article
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="card-hover grid gap-6 overflow-hidden rounded-3xl glass-strong p-8 md:grid-cols-[auto_1fr] md:items-center"
            >
              <div className="grid h-20 w-20 place-items-center rounded-2xl bg-gradient-glow text-4xl">
                {featured.emoji}
              </div>
              <div>
                <div className="mb-2 flex items-center gap-3 text-xs text-muted-foreground">
                  <Badge className="bg-gradient-primary">{featured.category}</Badge>
                  <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {featured.readMinutes} min read</span>
                </div>
                <h2 className="font-display text-2xl font-bold sm:text-3xl">{featured.title}</h2>
                <p className="mt-2 text-muted-foreground">{featured.description}</p>
                <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary-glow">
                  Read the guide<span className="sr-only">: {featured.title}</span> <ArrowRight className="h-4 w-4" />
                </span>
              </div>
            </motion.article>
          </Link>
        )}

        {/* Grid */}
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {rest.map((g, i) => (
            <motion.div
              key={g.slug}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.05 * i }}
            >
              <Link to={`/guides/${g.slug}`} className="card-hover flex h-full flex-col rounded-2xl glass p-6">
                <div className="mb-4 grid h-12 w-12 place-items-center rounded-xl bg-gradient-glow text-2xl">
                  {g.emoji}
                </div>
                <div className="mb-2 flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="font-medium text-primary-glow">{g.category}</span>
                  <span>·</span>
                  <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {g.readMinutes} min</span>
                </div>
                <h3 className="font-display text-lg font-semibold leading-snug">{g.title}</h3>
                <p className="mt-2 flex-1 text-sm text-muted-foreground">{g.description}</p>
                <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-foreground">
                  Read more<span className="sr-only"> the {g.title} guide</span> <ArrowRight className="h-3.5 w-3.5" />
                </span>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-16 rounded-3xl glass-strong p-10 text-center">
          <BookOpen className="mx-auto mb-3 h-8 w-8 text-primary-glow" />
          <h2 className="font-display text-2xl font-bold sm:text-3xl">Ready to put this into practice?</h2>
          <p className="mx-auto mt-2 max-w-xl text-muted-foreground">
            Browse hundreds of tested, ready-to-use prompts built on exactly these techniques —
            many of them completely free.
          </p>
          <Button asChild size="lg" className="mt-6 bg-gradient-primary btn-glow">
            <Link to="/browse">Browse prompts <ArrowRight className="ml-1 h-4 w-4" /></Link>
          </Button>
        </div>
      </div>
    </Layout>
  );
}
