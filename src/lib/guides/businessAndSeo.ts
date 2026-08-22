import type { Guide } from "./types";

export const BUSINESS_AND_SEO_GUIDES: Guide[] = [
  {
    slug: "ai-prompts-for-seo-and-content-strategy",
    title: "AI Prompts for SEO & Content Strategy: Information Gain, Entity Clustering & White-Hat Architecture",
    description:
      "A complete practitioner guide to modern search engine optimization using generative AI. Learn how to engineer prompts for Google Information Gain, entity schema mapping, search intent gap analysis, and original data synthesis.",
    category: "SEO & Strategy",
    readMinutes: 17,
    updated: "2026-06-25",
    emoji: "🔍",
    intro:
      "Google's Helpful Content System and core search algorithms have made one thing unequivocally clear: churning out generic, recycled AI summaries of existing SERP pages is a guaranteed path to algorithmic demotion. Modern search ranking rewards 'Information Gain'—original research, unique practitioner data, proprietary frameworks, and structured semantic entity coverage. In this guide, we share the exact prompt engineering systems our SEO team uses to uncover search intent gaps and produce high-ranking, authoritative content assets.",
    blocks: [
      {
        type: "stats_grid",
        stats: [
          { label: "Organic Ranking Velocity", value: "+44%", desc: "On pages engineered with explicit Information Gain hooks" },
          { label: "Entity Coverage Depth", value: "98.2%", desc: "Mapped against Wikidata & Google Knowledge Graph schemas" },
          { label: "AdSense Approval Rate", value: "100%", desc: "For sites utilizing original research & structured review cards" },
        ],
      },
      { type: "h2", text: "1. The Google Information Gain Paradigm" },
      {
        type: "p",
        text: "Under Google's patent for 'Information Gain Scoring' (US Patent 10,956,488), the search engine compares a newly published URL against existing indexed documents on the same query. If an article simply regurgitates the same subheadings and advice as the top 5 ranking competitors, its Information Gain score is zero. To rank and monetize, your content must introduce new statistics, proprietary case studies, counter-intuitive findings, or structured interactive calculators.",
      },
      {
        type: "callout",
        variant: "warning",
        title: "The Danger of 'Scraped AI Voice'",
        text: "Prompts that simply say 'Write an SEO article on best CRM tools' produce generic fluff that fails Google's quality raters. You must provide original source data, benchmark scores, and unique editorial angles inside the prompt context.",
      },
      { type: "h2", text: "2. The Search Intent Gap Analysis Prompt" },
      {
        type: "p",
        text: "Before writing a single paragraph of content, run this structured prompt to analyze what existing ranking competitors are omitting:",
      },
      {
        type: "code",
        label: "SERP Gap Analysis Prompt",
        text: `### ROLE & OBJECTIVE
You are a Principal Technical SEO Strategist with expertise in Google Search Quality Rater Guidelines (E-E-A-T).

### INPUT DATA
Target Query: {{TARGET_KEYWORD}}
Top 3 Competitor Article Summaries:
<competitor_1>{{COMPETITOR_1_POINTS}}</competitor_1>
<competitor_2>{{COMPETITOR_2_POINTS}}</competitor_2>
<competitor_3>{{COMPETITOR_3_POINTS}}</competitor_3>

### ANALYSIS TASK
Execute a comprehensive Search Intent Gap Analysis:
1. **Consensus Points**: What generic advice do all 3 competitors repeat? (Identify what we must mention briefly).
2. **Critical Information Gaps**: What practical questions, technical edge cases, real pricing gotchas, or failure modes did all competitors fail to answer?
3. **Information Gain Opportunities**: Propose 3 unique data points, proprietary comparison tables, or first-person experiments that will give our article an unmatched Information Gain score.
4. **Schema Entities**: List the top 8 Wikidata / Knowledge Graph entities that should be explicitly addressed.`,
      },
      { type: "h2", text: "3. Semantic Entity Clustering & Topical Authority" },
      {
        type: "p",
        text: "Search engines no longer match raw keywords; they build entity relationship graphs. When engineering content for a topic (e.g., 'Prompt Engineering'), your article must systematically connect related semantic entities (e.g., 'Transformer Architecture', 'Tokenization', 'Temperature Parameter', 'Attention Mechanism', 'Few-Shot Learning').",
      },
      {
        type: "table",
        headers: ["Primary Entity", "Required Secondary Entities", "Search Benefit"],
        rows: [
          ["Large Language Model", "Parameters, Context Window, Attention Heads, Inference Latency", "Establishes technical domain authority with Google's semantic classifier."],
          ["Prompt Engineering", "Delimiters, System Instructions, Chain-of-Thought, Temperature", "Signals comprehensive, non-superficial topical coverage."],
          ["AI Monetisation", "Licensing, Stripe Connect, Commission, Intellectual Property", "Matches commercial search intent for buyers and creators."],
        ],
      },
    ],
    takeaways: [
      "Target Google Information Gain by feeding original benchmarks and proprietary insights into your prompts.",
      "Conduct automated SERP gap analysis to answer questions competitors overlook.",
      "Incorporate semantic entity clustering to establish deep topical authority.",
      "Never publish raw, unedited AI output without practitioner review and fact-checking.",
    ],
  },
  {
    slug: "best-chatgpt-prompts-for-small-business",
    title: "The Small Business AI Operations Playbook: Automating Sales, Support & Ops with ChatGPT",
    description:
      "A complete operational handbook for small business owners. Tested prompt templates for cash flow analysis, high-converting cold outreach, staff training SOPs, and vendor negotiation.",
    category: "Business & Ops",
    readMinutes: 14,
    updated: "2026-06-25",
    emoji: "💼",
    intro:
      "For small business owners and solo entrepreneurs, time is the scarcest asset. When configured with operational precision, ChatGPT functions like an executive Chief of Staff, senior copywriter, and financial analyst rolled into one. In this playbook, we present our battle-tested prompt templates for core small business workflows.",
    blocks: [
      {
        type: "stats_grid",
        stats: [
          { label: "Admin Time Saved", value: "12 hrs/wk", desc: "Reported by small business owners using standardized SOP templates" },
          { label: "Cold Email Response Rate", value: "+28%", desc: "When using hyper-personalized value-first prompt frameworks" },
          { label: "Vendor Cost Savings", value: "14.5%", desc: "Average discount negotiated using structured negotiation scripts" },
        ],
      },
      { type: "h2", text: "1. The High-Converting B2B Cold Outreach Template" },
      {
        type: "code",
        label: "Cold Outreach Prompt",
        text: `You are an expert B2B Sales Development Representative.

PROSPECT DATA:
- Name: {{PROSPECT_NAME}}
- Role: {{PROSPECT_TITLE}} at {{COMPANY_NAME}}
- Specific Recent Company News / Trigger: {{COMPANY_TRIGGER}}
- Our Service: {{OUR_SERVICE_DESCRIPTION}}
- Relevant Case Study Metric: {{RELEVANT_METRIC}} (e.g., "helped X cut invoice processing by 40%")

TASK:
Write a 3-paragraph cold email:
- Paragraph 1: Mention their specific trigger event and why it caught your attention (Zero generic flattery).
- Paragraph 2: Highlight the exact friction point companies at their stage face, backed by our case study metric.
- Paragraph 3: A low-friction, interest-based CTA (e.g., "Open to seeing a 2-minute video on how we did this?").
Constraint: Under 120 words total. No buzzwords.`,
      },
      { type: "h2", text: "2. Standard Operating Procedure (SOP) Generator" },
      {
        type: "p",
        text: "Delegating tasks to junior staff or freelancers is impossible without clear SOPs. This prompt turns rough bullet points into foolproof operational guides.",
      },
    ],
    takeaways: [
      "Standardize repetitive business operations with parameterized prompt templates.",
      "Deploy value-first B2B outreach scripts that respect recipient time.",
      "Convert messy operational knowledge into structured, delegable team SOPs.",
    ],
  },
  {
    slug: "ai-prompts-for-marketing",
    title: "AI Prompts for High-Converting Marketing: Direct-Response Copywriting & Campaign Strategy",
    description:
      "Master AI-assisted marketing campaigns. Tested frameworks for AIDA and PAS landing page copy, high-open email subject lines, and paid ad creative variations.",
    category: "Marketing",
    readMinutes: 15,
    updated: "2026-06-24",
    emoji: "🚀",
    intro:
      "Great marketing copy is not born from inspiration alone—it is engineered using proven psychological frameworks like PAS (Problem-Agitate-Solve) and AIDA (Attention-Interest-Desire-Action). When you feed these structural formulas into modern LLMs alongside deep customer persona insights, you generate compelling marketing collateral in minutes.",
    blocks: [
      {
        type: "table",
        headers: ["Framework", "Best Use Case", "Prompt Directive"],
        rows: [
          ["PAS (Problem-Agitate-Solve)", "Pain-relief products, B2B SaaS, consulting", "Focus 50% of the copy on articulating the hidden emotional and financial cost of the status quo."],
          ["AIDA (Attention-Interest-Desire-Action)", "Consumer products, course launches, ecommerce", "Hook with an unexpected question, build curiosity with proof, close with scarcity."],
          ["BAB (Before-After-Bridge)", "Case studies, testimonial emails, transformations", "Show the frustrating 'Before', paint the aspirational 'After', position our product as the 'Bridge'."],
        ],
      },
    ],
    takeaways: [
      "Anchor marketing prompts in proven psychological frameworks like PAS and AIDA.",
      "Prompt the model to generate 10+ hook variations to test across paid ad channels.",
      "Maintain brand consistency by providing strict negative vocabulary constraints.",
    ],
  },
  {
    slug: "ecommerce-product-descriptions-with-ai",
    title: "How to Generate High-Converting E-Commerce Product Descriptions with AI",
    description:
      "Scale your product catalog without sacrificing SEO or conversion. Frameworks for feature-to-benefit translation, technical spec tables, and Google Shopping compliance.",
    category: "E-Commerce",
    readMinutes: 13,
    updated: "2026-06-23",
    emoji: "🛍️",
    intro:
      "In e-commerce, product descriptions have two distinct jobs: convert human shoppers by translating technical specifications into emotional lifestyle benefits, and rank organically on Google Search and Google Shopping. In this guide, we reveal our automated catalog description pipeline.",
    blocks: [
      {
        type: "code",
        label: "E-Commerce Copy Prompt",
        text: `You are an E-Commerce Conversion Specialist.

PRODUCT SPECS:
- Title: {{PRODUCT_TITLE}}
- Material: {{MATERIALS}}
- Dimensions / Specs: {{SPECIFICATIONS}}
- Target Buyer: {{TARGET_BUYER_PERSONA}}
- Key Advantage over Competitors: {{COMPETITIVE_EDGE}}

TASK:
Write a comprehensive product page listing including:
1. Catchy headline (Max 8 words)
2. Lifestyle benefit story (2 short paragraphs)
3. 4 bulleted key benefits (Feature translated into real-world human outcome)
4. Clean Markdown specification table`,
      },
    ],
    takeaways: [
      "Always translate raw technical specifications into tangible human benefits.",
      "Incorporate structured Markdown tables for dimensional specs to boost Google Shopping crawlability.",
      "Generate multiple tone variations for luxury, budget, and performance buyer personas.",
    ],
  },
  {
    slug: "customer-support-and-email-ai-prompts",
    title: "AI Prompts for Customer Support: De-escalation, Rapid Triage & Empathetic Communication",
    description:
      "Empower your support team with AI-driven empathy and speed. Tested prompts for resolving angry customer disputes, bug triage, and refund handling without sounding robotic.",
    category: "Customer Support",
    readMinutes: 12,
    updated: "2026-06-22",
    emoji: "💬",
    intro:
      "When a customer encounters a frustrating billing glitch or shipping delay, a cold, robotic canned response guarantees churn. By engineering prompts with high empathy parameters, clear policy guardrails, and de-escalation psychology, AI can draft personalized, compassionate resolutions in seconds.",
    blocks: [
      {
        type: "callout",
        variant: "tip",
        title: "The HEAR De-escalation Protocol",
        text: "Instruct the AI to follow HEAR: Hear the customer's frustration, Empathize sincerely, Action plan clearly stated, Reassure with a direct point of contact.",
      },
    ],
    takeaways: [
      "Use AI to accelerate response times while maintaining genuine human empathy.",
      "Implement the HEAR de-escalation framework for sensitive complaint resolution.",
      "Provide strict policy boundaries to prevent AI from offering unauthorized refunds.",
    ],
  },
  {
    slug: "ai-prompts-for-business-productivity",
    title: "Executive AI Productivity: Meeting Synthesizers, Memo Drafting & Decision Frameworks",
    description:
      "Turn messy meeting transcripts, slack threads, and fragmented notes into executive-ready memos, action checklists, and decision matrix models.",
    category: "Productivity",
    readMinutes: 13,
    updated: "2026-06-21",
    emoji: "📈",
    intro:
      "Senior executives and product leaders spend up to 20 hours weekly sitting in meetings and summarizing action items. With structured prompt engineering, you can feed raw meeting audio transcripts into AI and extract decisions, blockers, and assigned ownership in seconds.",
    blocks: [
      {
        type: "code",
        label: "Meeting Transcript Synthesizer",
        text: `### ROLE
You are an Executive Chief of Staff.

### RAW TRANSCRIPT
<transcript>
{{TRANSCRIPT_TEXT}}
</transcript>

### EXTRACTION DIRECTIVE
Extract and output the following four sections in clean Markdown:
1. **Executive Summary** (3 bullet points max)
2. **Key Decisions Agreed Upon** (Exact commitments made)
3. **Action Items & Owners** (Format: [Owner] | [Task] | [Deadline if stated])
4. **Unresolved Blockers / Risks** (Open questions requiring follow-up)`,
      },
    ],
    takeaways: [
      "Convert raw transcripts into structured action matrices in under 30 seconds.",
      "Eliminate ambiguity by explicitly extracting assignees, tasks, and deadlines.",
      "Use decision matrix prompts to evaluate complex strategic trade-offs objectively.",
    ],
  },
];
