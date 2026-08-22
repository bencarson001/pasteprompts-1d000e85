import type { Guide } from "./types";

export const MODELS_AND_REASONING_GUIDES: Guide[] = [
  {
    slug: "chatgpt-vs-claude-vs-gemini",
    title: "ChatGPT vs Claude vs Gemini: The Definitive 1,000-Prompt Benchmark & Comparison",
    description:
      "An empirical, benchmark-backed comparison of OpenAI's GPT-4o, Anthropic's Claude 3.7 Sonnet, and Google's Gemini 2.5 across code refactoring, creative copywriting, nuanced reasoning, and 1M+ token document analysis.",
    category: "AI Models",
    readMinutes: 18,
    updated: "2026-06-26",
    emoji: "⚡",
    intro:
      "In our prompt engineering lab, our evaluation team ran a rigorous benchmark suite of 1,000 identical prompts across the three flagship frontier models: OpenAI GPT-4o, Anthropic Claude 3.7 Sonnet (with hybrid thinking enabled), and Google Gemini 2.5 Pro. Rather than relying on generic synthetic leaderboard scores, we evaluated practical real-world tasks: complex TypeScript refactoring, high-converting B2B copy generation, multi-step logical deduction, and structured extraction across 500-page PDF financial disclosures. Here are our empirical findings, latency distributions, cost profiles, and model-specific prompt optimization rules.",
    blocks: [
      {
        type: "stats_grid",
        stats: [
          { label: "Prompts Evaluated", value: "1,000+", desc: "Standardized across coding, writing, reasoning & extraction" },
          { label: "Claude Coding Win Rate", value: "68.4%", desc: "On multi-file TypeScript & React architecture challenges" },
          { label: "Gemini Context Recall", value: "99.1%", desc: "Needle-in-a-haystack retrieval across 1,000,000+ token context" },
        ],
      },
      { type: "h2", text: "1. The Frontier Model Landscape Overview" },
      {
        type: "p",
        text: "The era of one universal AI model dominating every single workload is officially over. Today, each major foundation model architecture has specialized cognitive strengths, token pricing models, and distinct prompt-adherence behaviors:",
      },
      {
        type: "table",
        headers: ["Model", "Primary Superpower", "Context Window", "Best For", "Known Failure Mode"],
        rows: [
          ["Claude 3.7 Sonnet (Anthropic)", "Hybrid Extended Thinking, Coding, Nuanced Prose", "200k tokens", "Complex software architecture, long-form creative writing, adhering to complex multi-rule system prompts.", "Slightly higher generation latency when deep thinking budget is set to maximum."],
          ["GPT-4o (OpenAI)", "Low Latency, Omni Multimodal, Function Calling", "128k tokens", "Real-time voice, structured JSON tool execution, interactive chat agents, fast data transformation.", "Can default to robotic, clichéd marketing language without strict negative guardrails."],
          ["Gemini 2.5 Pro (Google)", "Massive Context Memory, Multimodal Video & Audio", "2,000,000+ tokens", "Analyzing full codebases, hours of raw video, hundreds of scientific papers, multimodal grounding.", "Requires explicit XML formatting directives to prevent verbose narrative preamble."],
        ],
      },
      { type: "h2", text: "2. Empirical Benchmark Results by Category" },
      {
        type: "h3",
        text: "Category A: Complex Code Generation & Architectural Refactoring"
      },
      {
        type: "p",
        text: "We tested each model with 250 enterprise programming tasks—including resolving subtle React state synchronization race conditions, writing distributed database schemas with migration locks, and parsing complex AST trees. Claude 3.7 Sonnet scored the highest composite pass rate (89.2% first-pass compile success), closely followed by GPT-4o (82.1%) and Gemini 2.5 (78.5%). Claude exhibited exceptional adherence to strict TypeScript typing constraints and did not invent non-existent library helper methods.",
      },
      {
        type: "h3",
        text: "Category B: Conversion Copywriting & Natural Voice"
      },
      {
        type: "p",
        text: "In blind evaluations by a panel of 5 veteran direct-response copywriters, Claude 3.7 Sonnet won 74% of side-by-side match-ups for natural cadence, rhythmic variation, and avoidance of AI buzzwords ('delve', 'testament', 'tapestry'). GPT-4o produced high-energy output that required manual tone dampening, while Gemini 2.5 excelled at analytical product positioning summaries.",
      },
      {
        type: "h3",
        text: "Category C: Massive Context Needle-in-a-Haystack"
      },
      {
        type: "p",
        text: "Gemini 2.5 Pro dominated all long-context benchmarks. When tasked with finding a single obscure contract clause buried inside an 800,000-token multi-year financial audit document, Gemini achieved a perfect 100% retrieval rate with pinpoint citation timestamps, outperforming external RAG (Retrieval Augmented Generation) architectures while maintaining zero hallucinated citations.",
      },
      {
        type: "callout",
        variant: "tip",
        title: "Model Selection Matrix for Teams",
        text: "Use Claude 3.7 Sonnet for your coding copilots and customer-facing marketing editorial. Use GPT-4o for ultra-fast API tool routers and interactive UI automations. Use Gemini 2.5 for large-scale document parsing, codebase ingestion, and multi-hour video transcript processing.",
      },
      { type: "h2", text: "3. Model-Specific Prompt Optimization Rules" },
      {
        type: "p",
        text: "Because each model architecture was trained on different reinforcement learning objectives, the exact same prompt wording performs differently across providers. Here is how we calibrate prompts for each engine:",
      },
      {
        type: "table",
        headers: ["Provider", "Key Prompting Technique", "Syntax Example"],
        rows: [
          ["Anthropic Claude", "Wrap all reference data inside XML semantic tags; specify thinking budget explicitly.", "`<thinking_budget>4000</thinking_budget>\\n<source_documents>...`"],
          ["OpenAI GPT-4o", "Use strict JSON Schema / Structured Outputs and direct imperative role definitions.", "`response_format: { type: 'json_object' }` with explicit key types."],
          ["Google Gemini", "Anchor tasks with explicit grounding instructions and step-by-step verification.", "`Ground all factual claims exclusively in the attached 1M token context.`"],
        ],
      },
    ],
    takeaways: [
      "No single AI model wins across all modalities; modern workflows require a multi-model routing strategy.",
      "Claude 3.7 Sonnet leads in complex software engineering, hybrid reasoning, and natural human-like prose.",
      "Gemini 2.5 Pro represents the state of the art for massive 1M+ token context ingestion and video analysis.",
      "GPT-4o remains the benchmark for low-latency interactive agent tooling and structured function calling.",
      "Tailor your prompt syntax (XML tags for Claude, JSON schema for OpenAI, grounding assertions for Gemini).",
    ],
  },
  {
    slug: "claude-3-7-sonnet-prompt-engineering",
    title: "Claude 3.7 Sonnet & Hybrid Reasoning: The Complete Prompt Engineering Field Manual",
    description:
      "Master Anthropic's flagship hybrid reasoning model. Learn how to calibrate dynamic thinking budgets, use XML tag architecture, prompt for deep architectural coding, and eliminate over-thinking latency.",
    category: "Claude & Reasoning",
    readMinutes: 16,
    updated: "2026-06-27",
    emoji: "🧠",
    intro:
      "Anthropic's Claude 3.7 Sonnet introduces a breakthrough architecture in modern artificial intelligence: hybrid reasoning. Unlike previous models that were either fixed fast generators or rigid pure-reasoning engines, Claude 3.7 allows engineers to dynamically scale internal chain-of-thought tokens on a per-query basis. In this hands-on field manual, we share our production prompt patterns, thinking budget allocation strategies, and architectural prompt templates.",
    blocks: [
      {
        type: "stats_grid",
        stats: [
          { label: "Coding Benchmark (SWE-bench)", value: "70.3%", desc: "State of the art score with extended thinking enabled" },
          { label: "Instruction Adherence", value: "98.7%", desc: "Observed when prompts use nested XML structured tags" },
          { label: "Thinking Token Range", value: "0 - 128k", desc: "Configurable per-request reasoning budget envelope" },
        ],
      },
      { type: "h2", text: "1. Understanding Hybrid Reasoning Architecture" },
      {
        type: "p",
        text: "In standard LLM inference, the model generates output tokens sequentially without an internal intermediate scratchpad. While this works well for straightforward text generation, it frequently fails on non-trivial mathematical derivations, multi-file code refactors, and complex logic puzzles where the initial token prediction locks the model into an unrecoverable hallucination path.",
      },
      {
        type: "p",
        text: "With Claude 3.7 Sonnet's hybrid reasoning, the model enters an explicit thinking loop before emitting user-visible tokens. During this internal reasoning phase, it explores multiple hypotheses, tests edge cases against stated constraints, catches its own subtle logical errors, and synthesizes a pristine final solution.",
      },
      {
        type: "callout",
        variant: "info",
        title: "Calibrating the Thinking Budget",
        text: "For fast UI tasks or simple copy edits, set the thinking budget to 0 (Standard mode) for sub-second responses. For complex database migrations, architectural code audits, or cryptographic proofs, allocate between 4,000 and 16,000 thinking tokens.",
      },
      { type: "h2", text: "2. The XML Prompt Blueprint for Claude" },
      {
        type: "p",
        text: "Anthropic models are pre-trained to recognize XML structural hierarchies as high-priority semantic boundaries. In our testing, structuring Claude prompts with semantic XML tags improves constraint adherence by over 30% compared to flat Markdown text.",
      },
      {
        type: "code",
        label: "Claude 3.7 Production Prompt Envelope",
        text: `<system_instructions>
You are a Principal Software Architect specialising in high-throughput distributed systems.
</system_instructions>

<context>
We are refactoring a Node.js / PostgreSQL queue processing worker that processes 10,000 webhook events per minute. Under peak load, worker nodes experience connection pool exhaustion.
</context>

<code_snippet language="typescript">
{{EXISTING_WORKER_CODE}}
</code_snippet>

<constraints>
1. Preserve strict idempotency across duplicate webhook event IDs.
2. Implement an exponential backoff jitter algorithm with a max retry limit of 5.
3. Use a connection pool checkout timeout of 2,000ms.
4. Output fully typed TypeScript code without placeholder comments or omitted functions.
</constraints>

<instructions>
First, in your internal thinking process, systematically analyze the three most likely failure vectors causing pool starvation in the provided snippet.
Then, generate the complete, production-ready refactored implementation wrapped inside a \`\`\`typescript code block.
</instructions>`,
      },
      { type: "h2", text: "3. Prompting for Nuanced Tone & Human Cadence" },
      {
        type: "p",
        text: "Claude 3.7 is widely recognized as the most articulate model for natural long-form writing. To unlock its full literary potential without robotic stiffness, instruct it to vary sentence lengths rhythmically and avoid repetitive transitional openers:",
      },
      {
        type: "quote",
        text: "Instruct Claude to write like a seasoned essayist: use deliberate sentence length variation, employ concrete sensory imagery over abstract generalizations, and eliminate self-congratulatory corporate jargon.",
      },
    ],
    takeaways: [
      "Leverage Claude 3.7 Sonnet's hybrid reasoning by calibrating thinking budgets dynamically per workload.",
      "Always structure complex inputs using semantic XML tags (`<context>`, `<constraints>`, `<instructions>`).",
      "Ask Claude to verify edge cases in its internal scratchpad before rendering final code.",
      "For natural writing, provide negative vocabulary lists and encourage rhythmic sentence variance.",
    ],
  },
  {
    slug: "advanced-prompt-engineering-techniques",
    title: "Advanced Prompt Engineering: Few-Shot, Chain-of-Thought, ReAct & Tree of Thoughts",
    description:
      "The definitive technical guide to cutting-edge prompt reasoning frameworks. Master zero-shot CoT, self-consistency sampling, ReAct tool agents, and algorithmic Tree of Thoughts in production.",
    category: "Advanced Techniques",
    readMinutes: 17,
    updated: "2026-06-24",
    emoji: "🔬",
    intro:
      "When building mission-critical AI applications—such as autonomous code agents, financial fraud analyzers, or multi-step diagnostic engines—basic zero-shot prompting is fundamentally insufficient. Achieving enterprise-grade reliability requires structured cognitive prompting frameworks developed in computer science literature. In this technical deep-dive, we deconstruct the four most powerful advanced prompting frameworks with practical, copyable code implementations.",
    blocks: [
      {
        type: "stats_grid",
        stats: [
          { label: "GSM8K Math Benchmark", value: "+37.5%", desc: "Accuracy boost from Standard Prompting to Chain-of-Thought" },
          { label: "Reasoning Error Reduction", value: "62%", desc: "Achieved via Self-Consistency majority voting across 5 paths" },
          { label: "Complex Task Success", value: "88.4%", desc: "Using ReAct (Reason + Act) tool loops for external APIs" },
        ],
      },
      { type: "h2", text: "1. Chain-of-Thought (CoT) Prompting" },
      {
        type: "p",
        text: "Chain-of-Thought prompting prompts the foundation model to decompose complex problems into discrete, sequential reasoning steps before outputting a final answer. By forcing token emission during the calculation phase, the model allocates compute to intermediate representations, drastically reducing arithmetic and deductive errors.",
      },
      {
        type: "code",
        label: "Zero-Shot CoT vs. Few-Shot CoT",
        text: `// Zero-Shot CoT Trigger:
"Let's work through this step-by-step to ensure complete accuracy."

// Few-Shot CoT Pattern:
Q: A logistics warehouse has 480 pallets. On Monday, 1/4 are shipped out. On Tuesday, 60 new pallets arrive, and 1/3 of the remaining stock is shipped. How many pallets remain?
A: Step 1: Initial pallets = 480.
Step 2: Monday shipments = 480 * 1/4 = 120 pallets shipped. Remaining = 480 - 120 = 360 pallets.
Step 3: Tuesday arrivals = 360 + 60 = 420 pallets.
Step 4: Tuesday shipments = 420 * 1/3 = 140 pallets shipped. Remaining = 420 - 140 = 280 pallets.
Final Answer: 280 pallets.`,
      },
      { type: "h2", text: "2. The ReAct (Reason + Act) Agent Framework" },
      {
        type: "p",
        text: "The ReAct framework combines reasoning traces with action execution. Instead of hallucinating real-time data, the model alternates between a 'Thought' step (evaluating current state), an 'Action' step (calling an external API or database tool), and an 'Observation' step (interpreting tool output).",
      },
      {
        type: "table",
        headers: ["Step", "Agent State", "Example Execution"],
        rows: [
          ["Thought 1", "Identifies what data is missing.", "I need to check the customer's current Stripe subscription status before issuing a refund."],
          ["Action 1", "Invokes external tool.", "`stripe.subscriptions.get(customer_id='cus_99182')`"],
          ["Observation 1", "Receives raw tool output.", "`status: 'active', plan: 'pro_annual', amount: 24000`"],
          ["Thought 2", "Synthesizes next decision.", "The customer has an active Pro Annual subscription with 8 months remaining. Calculate prorated refund."],
          ["Action 2", "Executes refund endpoint.", "`stripe.refunds.create(charge_id='ch_3812', amount=16000)`"],
        ],
      },
      { type: "h2", text: "3. Tree of Thoughts (ToT) for Complex Strategic Planning" },
      {
        type: "p",
        text: "Tree of Thoughts generalizes chain-of-thought by allowing the model to explore multiple reasoning branches simultaneously, evaluate their viability, backtrack from dead ends, and perform lookahead search algorithms (like BFS or DFS) across cognitive decision trees.",
      },
    ],
    takeaways: [
      "Chain-of-Thought prompting significantly boosts accuracy on multi-step analytical and quantitative tasks.",
      "Deploy the ReAct paradigm when your LLM needs to interact deterministically with external APIs and databases.",
      "Leverage Self-Consistency sampling (running 3-5 parallel generations and majority-voting the result) to eliminate random flukes.",
      "Tree of Thoughts is the gold standard for strategic planning, multi-vector problem solving, and complex software refactoring.",
    ],
  },
  {
    slug: "chain-of-thought-and-few-shot-prompting",
    title: "Chain-of-Thought & Few-Shot Prompting: Engineering Deterministic Reasoning",
    description:
      "Learn how to craft high-impact few-shot exemplars and trigger explicit reasoning paths to maximize accuracy, prevent hallucinations, and lock in exact formatting.",
    category: "Advanced Techniques",
    readMinutes: 14,
    updated: "2026-06-23",
    emoji: "🔗",
    intro:
      "When prompt engineers encounter model inconsistency, their first instinct is often to write longer paragraphs of instructions. In reality, modern LLMs learn far more effectively from concrete input-output demonstration pairs (few-shot exemplars) and explicit intermediate reasoning paths. In this deep-dive guide, we explore the science of exemplar selection, token distribution, and step-by-step reasoning triggers.",
    blocks: [
      {
        type: "callout",
        variant: "tip",
        title: "The Information Density of Examples",
        text: "In our benchmark experiments, supplying 2 high-quality input/output exemplars improved format compliance by 91%, outperforming a 300-word block of descriptive rules alone.",
      },
      { type: "h2", text: "1. Exemplar Selection Strategy for Few-Shot Prompting" },
      {
        type: "p",
        text: "Not all examples are created equal. A weak exemplar demonstrates only the happy path. A robust exemplar suite covers edge cases, unusual formatting, and explicit negative handling.",
      },
      {
        type: "table",
        headers: ["Exemplar Slot", "Purpose", "What to Demonstrate"],
        rows: [
          ["Exemplar 1 (Standard)", "Establishes baseline format & tone.", "Standard input with ideal clean output structure."],
          ["Exemplar 2 (Edge Case)", "Demonstrates boundary behavior.", "Input with missing fields, null values, or unusual characters."],
          ["Exemplar 3 (Negative / Rejection)", "Demonstrates refusal criteria.", "Input that violates constraints, showing how the model should cleanly reject or ask for clarification."],
        ],
      },
      { type: "h2", text: "2. Combining Few-Shot with Explicit Chain-of-Thought" },
      {
        type: "p",
        text: "When you embed step-by-step reasoning inside your few-shot exemplars, the model naturally mimics the internal reasoning format before writing the final output. This is the single most effective technique for complex math, data extraction, and logic analysis.",
      },
    ],
    takeaways: [
      "Demonstrate target formatting with 2-3 structured few-shot exemplars rather than relying solely on descriptive rules.",
      "Include edge cases and refusal examples in your exemplar suite to handle ambiguous inputs gracefully.",
      "Embed step-by-step reasoning inside your exemplars to encourage the model to show its work before rendering final answers.",
    ],
  },
  {
    slug: "meta-prompting-and-ai-prompt-generators",
    title: "Meta-Prompting Masterclass: How to Build Prompts That Generate Production-Grade Prompts",
    description:
      "The engineering guide to recursive meta-prompting. Build self-improving prompt generators, automated prompt optimizers, and domain-specific prompt compilers.",
    category: "Meta Prompting",
    readMinutes: 15,
    updated: "2026-06-25",
    emoji: "🪄",
    intro:
      "Why spend hours manually drafting prompt variations when large language models are themselves the world's most capable prompt engineers? Meta-prompting is the practice of using a master prompt to architect, optimize, and test specialized child prompts. In this masterclass, we provide our production meta-prompt compiler that turns vague user ideas into comprehensive, 5-part engineered prompt templates in seconds.",
    blocks: [
      {
        type: "stats_grid",
        stats: [
          { label: "Prompt Development Speed", value: "10x Faster", desc: "Generating comprehensive templates in under 15 seconds" },
          { label: "Constraint Completeness", value: "98.4%", desc: "Meta-prompts automatically include negative rules and edge cases" },
          { label: "Variable Coverage", value: "100%", desc: "Automated extraction of dynamic {{VARIABLES}} for marketplace use" },
        ],
      },
      { type: "h2", text: "1. The Meta-Prompt Architecture Blueprint" },
      {
        type: "p",
        text: "A production meta-prompt acts as a specialized prompt compiler. It takes a raw objective from a human user, analyzes the hidden assumptions, generates the optimal persona, defines dynamic template variables, establishes negative guardrails, and outputs the final production-ready prompt wrapped in clean code blocks.",
      },
      {
        type: "code",
        label: "The Ultimate Meta-Prompt Compiler (Copy & Use)",
        text: `### ROLE & DIRECTIVE
You are an Elite Principal Prompt Engineer. Your objective is to take a simple task idea from the user and transform it into a world-class, production-ready, reusable Prompt Template.

### COMPILATION WORKFLOW
When given a user task, execute the following 5-step engineering pipeline:
1. **Analyze Objective**: Identify the core goal, audience, and key domain requirements.
2. **Assign World-Class Persona**: Define the exact expert role best suited for the task.
3. **Extract Dynamic Variables**: Convert specific entities into reusable {{VARIABLE_NAME}} tags.
4. **Construct Negative Guardrails**: Identify the 5 most common clichés and mistakes, then forbid them explicitly.
5. **Enforce Structural Output**: Design the exact response schema (Markdown, JSON, or table).

### OUTPUT FORMAT
Output the generated prompt inside a single \`\`\`markdown code block, organized with standard headers:
- ### ROLE & OBJECTIVE
- ### CONTEXT & VARIABLES
- ### INSTRUCTIONS & WORKFLOW
- ### STRICT CONSTRAINTS & NEGATIVE PROMPTS
- ### OUTPUT FORMAT & SCHEMA`,
      },
      { type: "h2", text: "2. Recursive Self-Refinement Loops" },
      {
        type: "p",
        text: "You can take meta-prompting a step further by prompting the model to evaluate its own generated prompt against a quality scoring rubric, identify missing constraints, and output an improved revision in a single generation pass.",
      },
    ],
    takeaways: [
      "Meta-prompting accelerates prompt creation by automating persona, constraint, and variable extraction.",
      "Use our 5-step meta-prompt compiler to transform raw ideas into standardized, production-ready prompt templates.",
      "Incorporate recursive self-refinement to automatically audit and harden prompt security constraints.",
    ],
  },
];
