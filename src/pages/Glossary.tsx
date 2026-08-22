import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { BookMarked, ArrowRight, Search, Sparkles, HelpCircle } from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { SEO } from "@/components/SEO";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const SITE_URL = "https://pasteprompts.co.uk";

interface Term {
  term: string;
  definition: string;
  category: "Prompting" | "Architecture" | "Parameters" | "Safety";
}

/** Plain-English, comprehensive definitions written for Paste Prompts. */
const TERMS: Term[] = [
  { term: "Prompt", category: "Prompting", definition: "The exact text instruction you give an AI model. A professional prompt acts as a self-contained brief outlining the role, context, goal, dynamic inputs, and exact output schema." },
  { term: "Large Language Model (LLM)", category: "Architecture", definition: "A transformer-based neural network trained on billions of parameters to understand, summarize, and generate human language. Examples include GPT-4o, Claude 3.7, and Gemini 2.0." },
  { term: "Prompt Engineering", category: "Prompting", definition: "The deliberate methodology of designing structured prompts to elicit deterministic, high-quality responses from AI models while minimizing hallucinations." },
  { term: "System Prompt", category: "Prompting", definition: "A top-level system instruction that establishes the persistent persona, operational boundaries, and formatting rules for the AI before user queries begin." },
  { term: "Context Window", category: "Architecture", definition: "The total token buffer (input prompt + conversation history + output) an AI model can hold in active memory at once (e.g., 200,000+ tokens in Claude and Gemini)." },
  { term: "Token", category: "Architecture", definition: "The atomic unit of text that models process — approximately 4 characters or 0.75 words in English. Pricing, context windows, and rate limits are measured in tokens." },
  { term: "Temperature", category: "Parameters", definition: "A hyperparameter between 0.0 and 2.0 controlling output randomness. Low values (0.0–0.3) produce factual, deterministic results; higher values (0.7–1.0) encourage creative variability." },
  { term: "Top-P (Nucleus Sampling)", category: "Parameters", definition: "An alternative to temperature that limits token selection to the smallest set of candidates whose cumulative probability exceeds P (e.g., top 90% most likely words)." },
  { term: "Zero-Shot Prompting", category: "Prompting", definition: "Submitting an instruction directly to an AI model without providing any prior examples, relying solely on pre-trained model knowledge." },
  { term: "Few-Shot Prompting", category: "Prompting", definition: "Including 2 to 5 high-quality input/output demonstration pairs directly within the prompt to guide the AI toward an exact style or complex data format." },
  { term: "Chain-of-Thought (CoT)", category: "Prompting", definition: "Prompting an AI to break down complex logic into step-by-step reasoning steps before producing its final answer, drastically improving mathematical and coding accuracy." },
  { term: "Role Prompting", category: "Prompting", definition: "Assigning a specific professional persona (e.g., 'Act as an enterprise cloud architect') to calibrate tone, terminology, and level of domain depth." },
  { term: "Parameterised Prompt", category: "Prompting", definition: "A reusable prompt template with bracketed placeholders (e.g., [TARGET AUDIENCE]) designed to be quickly customized with project variables." },
  { term: "Hallucination", category: "Safety", definition: "When a generative AI confidently generates false facts, non-existent URLs, or invented citations. Reduced by strong constraints and source grounding." },
  { term: "Negative Prompting", category: "Prompting", definition: "Explicitly declaring what the AI must exclude (e.g., 'no buzzwords', or in Midjourney '--no text, watermark, blur') to prevent common quality defects." },
  { term: "XML Tag Structuring", category: "Prompting", definition: "Enclosing instructions, context, and examples in distinct XML tags (e.g. <context>...</context>, <instructions>...</instructions>) to keep prompt sections distinct for models like Claude." },
  { term: "RAG (Retrieval-Augmented Generation)", category: "Architecture", definition: "Connecting an AI model to an external vector database or search index so its answers are dynamically grounded in verified, real-time documentation." },
  { term: "Multimodal Model", category: "Architecture", definition: "An AI system capable of processing and generating multiple data types simultaneously, including text, images, code, and audio (e.g. Gemini 2.0, GPT-4o)." },
  { term: "Diffusion Model", category: "Architecture", definition: "A deep generative model used in image synthesis (Midjourney, Flux, Stable Diffusion) that creates images by iteratively removing Gaussian noise from a random latent space." },
  { term: "Grounding", category: "Safety", definition: "Tethering model generation to verifiable real-time sources (such as Google Search or private document stores) to ensure factual accuracy and prevent hallucinations." },
  { term: "Prompt Injection", category: "Safety", definition: "A security vulnerability where untrusted user input contains malicious instructions designed to hijack the model's original system instructions." },
  { term: "Few-Shot Output Schema", category: "Prompting", definition: "Enforcing structured machine-readable formats (JSON, YAML, markdown tables) by demonstrating exact structural syntax in prompt instructions." },
];

export default function Glossary() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("All");

  const categories = ["All", "Prompting", "Architecture", "Parameters", "Safety"];

  const filteredTerms = useMemo(() => {
    return TERMS.filter((t) => {
      const matchesSearch =
        search === "" ||
        t.term.toLowerCase().includes(search.toLowerCase()) ||
        t.definition.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = activeCategory === "All" || t.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [search, activeCategory]);

  return (
    <Layout>
      <SEO
        title="AI Prompt Glossary — Key Prompting & LLM Terms Explained"
        description="A plain-English glossary of essential AI and prompt engineering terms: tokens, system prompts, few-shot, chain-of-thought, temperature, RAG, and more."
        canonical="/glossary"
        jsonLd={[
          {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
              { "@type": "ListItem", position: 2, name: "AI Glossary", item: `${SITE_URL}/glossary` },
            ],
          },
          {
            "@context": "https://schema.org",
            "@type": "DefinedTermSet",
            name: "AI Prompt Engineering Glossary",
            url: `${SITE_URL}/glossary`,
            description: "Essential definitions and terminology for AI prompt engineering and generative models.",
            hasDefinedTerm: TERMS.map((t) => ({
              "@type": "DefinedTerm",
              name: t.term,
              description: t.definition,
              inDefinedTermSet: `${SITE_URL}/glossary`,
            })),
          },
        ]}
      />

      <div className="container-wide py-12">
        <Breadcrumbs
          items={[
            { name: "Home", to: "/" },
            { name: "AI Glossary" },
          ]}
        />

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="max-w-3xl">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-semibold text-primary-glow">
            <BookMarked className="h-3.5 w-3.5" /> AI &amp; Prompt Engineering Knowledge Base
          </div>
          <h1 className="font-display text-3xl font-extrabold sm:text-5xl">
            The AI Prompt <span className="text-gradient">Glossary</span>
          </h1>
          <p className="mt-4 text-base sm:text-lg text-muted-foreground leading-relaxed">
            Essential prompt engineering concepts, model hyperparameters, and generative AI terminology explained in plain English with actionable takeaways.
          </p>

          {/* Search & Category Filter */}
          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search glossary terms (e.g. few-shot, token, RAG)..."
                className="pl-10 bg-card/60 border-white/10 h-11 text-sm focus:border-primary/50"
              />
            </div>
            <div className="flex flex-wrap gap-1.5 items-center">
              {categories.map((c) => (
                <button
                  key={c}
                  onClick={() => setActiveCategory(c)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                    activeCategory === c
                      ? "bg-gradient-primary text-white shadow-glow"
                      : "border border-white/10 bg-card/60 text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Terms Grid */}
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredTerms.length > 0 ? (
            filteredTerms.map((t, i) => (
              <motion.div
                key={t.term}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.25, delay: (i % 6) * 0.02 }}
                className="rounded-2xl glass border border-white/10 p-6 flex flex-col justify-between hover:border-primary/40 transition-colors"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h2 className="font-display text-lg font-bold text-foreground">{t.term}</h2>
                    <Badge variant="outline" className="text-[10px] border-white/10 text-muted-foreground uppercase">
                      {t.category}
                    </Badge>
                  </div>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">{t.definition}</p>
                </div>

                <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs">
                  <Link to={`/browse?q=${encodeURIComponent(t.term)}`} className="text-primary-glow hover:underline inline-flex items-center gap-1">
                    Find {t.term} prompts <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="col-span-full rounded-2xl glass p-12 text-center text-muted-foreground">
              No glossary terms match "{search}". Try searching for another keyword.
            </div>
          )}
        </div>

        {/* CTA to Explore Guides */}
        <div className="mt-16 rounded-3xl border border-white/10 bg-gradient-to-r from-primary/10 via-card/40 to-primary/5 p-8 sm:p-10 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="font-display text-2xl font-bold">Want in-depth prompt engineering tutorials?</h3>
            <p className="mt-1 text-sm text-muted-foreground max-w-xl">
              Explore our step-by-step guides on prompt architecture, Midjourney formulas, and model comparisons.
            </p>
          </div>
          <Button asChild size="lg" className="bg-gradient-primary btn-glow shrink-0">
            <Link to="/guides">
              Explore Guides <ArrowRight className="ml-1.5 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </Layout>
  );
}
