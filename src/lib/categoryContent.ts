/**
 * Unique, long-form editorial content for each marketplace category.
 *
 * Category pages are the primary keyword-targeting surface of the site
 * ("copywriting prompts", "make money online prompts", etc). Thin, templated
 * category pages get devalued by search engines, so each category gets its own
 * hand-written SEO title, meta description, intro, body sections and FAQ that
 * target real search intent. Any category without a bespoke entry falls back to
 * a sensible generic template.
 */

export interface CategorySection {
  h2: string;
  paragraphs: string[];
}

export interface CategoryFaq {
  q: string;
  a: string;
}

export interface CategoryContent {
  /** SEO <title> base (brand is appended automatically). Keep under ~48 chars. */
  title: string;
  /** Meta description, ~150-160 chars. */
  metaDescription: string;
  /** One-line lead shown under the H1. */
  lead: string;
  /** Long-form body sections rendered below the prompt grid. */
  sections: CategorySection[];
  faqs: CategoryFaq[];
}

const YEAR = new Date().getFullYear();

export const CATEGORY_CONTENT: Record<string, CategoryContent> = {
  copywriting: {
    title: "Copywriting AI Prompts",
    metaDescription:
      "Free & premium copywriting AI prompts for ChatGPT, Claude & Gemini — sales pages, emails, ads and landing copy that convert. Copy, paste and publish in seconds.",
    lead: "Sales pages, VSLs, landing copy, cold emails and DM scripts that convert — engineered as reusable, parameterised prompts.",
    sections: [
      {
        h2: "Copywriting prompts that actually convert",
        paragraphs: [
          "Generic AI copy reads like AI copy: safe, vague and forgettable. The prompts in this collection are built the way professional copywriters brief a project — with a clear role, a defined audience, a single conversion goal and the proven frameworks (AIDA, PAS, the 4 Ps) baked directly into the instructions. You fill in your product details, run the prompt, and get copy that sounds like a human who understands persuasion wrote it.",
          "Whether you need a long-form sales page, a five-email launch sequence, Google and Meta ad variations, or a cold outreach script, each prompt is parameterised so you can reuse it across every product you launch. No more starting from a blank page.",
        ],
      },
      {
        h2: "What you can create with these prompts",
        paragraphs: [
          "This category covers the full conversion funnel: high-converting landing page heroes, long-form sales letters and VSL scripts, welcome and abandoned-cart email sequences, cold email and LinkedIn DM openers, product descriptions, and ad copy tuned for each platform's format and character limits.",
          "Every prompt works across ChatGPT, Claude and Gemini. Pick the model you already pay for — the structure does the heavy lifting, not the specific AI.",
        ],
      },
    ],
    faqs: [
      { q: "Do these copywriting prompts work with ChatGPT and Claude?", a: "Yes. Every prompt is written to paste straight into ChatGPT, Claude, Gemini or any modern LLM. The persuasion frameworks are built into the prompt, so results are consistent across models." },
      { q: "Can I use the copy I generate commercially?", a: "Absolutely. The output is yours to use for your own products, clients and campaigns. You're buying a reusable prompt, not a one-off piece of text." },
      { q: "Are there free copywriting prompts?", a: "Yes — many prompts in this category are completely free to copy and use. Filter by free to see them all, no sign-up required." },
    ],
  },
  "make-money-online": {
    title: "Make Money Online AI Prompts",
    metaDescription:
      "Battle-tested make money online AI prompts for side hustles, freelancing, e-commerce and digital products. Free & premium prompts for ChatGPT, Claude & Gemini.",
    lead: "Battle-tested prompts for side hustles, freelancing, e-commerce and digital products — from idea to first sale.",
    sections: [
      {
        h2: "AI prompts for building an online income",
        paragraphs: [
          "Making money online is mostly a research, positioning and execution problem — exactly the kind of work AI is good at when you brief it properly. These prompts help you validate a business idea before you build it, find under-served niches, price your offer, write the listing that sells it, and plan the content that drives traffic.",
          "Instead of asking AI a vague question and getting a listicle back, each prompt walks the model through a structured process: it scores ideas against real criteria, stress-tests demand, and hands you an actionable next step rather than generic advice.",
        ],
      },
      {
        h2: "From side hustle to scalable offer",
        paragraphs: [
          "Use these prompts to spin up freelance service descriptions, e-commerce product research and listings, digital product concepts (templates, courses, ebooks), affiliate content angles, and outreach that lands clients. Each one is parameterised so you can run it again for every new niche or product you test.",
          "They pair perfectly with the free prompts in this category — start free, prove the concept, then upgrade to the premium prompts that go deeper.",
        ],
      },
    ],
    faqs: [
      { q: "Can AI prompts really help me make money online?", a: "AI won't hand you a business, but it dramatically speeds up the parts that stall most people: idea validation, positioning, copy and content. These prompts turn a vague goal into a concrete, testable plan." },
      { q: "Do I need any technical skills to use these?", a: "No. Copy the prompt, paste it into ChatGPT, Claude or Gemini, fill in your details, and follow the output. If you can send an email, you can use these prompts." },
      { q: "Are the make money online prompts free?", a: "Many are free to copy right now. Premium prompts go deeper with multi-step frameworks — filter by price to compare." },
    ],
  },
  "business-marketing": {
    title: "Business & Marketing AI Prompts",
    metaDescription:
      "Business & marketing AI prompts for strategy, ads, funnels, email and growth. Free & premium ChatGPT, Claude & Gemini prompts for founders and marketers.",
    lead: "Strategy, positioning, ads, funnels, email and growth playbooks — parameterised for any business.",
    sections: [
      {
        h2: "Marketing prompts for founders and teams",
        paragraphs: [
          "Marketing is where most small teams lose time reinventing the wheel. These prompts encode the playbooks agencies charge thousands for: positioning statements, ideal-customer profiles, full funnel maps, ad campaign structures, and content calendars — ready to adapt to your business in minutes.",
          "Each prompt is designed to produce a usable deliverable, not a wall of theory. You get the messaging matrix, the email sequence, the campaign brief — the actual thing you were going to spend an afternoon writing.",
        ],
      },
      {
        h2: "Cover the whole growth engine",
        paragraphs: [
          "This category spans brand positioning and messaging, paid social and search ad copy, landing and funnel strategy, lifecycle and newsletter email, SEO content briefs, and social growth systems. Run one prompt to set strategy, then chain the others to execute it.",
          "Works across ChatGPT, Claude and Gemini so you can plug it into whatever your team already uses.",
        ],
      },
    ],
    faqs: [
      { q: "Who are these marketing prompts for?", a: "Founders, solo marketers, agencies and side-project builders who want agency-grade marketing output without the agency retainer. They scale from a one-person shop to a full team." },
      { q: "Will these help with paid ads?", a: "Yes. There are prompts for ad angles, hooks and platform-specific copy for Meta, Google and TikTok, plus campaign structure and testing plans." },
      { q: "Do you have free marketing prompts?", a: "Yes — plenty. Filter this category by free to copy them instantly, no account needed." },
    ],
  },
  "ai-tools": {
    title: "AI Tools Power-User Prompts",
    metaDescription:
      "Power-user AI prompts for ChatGPT, Claude, Midjourney, Gemini and Sora. Free & premium prompts to get more from every AI tool — copy, paste and go.",
    lead: "Power-user prompts for ChatGPT, Claude, Midjourney, Gemini and Sora — get more from every tool you already pay for.",
    sections: [
      {
        h2: "Get more from the AI tools you already use",
        paragraphs: [
          "Most people use a fraction of what modern AI tools can do. These prompts unlock the advanced behaviour: multi-step reasoning, structured output, image and video generation direction, custom instructions, and workflow automations that turn a chatbot into a genuine productivity engine.",
          "Each prompt is tuned to the strengths of a specific tool — Midjourney and Sora prompts speak the language of visual generation, while ChatGPT and Claude prompts lean into reasoning, formatting and long-context work.",
        ],
      },
      {
        h2: "Prompts built for each platform",
        paragraphs: [
          "Find image prompts for Midjourney, video direction for Sora, deep-reasoning and analysis prompts for ChatGPT and Claude, and research and summarisation prompts for Gemini. Everything is parameterised so you can adapt it to your subject in seconds.",
          "New to a tool? Start with the free prompts to see what each model does best before going deeper with premium packs.",
        ],
      },
    ],
    faqs: [
      { q: "Which AI tools do these prompts support?", a: "ChatGPT, Claude, Gemini, Midjourney and Sora, among others. Each prompt is tagged with its recommended tool so you know exactly where to paste it." },
      { q: "Are these suitable for beginners?", a: "Yes. Even advanced prompts are copy-paste ready with clear placeholders. You'll learn power-user techniques just by using them." },
      { q: "Can I get AI tool prompts for free?", a: "Yes — many are free. Filter by free to browse them all without signing up." },
    ],
  },
  productivity: {
    title: "Productivity AI Prompts",
    metaDescription:
      "Productivity AI prompts for planning, learning, decision-making and automation. Free & premium ChatGPT, Claude & Gemini prompts to get more done, faster.",
    lead: "Personal systems, planning, learning, decision-making and workflow automations that give you hours back.",
    sections: [
      {
        h2: "AI prompts that give you hours back",
        paragraphs: [
          "The biggest productivity gains from AI don't come from doing one task faster — they come from offloading the thinking around planning, prioritising and learning. These prompts turn AI into a chief-of-staff: it plans your week around your real priorities, breaks big goals into next actions, and helps you make hard decisions with a clear framework.",
          "Each prompt is structured to produce a concrete plan or system you can act on immediately, not vague motivation. Reuse them daily and weekly to build a personal operating system.",
        ],
      },
      {
        h2: "Plan, learn and decide faster",
        paragraphs: [
          "This category includes weekly and daily planning prompts, goal-breakdown and project-scoping systems, accelerated-learning and study prompts, decision-making frameworks, meeting and email triage, and lightweight automation blueprints.",
          "They work in ChatGPT, Claude and Gemini, so you can build your system on whichever assistant you keep open all day.",
        ],
      },
    ],
    faqs: [
      { q: "How do productivity prompts save time?", a: "They remove the setup cost of thinking. Instead of deciding how to plan your week or scope a project, the prompt runs a proven structure for you and hands back an actionable output." },
      { q: "Can I reuse these prompts every day?", a: "Yes — they're parameterised and built for repeat use. Many people keep a small set pinned for daily planning and weekly reviews." },
      { q: "Are there free productivity prompts?", a: "Yes. Filter by free to copy planning and learning prompts instantly, no sign-up required." },
    ],
  },
  "social-media": {
    title: "Social Media & YouTube Prompts",
    metaDescription:
      "TikTok & YouTube growth AI prompts — hooks, scripts and content systems that pop on short-form and long-form. Free & premium ChatGPT, Claude & Gemini prompts.",
    lead: "Hooks, scripts and content systems that actually pop on short-form and long-form video.",
    sections: [
      {
        h2: "Prompts for creators who want reach",
        paragraphs: [
          "Views come from hooks, retention and consistency — the three things creators struggle to keep up manually. These prompts generate scroll-stopping hooks, full video scripts structured for retention, content pillars and calendars, titles and thumbnails concepts, and repurposing systems that turn one video into a week of content.",
          "Instead of one generic caption, each prompt gives you a batch of platform-native options tuned to how TikTok, Reels, Shorts and YouTube actually reward content.",
        ],
      },
      {
        h2: "From idea to posted video",
        paragraphs: [
          "Use these prompts for viral hook generation, short-form and long-form scripts, YouTube titles and descriptions optimised for search, content-pillar planning, and turning long videos into clips, threads and posts.",
          "All of it runs in ChatGPT, Claude or Gemini, so you can batch a month of content in a single session.",
        ],
      },
    ],
    faqs: [
      { q: "Will these prompts help me go viral?", a: "Nothing guarantees a viral hit, but these prompts stack the odds by focusing on the levers that matter most — hooks and retention — and giving you many options to test fast." },
      { q: "Do they work for both TikTok and YouTube?", a: "Yes. There are prompts tuned for short-form (TikTok, Reels, Shorts) and long-form (YouTube), plus repurposing prompts that bridge the two." },
      { q: "Are any of the creator prompts free?", a: "Yes — filter by free to grab hook and script prompts you can use on your next video right now." },
    ],
  },
};

export function getCategoryContent(slug: string): CategoryContent | undefined {
  return CATEGORY_CONTENT[slug];
}

export { YEAR as CURRENT_YEAR };
