import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import { useState, type ReactNode } from "react";
import {
  ArrowRight, Search, Gift, Lock, Sparkles, Bookmark, UserPlus, Upload,
  Copy, FileText, Flame, Clock, Star, Layers, Banknote, Play, Briefcase, PenTool, Zap,
  Code, Paintbrush, Megaphone, Image as ImageIcon, type LucideIcon,
} from "lucide-react";

const CATEGORY_ICONS: Record<string, LucideIcon> = {
  banknote: Banknote, play: Play, briefcase: Briefcase, "pen-tool": PenTool, zap: Zap,
  sparkles: Sparkles, code: Code, paintbrush: Paintbrush, megaphone: Megaphone, image: ImageIcon,
};
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/layout/Layout";
import { SEO } from "@/components/SEO";
import { PromptCard, type PromptCardData } from "@/components/PromptCard";
import { fetchPrompts, fetchCategories, fetchCategoryCounts, PROMPT_CARD_SELECT } from "@/lib/queries";
import { supabase } from "@/integrations/supabase/client";
import { formatPrice } from "@/lib/format";
import { useAuth } from "@/contexts/AuthContext";

const faqs = [
  { q: "Is Paste Prompts free to use?", a: "Yes. Creating an account is free, and free prompts can be copied without paying anything." },
  { q: "How much do paid prompts cost?", a: "Paid prompts are 49p each, paid securely through Stripe checkout." },
  { q: "Which AI models do these prompts work with?", a: "Each listing shows the model it was written for, such as ChatGPT, Claude, Gemini, Midjourney or Flux." },
  { q: "Can I sell my own prompts?", a: "Yes. Create a free account, open the Sell page and upload your prompt. Listings are reviewed before they appear." },
];

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
};

type Card = PromptCardData;

function SectionHeader({ icon, title, subtitle, href }: { icon: ReactNode; title: string; subtitle: string; href?: string }) {
  return (
    <div className="mb-5 flex items-end justify-between gap-4">
      <div>
        <h2 className="flex items-center gap-2 font-display text-xl font-bold text-foreground sm:text-2xl">
          <span className="text-primary-glow">{icon}</span>{title}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
      </div>
      {href && (
        <Link to={href} className="flex shrink-0 items-center gap-1 text-sm font-semibold text-primary-glow hover:text-foreground">
          View all <ArrowRight className="h-4 w-4" />
        </Link>
      )}
    </div>
  );
}

function PromptRow({ items, loading }: { items?: Card[]; loading: boolean }) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[0, 1, 2, 3].map((i) => <div key={i} className="h-72 animate-pulse rounded-2xl bg-muted/30" />)}
      </div>
    );
  }
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {(items ?? []).map((p, i) => <PromptCard key={p.id} prompt={p} index={i} />)}
    </div>
  );
}

const hrefFor = (p: Card) => `/prompt/${p.slug}`;

export default function Index() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  const { data: promptCount } = useQuery({
    queryKey: ["home-stats"],
    queryFn: async () => {
      const { count } = await supabase.from("prompts").select("id", { count: "exact", head: true }).eq("status", "approved");
      return count ?? 0;
    },
  });
  const trending = useQuery({ queryKey: ["home-trending"], queryFn: () => fetchPrompts({ sort: "trending", limit: 8 }) });
  const recent = useQuery({ queryKey: ["home-recent"], queryFn: () => fetchPrompts({ sort: "newest", limit: 4 }) });
  const free = useQuery({ queryKey: ["home-free"], queryFn: () => fetchPrompts({ price: "free", sort: "popular", limit: 4 }) });
  const featured = useQuery({
    queryKey: ["home-featured"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("prompts").select(PROMPT_CARD_SELECT)
        .eq("status", "approved").eq("featured", true)
        .order("trending_score", { ascending: false }).limit(4);
      if (error) throw error;
      return data ?? [];
    },
  });
  const { data: categories = [] } = useQuery({ queryKey: ["categories"], queryFn: fetchCategories });
  const { data: catCounts = {} } = useQuery({ queryKey: ["home-cat-counts"], queryFn: () => fetchCategoryCounts() });
  const { data: creators = [] } = useQuery({
    queryKey: ["home-creators"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles").select("id, handle, display_name, avatar_url, total_sales")
        .eq("is_creator", true).not("handle", "is", null)
        .order("total_sales", { ascending: false }).limit(6);
      if (error) throw error;
      return data ?? [];
    },
  });

  const trendingCards = (trending.data ?? []) as unknown as Card[];
  const heroCards = trendingCards.slice(0, 3);
  const trendingIds = new Set(trendingCards.slice(0, 4).map((p) => p.id));
  const featuredCards = ((featured.data ?? []) as unknown as Card[]).filter((p) => !trendingIds.has(p.id));
  const topCategories = categories
    .map((c) => ({ ...c, count: catCounts[c.id] ?? 0 }))
    .filter((c) => c.count > 0)
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchQuery.trim();
    navigate(q ? `/browse?q=${encodeURIComponent(q)}` : "/browse");
  };

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Paste Prompts",
    "url": "https://pasteprompts.co.uk",
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": "https://pasteprompts.co.uk/browse?q={search_term_string}",
      },
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <Layout>
      <SEO
        title="AI Prompts & ChatGPT Prompts Marketplace | Paste Prompts"
        description="Discover AI prompts & ChatGPT prompts. Copy and paste free & 49p prompts for ChatGPT, Claude, Gemini, Midjourney & Flux. Buy or sell prompts on Paste Prompts."
        canonical="/"
        jsonLd={[faqSchema, websiteSchema]}
      />

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border/50">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_left,hsl(var(--primary)/0.18),transparent_60%)]" />
        <div className="container-wide grid items-center gap-10 py-10 lg:grid-cols-12 lg:py-16">
          <div className="min-w-0 lg:col-span-7">
            <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary-glow">
              <Sparkles className="h-3.5 w-3.5" /> The AI prompt marketplace
            </p>
            <h1 className="font-display text-4xl font-bold leading-[1.08] tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              Free &amp; 49p <span className="text-primary-glow">AI Prompts</span> for ChatGPT, Claude &amp; Gemini.
            </h1>
            <p className="mt-4 max-w-xl text-base text-muted-foreground sm:text-lg">
              Copy and paste high-performing AI prompts &amp; ChatGPT prompts for copywriting, coding, marketing, and business. Free or just 49p.
            </p>

            <form onSubmit={handleSearch} role="search" className="mt-6 flex max-w-xl items-center gap-2 rounded-2xl border border-border bg-card p-1.5 shadow-lg focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20">
              <Search className="ml-3 h-5 w-5 shrink-0 text-muted-foreground" aria-hidden />
              <label htmlFor="home-search" className="sr-only">Search prompts</label>
              <input
                id="home-search"
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search prompts, e.g. logo design, cold email"
                className="min-w-0 flex-1 bg-transparent px-2 py-2.5 text-base text-foreground placeholder:text-muted-foreground/70 focus:outline-hidden"
              />
              <Button type="submit" className="h-11 shrink-0 rounded-xl px-5 font-semibold">Search</Button>
            </form>

            <div className="mt-5 flex flex-wrap gap-3">
              <Button asChild size="lg" className="h-12 rounded-xl px-6 font-semibold">
                <Link to="/browse">Browse prompts <ArrowRight className="ml-1 h-4 w-4" /></Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="h-12 rounded-xl px-6 font-semibold">
                {user ? <Link to="/sell">Start selling</Link> : <Link to="/auth">Create free account</Link>}
              </Button>
            </div>

            <ul className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">
              {promptCount ? <li className="flex items-center gap-1.5"><Layers className="h-4 w-4 text-primary-glow" />{promptCount.toLocaleString("en-GB")} prompts listed</li> : null}
              <li className="flex items-center gap-1.5"><Gift className="h-4 w-4 text-primary-glow" />Free account</li>
              <li className="flex items-center gap-1.5"><Lock className="h-4 w-4 text-primary-glow" />Secure Stripe checkout</li>
            </ul>
          </div>

          {heroCards.length > 0 && (
            <div className="hidden min-w-0 lg:col-span-5 lg:block">
              <div className="space-y-3">
                {heroCards.map((p, i) => (
                  <Link
                    key={p.id}
                    to={hrefFor(p)}
                    className={`group flex items-center gap-4 rounded-2xl border border-border bg-card/80 p-3 backdrop-blur transition-all hover:-translate-y-0.5 hover:border-primary/40 ${i === 1 ? "lg:ml-8" : ""}`}
                  >
                    {p.image_url ? (
                      <img src={p.image_url} alt={`${p.title} AI prompt preview`} referrerPolicy="no-referrer" className="h-20 w-20 shrink-0 rounded-xl object-cover" />
                    ) : (
                      <span className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl bg-muted/40 text-primary-glow"><FileText className="h-7 w-7" /></span>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium text-primary-glow">{p.category?.name ?? "Prompt"}</p>
                      <h3 className="line-clamp-2 font-display text-sm font-semibold text-foreground group-hover:text-primary-glow">{p.title}</h3>
                      <div className="mt-1 flex items-center justify-between text-xs text-muted-foreground">
                        <span className="truncate">{p.creator?.display_name || p.creator?.handle || ""}</span>
                        <span className="font-semibold text-foreground">{p.is_free ? "Free" : formatPrice(p.price_pence)}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Trending */}
      <section className="container-wide py-10" aria-labelledby="trending">
        <SectionHeader icon={<Flame className="h-5 w-5" />} title="Trending prompts" subtitle="What people are opening and copying right now" href="/browse?sort=trending" />
        {!trending.isLoading && trendingCards.length === 0 ? (
          <div className="rounded-2xl border border-border bg-card p-8 text-center text-muted-foreground">
            No prompts are listed yet. <Link to="/sell" className="font-semibold text-primary-glow">Be the first to sell one</Link>.
          </div>
        ) : (
          <PromptRow items={trendingCards.slice(0, 4)} loading={trending.isLoading} />
        )}
      </section>

      {/* Categories */}
      {topCategories.length > 0 && (
        <section id="categories" className="container-wide scroll-mt-24 py-10">
          <SectionHeader icon={<Layers className="h-5 w-5" />} title="Popular categories" subtitle="Jump straight to the kind of prompt you need" href="/browse" />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {topCategories.map((c) => (
              <Link key={c.id} to={`/category/${c.slug}`} className="group flex items-center gap-3 rounded-2xl border border-border bg-card p-4 transition-all hover:border-primary/40 hover:bg-muted/20">
                {(() => { const I = CATEGORY_ICONS[c.icon ?? ""] ?? Layers; return (
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary-glow"><I className="h-5 w-5" aria-hidden /></span>
                ); })()}
                <span className="min-w-0">
                  <span className="block truncate font-display font-semibold text-foreground group-hover:text-primary-glow">{c.name}</span>
                  <span className="text-xs text-muted-foreground">{c.count.toLocaleString("en-GB")} prompt{c.count === 1 ? "" : "s"}</span>
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Featured */}
      {featuredCards.length > 0 && (
        <section className="container-wide py-10">
          <SectionHeader icon={<Star className="h-5 w-5" />} title="Featured prompts" subtitle="Hand-picked by the Paste Prompts team" />
          <PromptRow items={featuredCards.slice(0, 4)} loading={false} />
        </section>
      )}

      {/* Recent */}
      {(recent.data?.length ?? 0) > 0 && (
        <section className="container-wide py-10">
          <SectionHeader icon={<Clock className="h-5 w-5" />} title="Recently added" subtitle="Fresh prompts from our creators" href="/browse?sort=newest" />
          <PromptRow items={recent.data as unknown as Card[]} loading={false} />
        </section>
      )}

      {/* Sign-up band */}
      {!user && (
        <section className="container-wide py-10">
          <div className="grid gap-6 rounded-3xl border border-primary/25 bg-card p-6 md:grid-cols-2 md:p-10">
            <div>
              <h2 className="font-display text-2xl font-bold text-foreground sm:text-3xl">Join free and keep the prompts you love</h2>
              <p className="mt-2 text-muted-foreground">No subscription needed to get started.</p>
              <Button asChild size="lg" className="mt-5 h-12 rounded-xl px-6 font-semibold">
                <Link to="/auth">Create free account</Link>
              </Button>
            </div>
            <ul className="space-y-3 text-sm">
              {[
                { icon: Copy, t: "Copy free prompts without limits" },
                { icon: Bookmark, t: "Save prompts to your library" },
                { icon: UserPlus, t: "Follow creators you like" },
                { icon: Upload, t: "Upload and sell your own prompts" },
              ].map(({ icon: I, t }) => (
                <li key={t} className="flex items-center gap-3 text-foreground/90">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary-glow"><I className="h-4 w-4" /></span>{t}
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* Free */}
      {(free.data?.length ?? 0) > 0 && (
        <section className="container-wide py-10">
          <SectionHeader icon={<Gift className="h-5 w-5" />} title="Free prompts" subtitle="Try these without spending a penny" href="/browse?price=free" />
          <PromptRow items={free.data as unknown as Card[]} loading={false} />
        </section>
      )}

      {/* Creators */}
      <section className="container-wide py-10">
        {creators.length >= 3 ? (
          <>
            <SectionHeader icon={<UserPlus className="h-5 w-5" />} title="Meet the creators" subtitle="The people writing the prompts" href="/creators" />
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
              {creators.map((c) => {
                const name = c.display_name || c.handle;
                return (
                  <Link key={c.id} to={`/creators/${c.handle}`} className="group flex flex-col items-center rounded-2xl border border-border bg-card p-4 text-center transition-all hover:border-primary/40">
                    {c.avatar_url ? (
                      <img src={c.avatar_url} alt={`${name ?? "Paste Prompts creator"} profile picture`} loading="lazy" referrerPolicy="no-referrer" className="h-16 w-16 rounded-full object-cover" />
                    ) : (
                      <span className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/15 font-display text-xl font-bold text-primary-glow">{(name ?? "?").slice(0, 1).toUpperCase()}</span>
                    )}
                    <span className="mt-3 w-full truncate font-semibold text-foreground group-hover:text-primary-glow">{name}</span>
                    <span className="text-xs text-muted-foreground">
                      {(c.total_sales ?? 0) > 0 ? `${c.total_sales} sale${c.total_sales === 1 ? "" : "s"}` : `@${c.handle}`}
                    </span>
                  </Link>
                );
              })}
            </div>
          </>
        ) : null}
        <div className="mt-6 flex flex-col items-start justify-between gap-4 rounded-3xl border border-border bg-card p-6 sm:flex-row sm:items-center md:p-8">
          <div>
            <h2 className="font-display text-xl font-bold text-foreground sm:text-2xl">Good at writing prompts?</h2>
            <p className="mt-1 text-muted-foreground">List them on Paste Prompts and earn from every sale.</p>
          </div>
          <Button asChild size="lg" className="h-12 rounded-xl px-6 font-semibold">
            <Link to="/sell">Start selling <ArrowRight className="ml-1 h-4 w-4" /></Link>
          </Button>
        </div>
      </section>

      {/* Semantic Keyword SEO Block */}
      <section className="container-wide border-t border-border/50 py-12">
        <div className="mx-auto max-w-4xl space-y-6 text-left">
          <h2 className="font-display text-2xl font-bold text-foreground sm:text-3xl">
            Copy and Paste AI Prompts That Work
          </h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Paste Prompts is the dedicated marketplace for high-performance <strong className="text-foreground">AI prompts</strong> and <strong className="text-foreground">ChatGPT prompts</strong>. Whether you need copywriting frameworks, coding helpers, business strategy blueprints, or image generation formulas for Midjourney and Flux, our prompt library delivers copy-and-paste ready instructions tested for immediate execution.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
            <div className="rounded-2xl border border-white/10 bg-card/40 p-5">
              <h3 className="font-display font-bold text-foreground text-base mb-2">
                ChatGPT &amp; Claude Prompts
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Explore thousands of parameterised <Link to="/prompts/chatgpt-prompts" className="text-primary-glow hover:underline">ChatGPT prompts</Link> and <Link to="/prompts/claude-prompts" className="text-primary-glow hover:underline">Claude AI prompts</Link> built with explicit variable brackets. Eliminate conversational fluff and unlock deterministic output across GPT-4o, Claude 3.7 Sonnet, and Gemini 2.5.
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-card/40 p-5">
              <h3 className="font-display font-bold text-foreground text-base mb-2">
                Free &amp; 49p Marketplace
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Access hundreds of <Link to="/prompts/free-ai-prompts" className="text-primary-glow hover:underline">free AI prompts</Link> or premium 49p prompt packs created by verified prompt engineers. Save your favourite prompts into your personal library or <Link to="/sell" className="text-primary-glow hover:underline">sell your own prompts</Link> on our open creator platform.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="how-it-works" className="container-wide scroll-mt-24 border-t border-border/50 py-12">
        <h2 className="mb-6 text-center font-display text-2xl font-bold text-foreground sm:text-3xl">Frequently asked questions</h2>
        <div className="mx-auto grid max-w-4xl gap-4 sm:grid-cols-2">
          {faqs.map((f) => (
            <div key={f.q} className="rounded-2xl border border-border bg-card p-5">
              <h3 className="font-display font-semibold text-foreground">{f.q}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.a}</p>
            </div>
          ))}
        </div>
      </section>
    </Layout>
  );
}
