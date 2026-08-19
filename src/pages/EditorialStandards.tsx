import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ShieldCheck, CheckCircle2, FileText, Cpu, AlertTriangle, RefreshCw, Sparkles, Scale, BookOpen } from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { SEO } from "@/components/SEO";
import { Breadcrumbs } from "@/components/Breadcrumbs";

const SITE_URL = "https://pasteprompts.co.uk";

export default function EditorialStandards() {
  return (
    <Layout>
      <SEO
        title="Editorial Standards & Quality Guidelines — Paste Prompts"
        description="Learn how Paste Prompts reviews, benchmarks, and verifies AI prompts for reliability, reproducibility, and safety across leading AI models."
        canonical="/editorial-standards"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: "Editorial Standards & Prompt Quality Guidelines",
          url: `${SITE_URL}/editorial-standards`,
          description: "Our comprehensive verification standards, testing methodology, and quality benchmarks for AI prompts and educational guides.",
          publisher: {
            "@type": "Organization",
            name: "Paste Prompts",
            url: SITE_URL,
          },
        }}
      />

      <div className="container-tight py-12">
        <Breadcrumbs
          items={[
            { name: "Home", to: "/" },
            { name: "Editorial Standards" },
          ]}
        />

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-semibold text-primary-glow">
            <ShieldCheck className="h-3.5 w-3.5" /> Trust, Quality & Verification
          </div>

          <h1 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
            Editorial Standards &amp; Prompt Quality Guidelines
          </h1>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground sm:text-lg">
            At Paste Prompts, our mission is to eliminate prompt hallucinations and deliver reliable, reproducible AI workflows. Every prompt listed on our marketplace and every educational article we publish adheres to strict quality benchmarks.
          </p>

          <div className="mt-10 space-y-12">
            {/* 1. Prompt Verification Pipeline */}
            <section className="rounded-3xl border border-white/10 bg-card/40 p-6 sm:p-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="grid h-10 w-10 place-items-center rounded-2xl bg-gradient-primary">
                  <Cpu className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="font-display text-xl font-bold text-foreground">1. The 5-Point Prompt Verification Pipeline</h2>
                  <p className="text-xs text-muted-foreground">Standardized evaluation protocol for all creator submissions</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                <div className="rounded-2xl border border-white/5 bg-card/60 p-4">
                  <h3 className="text-sm font-bold text-foreground flex items-center gap-2 mb-1.5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                    1. Deterministic Reproducibility
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Prompts must produce consistent, high-fidelity results across at least 3 distinct test runs using the target AI model (ChatGPT, Claude, Gemini, Midjourney, Flux) without erratic hallucinations.
                  </p>
                </div>

                <div className="rounded-2xl border border-white/5 bg-card/60 p-4">
                  <h3 className="text-sm font-bold text-foreground flex items-center gap-2 mb-1.5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                    2. Clean Parameter Bracketing
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    All dynamic inputs must use clear, all-caps bracket notation (e.g. <code className="bg-white/10 px-1 py-0.5 rounded text-[11px] text-foreground">[TARGET AUDIENCE]</code>) accompanied by clear variable instructions.
                  </p>
                </div>

                <div className="rounded-2xl border border-white/5 bg-card/60 p-4">
                  <h3 className="text-sm font-bold text-foreground flex items-center gap-2 mb-1.5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                    3. Exact Model Version Attribution
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Each prompt is explicitly tagged with tested model architectures (e.g. Claude 3.7 Sonnet, GPT-4o, Midjourney v6.1, Flux 1.1 Pro) and recommended temperature parameters where applicable.
                  </p>
                </div>

                <div className="rounded-2xl border border-white/5 bg-card/60 p-4">
                  <h3 className="text-sm font-bold text-foreground flex items-center gap-2 mb-1.5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                    4. Originality &amp; Anti-Plagiarism
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Submissions are scanned against public prompt repositories to verify authentic creator engineering. Trivial one-line queries or direct copies of public documentation are strictly rejected.
                  </p>
                </div>
              </div>
            </section>

            {/* 2. Educational & Editorial Standards */}
            <section className="space-y-4">
              <h2 className="font-display text-2xl font-bold flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary-glow" /> 2. Educational Guide Editorial Integrity
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Our tutorials, comparative model benchmarks, and prompt engineering guides are written by experienced AI practitioners and prompt engineers. Every guide undergoes technical review to verify:
              </p>
              <ul className="space-y-2 text-sm text-muted-foreground list-disc pl-5">
                <li><strong className="text-foreground">Accuracy:</strong> Model capabilities, token limits, and reasoning benchmarks are verified against official API documentation from OpenAI, Anthropic, Google, and Midjourney.</li>
                <li><strong className="text-foreground">Tested Code &amp; Prompts:</strong> All example prompt chains and system prompt snippets featured in guides are tested live before publication.</li>
                <li><strong className="text-foreground">Continuous Maintenance:</strong> When frontier AI models receive major version updates (such as new reasoning capabilities), our editorial staff updates relevant guides with latest benchmarks and revised recommendations.</li>
              </ul>
            </section>

            {/* 3. Prohibited Content & Safety Policy */}
            <section className="rounded-3xl border border-red-500/20 bg-red-500/5 p-6 sm:p-8 space-y-4">
              <div className="flex items-center gap-2 text-red-400 font-bold">
                <AlertTriangle className="h-5 w-5 shrink-0" />
                <h2 className="text-lg">3. Prohibited Content &amp; Safety Enforcements</h2>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Paste Prompts strictly enforces automated and human review filters prohibiting the following content:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-muted-foreground">
                <div className="p-3 rounded-xl bg-black/40 border border-white/5">
                  <strong className="text-foreground block mb-1">✕ Malicious Workflows:</strong> Prompts intended to generate malware, automated scraping exploits, vulnerability bypasses, or jailbreaks.
                </div>
                <div className="p-3 rounded-xl bg-black/40 border border-white/5">
                  <strong className="text-foreground block mb-1">✕ Deceptive Spam &amp; Fraud:</strong> Prompts designed for phishing campaigns, mass fake reviews, deceptive affiliate cloaking, or impersonation.
                </div>
                <div className="p-3 rounded-xl bg-black/40 border border-white/5">
                  <strong className="text-foreground block mb-1">✕ Harmful Imagery:</strong> Midjourney or DALL-E prompts intended to generate non-consensual deepfakes, violent content, or hate speech.
                </div>
                <div className="p-3 rounded-xl bg-black/40 border border-white/5">
                  <strong className="text-foreground block mb-1">✕ Direct Plagiarism:</strong> Unauthorized republication of proprietary enterprise prompt architectures without consent.
                </div>
              </div>
            </section>

            {/* 4. Creator Accountability & Reporting */}
            <section className="space-y-4">
              <h2 className="font-display text-2xl font-bold flex items-center gap-2">
                <Scale className="h-5 w-5 text-primary-glow" /> 4. Creator Accountability &amp; Reviewer Transparency
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                All prompt reviews, sales statistics, and copy counters on Paste Prompts reflect actual verified platform transactions. We do not manufacture mock reviews or artificially inflate creator metrics.
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                If you encounter any prompt that does not perform as advertised, you are protected by our 14-day digital satisfaction warranty. In addition, you can report infringing or defective content directly via our{" "}
                <Link to="/dmca" className="text-primary-glow underline">Takedown &amp; Copyright Notice</Link> or{" "}
                <Link to="/contact" className="text-primary-glow underline">Support Desk</Link>.
              </p>
            </section>
          </div>
        </motion.div>
      </div>
    </Layout>
  );
}
