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
  /** Thin collections stay reachable but are kept out of search indexes. */
  noindex?: boolean;
  /** Matching marketplace category page, when one exists. */
  categoryPath?: string;
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
    metaDescription: `Copy-ready Midjourney prompts for logos, art, photography and design. Free and 49p image prompts with suggested parameters included.`,
    lead: "Image prompts engineered for Midjourney — with suggested style, lighting, camera and aspect-ratio parameters. Copy, paste and generate.",
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
    heading: "DALL-E 3 image prompts",
    metaDescription: "DALL-E 3 image prompts on Paste Prompts. See the current listings, how to adapt them in ChatGPT, and related Midjourney and image collections.",
    lead: "Image prompts written for DALL-E 3, which you can run inside ChatGPT. Ten new templates cover product, portrait, food, architecture, poster and character scenes.",
    filters: { model: "dalle", sort: "trending", limit: 48 },
    sections: [
      {
        h2: "What these prompts are for",
        paragraphs: [
          "DALL-E 3 follows plain-language descriptions closely, so a useful prompt states the subject, setting, style, composition and any text that should appear in the image. The listings here are templates: replace the bracketed subject and keep the style instructions.",
          "For more image ideas, the FLUX.1 and Midjourney collections cover similar subjects with wording suited to those models.",
        ],
      },
    ],
    faqs: [
      { q: "Where can I run a DALL-E 3 prompt?", a: "DALL-E 3 image generation is available inside ChatGPT. Availability depends on your OpenAI plan." },
      { q: "Which prompts appear here?", a: "Only approved prompts written for DALL-E. Each listing shows the full description and price before you buy." },
    ],
    related: ["midjourney-prompts", "sora-prompts", "free-ai-prompts"],
  },
  "sora-prompts": {
    slug: "sora-prompts",
    title: "Sora AI Video Prompts",
    heading: "Sora video prompts",
    metaDescription: "Sora text-to-video prompts on Paste Prompts. See the current listings, what a video prompt should describe, and related image prompt collections.",
    lead: "Video prompts written for OpenAI's Sora. Templates cover product commercials, short social clips, demonstrations, brand stories, explainers and storyboard direction.",
    filters: { model: "sora", sort: "trending", limit: 48 },
    sections: [
      {
        h2: "What a video prompt needs",
        paragraphs: [
          "A text-to-video prompt works best when it describes the subject, the action, the camera movement, the lighting and the overall style in separate, clear phrases. The listings here use bracketed placeholders so you can swap the subject while keeping the camera and lighting directions.",
        ],
      },
    ],
    faqs: [
      { q: "Do these prompts work in other video tools?", a: "They are written for Sora. Other text-to-video tools accept similar descriptions, but results will differ, so expect to adjust them." },
      { q: "Why are there only a few prompts here?", a: "This page lists only approved prompts tagged for Sora. It will grow as creators publish more." },
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
    heading: "AI coding prompts for developers",
    metaDescription: "AI coding prompts on Paste Prompts for code review, SQL queries and pair programming with ChatGPT or Claude. See the current listings and related collections.",
    lead: "Prompts for everyday development work: reviewing and refactoring code, writing SQL and working through problems with an AI assistant. Templates also cover API integrations, test suites, authentication reviews, documentation and architecture decisions.",
    filters: { q: "code", sort: "trending", limit: 48 },
    sections: [
      {
        h2: "What these prompts are for",
        paragraphs: [
          "A coding prompt is most useful when it tells the assistant the language, the framework version, the code or schema involved and what a good answer looks like. The listings here use bracketed placeholders for those details.",
          "Always review and test AI-generated code before using it. These prompts help structure the request; they do not guarantee correct output.",
        ],
      },
    ],
    faqs: [
      { q: "Which assistants can I use these with?", a: "They are written as plain text, so you can paste them into ChatGPT, Claude or another chat-based assistant." },
      { q: "Which prompts appear here?", a: "Approved prompts that mention code, drawn from the Coding & Troubleshooting and Software Development categories." },
    ],
    related: ["chatgpt-prompts", "claude-prompts", "business-prompts"],
  },
  "copywriting-prompts": {
    slug: "copywriting-prompts",
    title: "AI Copywriting Prompts",
    heading: "AI copywriting prompts",
    metaDescription: "AI copywriting prompts for sales pages, emails, ads and headlines. Free and 49p prompts for ChatGPT and Claude on Paste Prompts.",
    lead: "Prompts for writing marketing copy with ChatGPT or Claude: sales pages, email sequences, ad variations and headlines.",
    filters: { categorySlug: "copywriting", sort: "trending", limit: 48 },
    categoryPath: "/category/copywriting",
    sections: [
      {
        h2: "What these prompts are for",
        paragraphs: [
          "Generic requests tend to produce generic copy. These prompts ask you for the product, the audience, the main benefit and the tone, and several are built around common copywriting structures such as AIDA (attention, interest, desire, action) and PAS (problem, agitate, solution).",
          "Use them as a first draft. Check claims, pricing and legal wording yourself before publishing anything an AI has written.",
        ],
      },
      {
        h2: "Who they are useful for",
        paragraphs: [
          "Small business owners writing their own marketing, freelancers who need a faster first draft, and marketers who want several variations to test.",
        ],
      },
    ],
    faqs: [
      { q: "Can I use the copy commercially?", a: "Yes. Text you generate with these prompts is yours to use, subject to the AI tool's own terms." },
      { q: "Are there free copywriting prompts?", a: "Some listings are free. Use the free filter on the browse page to see only free prompts." },
    ],
    related: ["business-prompts", "chatgpt-prompts", "claude-prompts"],
  },
  "business-prompts": {
    slug: "business-prompts",
    title: "AI Business Prompts",
    heading: "AI business and marketing prompts",
    metaDescription: "AI business prompts for planning, market research, marketing strategy and everyday operations. Free and 49p prompts for ChatGPT, Claude and Gemini.",
    lead: "Prompts for business planning and marketing work: researching a market, outlining a plan, positioning a product and organising campaigns.",
    filters: { categorySlug: "business-marketing", sort: "trending", limit: 48 },
    categoryPath: "/category/business-marketing",
    sections: [
      {
        h2: "What these prompts are for",
        paragraphs: [
          "These prompts turn a broad goal into a structured request, such as a SWOT analysis, a competitor comparison or a simple marketing plan. You fill in your industry, audience and constraints.",
          "AI output is a starting point, not professional financial or legal advice. Check figures and assumptions before relying on them.",
        ],
      },
      {
        h2: "Who they are useful for",
        paragraphs: [
          "Founders and sole traders doing their own planning, consultants preparing first drafts, and teams who want a consistent structure for recurring documents.",
        ],
      },
    ],
    faqs: [
      { q: "Which AI tools do these work with?", a: "The listings show which model each prompt was written for. Most are plain-text prompts for ChatGPT, Claude or Gemini." },
      { q: "Are free business prompts available?", a: "Some listings are free. Use the free filter on the browse page to see only free prompts." },
    ],
    related: ["copywriting-prompts", "chatgpt-prompts", "claude-prompts"],
  },
  "flux-prompts": {
    slug: "flux-prompts",
    title: "FLUX.1 AI Prompts",
    heading: "FLUX.1 image prompts",
    metaDescription: "FLUX.1 image prompts for product heroes, portraits, food, interiors, fashion, mockups and travel scenes. 49p templates with bracketed fields to fill in.",
    lead: "Photorealistic image prompts written for FLUX.1: product and e-commerce shots, editorial portraits, food, interiors, fashion, book mockups, travel and concept art.",
    filters: { q: "flux", sort: "trending", limit: 48 },
    sections: [
      {
        h2: "What these prompts are for",
        paragraphs: [
          "FLUX.1 responds well to concrete visual direction. Each template asks for the subject, setting, lighting, viewpoint and aspect ratio, and tells the model what not to invent, such as extra text, logos or landmarks.",
          "Fill in every bracketed field with specific details. Vague inputs give generic images, so describe materials, light direction and framing rather than adjectives like \"stunning\".",
        ],
      },
    ],
    faqs: [
      { q: "Can I sell FLUX prompts here?", a: "Yes. Creators can submit image prompts for review from the Sell page." },
    ],
    related: ["midjourney-prompts", "dalle-prompts", "free-ai-prompts"],
  },
};

export function getLandingContent(slug: string): LandingContent | undefined {
  return LANDING_PAGES[slug];
}

export const LANDING_SLUGS = Object.keys(LANDING_PAGES);

export { YEAR as LANDING_YEAR };
