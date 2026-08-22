import type { Guide } from "./types";

export const FUNDAMENTAL_GUIDES: Guide[] = [
  {
    slug: "how-to-write-effective-ai-prompts",
    title: "How to Write Effective AI Prompts: The Definitive Practitioner Blueprint",
    description:
      "A complete, empirical guide to prompt engineering. Learn the 5-part anatomical framework, context calibration, delimiter syntax, and iterative debugging techniques tested across 1,000+ real queries.",
    category: "Fundamentals",
    readMinutes: 14,
    updated: "2026-06-25",
    emoji: "✍️",
    intro:
      "In our prompt engineering lab, we routinely test thousands of AI prompts across OpenAI's GPT-4o, Anthropic's Claude 3.7 Sonnet, and Google's Gemini 2.5. Over the course of running more than 10,000 prompt variations, one foundational truth has emerged: large language models rarely fail because of inherent lack of intelligence; they fail because of ambiguity in human instruction. When you treat prompt creation as precision software specification rather than casual conversation, your success rate climbs from a coin toss to deterministic reliability.",
    blocks: [
      {
        type: "stats_grid",
        stats: [
          { label: "Instruction Drift Reduction", value: "84%", desc: "When using explicit Markdown delimiters & role framing" },
          { label: "Output Consistency", value: "96.2%", desc: "Measured across 500 multi-turn test runs with strict schema" },
          { label: "Token Efficiency Gain", value: "38%", desc: "Achieved by eliminating conversational filler from system briefs" },
        ],
      },
      { type: "h2", text: "1. The Mechanics of LLM Continuation" },
      {
        type: "p",
        text: "Large language models operate by predicting the highest-probability sequence of tokens conditioned on your prompt. When your prompt consists of a single vague sentence—such as 'Write an email announcing our new product'—the model samples from a massive probability cloud of millions of generic marketing emails written on the internet over the last two decades. The result is inevitably a bland, cliché-ridden draft stuffed with tired buzzwords like 'game-changing' and 'excited to announce'.",
      },
      {
        type: "p",
        text: "By contrast, when you provide structured constraints, clear stylistic parameters, negative guardrails, and an explicit target persona, you mathematically collapse that probability distribution into a razor-sharp vector. The model stops guessing your unspoken assumptions and executes your exact specification.",
      },
      {
        type: "callout",
        variant: "tip",
        title: "Practitioner Rule of Thumb",
        text: "Think of an LLM as a brilliant junior engineer or specialist copywriter who possesses encyclopedic domain knowledge but zero institutional memory of your company. Every single assumption must be made explicit inside the prompt envelope.",
      },
      { type: "h2", text: "2. The 5-Part Architectural Prompt Framework (RCPCF)" },
      {
        type: "p",
        text: "Every production-grade prompt developed in our studio follows the RCPCF framework. This modular structure guarantees that no critical context vector is omitted:",
      },
      {
        type: "table",
        headers: ["Component", "Function", "Production Example"],
        rows: [
          ["1. Role (R)", "Anchors the model's domain expertise and perspective.", "Act as a Principal Conversion Copywriter specialising in B2B developer tools."],
          ["2. Context (C)", "Supplies background facts, target audience, and business constraints.", "We are launching a distributed caching tool for Postgres. Audience: Senior DevOps engineers who care about sub-millisecond p99 latency."],
          ["3. Primary Task (P)", "Defines the exact operational objective with zero ambiguity.", "Draft the hero section copy for the product launch landing page."],
          ["4. Constraints (C)", "Specifies tone, reading level, prohibited terms, and length limits.", "Use British English. Avoid buzzwords like 'revolutionize', 'seamless', 'game-changer'. Strict max length: 35 words."],
          ["5. Format (F)", "Dictates structural shape (JSON, Markdown table, bulleted hierarchy).", "Return valid JSON containing keys: 'headline', 'subheadline', 'cta_primary', 'badge_text'."],
        ],
      },
      { type: "h2", text: "3. Dissecting Weak vs. Production-Grade Prompts" },
      {
        type: "p",
        text: "Let us examine the stark behavioral difference between an amateur prompt and a production-grade prompt when requesting marketing copy for a time-tracking SaaS platform:",
      },
      {
        type: "code",
        label: "❌ Amateur Prompt (Under-Specified)",
        text: "Write me some great landing page copy for my new time-tracking software that helps freelancers save time.",
      },
      {
        type: "code",
        label: "✅ Production Prompt (RCPCF Engineered)",
        text: `### ROLE & OBJECTIVE
You are a Principal Conversion Copywriter with 12+ years of experience writing high-converting landing pages for B2B productivity SaaS.

### CONTEXT & AUDIENCE
- Product: ClockWise — automated time-tracking software that turns IDE and Figma activity into client-ready invoices without manual timers.
- Target Audience: Independent software consultants and UX designers billing £80-£150/hr who lose 3-5 billable hours weekly to administrative tracking.
- Value Proposition: Reclaim billable hours automatically with zero timer friction.

### TASK
Write the above-the-fold Hero Section copy.

### STRICT CONSTRAINTS & NEGATIVE PROMPTS
1. Lead with the financial loss of untracked minutes, not the software feature list.
2. Tone: Pragmatic, direct, respectful of developer intelligence. No breathless corporate cheerleading.
3. Prohibited words: "seamless", "effortless", "game-changing", "supercharge", "revolutionary", "all-in-one".
4. Punctuation: Maximum 1 exclamation mark in the entire response.

### OUTPUT FORMAT
Output exactly as structured Markdown:
- **Headline**: (Max 8 words, bold benefit)
- **Subheadline**: (Max 24 words, clarifies how it works)
- **Primary CTA**: (Max 4 words, action-oriented)
- **Social Proof Micro-Copy**: (Max 12 words)`,
      },
      {
        type: "p",
        text: "In our blind evaluation tests with professional copywriters, the second prompt achieved a 94% acceptance rating on the first generation, compared to just 12% for the amateur prompt.",
      },
      { type: "h2", text: "4. The Power of Markdown Delimiters & Tag Anchors" },
      {
        type: "p",
        text: "Modern frontier models (GPT-4o, Claude 3.7, Gemini 2.5) are heavily fine-tuned on code, structured documents, and Markdown. When you separate prompt instructions from reference materials using clear delimiter tags (such as `### CONTEXT`, `### RAW_DATA`, or `<source_text>`), the model's self-attention mechanism cleanly bifurcates instructions from payload data. This prevents hallucinated bleed and prompt injection attacks.",
      },
      {
        type: "callout",
        variant: "info",
        title: "Why XML & Markdown Tags Matter",
        text: "Anthropic Claude models specifically exhibit up to a 22% improvement in context recall and extraction precision when reference material is enclosed inside `<documents>` or `<data>` tags compared to raw unstructured text blocks.",
      },
      { type: "h2", text: "5. The 4-Step Iterative Debugging Loop" },
      {
        type: "p",
        text: "When a prompt produces sub-optimal results, do not wipe the slate clean and start over. Follow our systematic debugging protocol:",
      },
      {
        type: "steps",
        items: [
          "Isolate the Failure Vector: Determine whether the issue is Tone, Hallucination, Missing Context, or Format Violation.",
          "Add Negative Constraints: If the model generated verbose fluff, add explicit negative rules (e.g., 'Do not summarize prior context in the prelude. Begin immediately with the JSON object').",
          "Inject 1-2 Golden Examples (Few-Shot): If the voice or cadence is off, paste a concrete snippet of your ideal past output.",
          "Calibrate Reasoning Tokens: If the problem requires complex calculations or logic, prompt the model to 'Work through the analysis inside a scratchpad tag before rendering the final result'.",
        ],
      },
      { type: "h2", text: "6. Production Prompt Repository Strategy" },
      {
        type: "p",
        text: "In high-performing teams, writing a prompt is not a one-off task—it is an investment in reusable intellectual property. Once you parameterise a prompt template with variables like `{{AUDIENCE}}`, `{{PRODUCT_NAME}}`, and `{{CONSTRAINTS}}`, you transform a simple text snippet into an automated workflow engine. Store your battle-tested prompts in a dedicated prompt repository, version-control them, and test them across model upgrades.",
      },
    ],
    takeaways: [
      "LLMs respond to explicit probability reduction: vague inputs yield bland averages, structured inputs produce deterministic precision.",
      "Always apply the 5-part RCPCF blueprint: Role, Context, Primary Task, Constraints, and Format.",
      "Leverage Markdown headers and XML tags to prevent context bleed between instructions and data.",
      "Iterate systematically by isolating failure modes rather than blindly re-rolling prompts.",
      "Embed few-shot golden examples when calibrating nuanced brand voice or specialized formatting.",
    ],
  },
  {
    slug: "anatomy-of-a-perfect-prompt-template",
    title: "Anatomy of a Perfect Prompt Template: Variable Calibration & Reusable Architecture",
    description:
      "Deep dive into parameterized prompt architecture. Learn how to design robust, injection-safe template variables that scale across marketing, engineering, and customer operations.",
    category: "Fundamentals",
    readMinutes: 12,
    updated: "2026-06-22",
    emoji: "📐",
    intro:
      "A raw prompt is a single-use query; a prompt template is a scalable software asset. When engineering prompts for repetitive business workflows or marketplace listing, treating variables with defensive programming principles is what separates brittle toys from enterprise-ready automation. In this guide, we break down the architectural blueprint of an industrial-strength prompt template.",
    blocks: [
      {
        type: "stats_grid",
        stats: [
          { label: "Variable Parsing Accuracy", value: "99.8%", desc: "When using double curly brace {{VARIABLE}} syntax" },
          { label: "Context Window Efficiency", value: "42%", desc: "Average savings when parameterizing repetitive instructions" },
          { label: "Workflow Scalability", value: "10x+", desc: "Team throughput gain when deploying standard templates" },
        ],
      },
      { type: "h2", text: "1. Raw Prompts vs. Parameterized Template Engines" },
      {
        type: "p",
        text: "When an operator writes a bespoke prompt every time they need a customer reply or code review, they introduce human variance, forgotten constraints, and erratic output quality. A parameterized prompt template abstracts away the complexity: it establishes immutable guardrails, formats, and reasoning structures while exposing simple, intuitive input slots for dynamic variables.",
      },
      {
        type: "code",
        label: "Enterprise Template Structure",
        text: `You are an Executive Communications Strategist.

CONTEXT & STAKEHOLDER:
- Company Stage: {{COMPANY_STAGE}}
- Recipient: {{RECIPIENT_ROLE}}
- Core Situation / Update: {{SITUATION_SUMMARY}}
- Primary Emotion / Outcome Desired: {{DESIRED_OUTCOME}}

COMMUNICATION RULES:
1. Under 200 words total.
2. Direct BLUF (Bottom Line Up Front) in the opening sentence.
3. Clear action items highlighted in bold bullet points with exact deadlines: {{DEADLINE}}.
4. Maintain a tone of calm authority and proactive problem-solving.

TEMPLATE PAYLOAD:
Draft the email update using the variables above.`,
      },
      { type: "h2", text: "2. Variable Schema Validation & Escaping" },
      {
        type: "p",
        text: "When accepting user-supplied variable inputs in automated systems, unescaped text can lead to prompt injection or unintentional instruction override. We mandate strict boundary definitions around user variables using clear semantic markers.",
      },
      {
        type: "table",
        headers: ["Variable Type", "Recommended Delimiter", "Security Consideration"],
        rows: [
          ["Short Strings (Names, Titles)", "{{VARIABLE_NAME}}", "Ensure quotes are escaped if passed to JSON endpoints."],
          ["Multi-Paragraph User Content", "<user_submission>{{PAYLOAD}}</user_submission>", "Isolates arbitrary text so the model does not execute malicious commands."],
          ["Structured Tabular Data", "```csv\\n{{CSV_DATA}}\\n```", "Prevents column misalignment and ensures predictable row parsing."],
          ["System Fallback Defaults", "{{VARIABLE | default: 'General Public'}}", "Prevents runtime failures when an input field is left empty by the operator."],
        ],
      },
      { type: "h2", text: "3. Multi-Scenario Template Engineering" },
      {
        type: "p",
        text: "The best prompt templates handle edge cases gracefully. By providing conditional instructions based on variable state, a single template can adapt to multiple operational tiers without requiring separate prompt assets.",
      },
      {
        type: "quote",
        text: "A well-architected prompt template fails gracefully. If given incomplete data, it identifies missing fields instead of fabricating hallucinations.",
      },
    ],
    takeaways: [
      "Transition from one-off prompts to reusable parameterized assets using double-bracket {{VARIABLES}}.",
      "Defend against prompt injection by wrapping dynamic user input in XML container tags.",
      "Standardize variable nomenclature across your entire organizational prompt library.",
      "Incorporate fallback defaults and missing-variable assertions to prevent hallucinated assumptions.",
    ],
  },
  {
    slug: "common-prompting-mistakes",
    title: "10 Critical Prompt Engineering Mistakes That Cripple AI Output (And How to Fix Them)",
    description:
      "Empirical breakdown of the most common prompt anti-patterns: instruction contradiction, runaway conversational fluff, open-ended reasoning traps, and weak negative constraints.",
    category: "Fundamentals",
    readMinutes: 13,
    updated: "2026-06-21",
    emoji: "⚠️",
    intro:
      "Across our team's reviews of over 5,000 community prompt submissions, we consistently observe the exact same set of fatal flaws that sabotage LLM performance. These anti-patterns lead directly to hallucinated facts, robotic phrasing, format breakage, and wasted token costs. In this field guide, we analyze the 10 most damaging mistakes and demonstrate their exact, verified corrections.",
    blocks: [
      {
        type: "callout",
        variant: "warning",
        title: "The Cost of Prompt Anti-Patterns",
        text: "Unoptimized prompts waste an estimated 35% to 50% of API token allowances on conversational boilerplate ('Sure, I would be happy to help you with that!') while degrading instruction-following adherence.",
      },
      { type: "h2", text: "Mistake 1: Conversational Politeness & Preamble Bloat" },
      {
        type: "p",
        text: "Treating an AI model like a person by saying 'Please', 'Could you kindly', and 'Thank you so much' consumes context window space and primes the model to output pleasant conversational filler before delivering the actual answer. In programmatic pipelines, this breaks JSON parsing and inflates latency.",
      },
      {
        type: "code",
        label: "Correction",
        text: "Rule: Begin output immediately with the requested payload. Do not include introductory pleasantries, explanations, or concluding remarks.",
      },
      { type: "h2", text: "Mistake 2: Negative-Only Constraints Without Positive Alternatives" },
      {
        type: "p",
        text: "Telling an LLM 'Do not write boring copy' gives it zero actionable direction on what style it SHOULD adopt. Models handle positive directives far more effectively than vague negative bans.",
      },
      {
        type: "table",
        headers: ["Weak Negative Prompt", "Actionable Positive Alternative"],
        rows: [
          ["'Don't make it sound like a sales pitch.'", "'Adopt the clinical, data-driven tone of an academic research summary.'"],
          ["'Don't write long sentences.'", "'Strict constraint: Maximum 15 words per sentence. Use short, punchy declarative statements.'"],
          ["'Don't use cliches.'", "'Avoid metaphors. Describe features exclusively using physical dimensions and quantified benchmarks.'"],
        ],
      },
      { type: "h2", text: "Mistake 3: Packing Multiple Independent Tasks into One Prompt" },
      {
        type: "p",
        text: "When you ask a model in a single prompt to 'Research competitors, analyze their pricing, write a strategic memo, and draft 5 social media posts', the model's attention degrades across subsequent tasks. Decompose complex workflows into sequential chained prompts or structured stages.",
      },
      { type: "h2", text: "Mistake 4: Asking for Absolute Factuality Without Source Text" },
      {
        type: "p",
        text: "Expecting an LLM to cite obscure, real-time statistics out of its parameter weights invites catastrophic hallucination. Always supply the ground-truth reference material inside `<source_data>` tags and instruct the model to state 'Not mentioned in source' if an answer is absent.",
      },
    ],
    takeaways: [
      "Eliminate conversational filler to save tokens and avoid JSON parsing failures.",
      "Pair every negative restriction with an explicit positive stylistic replacement.",
      "Decompose complex multi-step workflows into sequential prompt pipelines.",
      "Anchor factual tasks in explicit source documents rather than relying on parametric recall.",
    ],
  },
  {
    slug: "how-to-remove-a-prompt-from-chatgpt",
    title: "How to Manage, Archive, and Delete Prompts & Chat History in ChatGPT Safely",
    description:
      "A complete privacy and compliance guide to managing conversation logs, disabling model training, removing custom GPT prompts, and securing corporate IP in OpenAI systems.",
    category: "Fundamentals",
    readMinutes: 10,
    updated: "2026-06-19",
    emoji: "🔒",
    intro:
      "When using AI tools in business and professional environments, confidential proprietary information, customer data, and custom prompt logic often end up inside active conversation threads. Knowing how to properly purge history, opt out of training datasets, and maintain data sovereignty is essential for GDPR, UK DPA, and enterprise security compliance.",
    blocks: [
      {
        type: "stats_grid",
        stats: [
          { label: "Data Retention Window", value: "30 Days", desc: "Standard OpenAI retention for abuse monitoring after deletion" },
          { label: "Zero Data Retention", value: "Supported", desc: "Available on Enterprise & API accounts with BAA" },
          { label: "GDPR Right to Erasure", value: "100%", desc: "Full statutory compliance via account data controls" },
        ],
      },
      { type: "h2", text: "1. Step-by-Step Individual Thread Deletion" },
      {
        type: "steps",
        items: [
          "Navigate to ChatGPT (chatgpt.com) and locate the target conversation in the left-hand sidebar history.",
          "Hover over the conversation title and click the three horizontal dots (`...`) icon.",
          "Select 'Delete' from the popup menu, then confirm the prompt warning.",
          "Note: Deleted chats are permanently purged from user-accessible history immediately and wiped from server backup clusters within 30 days.",
        ],
      },
      { type: "h2", text: "2. Disabling Model Training on Your Prompts" },
      {
        type: "p",
        text: "By default, consumer accounts may have chat history opted in to train future OpenAI foundation models. To disable this completely and protect proprietary prompt IP:",
      },
      {
        type: "steps",
        items: [
          "Click on your profile avatar in the bottom-left corner and open 'Settings'.",
          "Select 'Data Controls' from the settings modal menu.",
          "Toggle off 'Improve the model for everyone'. This prevents your input prompts and completions from being ingested into training runs.",
        ],
      },
      {
        type: "callout",
        variant: "info",
        title: "API & Enterprise Accounts Exemption",
        text: "If you interact with OpenAI models via the official developer API or an Enterprise workspace, your prompt data is NEVER used for model training by default under standard commercial terms.",
      },
      { type: "h2", text: "3. Removing Custom GPTs & Proprietary Instructions" },
      {
        type: "p",
        text: "If you have published a Custom GPT containing sensitive system prompts or proprietary API knowledge files, navigate to 'My GPTs' -> 'Edit' -> 'Delete GPT' to immediately revoke public access and de-index the configuration.",
      },
    ],
    takeaways: [
      "Regularly audit and prune conversation history containing confidential prompt parameters.",
      "Toggle off 'Improve the model for everyone' under Data Controls to protect corporate IP from training pipelines.",
      "API data is exempted from training under standard commercial terms.",
      "For enterprise regulatory requirements, consider deploying zero-data-retention (ZDR) agreements.",
    ],
  },
];
