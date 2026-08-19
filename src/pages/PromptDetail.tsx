import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  Star, ShoppingBag, Copy, Check, Lock, Bookmark, Eye, ArrowLeft, Loader2, Play, Sparkles, HelpCircle, ExternalLink,
} from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { SEO } from "@/components/SEO";
import { PromptGrid } from "@/components/PromptGrid";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { fetchPromptBySlug, fetchRelatedPrompts, fetchReviews } from "@/lib/queries";
import { formatPrice, formatCount, MODEL_LABELS, timeAgo } from "@/lib/format";
import { useStripeCheckout } from "@/hooks/useStripeCheckout";
import { trackPromptView } from "@/lib/analytics";
import { ShareButtons } from "@/components/ShareButtons";
import { ShareEncouragement } from "@/components/ShareEncouragement";
import { SignUpGate } from "@/components/SignUpGate";
import { hasReachedFreeLimit, incrementFreeCopies } from "@/lib/copyGate";
import { PromptVariableCustomizer } from "@/components/PromptVariableCustomizer";
import { ModelCompatibilityBadge } from "@/components/ModelCompatibilityBadge";

const SITE_URL = "https://pasteprompts.co.uk";

export default function PromptDetail() {
  const { slug = "", category: categorySlug = "" } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const qc = useQueryClient();
  const { openCheckout, checkoutElement, isOpen } = useStripeCheckout();
  const [copied, setCopied] = useState(false);
  const [claiming, setClaiming] = useState(false);
  const [gateOpen, setGateOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);

  const currentPath = categorySlug ? `/prompt/${categorySlug}/${slug}` : `/prompt/${slug}`;

  const { data: prompt, isLoading } = useQuery({ queryKey: ["prompt", slug], queryFn: () => fetchPromptBySlug(slug) });

  const { data: owned } = useQuery({
    queryKey: ["owned", prompt?.id, user?.id],
    enabled: !!prompt?.id && !!user?.id,
    queryFn: async () => {
      const { data } = await supabase
        .from("purchases").select("id").eq("prompt_id", prompt!.id).eq("buyer_id", user!.id).maybeSingle();
      return !!data;
    },
  });

  const hasAccess = !!prompt && (prompt.is_free || owned || prompt.creator_id === user?.id);

  const { data: body } = useQuery({
    queryKey: ["body", prompt?.id, hasAccess],
    enabled: !!prompt?.id && hasAccess,
    queryFn: async () => {
      const { data } = await supabase.rpc("get_prompt_body", { _prompt_id: prompt!.id });
      return data as string | null;
    },
  });

  const { data: related } = useQuery({
    queryKey: ["related", prompt?.id],
    enabled: !!prompt,
    queryFn: () => fetchRelatedPrompts((prompt as never as { category_id?: string }).category_id ?? "", prompt!.id),
  });

  const { data: reviews } = useQuery({ queryKey: ["reviews", prompt?.id], enabled: !!prompt?.id, queryFn: () => fetchReviews(prompt!.id) });

  const { data: tryEnabled } = useQuery({
    queryKey: ["flag", "ai_try_sandbox"],
    queryFn: async () => {
      const { data } = await supabase.from("feature_flags").select("enabled").eq("key", "ai_try_sandbox").maybeSingle();
      return data ? !!data.enabled : false;
    },
  });

  useEffect(() => {
    if (prompt?.id) {
      supabase.rpc("increment_prompt_views", { _prompt_id: prompt.id });
      trackPromptView(prompt.id, currentPath);
    }
  }, [prompt?.id, currentPath]);

  if (!isLoading && !prompt) {
    return <Layout><div className="container-wide py-24 text-center text-muted-foreground">Prompt not found.</div></Layout>;
  }
  if (isLoading || !prompt) {
    return <Layout><div className="grid min-h-[60vh] place-items-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div></Layout>;
  }

  const handleCopy = async () => {
    if (!body) return;
    // Soft-wall: logged-out visitors get a couple of free copies, then we ask
    // them to sign up. Owners/logged-in users are never gated.
    if (!user) {
      if (hasReachedFreeLimit()) {
        setGateOpen(true);
        return;
      }
      incrementFreeCopies();
    }
    await navigator.clipboard.writeText(body);
    setCopied(true);
    supabase.rpc("increment_prompt_copies", { _prompt_id: prompt.id });
    setTimeout(() => setCopied(false), 2000);
    toast({ title: "Copied to clipboard", description: "Paste it straight into your AI tool." });
    // Ask to share at peak satisfaction — once per page visit.
    setTimeout(() => setShareOpen(true), 900);
  };

  const handleGet = async () => {
    if (!user) { navigate(`/auth?redirect=/prompt/${slug}`); return; }
    if (prompt.is_free) {
      setClaiming(true);
      const { error } = await supabase.from("purchases").insert({
        buyer_id: user.id, prompt_id: prompt.id, amount_pence: 0, is_free: true,
      });
      setClaiming(false);
      if (error && !error.message.includes("duplicate")) {
        toast({ title: "Could not add to library", description: error.message, variant: "destructive" });
        return;
      }
      qc.invalidateQueries({ queryKey: ["owned", prompt.id] });
      toast({ title: "Added to your library", description: "Copy it any time from My Library." });
      return;
    }
    openCheckout({
      promptId: prompt.id,
      customerEmail: user.email ?? undefined,
      userId: user.id,
      returnUrl: `${window.location.origin}/checkout/return?session_id={CHECKOUT_SESSION_ID}`,
    });
  };

  const creator = prompt.creator as never as { handle: string; display_name: string; avatar_url?: string; bio?: string; total_sales?: number };
  const category = prompt.category as never as { slug: string; name: string };

  const modelLabel = MODEL_LABELS[prompt.model] ?? prompt.model;
  // Unique, keyword-rich title per prompt (SEO component appends "| Paste Prompts").
  const metaTitle = `${prompt.title} — ${modelLabel} Prompt`;
  // Unique meta description: real prompt copy + model, category, price & rating signals.
  const priceLabel = prompt.is_free ? "Free" : formatPrice(prompt.price_pence);
  const ratingLabel = prompt.rating_count > 0 ? `Rated ${prompt.rating_avg.toFixed(1)}/5.` : "";
  const metaDescription = [
    prompt.description,
    `${priceLabel} copy-ready ${modelLabel} prompt${category ? ` for ${category.name.toLowerCase()}` : ""}.`,
    ratingLabel,
  ]
    .filter(Boolean)
    .join(" ")
    .slice(0, 158);

  return (
    <Layout>
      <SEO
        title={metaTitle}
        description={metaDescription}
        canonical={currentPath}
        type="product"
        jsonLd={[
          {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
              { "@type": "ListItem", position: 2, name: "Browse", item: `${SITE_URL}/browse` },
              ...(category
                ? [{ "@type": "ListItem", position: 3, name: category.name, item: `${SITE_URL}/category/${category.slug}` }]
                : []),
              { "@type": "ListItem", position: category ? 4 : 3, name: prompt.title, item: `${SITE_URL}${currentPath}` },
            ],
          },
          {
            "@context": "https://schema.org",
            "@type": "Product",
            name: prompt.title,
            description: prompt.description,
            brand: { "@type": "Brand", name: "Paste Prompts" },
            category: category?.name,
            ...(prompt.rating_count > 0
              ? {
                  aggregateRating: {
                    "@type": "AggregateRating",
                    ratingValue: prompt.rating_avg.toFixed(1),
                    reviewCount: prompt.rating_count,
                    bestRating: 5,
                    worstRating: 1,
                  },
                }
              : {}),
            ...(reviews && reviews.length > 0
              ? {
                  review: reviews.slice(0, 8).map((r) => {
                    const rev = r as {
                      rating: number;
                      body: string | null;
                      created_at: string;
                      buyer?: { display_name?: string | null; handle?: string | null } | null;
                    };
                    return {
                      "@type": "Review",
                      reviewRating: {
                        "@type": "Rating",
                        ratingValue: rev.rating,
                        bestRating: 5,
                        worstRating: 1,
                      },
                      author: {
                        "@type": "Person",
                        name: rev.buyer?.display_name || rev.buyer?.handle || "Verified buyer",
                      },
                      datePublished: rev.created_at,
                      ...(rev.body ? { reviewBody: rev.body } : {}),
                    };
                  }),
                }
              : {}),
            offers: {
              "@type": "Offer",
              price: (prompt.price_pence / 100).toFixed(2),
              priceCurrency: "GBP",
              availability: "https://schema.org/InStock",
              url: `${SITE_URL}/prompt/${slug}`,
            },
          },
          {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: [
              {
                "@type": "Question",
                name: `How do I use this ${category?.name ?? "AI"} prompt?`,
                acceptedAnswer: {
                  "@type": "Answer",
                  text: `Copy the prompt with one click, open ${modelLabel} or your preferred AI tool, and substitute the bracketed placeholders [LIKE_THIS] with your specific details.`,
                },
              },
              {
                "@type": "Question",
                name: `Which AI models does this prompt work with?`,
                acceptedAnswer: {
                  "@type": "Answer",
                  text: `This prompt is optimized for ${modelLabel}, but also runs reliably across ChatGPT (GPT-4o), Claude 3.5/3.7, Google Gemini 2.5, and other modern LLMs.`,
                },
              },
              {
                "@type": "Question",
                name: `Do I have unlimited usage after getting this prompt?`,
                acceptedAnswer: {
                  "@type": "Answer",
                  text: `Yes. Once added to your library, you have lifetime access to copy, customize, and run this prompt for personal and commercial projects.`,
                },
              },
            ],
          },
        ]}
      />
      <div className="container-wide py-8">
        <Breadcrumbs
          items={[
            { name: "Home", to: "/" },
            { name: "Browse", to: "/browse" },
            ...(category ? [{ name: category.name, to: `/category/${category.slug}` }] : []),
            { name: prompt.title },
          ]}
        />
        <Button asChild variant="ghost" size="sm" className="mb-5">
          <Link to={category ? `/category/${category.slug}` : "/browse"}>
            <ArrowLeft className="mr-1 h-4 w-4" /> Back to {category?.name ?? "browse"}
          </Link>
        </Button>

        <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
          <div>
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <Link to={`/category/${category?.slug}`}><Badge variant="secondary" className="bg-secondary/70">{category?.name}</Badge></Link>
              <Badge variant="outline" className="border-white/10 uppercase tracking-wide text-muted-foreground">{MODEL_LABELS[prompt.model] ?? prompt.model}</Badge>
              {prompt.featured && <Badge className="bg-gradient-primary">Featured</Badge>}
            </div>
            <h1 className="font-display text-3xl font-bold sm:text-4xl">{prompt.title}</h1>
            <p className="mt-3 text-lg text-muted-foreground">{prompt.description}</p>

            {prompt.image_url && (
              <div className="mt-6 overflow-hidden rounded-2xl border border-white/10 glass aspect-[16/9] max-h-[380px] w-full bg-black/40">
                <img
                  src={prompt.image_url}
                  alt={prompt.title}
                  referrerPolicy="no-referrer"
                  className="h-full w-full object-cover"
                />
              </div>
            )}

            <div className="mt-4 flex flex-wrap items-center gap-5 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5"><Star className="h-4 w-4 fill-warning text-warning" />{prompt.rating_count > 0 ? `${prompt.rating_avg.toFixed(1)} (${prompt.rating_count})` : "New"}</span>
              <span className="flex items-center gap-1.5"><ShoppingBag className="h-4 w-4" />{formatCount(prompt.sales_count)} sales</span>
              <span className="flex items-center gap-1.5"><Copy className="h-4 w-4" />{formatCount(prompt.copies_count)} copies</span>
              <span className="flex items-center gap-1.5"><Eye className="h-4 w-4" />{formatCount(prompt.views)} views</span>
            </div>

            <ShareButtons url={`${SITE_URL}/prompt/${slug}`} title={prompt.title} className="mt-5" />

            <Tabs defaultValue="prompt" className="mt-8">
              <TabsList className="bg-card/60">
                <TabsTrigger value="prompt">Prompt</TabsTrigger>
                {tryEnabled && <TabsTrigger value="try">Try it live</TabsTrigger>}
                <TabsTrigger value="example">Example output</TabsTrigger>
                <TabsTrigger value="reviews">Reviews ({reviews?.length ?? 0})</TabsTrigger>
              </TabsList>

              <TabsContent value="prompt" className="mt-4">
                {hasAccess ? (
                  body ? (
                    <PromptVariableCustomizer
                      promptBody={body}
                      model={prompt.model}
                      onCopySuccess={() => {
                        supabase.rpc("increment_prompt_copies", { _prompt_id: prompt.id });
                        setTimeout(() => setShareOpen(true), 900);
                      }}
                    />
                  ) : (
                    <div className="rounded-2xl glass p-8 text-center text-sm text-muted-foreground">
                      <Loader2 className="mx-auto h-5 w-5 animate-spin text-primary-glow mb-2" />
                      Loading prompt body...
                    </div>
                  )
                ) : (
                  <div className="relative overflow-hidden rounded-2xl glass p-5">
                    <pre className="pointer-events-none select-none whitespace-pre-wrap break-words font-mono text-sm text-foreground/60 blur-sm">
{`You are an elite specialist with a track record of measurable results.

GOAL: Act as a done-for-you engine for your exact situation.

INPUTS (fill these in):
- Context / product: [DESCRIBE YOUR OFFER]
- Target audience: [WHO YOU SERVE]
- Primary goal: [WHAT SUCCESS LOOKS LIKE]
...`}
                    </pre>
                    <div className="absolute inset-0 grid place-items-center bg-background/40 backdrop-blur-[2px]">
                      <div className="text-center">
                        <Lock className="mx-auto mb-2 h-7 w-7 text-primary-glow" />
                        <p className="font-medium">Unlock the full prompt</p>
                        <p className="text-sm text-muted-foreground">Get it to reveal the complete, copy-ready text.</p>
                      </div>
                    </div>
                  </div>
                )}
              </TabsContent>

              {tryEnabled && (
                <TabsContent value="try" className="mt-4">
                  <TrySandbox promptId={prompt.id} hasAccess={hasAccess} isFree={prompt.is_free} />
                </TabsContent>
              )}

              <TabsContent value="example" className="mt-4">
                <div className="rounded-2xl glass p-5">
                  <pre className="whitespace-pre-wrap break-words text-sm text-foreground/90">{prompt.example_output}</pre>
                </div>
              </TabsContent>

              <TabsContent value="reviews" className="mt-4">
                <ReviewsSection promptId={prompt.id} owned={!!owned} reviews={reviews ?? []} />
              </TabsContent>
            </Tabs>

            {/* SEO Content Injection for Thin Pages */}
            <section className="mt-12 space-y-6 border-t border-white/5 pt-8">
              <div>
                <h2 className="font-display text-2xl font-bold">Why this {category?.name?.toLowerCase() ?? ""} prompt works</h2>
                <p className="mt-2 text-muted-foreground leading-relaxed">
                  {prompt.description || `This prompt provides structured constraints and context, forcing the AI to bypass generic responses. By establishing a clear role and expected output format, it reliably generates high-quality results tailored for ${category?.name?.toLowerCase() ?? "professional"} use cases.`}
                </p>
              </div>
              
              <div>
                <h3 className="text-xl font-bold">Ideal Use Cases</h3>
                <ul className="mt-2 space-y-2 text-muted-foreground list-disc pl-5">
                  <li>Automating repetitive {category?.name?.toLowerCase() ?? ""} tasks</li>
                  <li>Generating baseline copy or templates quickly</li>
                  <li>Standardising output formats across your team</li>
                  <li>Overcoming creative block with high-quality AI starting points</li>
                </ul>
              </div>
            </section>

            {/* How to use — unique, useful context for every prompt */}
            <section className="mt-12">
              <h2 className="font-display text-2xl font-bold">
                How to use this {category?.name?.toLowerCase() ?? ""} prompt
              </h2>
              <p className="mt-2 text-muted-foreground">
                This prompt is designed to run in {MODEL_LABELS[prompt.model] ?? prompt.model} and other leading AI
                assistants. Follow these steps to get professional-quality results in under a minute.
              </p>
              <ol className="mt-5 space-y-4">
                {[
                  {
                    t: prompt.is_free ? "Add it to your library for free" : "Unlock the full prompt",
                    d: prompt.is_free
                      ? "Click “Get for free” to save it to your account. You can return and copy it any time from My Library."
                      : "Buy once to reveal the complete, copy-ready text. You own it forever — there's no subscription needed to use it.",
                  },
                  {
                    t: "Copy the prompt with one click",
                    d: "Use the Copy button to grab the entire prompt, including its structure and formatting instructions.",
                  },
                  {
                    t: `Paste it into ${MODEL_LABELS[prompt.model] ?? "your AI tool"}`,
                    d: "Open a fresh chat and paste the prompt. Then swap the [PLACEHOLDERS] for your own product, audience or goal.",
                  },
                  {
                    t: "Run it, then refine",
                    d: "Send it and review the output. Ask a short follow-up (“make it punchier”, “add a table”) to tailor the result to you.",
                  },
                ].map((s, i) => (
                  <li key={s.t} className="flex gap-4 rounded-2xl glass p-5">
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-gradient-primary text-sm font-bold text-primary-foreground">
                      {i + 1}
                    </span>
                    <div>
                      <h3 className="font-semibold">{s.t}</h3>
                      <p className="mt-1 text-sm text-muted-foreground">{s.d}</p>
                    </div>
                  </li>
                ))}
              </ol>
              <div className="mt-6 rounded-2xl border border-white/5 bg-card/40 p-5">
                <h3 className="flex items-center gap-2 font-semibold">
                  <Sparkles className="h-4 w-4 text-primary-glow" /> Tips for the best results
                </h3>
                <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                  <li>• Be specific in the placeholders — the more context you give, the sharper the output.</li>
                  <li>• If the first answer isn't perfect, iterate with one small instruction at a time.</li>
                  <li>• Reuse this prompt across projects; it's built to be parameterised, not one-off.</li>
                  <li>• New to prompting? See our <Link to="/glossary" className="text-primary-glow hover:underline">AI prompt glossary</Link> and <Link to="/guides" className="text-primary-glow hover:underline">step-by-step guides</Link>.</li>
                </ul>
              </div>

              {/* Frequently Asked Questions */}
              <div className="mt-10">
                <h2 className="flex items-center gap-2 font-display text-2xl font-bold">
                  <HelpCircle className="h-5 w-5 text-primary-glow" /> Frequently Asked Questions
                </h2>
                <Accordion type="single" collapsible className="mt-4 space-y-2">
                  <AccordionItem value="faq-1" className="rounded-xl border border-white/5 bg-card/40 px-4">
                    <AccordionTrigger className="text-sm font-semibold hover:no-underline">
                      How do I use this {category?.name ?? "AI"} prompt?
                    </AccordionTrigger>
                    <AccordionContent className="text-sm text-muted-foreground leading-relaxed">
                      Copy the prompt with one click, open {modelLabel} (or your preferred AI model), and swap any bracketed placeholders [LIKE_THIS] with your exact project details or audience info.
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="faq-2" className="rounded-xl border border-white/5 bg-card/40 px-4">
                    <AccordionTrigger className="text-sm font-semibold hover:no-underline">
                      Which AI models does this prompt support?
                    </AccordionTrigger>
                    <AccordionContent className="text-sm text-muted-foreground leading-relaxed">
                      This prompt has been engineered and tested specifically for {modelLabel}, but functions reliably across modern LLMs including ChatGPT (GPT-4o), Claude 3.5/3.7, and Google Gemini 2.5.
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="faq-3" className="rounded-xl border border-white/5 bg-card/40 px-4">
                    <AccordionTrigger className="text-sm font-semibold hover:no-underline">
                      Do I get lifetime access?
                    </AccordionTrigger>
                    <AccordionContent className="text-sm text-muted-foreground leading-relaxed">
                      Yes. Once added to your account library, you own perpetual rights to copy, customize, and execute this prompt across all your commercial and personal projects.
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>
            </section>
          </div>


          {/* Buy box */}
          <aside className="lg:sticky lg:top-20 lg:h-fit">
            <div className="rounded-2xl glass-strong p-6">
              <div className="mb-4 font-display text-3xl font-bold">
                {prompt.is_free ? <span className="text-success">Free</span> : formatPrice(prompt.price_pence)}
              </div>
              {hasAccess ? (
                <Button onClick={handleCopy} className="w-full bg-gradient-primary btn-glow" size="lg">
                  {copied ? <><Check className="mr-1 h-4 w-4" /> Copied</> : <><Copy className="mr-1 h-4 w-4" /> Copy prompt</>}
                </Button>
              ) : (
                <Button onClick={handleGet} disabled={claiming} className="w-full bg-gradient-primary btn-glow" size="lg">
                  {claiming ? <Loader2 className="h-4 w-4 animate-spin" /> : prompt.is_free ? "Get for free" : `Buy · ${formatPrice(prompt.price_pence)}`}
                </Button>
              )}
              <SaveButton promptId={prompt.id} />

              <Link to={`/creators/${creator?.handle}`} className="mt-6 flex items-center gap-3 rounded-xl border border-white/5 p-3 transition-colors hover:bg-card/60">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={creator?.avatar_url} alt={creator?.display_name ? `${creator.display_name} avatar` : "Creator avatar"} />
                  <AvatarFallback className="bg-gradient-primary text-xs text-primary-foreground">{(creator?.display_name ?? "?").slice(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold">{creator?.display_name}</div>
                  <div className="text-xs text-muted-foreground">{formatCount(creator?.total_sales ?? 0)} sales</div>
                </div>
              </Link>

              {!!prompt.tags?.length && (
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {prompt.tags.map((t: string) => (
                    <Link key={t} to={`/browse?q=${encodeURIComponent(t)}`}>
                      <Badge variant="outline" className="border-white/10 text-xs text-muted-foreground">#{t}</Badge>
                    </Link>
                  ))}
                </div>
              )}

              <ModelCompatibilityBadge model={prompt.model} className="mt-5" />
            </div>
          </aside>
        </div>

        {!!related?.length && (
          <section className="mt-16">
            <div className="mb-6 flex items-end justify-between gap-4">
              <div>
                <h2 className="font-display text-2xl font-bold">Related prompts</h2>
                {category && (
                  <p className="mt-1 text-sm text-muted-foreground">
                    More hand-picked {category.name.toLowerCase()} prompts from Paste Prompts.
                  </p>
                )}
              </div>
              {category && (
                <Link
                  to={`/category/${category.slug}`}
                  className="hidden shrink-0 rounded-xl border border-white/15 px-4 py-2 text-sm font-medium hover:bg-card sm:inline-block"
                >
                  See all {category.name} prompts →
                </Link>
              )}
            </div>
            <PromptGrid prompts={related as never} />
          </section>
        )}
      </div>
      {isOpen && (
        <div className="fixed inset-0 z-[100] overflow-y-auto bg-background/90 p-4 backdrop-blur">
          <div className="mx-auto max-w-xl py-8">{checkoutElement}</div>
        </div>
      )}
      <SignUpGate open={gateOpen} onOpenChange={setGateOpen} redirect={currentPath} />
      <ShareEncouragement open={shareOpen} onOpenChange={setShareOpen} url={`${SITE_URL}${currentPath}`} title={prompt.title} />
    </Layout>
  );
}

function SaveButton({ promptId }: { promptId: string }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const qc = useQueryClient();
  const { data: saved } = useQuery({
    queryKey: ["saved", promptId, user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data } = await supabase.from("saved_prompts").select("prompt_id").eq("prompt_id", promptId).eq("user_id", user!.id).maybeSingle();
      return !!data;
    },
  });
  const toggle = async () => {
    if (!user) { toast({ title: "Sign in to save prompts" }); return; }
    if (saved) await supabase.from("saved_prompts").delete().eq("prompt_id", promptId).eq("user_id", user.id);
    else await supabase.from("saved_prompts").insert({ prompt_id: promptId, user_id: user.id });
    qc.invalidateQueries({ queryKey: ["saved", promptId] });
  };
  return (
    <Button onClick={toggle} variant="outline" className="mt-3 w-full border-white/15">
      <Bookmark className={`mr-1 h-4 w-4 ${saved ? "fill-primary text-primary" : ""}`} /> {saved ? "Saved" : "Save for later"}
    </Button>
  );
}

function TrySandbox({ promptId, hasAccess, isFree }: { promptId: string; hasAccess: boolean; isFree: boolean }) {
  const { toast } = useToast();
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [teaser, setTeaser] = useState(false);
  const [running, setRunning] = useState(false);

  const run = async () => {
    setRunning(true);
    setOutput("");
    try {
      const { data, error } = await supabase.functions.invoke("try-prompt", {
        body: { promptId, userInput: input },
      });
      if (error) throw error;
      if ((data as { error?: string })?.error) throw new Error((data as { error: string }).error);
      setOutput((data as { output: string }).output ?? "");
      setTeaser(!!(data as { teaser?: boolean }).teaser);
    } catch (e) {
      toast({ title: "Could not run prompt", description: (e as Error).message, variant: "destructive" });
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="rounded-2xl glass p-5">
        <div className="mb-2 flex items-center gap-2 text-sm font-medium">
          <Sparkles className="h-4 w-4 text-primary-glow" />
          {hasAccess || isFree ? "Run this prompt live with your own input" : "Preview what this prompt can do"}
        </div>
        <p className="mb-3 text-xs text-muted-foreground">
          {hasAccess || isFree
            ? "Add any context below and run the real prompt instantly — no copy-paste needed."
            : "We'll generate a short teaser based on this prompt. Unlock it to run the full version on your own inputs."}
        </p>
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Optional: describe your situation, product or goal…"
          className="mb-3 bg-card/60 border-white/10"
          rows={3}
        />
        <Button onClick={run} disabled={running} className="bg-gradient-primary btn-glow">
          {running ? <><Loader2 className="mr-1 h-4 w-4 animate-spin" /> Running…</> : <><Play className="mr-1 h-4 w-4" /> Run prompt</>}
        </Button>
      </div>

      {output && (
        <div className="rounded-2xl glass p-5">
          {teaser && (
            <div className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary-glow">
              <Lock className="h-3 w-3" /> Teaser preview
            </div>
          )}
          <pre className="whitespace-pre-wrap break-words text-sm text-foreground/90">{output}</pre>
        </div>
      )}
    </div>
  );
}

function ReviewsSection({ promptId, owned, reviews }: { promptId: string; owned: boolean; reviews: unknown[] }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const qc = useQueryClient();
  const [rating, setRating] = useState(5);
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    if (!user) return;
    setSubmitting(true);
    const { error } = await supabase.from("reviews").upsert(
      { prompt_id: promptId, buyer_id: user.id, rating, body: text },
      { onConflict: "prompt_id,buyer_id" } as never
    );
    setSubmitting(false);
    if (error) { toast({ title: "Could not submit review", description: error.message, variant: "destructive" }); return; }
    setText("");
    qc.invalidateQueries({ queryKey: ["reviews", promptId] });
    toast({ title: "Review submitted" });
  };

  return (
    <div className="space-y-5">
      {owned && (
        <div className="rounded-2xl glass p-5">
          <p className="mb-3 text-sm font-medium">Leave a review</p>
          <div className="mb-3 flex gap-1">
            {[1, 2, 3, 4, 5].map((n) => (
              <button key={n} onClick={() => setRating(n)} aria-label={`${n} stars`}>
                <Star className={`h-6 w-6 ${n <= rating ? "fill-warning text-warning" : "text-muted-foreground"}`} />
              </button>
            ))}
          </div>
          <Textarea 
            value={text} 
            onChange={(e) => setText(e.target.value)} 
            placeholder="Help others by sharing the AI output you generated with this prompt..." 
            className="mb-3 bg-card/60 border-white/10" 
          />
          <Button onClick={submit} disabled={submitting} size="sm" className="bg-gradient-primary">Submit review</Button>
        </div>
      )}
      {reviews.length === 0 ? (
        <p className="rounded-2xl glass p-8 text-center text-muted-foreground">No reviews yet.</p>
      ) : (
        reviews.map((r: never) => {
          const rev = r as { id: string; rating: number; body?: string; created_at: string; buyer?: { display_name: string; avatar_url?: string } };
          return (
            <div key={rev.id} className="rounded-2xl glass p-5">
              <div className="mb-2 flex items-center gap-3">
                <Avatar className="h-8 w-8"><AvatarImage src={rev.buyer?.avatar_url} alt={rev.buyer?.display_name ? `${rev.buyer.display_name} profile picture` : "Reviewer profile picture"} /><AvatarFallback className="bg-gradient-primary text-xs text-primary-foreground">{(rev.buyer?.display_name ?? "?").slice(0, 2).toUpperCase()}</AvatarFallback></Avatar>
                <div>
                  <div className="text-sm font-medium">{rev.buyer?.display_name ?? "User"}</div>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((n) => <Star key={n} className={`h-3 w-3 ${n <= rev.rating ? "fill-warning text-warning" : "text-muted-foreground"}`} />)}
                    <span className="ml-1 text-xs text-muted-foreground">{timeAgo(rev.created_at)}</span>
                  </div>
                </div>
              </div>
              {rev.body && <p className="text-sm text-muted-foreground">{rev.body}</p>}
            </div>
          );
        })
      )}
    </div>
  );
}
