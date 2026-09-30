/**
 * High-intent SEO landing pages ("Stage 3").
 *
 * These pages target the exact phrases people type into Google — "chatgpt
 * prompts", "free ai prompts", "midjourney prompts" — rather than the site's
 * internal category taxonomy. Each landing page pulls a live, filtered slice of
 * the marketplace (by model and/or price) and wraps it in unique, long-form
 * editorial content plus rich structured data so it can rank on its own.
 *
 * Add a new entry here to spin up a fully-formed, indexable landing page at
 * /prompts/:slug — no page code changes required.
 */

import type { BrowseFilters } from "@/lib/queries";

export interface LandingSection {
  h2: string;
  paragraphs: string[];
}

export interface LandingFaq {
  q: string;
  a: string;
}

export interface LandingContent {
  slug: string;
  /** SEO <title> base (brand appended automatically). Keep under ~52 chars. */
  title: string;
  /** H1 shown on the page. */
  heading: string;
  /** Meta description, ~150-160 chars. */
  metaDescription: string;
  /** One-line lead under the H1. */
  lead: string;
  /** Live marketplace filter that populates the prompt grid. */
  filters: BrowseFilters;
  /** Long-form body sections rendered below the grid. */
  sections: LandingSection[];
  faqs: LandingFaq[];
  /** Related landing slugs for internal linking. */
  related?: string[];
}

const YEAR = new Date().getFullYear();

export const LANDING_PAGES: Record<string, LandingContent> = {
  "chatgpt-prompts": {
    slug: "chatgpt-prompts",
    title: "ChatGPT Prompts",
    heading: "ChatGPT prompts that actually work",
    metaDescription: `Browse ChatGPT prompts for writing, marketing, business and productivity. Free and 49p listings — copy, paste and run (${YEAR}).`,
    lead: "A searchable library of ChatGPT prompts for real work — copywriting, marketing, business, coding and productivity. Copy, paste and run.",
    filters: { model: "chatgpt", sort: "trending", limit: 48 },
    sections: [
      {
        h2: `The best ChatGPT prompts for ${YEAR}`,
        paragraphs: [
          "ChatGPT is only as good as the prompt you give it. Type a vague question and you get a vague, average answer; give it a clear role, context and format and it produces work you can actually ship. Every prompt in this collection is engineered that way — with the role, constraints and output format built in, so you get professional results on the first try.",
          "Instead of hunting through Reddit threads and screenshots, you get a searchable library. Filter by free or paid, choose the one you need, swap in your details and run it. No sign-up is required to browse.",
        ],
      },
      {
        h2: "What you can do with these ChatGPT prompts",
        paragraphs: [
          "This library spans the full range of what ChatGPT is great at: high-converting sales copy and emails, marketing strategy and ad campaigns, business plans and analysis, study and learning systems, coding help, and personal productivity. Each prompt is parameterised, so you reuse it across every project rather than starting from a blank chat.",
          "New to prompting? Start with the free prompts to see what ChatGPT can really do, then explore premium packs that go deeper with multi-step frameworks.",
        ],
      },
    ],
    faqs: [
      { q: "Are these ChatGPT prompts free?", a: "Some are completely free to copy and use. Paid prompts cost 49p. Use the free filter to see the currently available free listings." },
      { q: "Do the prompts work with GPT-4o and the latest ChatGPT?", a: "Yes. The prompts are model-agnostic in structure, so they work across every recent ChatGPT version, and most also work in Claude and Gemini." },
      { q: "How do I use a ChatGPT prompt?", a: "Copy the prompt, open a new ChatGPT chat, paste it, then replace the [PLACEHOLDERS] with your own product, audience or goal and hit send." },
    ],
    related: ["free-ai-prompts", "claude-prompts", "gemini-prompts"],
  },
  "claude-prompts": {
    slug: "claude-prompts",
    title: "Claude AI Prompts",
    heading: "Claude prompts for serious work",
    metaDescription: `Browse Claude AI prompts for long-form writing, analysis, research and coding. Free and 49p listings for Anthropic's Claude.`,
    lead: "Prompts tuned to Claude's strengths — long-context writing, careful reasoning, analysis and structured output. Copy, paste and run.",
    filters: { model: "claude", sort: "trending", limit: 48 },
    sections: [
      {
        h2: "Prompts built for how Claude thinks",
        paragraphs: [
          "Claude excels at long-context work, nuanced reasoning and following detailed instructions faithfully — but it rewards structure. These prompts are written to play to those strengths: clear roles, explicit constraints and format specs that get Claude to produce thorough, well-organised output instead of hedged summaries.",
          "Whether you're drafting long documents, analysing a dataset in plain English, summarising research, or writing and reviewing code, there's a parameterised, reusable prompt here for it.",
        ],
      },
      {
        h2: "Where Claude prompts shine",
        paragraphs: [
          "Use this collection for long-form articles and reports, careful document analysis, research synthesis, coding and code review, and any task where accuracy and structure matter more than speed. Each prompt is copy-paste ready and works across Claude models.",
          "Many prompts here also run well in ChatGPT and Gemini, so you're never locked to one tool.",
        ],
      },
    ],
    faqs: [
      { q: "Are these prompts made specifically for Claude?", a: "They're tuned to Claude's strengths — long context, structured reasoning and instruction-following — but most also work in ChatGPT and Gemini." },
      { q: "Is Claude better than ChatGPT for these prompts?", a: "Claude often wins on long documents and careful analysis; ChatGPT on speed and breadth. See our guide comparing ChatGPT, Claude and Gemini to choose." },
      { q: "Can I use these Claude prompts for free?", a: "Yes — many are free to copy right now. Filter by free to browse them without signing up." },
    ],
    related: ["chatgpt-prompts", "gemini-prompts", "free-ai-prompts"],
  },
  "gemini-prompts": {
    slug: "gemini-prompts",
    title: "Google Gemini Prompts",
    heading: "Gemini prompts for research & productivity",
    metaDescription: `Browse Google Gemini prompts for research, summarising, planning and everyday work. Free and 49p listings ready to copy and adapt.`,
    lead: "Prompts that get the most out of Google Gemini — research, summarising, planning and multimodal tasks. Copy, paste and run.",
    filters: { model: "gemini", sort: "trending", limit: 48 },
    sections: [
      {
        h2: "Get more from Google Gemini",
        paragraphs: [
          "Gemini is a powerful all-rounder that's especially strong at research, summarising and pulling in fresh information. These prompts are structured to steer it toward focused, useful output — clear roles, explicit tasks and formats — instead of the generic answers you get from a one-line question.",
          "From planning your week to summarising a long document to drafting content, every prompt is parameterised so you can reuse it again and again.",
        ],
      },
      {
        h2: "What these Gemini prompts cover",
        paragraphs: [
          "Find prompts for research and fact-finding, summarising articles and reports, weekly and project planning, content drafting, and everyday productivity. Each one is copy-paste ready and works across Gemini's models.",
          "Most also work in ChatGPT and Claude, so you can pick whichever assistant you already use.",
        ],
      },
    ],
    faqs: [
      { q: "Do these prompts work with Gemini?", a: "Yes — they're written to work across current Gemini models, and most also work in ChatGPT and Claude." },
      { q: "What is Gemini best at?", a: "Research, summarising and everyday productivity, with strong multimodal support. The prompts here lean into those strengths." },
      { q: "Are the Gemini prompts free?", a: "Many are free to copy right now. Use the free filter to see them all — no sign-up needed." },
    ],
    related: ["chatgpt-prompts", "claude-prompts", "free-ai-prompts"],
  },
  "midjourney-prompts": {
    slug: "midjourney-prompts",
    title: "Midjourney Prompts",
    heading: "Midjourney prompts for stunning images",
    metaDescription: `Copy-ready Midjourney prompts for logos, art, photography and design. Free & premium image prompts with the right parameters baked in.`,
    lead: "Image prompts engineered for Midjourney — styles, lighting, camera and aspect-ratio parameters baked in. Copy, paste and generate.",
    filters: { model: "midjourney", sort: "trending", limit: 48 },
    sections: [
      {
        h2: "Midjourney prompts that get the look right",
        paragraphs: [
          "Great Midjourney images come from precise prompting — the right style references, lighting, lens, composition and parameters. These prompts speak Midjourney's language, so you spend less time guessing and more time generating images that actually match what's in your head.",
          "Each prompt is a reusable template: swap the subject, keep the proven styling, and generate consistent results across a whole project.",
        ],
      },
      {
        h2: "From concept art to brand assets",
        paragraphs: [
          "Use these for logos and brand marks, product photography, character and concept art, illustration styles, backgrounds and textures, and social media visuals. The hard part — the styling and parameters — is already done for you.",
          "Filter by free to experiment, then unlock premium packs for polished, production-ready looks.",
        ],
      },
    ],
    faqs: [
      { q: "Do these prompts include Midjourney parameters?", a: "Yes — the proven parameters (aspect ratio, stylize, quality and style references) are built into each prompt so you get the intended look." },
      { q: "Which Midjourney version do they work with?", a: "They're written for current Midjourney versions; you can adjust parameters for older versions if needed." },
      { q: "Are the Midjourney prompts free?", a: "Many are free to copy and try. Use the free filter to browse them without signing up." },
    ],
    related: ["free-ai-prompts", "chatgpt-prompts"],
  },
  "dalle-prompts": {
    slug: "dalle-prompts",
    title: "DALL-E 3 Prompts",
    heading: "DALL-E 3 prompts for beautiful illustration & design",
    metaDescription: `Browse DALL-E 3 prompts for flat vectors, logo designs, isometric graphics and digital art. Copy and run in ChatGPT or Bing (${YEAR}).`,
    lead: "Image prompts engineered for DALL-E 3. Leverage its unmatched text rendering and exact spatial composition. Copy, paste and generate.",
    filters: { model: "dalle", sort: "trending", limit: 48 },
    sections: [
      {
        h2: "Engineered prompts for DALL-E 3",
        paragraphs: [
          "DALL-E 3 is remarkably good at following exact instructions, rendering complex text labels, and keeping spatial compositions precise. However, it can occasionally output generic cartoonish styles if not properly guided. These prompts are engineered with advanced artistic descriptors, precise flat-vector styling, and rendering constraints to ensure professional results.",
          "Every prompt acts as a fully customizable template: simply replace the main subject inside the bracketed placeholders while preserving the proven style variables to generate matching visual sets for your projects.",
        ],
      },
      {
        h2: "Create flat vectors, logos, and UI assets",
        paragraphs: [
          "This collection spans various design disciplines: flat 2D vector graphics, clean brand logos, detailed isometric illustrations, 3D claymation styles, and high-fidelity UI mockups. Detailed styling parameters help you spend less time guessing keywords and more time generating assets.",
          "Many of these prompts also produce interesting results in Midjourney and Stable Diffusion, giving you multi-platform versatility.",
        ],
      },
    ],
    faqs: [
      { q: "Do these prompts work with ChatGPT Plus?", a: "Yes. ChatGPT Plus uses DALL-E 3 natively, so copying these prompts and pasting them into ChatGPT will produce the expected high-fidelity results." },
      { q: "Can I use these prompts in Microsoft Copilot / Bing?", a: "Yes, Microsoft's Image Creator is powered by DALL-E 3, making these prompts highly effective on both platforms." },
      { q: "Are there free DALL-E prompts?", a: "Absolutely. Many prompts in our library are 100% free to copy and use. Simply toggle the free filter to find them." },
    ],
    related: ["midjourney-prompts", "free-ai-prompts", "sora-prompts"],
  },
  "sora-prompts": {
    slug: "sora-prompts",
    title: "Sora AI Video Prompts",
    heading: "Sora AI prompts for stunning cinematic videos",
    metaDescription: `Browse Sora video prompts for cinematic scenes, drone flyovers and detailed 3D animations. Copy, adapt and generate videos (${YEAR}).`,
    lead: "Open the door to next-generation video generation with Sora prompts featuring cinematic camera direction, realistic physics, and precise lighting.",
    filters: { model: "sora", sort: "trending", limit: 48 },
    sections: [
      {
        h2: "The ultimate formulas for Sora video prompting",
        paragraphs: [
          "OpenAI's Sora text-to-video engine produces incredible realism, but it demands rich descriptive detail regarding camera motion, lighting conditions, physical context, and fluid motion. These prompts are structured professionally: starting with the core subject, followed by cinematic camera instructions (e.g., tracking shots, slow pan), specific lighting (e.g., golden hour, moody chiaroscuro), and motion parameters.",
          "By utilizing these structured templates, you can easily swap subjects while keeping the video's motion cadence, film stock texture, and camera fluidity perfectly intact.",
        ],
      },
      {
        h2: "From hyper-realistic footage to stylized animations",
        paragraphs: [
          "Find prompts covering cinematic movie trailers, high-altitude drone photography, slow-motion food closeups, stylized 3D game loops, and retro claymation. Whether you are creating short-form marketing content or experimenting with cinematic storytelling, these prompts provide the ultimate starting blueprints.",
          "Our video prompts are also highly optimized for other top video models like Runway Gen-3, Luma Dream Machine, and Kling AI, ensuring you get gorgeous motion across any model.",
        ],
      },
    ],
    faqs: [
      { q: "What makes a good Sora video prompt?", a: "A great video prompt specifies the action, cinematic camera movement, lighting, environmental details, and desired frame rate/style. Our prompts handle the styling and cinematography work for you." },
      { q: "Can these video prompts be used in Runway or Luma?", a: "Yes, these dense and cinematic descriptive prompts translate exceptionally well to Runway Gen-3 Alpha, Luma Dream Machine, and Kling AI." },
      { q: "Are these video prompts free?", a: "We offer both free and premium video prompts. You can copy free video prompts instantly with a single click." },
    ],
    related: ["dalle-prompts", "midjourney-prompts", "free-ai-prompts"],
  },
  "free-ai-prompts": {
    slug: "free-ai-prompts",
    title: "Free AI Prompts",
    heading: "Free AI prompts you can use right now",
    metaDescription: `Browse free AI prompts for ChatGPT, Claude, Gemini and Midjourney. No sign-up to browse — copy, adapt and run (${YEAR}).`,
    lead: "Browse the free prompts currently listed for ChatGPT, Claude, Gemini and Midjourney. No sign-up to browse — copy and go.",
    filters: { price: "free", sort: "trending", limit: 48 },
    sections: [
      {
        h2: "Free prompts, no strings attached",
        paragraphs: [
          "Plenty of sites promise free AI prompts and then hide them behind a sign-up wall. These listings are genuinely free to browse and copy without an account, with reusable fields you can replace with your own details.",
          "Create a free account only when you want to save prompts to your own library, get notified about new drops, and keep your favourites in one place. Browsing and copying stays free.",
        ],
      },
      {
        h2: "Free prompts for every tool and task",
        paragraphs: [
          "This collection covers writing and copywriting, marketing and business, productivity, image generation and more — across ChatGPT, Claude, Gemini and Midjourney. Start here, prove the value, then explore premium packs when you want to go deeper.",
          "Sorted by what's trending, so the prompts other people are actually using rise to the top.",
        ],
      },
    ],
    faqs: [
      { q: "Are these AI prompts really free?", a: "Yes — everything on this page is free to copy and use, with no account required to browse. You only sign up if you want to save prompts to a personal library." },
      { q: "Which AI tools do the free prompts work with?", a: "ChatGPT, Claude, Gemini and Midjourney, among others. Each prompt is tagged with its recommended tool." },
      { q: "Do I need to sign up?", a: "No sign-up is needed to browse or copy. A free account just lets you save favourites, build a library and get new-prompt alerts." },
    ],
    related: ["chatgpt-prompts", "claude-prompts", "gemini-prompts", "midjourney-prompts"],
  },
  "coding-prompts": {
    slug: "coding-prompts",
    title: "AI Coding Prompts",
    heading: "AI coding prompts for developers & software engineers",
    metaDescription: `Browse AI coding prompts for React, Python, SQL, TypeScript, and refactoring. Free and 49p prompts for ChatGPT, Claude, and Cursor (${YEAR}).`,
    lead: "Developer prompts for React, Python, SQL, architecture design, and automated testing. Copy, paste, and ship faster code.",
    filters: { categorySlug: "coding-troubleshooting", sort: "trending", limit: 48 },
    sections: [
      {
        h2: "Code faster with battle-tested LLM prompts",
        paragraphs: [
          "AI coding assistants like Claude 3.7 Sonnet, ChatGPT GPT-4o, and Cursor are only as effective as the architectural context and constraints you feed them. A vague prompt returns buggy, unoptimised code. An engineered developer prompt establishes strict type definitions, error boundaries, test requirements, and framework conventions up front.",
          "This collection covers full-stack web development, algorithmic optimization, unit testing, database schema design, and complex bug troubleshooting across modern languages.",
        ],
      },
      {
        h2: "From architecture design to automated refactoring",
        paragraphs: [
          "Each prompt in this section is parameterised: replace code snippets, target framework versions, or data schemas in bracketed placeholders while preserving the structural constraints that prevent hallucinated APIs and outdated syntax.",
          "Use these prompts in ChatGPT, Claude Sonnet, Cursor, or Copilot to generate production-ready code with minimal revision.",
        ],
      },
    ],
    faqs: [
      { q: "Do these coding prompts work with Claude 3.7 Sonnet and Cursor?", a: "Yes. They are specifically structured with technical constraints that work exceptionally well across Claude 3.7 Sonnet, GPT-4o, DeepSeek R1, and Cursor." },
      { q: "Can I use these developer prompts for commercial client projects?", a: "Yes. All code generated using these prompts is yours to use in proprietary, client, or open-source software without restriction." },
      { q: "Are there free coding prompts available?", a: "Yes. Multiple coding prompts are 100% free to copy instantly. Filter by free to view them." },
    ],
    related: ["chatgpt-prompts", "claude-prompts", "free-ai-prompts"],
  },
  "copywriting-prompts": {
    slug: "copywriting-prompts",
    title: "AI Copywriting Prompts",
    heading: "High-converting AI copywriting prompts & templates",
    metaDescription: `Browse AI copywriting prompts for sales pages, email sequences, ad copy, and VSLs. Free and 49p templates for ChatGPT and Claude (${YEAR}).`,
    lead: "Copywriting frameworks (AIDA, PAS, 4 Ps) baked into copy-and-paste AI prompts. Generate sales pages, cold emails, and ad copy.",
    filters: { categorySlug: "copywriting", sort: "trending", limit: 48 },
    sections: [
      {
        h2: "Copywriting prompts that sound like human copywriters",
        paragraphs: [
          "Most AI copy sounds robotic, generic, and unconvincing because it lacks conversion principles. These prompts embed proven direct-response frameworks directly into system instructions, forcing the AI to focus on customer pain points, hooks, social proof, and compelling calls-to-action.",
          "Whether you are writing sales letters, 5-part email launch sequences, high-ROAS Meta and Google ad variations, or landing page headlines, these parameterised templates give you agency-grade copy in seconds.",
        ],
      },
      {
        h2: "Reusable marketing copy formulas",
        paragraphs: [
          "Swap in your product features, target audience avatar, and unique value proposition into bracketed placeholders. The prompt handles tone calibration, rhythm, and conversion mechanics automatically.",
          "Works seamlessly in ChatGPT, Claude, and Gemini.",
        ],
      },
    ],
    faqs: [
      { q: "Do these prompts include copywriting frameworks like PAS or AIDA?", a: "Yes. Prompts specify proven direct-response frameworks (AIDA, PAS, Before-After-Bridge) so the generated copy is structured to convert." },
      { q: "Can I use the copy generated for client work?", a: "Yes. All generated copy can be published on client websites, ad accounts, and email broadcasts without royalty fees." },
      { q: "Are there free copywriting prompts?", a: "Yes. Filter by free to access free copywriting prompts ready to copy without an account." },
    ],
    related: ["chatgpt-prompts", "claude-prompts", "free-ai-prompts"],
  },
  "business-prompts": {
    slug: "business-prompts",
    title: "AI Business Prompts",
    heading: "AI business prompts for strategy, planning & growth",
    metaDescription: `Browse AI business prompts for business plans, market research, pitch decks, and financial modeling. Free and 49p templates (${YEAR}).`,
    lead: "Strategic business frameworks, competitor intelligence matrices, and pitch deck blueprints parameterised for founders and executives.",
    filters: { categorySlug: "business-marketing", sort: "trending", limit: 48 },
    sections: [
      {
        h2: "Accelerate business strategy and planning with AI",
        paragraphs: [
          "Building a business requires deep market analysis, financial modeling, positioning strategy, and operational planning. These AI prompts convert vague strategic goals into structured frameworks: SWOT matrices, TAM/SAM market sizing, investor pitch deck slides, and customer acquisition playbooks.",
          "Instead of starting from a blank page, use battle-tested executive templates to analyze opportunities, identify market gaps, and streamline business operations.",
        ],
      },
      {
        h2: "Designed for founders, consultants, and operators",
        paragraphs: [
          "Every business prompt includes explicit variable inputs for target industries, pricing tiers, and competitor benchmarks. Use them in ChatGPT or Claude to draft comprehensive business documentation in minutes.",
        ],
      },
    ],
    faqs: [
      { q: "Can AI prompts help create business plans or pitch decks?", a: "Yes. These prompts provide the exact structural prompts used by venture-backed startups and management consultants." },
      { q: "Which AI models are best for business strategy?", a: "Claude 3.7 Sonnet and ChatGPT (GPT-4o) excel at strategic reasoning and long-context business analysis." },
      { q: "Are free business prompts available?", a: "Yes. Toggle the free filter to browse business strategy prompts instantly." },
    ],
    related: ["chatgpt-prompts", "claude-prompts", "copywriting-prompts"],
  },
  "flux-prompts": {
    slug: "flux-prompts",
    title: "FLUX.1 AI Prompts",
    heading: "FLUX.1 prompts for photorealistic AI image generation",
    metaDescription: `Copy-ready FLUX.1 prompts for photorealism, typography, product photography, and 3D renders. Free and 49p formulas (${YEAR}).`,
    lead: "Image prompts engineered for FLUX.1 Schnell & Dev models. Master lighting, photorealism, camera lenses, and crisp text rendering.",
    filters: { model: "flux", sort: "trending", limit: 48 },
    sections: [
      {
        h2: "Unlock the full power of FLUX.1 image generation",
        paragraphs: [
          "FLUX.1 by Black Forest Labs has redefined open-weights image generation with incredible prompt adherence, natural photorealism, and clean text rendering. However, achieving studio-grade imagery requires precise descriptive cues, camera parameters, and lighting descriptors.",
          "These prompts are parameterised formulas for hyper-realistic portraits, editorial product photography, cinematic film stills, and graphic typography.",
        ],
      },
      {
        h2: "Consistent photorealism across FLUX.1 Dev & Schnell",
        paragraphs: [
          "Simply swap the main subject inside bracketed placeholders while maintaining proven photographic styling parameters. Use these prompts in Fal.ai, Replicate, HuggingFace, or local ComfyUI workflows.",
        ],
      },
    ],
    faqs: [
      { q: "Do these prompts work on both FLUX.1 Dev and Schnell?", a: "Yes. They are engineered to produce exceptional photorealism and crisp typography across all FLUX.1 model variants." },
      { q: "Can I use FLUX.1 generated images commercially?", a: "Commercial usage depends on the specific FLUX license model used, but prompt parameters are 100% free for open use." },
      { q: "Are free FLUX prompts included?", a: "Yes. Browse free FLUX image prompts ready to copy with a single click." },
    ],
    related: ["midjourney-prompts", "dalle-prompts", "free-ai-prompts"],
  },
};

export function getLandingContent(slug: string): LandingContent | undefined {
  return LANDING_PAGES[slug];
}

export const LANDING_SLUGS = Object.keys(LANDING_PAGES);

export { YEAR as LANDING_YEAR };
