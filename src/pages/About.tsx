import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles, ShieldCheck, Users, Zap, Target, Heart } from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { SEO } from "@/components/SEO";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Button } from "@/components/ui/button";

const SITE_URL = "https://pasteprompts.co.uk";

const values = [
  {
    icon: Target,
    title: "Quality over quantity",
    desc: "Every prompt is reviewed before it goes live. We would rather list one prompt that works than a hundred that don't.",
  },
  {
    icon: Zap,
    title: "Built to be used",
    desc: "Prompts are parameterised and tested across ChatGPT, Claude and Gemini, so they work the moment you paste them in.",
  },
  {
    icon: ShieldCheck,
    title: "Fair and transparent",
    desc: "Honest ratings, real sales counts and clear pricing. No fake reviews, no dark patterns, no surprises at checkout.",
  },
  {
    icon: Heart,
    title: "Creator-first",
    desc: "The people who write great prompts deserve to earn from them. We pay creators automatically and keep our cut fair.",
  },
];

export default function About() {
  return (
    <Layout>
      <SEO
        title="About Paste Prompts — AI prompt marketplace"
        description="Paste Prompts is a curated marketplace and learning hub for high-performing AI prompts. Learn who we are, what we believe, and how the platform works."
        canonical="/about"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "AboutPage",
          name: "About Paste Prompts",
          url: `${SITE_URL}/about`,
          description:
            "Paste Prompts is a curated marketplace and learning hub for high-performing AI prompts.",
        }}
      />

      <div className="container-tight py-12">
        <Breadcrumbs
          items={[
            { name: "Home", to: "/" },
            { name: "About Us" },
          ]}
        />
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-card/60 px-4 py-1.5 text-xs font-medium text-muted-foreground">
            <Sparkles className="h-3.5 w-3.5 text-primary-glow" /> About us
          </div>
          <h1 className="font-display text-4xl font-bold leading-tight sm:text-5xl">
            We help people get <span className="text-gradient">real results</span> from AI
          </h1>
          <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
            Paste Prompts is a curated marketplace and learning hub for high-performing AI prompts.
            Our mission is simple: make it effortless to get genuinely useful output from tools like
            ChatGPT, Claude and Gemini — whether you write your own prompts or use ones built by experts.
          </p>
        </motion.div>

        <article className="prose-invert mt-12 max-w-none space-y-10">
          <section>
            <h2 className="font-display text-2xl font-bold">Why we built Paste Prompts</h2>
            <p className="mt-3 leading-relaxed text-muted-foreground">
              AI models are extraordinarily capable, but most people only ever see a fraction of what they can do.
              The difference between a disappointing answer and a brilliant one is almost never the model — it's the
              prompt. A well-engineered prompt carries context, constraints and structure that turn a vague request
              into a precise brief, and the results speak for themselves.
            </p>
            <p className="mt-3 leading-relaxed text-muted-foreground">
              The problem is that writing great prompts is a skill, and rewriting them from scratch every time is a
              waste. We started Paste Prompts to fix both halves of that problem: a library of tested, ready-to-use
              prompts you can copy in seconds, and a free learning hub that teaches the techniques behind them so you
              can build your own.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-bold">What you'll find here</h2>
            <ul className="mt-4 space-y-3">
              <li className="flex gap-3 text-muted-foreground">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary-glow" />
                <span><strong className="text-foreground">A curated prompt marketplace</strong> — hundreds of prompts across copywriting, business, marketing, coding and more, with honest ratings and many available completely free.</span>
              </li>
              <li className="flex gap-3 text-muted-foreground">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary-glow" />
                <span><strong className="text-foreground">A free learning hub</strong> — in-depth, original guides to prompt engineering, from beginner fundamentals to advanced techniques used by professionals.</span>
              </li>
              <li className="flex gap-3 text-muted-foreground">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary-glow" />
                <span><strong className="text-foreground">A platform for creators</strong> — if you're good at getting results from AI, you can package your best prompts and earn from them.</span>
              </li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-2xl font-bold">How the marketplace works</h2>
            <p className="mt-3 leading-relaxed text-muted-foreground">
              Browse by category, model or use case. Free prompts can be copied instantly — no payment needed. Paid
              prompts can be previewed and tried before you buy, and once you own one it lives in your library forever,
              ready to copy any time. Every prompt is reviewed for quality before it's listed, and you can leave a
              rating after you've used it so the best work rises to the top.
            </p>
            <p className="mt-3 leading-relaxed text-muted-foreground">
              Creators upload their prompts, set them live, and get paid automatically when they sell. We handle
              payments, hosting and discovery so creators can focus on what they're good at — writing prompts that work.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-bold">What we believe</h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              {values.map((v) => (
                <div key={v.title} className="rounded-2xl glass p-5">
                  <v.icon className="mb-3 h-6 w-6 text-primary-glow" />
                  <h3 className="font-display font-semibold">{v.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{v.desc}</p>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="font-display text-2xl font-bold">Who writes and reviews our content</h2>
            <p className="mt-3 leading-relaxed text-muted-foreground">
              Everything published on Paste Prompts — guides, glossary entries, category explainers and prompt
              descriptions — is written and reviewed in-house by the Paste Prompts editorial team: prompt engineers,
              copywriters and marketers who have been building production AI workflows since 2023 for agencies,
              SaaS teams and independent creators.
            </p>
            <ul className="mt-4 space-y-2 leading-relaxed text-muted-foreground">
              <li>
                <strong className="text-foreground">Hands-on experience:</strong> every technique we publish has been
                run against the model it targets (ChatGPT, Claude, Gemini or Midjourney) before it goes live.
              </li>
              <li>
                <strong className="text-foreground">Human review:</strong> no article is published straight from an AI
                draft. A named editor checks accuracy, removes filler and tests each example prompt.
              </li>
              <li>
                <strong className="text-foreground">Kept current:</strong> guides carry a "last reviewed" date and are
                re-checked whenever a major model release changes the advice.
              </li>
              <li>
                <strong className="text-foreground">Corrections welcome:</strong> spotted something wrong? Email{" "}
                <a href="mailto:hello@pasteprompts.co.uk" className="text-primary-glow underline">
                  hello@pasteprompts.co.uk
                </a>{" "}
                and we will fix and re-date the page.
              </li>
            </ul>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              We also link out to primary sources — the official{" "}
              <a href="https://platform.openai.com/docs/guides/prompt-engineering" target="_blank" rel="noopener noreferrer" className="text-primary-glow underline">OpenAI</a>,{" "}
              <a href="https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/overview" target="_blank" rel="noopener noreferrer" className="text-primary-glow underline">Anthropic</a> and{" "}
              <a href="https://ai.google.dev/gemini-api/docs/prompting-strategies" target="_blank" rel="noopener noreferrer" className="text-primary-glow underline">Google Gemini</a>{" "}
              prompting documentation — so you can verify our advice against the model makers themselves.
            </p>
          </section>


          <section>
            <h2 className="font-display text-2xl font-bold">Get in touch</h2>
            <p className="mt-3 leading-relaxed text-muted-foreground">
              Questions, feedback, or a partnership idea? We'd love to hear from you. You can reach us through the
              contact channels on our site, report content that breaches our{" "}
              <Link to="/legal/terms" className="text-primary-glow underline">Terms of Service</Link>, or read more about
              how we handle your data in our{" "}
              <Link to="/legal/privacy" className="text-primary-glow underline">Privacy Policy</Link> and{" "}
              <Link to="/trust" className="text-primary-glow underline">Trust &amp; Security</Link> pages.
            </p>
          </section>
        </article>

        {/* CTA */}
        <div className="mt-14 rounded-3xl glass-strong p-10 text-center">
          <Users className="mx-auto mb-3 h-8 w-8 text-primary-glow" />
          <h2 className="font-display text-2xl font-bold sm:text-3xl">Join thousands using better prompts</h2>
          <p className="mx-auto mt-2 max-w-xl text-muted-foreground">
            Create a free account to save prompts, unlock free packs and follow your favourite creators.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button asChild size="lg" className="bg-gradient-primary btn-glow">
              <Link to="/auth?mode=signup">Create free account <ArrowRight className="ml-1 h-4 w-4" /></Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-white/15">
              <Link to="/guides">Explore the guides</Link>
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
