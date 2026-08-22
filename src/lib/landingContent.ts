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
    metaDescription: `Hundreds of tested ChatGPT prompts for writing, marketing, business and productivity. Free & premium — copy, paste and run in seconds (${YEAR}).`,
    lead: "A curated, tested library of ChatGPT prompts for real work — copywriting, marketing, business, coding and productivity. Copy, paste and run.",
    filters: { model: "chatgpt", sort: "trending", limit: 48 },
    sections: [
      {
        h2: `The best ChatGPT prompts for ${YEAR}`,
        paragraphs: [
          "ChatGPT is only as good as the prompt you give it. Type a vague question and you get a vague, average answer; give it a clear role, context and format and it produces work you can actually ship. Every prompt in this collection is engineered that way — with the role, constraints and output format built in, so you get professional results on the first try.",
          "Instead of hunting through Reddit threads and screenshots, you get a searchable, tested library. Filter by free or premium, grab the one you need, swap in your details and run it. No sign-up required to browse, and hundreds are completely free.",
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
      { q: "Are these ChatGPT prompts free?", a: "Hundreds are completely free to copy and use — no account needed. Premium prompts go deeper with advanced, multi-step frameworks. Use the free filter to see them all." },
      { q: "Do the prompts work with GPT-4o and the latest ChatGPT?", a: "Yes. The prompts are model-agnostic in structure, so they work across every recent ChatGPT version, and most also work in Claude and Gemini." },
      { q: "How do I use a ChatGPT prompt?", a: "Copy the prompt, open a new ChatGPT chat, paste it, then replace the [PLACEHOLDERS] with your own product, audience or goal and hit send." },
    ],
    related: ["free-ai-prompts", "claude-prompts", "gemini-prompts"],
  },
  "claude-prompts": {
    slug: "claude-prompts",
    title: "Claude AI Prompts",
    heading: "Claude prompts for serious work",
    metaDescription: `Tested Claude AI prompts for long-form writing, analysis, research and coding. Free & premium prompts built for Anthropic's Claude — copy and paste.`,
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
    metaDescription: `Tested Google Gemini prompts for research, summarising, planning and everyday work. Free & premium prompts — copy, paste and run in seconds.`,
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
    metaDescription: `Tested, copy-ready DALL-E 3 prompts for flat vectors, logo designs, isometric graphics and digital art. Copy and run in ChatGPT or Bing (${YEAR}).`,
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
          "This collection spans various design disciplines: flat 2D vector graphics, clean brand logos, detailed isometric illustrations, 3D claymation styles, and high-fidelity UI mockups. With the styling parameters pre-tested, you spend less time guessing keywords and more time generating assets.",
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
    metaDescription: `Tested Sora video prompts for cinematic visual generation, drone flyovers, and detailed 3D animations. Copy, paste and generate videos (${YEAR}).`,
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
    metaDescription: `Hundreds of free AI prompts for ChatGPT, Claude, Gemini & Midjourney. No sign-up to browse — copy, paste and run in seconds (${YEAR}).`,
    lead: "Hundreds of genuinely free, tested prompts for ChatGPT, Claude, Gemini and Midjourney. No sign-up to browse — copy and go.",
    filters: { price: "free", sort: "trending", limit: 48 },
    sections: [
      {
        h2: "Free prompts, no strings attached",
        paragraphs: [
          "Plenty of sites promise free AI prompts and then hide them behind a sign-up wall. These are genuinely free — browse and copy without an account. Every one is tested and parameterised, so you get real results, not filler.",
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
};

export function getLandingContent(slug: string): LandingContent | undefined {
  return LANDING_PAGES[slug];
}

export const LANDING_SLUGS = Object.keys(LANDING_PAGES);

export { YEAR as LANDING_YEAR };
