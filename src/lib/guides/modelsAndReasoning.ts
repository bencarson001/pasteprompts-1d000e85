import type { Guide } from "./types";

export const MODELS_AND_REASONING_GUIDES: Guide[] = [
  {
    "slug": "chatgpt-vs-claude-vs-gemini",
    "title": "ChatGPT vs Claude vs Gemini: Which AI Should You Use?",
    "description": "Compare ChatGPT, Claude and Gemini for writing, coding and document work. Try a practical comparison method and relevant prompts without unsupported rankings.",
    "intro": "There is no single winner for every task. Compare the assistants using work you actually do and choose the result that needs less correction, within the tools and budget you have.",
    "blocks": [
      {
        "type": "callout",
        "title": "Short answer",
        "text": "There is no single winner for every task. Compare the assistants using work you actually do and choose the result that needs less correction, within the tools and budget you have.",
        "variant": "info"
      },
      {
        "type": "h2",
        "text": "Compare the service you can actually use"
      },
      {
        "type": "p",
        "text": "ChatGPT, Claude and Gemini are general-purpose assistants with overlapping writing, coding and analysis abilities. Features, models, usage limits and connected tools change by plan and over time. Check the service’s current interface before assuming a capability is available on your account."
      },
      {
        "type": "h2",
        "text": "For writing, compare editing effort"
      },
      {
        "type": "p",
        "text": "Give each assistant the same audience, facts, tone and length. Compare specificity, readability and invented claims rather than how polished the opening sounds. A favourite default writing style is a personal preference, not evidence that one service is universally better."
      },
      {
        "type": "h2",
        "text": "For coding, compare working changes"
      },
      {
        "type": "p",
        "text": "Provide the relevant code, exact error, framework version and behaviour to preserve. Ask for a small change and tests. Run the proposed code in your own environment: an answer that compiles but weakens permissions or changes the public API is not a successful fix."
      },
      {
        "type": "h2",
        "text": "For documents, check traceability"
      },
      {
        "type": "p",
        "text": "Ask for references to pages or sections and verify those references. A large input limit does not guarantee that every passage will be used correctly. For long files, compare a summary with the original and inspect omitted qualifications."
      },
      {
        "type": "h2",
        "text": "Run a fair small comparison"
      },
      {
        "type": "p",
        "text": "Choose one writing task, one technical task and one document task you need. Use the same inputs and judge against criteria set beforehand. Record the model, date, limitations and edits required. Do not turn a few personal trials into a claimed general benchmark."
      },
      {
        "type": "h2",
        "text": "A starting prompt to adapt"
      },
      {
        "type": "p",
        "text": "This is an illustrative template, not a recorded model result. Replace the bracketed fields with your own material, then check the answer before using it."
      },
      {
        "type": "code",
        "label": "Example prompt — fill in the brackets",
        "text": "Using only [SOURCE MATERIAL], complete [TASK] for [AUDIENCE].\nReturn [FORMAT] and keep within [LENGTH].\nLabel missing evidence or assumptions.\nInclude source sections for factual points.\nFinish with a short list of items that need human verification."
      },
      {
        "type": "h2",
        "text": "Check the result before using it"
      },
      {
        "type": "list",
        "items": [
          "Use the same source and brief for each assistant.",
          "Check factual accuracy before judging style.",
          "Run code and inspect permission changes.",
          "Choose on actual editing effort, available tools and cost."
        ]
      },
      {
        "type": "h2",
        "text": "Common questions"
      },
      {
        "type": "h3",
        "text": "Should I pay for all three?"
      },
      {
        "type": "p",
        "text": "Not necessarily. Start with a service you already have and compare alternatives only where a recurring task remains difficult."
      },
      {
        "type": "h3",
        "text": "Will the same prompt work in all three?"
      },
      {
        "type": "p",
        "text": "The task and facts often transfer, but tool availability, input limits and formatting behaviour can differ. Adapt and retest."
      },
      {
        "type": "related_prompts",
        "prompts": [
          {
            "title": "Production Code Review & Refactor",
            "href": "/prompt/production-code-review-refactor-pp1",
            "description": "Organise a code review and refactor proposal; run your own tests before merging changes."
          },
          {
            "title": "Debug This Error Systematically",
            "href": "/prompt/debug-this-error-systematically-pp2",
            "description": "Separate a debugging hypothesis from evidence and choose a way to confirm it."
          },
          {
            "title": "Product Description That Sells",
            "href": "/prompt/product-description-that-sells-pp13",
            "description": "Turn supplied product facts into a structured description; review the draft for unsupported claims."
          },
          {
            "title": "Sales Email Sequence",
            "href": "/prompt/sales-email-sequence-pp12",
            "description": "Draft a sales email series around the offer and evidence you supply."
          },
          {
            "title": "Document Summarisation Engine",
            "href": "/prompt/document-summarisation-engine-ai14",
            "description": "Summarise supplied documents and check the summary against the original."
          },
          {
            "title": "AI Research Assistant",
            "href": "/prompt/ai-research-assistant-ai15",
            "description": "Organise research questions and source material; verify citations yourself."
          }
        ]
      }
    ],
    "takeaways": [
      "Use the same source and brief for each assistant.",
      "Check factual accuracy before judging style.",
      "Run code and inspect permission changes.",
      "Choose on actual editing effort, available tools and cost."
    ],
    "updated": "2026-11-03",
    "category": "AI Models",
    "emoji": "⚡",
    "readMinutes": 4
  },
  {
    "slug": "claude-3-7-sonnet-prompt-engineering",
    "title": "Claude Prompting: Clear Briefs and Reasoning Tasks",
    "description": "Write useful Claude prompts for editing, coding and analysis. Separate sources from instructions and check reasoning features in the model you actually use.",
    "intro": "Give Claude a clear deliverable, relevant source material and constraints. This page keeps its older URL, but the advice is not a claim that Claude 3.7 is the current model or best choice.",
    "blocks": [
      {
        "type": "callout",
        "title": "Short answer",
        "text": "Give Claude a clear deliverable, relevant source material and constraints. This page keeps its older URL, but the advice is not a claim that Claude 3.7 is the current model or best choice.",
        "variant": "info"
      },
      {
        "type": "h2",
        "text": "Begin with the task and source"
      },
      {
        "type": "p",
        "text": "Explain what must be produced and provide the code, document or draft it depends on. Label context, instructions and output requirements with headings. XML-style tags are an optional organising convention, not a special access-control mechanism or a measured improvement promised by this site."
      },
      {
        "type": "h2",
        "text": "Use reasoning features only where available"
      },
      {
        "type": "p",
        "text": "Some Claude models and plans offer extended thinking or related controls. Their availability, limits and API settings vary. Check current Anthropic documentation for your selected model rather than copying a token budget from an old article. Extra processing can cost time and money and does not guarantee correctness."
      },
      {
        "type": "h2",
        "text": "Ask for evidence you can check"
      },
      {
        "type": "p",
        "text": "For a code audit, request a ranked list of issues with the relevant lines, proposed minimal changes and tests. For document work, ask for quoted passages or section references. You do not need the model’s private internal reasoning; a concise explanation and verifiable evidence are more useful."
      },
      {
        "type": "h2",
        "text": "Calibrate writing with an example"
      },
      {
        "type": "p",
        "text": "Provide a short piece of your own approved writing and say what should carry over: direct openings, varied sentence lengths or restrained language. Ask it not to imitate a named person or invent expertise. Compare the draft with your reader’s needs, not a claim about a model’s natural voice."
      },
      {
        "type": "h2",
        "text": "A starting prompt to adapt"
      },
      {
        "type": "p",
        "text": "This is an illustrative template, not a recorded model result. Replace the bracketed fields with your own material, then check the answer before using it."
      },
      {
        "type": "code",
        "label": "Example prompt — fill in the brackets",
        "text": "Review [CODE] in [FRAMEWORK AND VERSION].\nPreserve: [PUBLIC BEHAVIOUR AND SECURITY RULES].\nReturn: issues ranked by severity, evidence, smallest suggested fix, and tests to run.\nDistinguish confirmed defects from hypotheses.\nDo not add dependencies or change permissions without explaining why."
      },
      {
        "type": "h2",
        "text": "Check the result before using it"
      },
      {
        "type": "list",
        "items": [
          "Check the actual model and feature availability.",
          "Supply code versions and behaviour to preserve.",
          "Require source evidence for important findings.",
          "Run the tests yourself before accepting changes."
        ]
      },
      {
        "type": "h2",
        "text": "Common questions"
      },
      {
        "type": "h3",
        "text": "Are XML tags mandatory?"
      },
      {
        "type": "p",
        "text": "No. Clear headings can work too. Choose a structure that makes the instructions and source easy to distinguish."
      },
      {
        "type": "h3",
        "text": "Does more thinking always improve a response?"
      },
      {
        "type": "p",
        "text": "No. Compare on the task you need; extra time can add complexity without fixing missing evidence."
      },
      {
        "type": "related_prompts",
        "prompts": [
          {
            "title": "Production Code Review & Refactor",
            "href": "/prompt/production-code-review-refactor-pp1",
            "description": "Organise a code review and refactor proposal; run your own tests before merging changes."
          },
          {
            "title": "Debug This Error Systematically",
            "href": "/prompt/debug-this-error-systematically-pp2",
            "description": "Separate a debugging hypothesis from evidence and choose a way to confirm it."
          }
        ]
      }
    ],
    "takeaways": [
      "Check the actual model and feature availability.",
      "Supply code versions and behaviour to preserve.",
      "Require source evidence for important findings.",
      "Run the tests yourself before accepting changes."
    ],
    "updated": "2026-11-03",
    "category": "Claude & Reasoning",
    "emoji": "🧠",
    "readMinutes": 3
  },
  {
    "slug": "advanced-prompt-engineering-techniques",
    "title": "Advanced Prompting: Examples, Task Chains and Tool Use",
    "description": "Use examples, staged tasks and controlled tool calls for complex AI work. Learn when each technique helps and why verification still matters.",
    "intro": "Use extra structure when a simple brief fails for a clear reason. Examples, staged tasks and tool-assisted work solve different problems; none turns a language model into a reliable decision-maker by itself.",
    "blocks": [
      {
        "type": "callout",
        "title": "Short answer",
        "text": "Use extra structure when a simple brief fails for a clear reason. Examples, staged tasks and tool-assisted work solve different problems; none turns a language model into a reliable decision-maker by itself.",
        "variant": "info"
      },
      {
        "type": "h2",
        "text": "Use examples for format and boundaries"
      },
      {
        "type": "p",
        "text": "Few-shot prompting supplies input-output examples. Include a normal case and an incomplete case so the model can see both the expected format and the rule for missing information. Use examples you have permission to share and do not label fictional demonstrations as real results."
      },
      {
        "type": "h2",
        "text": "Break long tasks into reviewable stages"
      },
      {
        "type": "p",
        "text": "For research and writing, gather sources first, check a proposed outline next and draft after that. For software work, identify the fault before generating a patch. A task chain provides places to correct errors; it does not guarantee that later stages will notice every earlier mistake."
      },
      {
        "type": "h2",
        "text": "Treat ReAct as a tool workflow, not a magic phrase"
      },
      {
        "type": "p",
        "text": "ReAct-style systems combine reasoning and actions using tool results. Writing “use ReAct” into an ordinary chat does not give it a search tool or database connection. Tool access must be implemented, scoped and authorised in the application. Approve consequential actions outside the model."
      },
      {
        "type": "h2",
        "text": "Explore alternatives without inventing certainty"
      },
      {
        "type": "p",
        "text": "Comparing several approaches can expose trade-offs. Ask for assumptions, costs and a way to test each option. Agreement between several model answers is not proof: they may repeat the same error. Verify calculations and decisions against independent evidence."
      },
      {
        "type": "h2",
        "text": "A starting prompt to adapt"
      },
      {
        "type": "p",
        "text": "This is an illustrative template, not a recorded model result. Replace the bracketed fields with your own material, then check the answer before using it."
      },
      {
        "type": "code",
        "label": "Example prompt — fill in the brackets",
        "text": "For [PROBLEM], propose three approaches.\nFor each: required evidence, trade-offs, risks, and a small test.\nDo not execute actions.\nRecommend a next step only after stating what remains unknown.\nUse [SOURCE MATERIAL] and mark anything not supported by it."
      },
      {
        "type": "h2",
        "text": "Check the result before using it"
      },
      {
        "type": "list",
        "items": [
          "Match the technique to a specific failure.",
          "Keep a review point between dependent tasks.",
          "Enforce tool permissions outside the model.",
          "Treat agreement between outputs as a clue, not proof."
        ]
      },
      {
        "type": "h2",
        "text": "Common questions"
      },
      {
        "type": "h3",
        "text": "Can a prompt create an autonomous agent?"
      },
      {
        "type": "p",
        "text": "No. An agent also needs software, tools, state and permissions. A chat instruction alone cannot supply those capabilities."
      },
      {
        "type": "h3",
        "text": "Is a complex framework always better?"
      },
      {
        "type": "p",
        "text": "No. Start with the smallest workflow that meets the task and add stages only when they help you detect or prevent a real failure."
      },
      {
        "type": "related_prompts",
        "prompts": [
          {
            "title": "AI Research Assistant",
            "href": "/prompt/ai-research-assistant-ai15",
            "description": "Organise research questions and source material; verify citations yourself."
          },
          {
            "title": "Debug This Error Systematically",
            "href": "/prompt/debug-this-error-systematically-pp2",
            "description": "Separate a debugging hypothesis from evidence and choose a way to confirm it."
          }
        ]
      }
    ],
    "takeaways": [
      "Match the technique to a specific failure.",
      "Keep a review point between dependent tasks.",
      "Enforce tool permissions outside the model.",
      "Treat agreement between outputs as a clue, not proof."
    ],
    "updated": "2026-11-03",
    "category": "Advanced Techniques",
    "emoji": "🔬",
    "readMinutes": 3
  },
  {
    "slug": "chain-of-thought-and-few-shot-prompting",
    "title": "Few-Shot Prompting and Checkable AI Explanations",
    "description": "Show AI examples of the answer you need and ask for concise, checkable explanations. Includes missing-data examples and advice on reviewing reasoning tasks.",
    "intro": "Examples help communicate a pattern, while a short explanation can make an answer easier to review. Neither guarantees accuracy, and you do not need to request hidden internal reasoning.",
    "blocks": [
      {
        "type": "callout",
        "title": "Short answer",
        "text": "Examples help communicate a pattern, while a short explanation can make an answer easier to review. Neither guarantees accuracy, and you do not need to request hidden internal reasoning.",
        "variant": "info"
      },
      {
        "type": "h2",
        "text": "Show the pattern with a small example"
      },
      {
        "type": "p",
        "text": "Use an input and an approved output that demonstrate the required fields and tone. Avoid examples that introduce rules you never intended. If you need factual extraction, show how a missing value should be reported rather than invented."
      },
      {
        "type": "h2",
        "text": "Cover an edge case"
      },
      {
        "type": "p",
        "text": "A normal example alone can encourage guessing when the next input is incomplete. Add a second example with missing or conflicting information. For a date extractor, “next Friday” without a reference date should stay ambiguous rather than becoming a made-up calendar date."
      },
      {
        "type": "h2",
        "text": "Ask for a concise explanation you can verify"
      },
      {
        "type": "p",
        "text": "For maths, ask for the calculation and units. For analysis, ask for the supporting source and assumptions. A plausible explanation can accompany a wrong answer, so independently check the steps that matter. Do not treat a request to “think step by step” as a factual guarantee."
      },
      {
        "type": "h2",
        "text": "Test beyond the examples"
      },
      {
        "type": "p",
        "text": "Try new inputs instead of only the demonstrations embedded in your prompt. Keep separate examples for evaluation and note which failures remain. When formatting must be strict, validate the returned fields in code rather than relying solely on the prompt."
      },
      {
        "type": "h2",
        "text": "A starting prompt to adapt"
      },
      {
        "type": "p",
        "text": "This is an illustrative template, not a recorded model result. Replace the bracketed fields with your own material, then check the answer before using it."
      },
      {
        "type": "code",
        "label": "Example prompt — fill in the brackets",
        "text": "Extract task, owner and deadline from each note.\nExample input: “Maya will send the quote by 12 May.”\nExample output: task=send quote; owner=Maya; deadline=12 May (year unspecified).\nExample input: “Someone should update the website soon.”\nExample output: task=update website; owner=not specified; deadline=not specified.\nNow process: [NOTES]. Do not fill missing fields."
      },
      {
        "type": "h2",
        "text": "Check the result before using it"
      },
      {
        "type": "list",
        "items": [
          "Use examples that match the real task.",
          "Include a missing-data case.",
          "Check calculations and cited passages independently.",
          "Test on inputs not included in the demonstrations."
        ]
      },
      {
        "type": "h2",
        "text": "Common questions"
      },
      {
        "type": "h3",
        "text": "How many examples do I need?"
      },
      {
        "type": "p",
        "text": "Start with one or two that show distinct cases. Add another only when it teaches a boundary the others miss."
      },
      {
        "type": "h3",
        "text": "Does an explanation prove the answer?"
      },
      {
        "type": "p",
        "text": "No. Check the calculation or source directly; a model can explain an incorrect conclusion convincingly."
      },
      {
        "type": "related_prompts",
        "prompts": [
          {
            "title": "Few-Shot Example Generator",
            "href": "/prompt/few-shot-example-generator-ai11",
            "description": "Draft examples for a prompting pattern, then check that each example follows your rules."
          },
          {
            "title": "Meeting Notes to Action Items",
            "href": "/prompt/meeting-notes-to-action-items-pro24",
            "description": "Extract actions from notes, with owners and deadlines checked against the meeting record."
          }
        ]
      }
    ],
    "takeaways": [
      "Use examples that match the real task.",
      "Include a missing-data case.",
      "Check calculations and cited passages independently.",
      "Test on inputs not included in the demonstrations."
    ],
    "updated": "2026-11-03",
    "category": "Advanced Techniques",
    "emoji": "🔗",
    "readMinutes": 3
  },
  {
    "slug": "meta-prompting-and-ai-prompt-generators",
    "title": "How to Use AI to Improve Your Prompts",
    "description": "Turn a vague task into a clearer AI prompt with defined inputs, constraints and a review checklist. Learn the limits of automatic prompt generators.",
    "intro": "An AI assistant can help draft a prompt, but it cannot know your workflow or prove that its own template works. Give it the task, then test and edit the result yourself.",
    "blocks": [
      {
        "type": "callout",
        "title": "Short answer",
        "text": "An AI assistant can help draft a prompt, but it cannot know your workflow or prove that its own template works. Give it the task, then test and edit the result yourself.",
        "variant": "info"
      },
      {
        "type": "h2",
        "text": "Start from the work, not an impressive persona"
      },
      {
        "type": "p",
        "text": "Describe the recurring job, who will use the result and what a successful output must contain. Include a failing example if you have one. A prompt generator is most useful when it can identify missing facts, not when it adds grand titles or excessive rules."
      },
      {
        "type": "h2",
        "text": "Ask for inputs and boundaries"
      },
      {
        "type": "p",
        "text": "Request clearly named placeholders, an output format and rules for incomplete information. Ask it to avoid adding business claims or facts you did not provide. If the result needs tools, the generator should state that requirement rather than pretend a prompt can create tool access."
      },
      {
        "type": "h2",
        "text": "Review the generated instructions"
      },
      {
        "type": "p",
        "text": "Remove contradictory limits, unnecessary stages and invented “best settings”. Check whether the user could fill in the inputs without help. A model’s self-rating is not an independent quality score; compare against a checklist you define."
      },
      {
        "type": "h2",
        "text": "Keep test cases separate"
      },
      {
        "type": "p",
        "text": "Run an ordinary input and an awkward one on the intended service. Record the actual model, date and outcome. If live testing is unavailable, say the review covered structure only. Recheck after model changes or when the underlying business task changes."
      },
      {
        "type": "h2",
        "text": "A starting prompt to adapt"
      },
      {
        "type": "p",
        "text": "This is an illustrative template, not a recorded model result. Replace the bracketed fields with your own material, then check the answer before using it."
      },
      {
        "type": "code",
        "label": "Example prompt — fill in the brackets",
        "text": "Help me draft a reusable prompt for [TASK].\nUser: [WHO WILL USE IT]. Output needed: [DELIVERABLE].\nKnown failures: [EXAMPLES].\nFirst ask about missing requirements. Then draft a concise template with labelled inputs, constraints and output format.\nFinish with two test cases and a human review checklist. Do not claim the template has been tested."
      },
      {
        "type": "h2",
        "text": "Check the result before using it"
      },
      {
        "type": "list",
        "items": [
          "Remove unnecessary personas and repeated instructions.",
          "Check every input has a clear purpose.",
          "Separate a proposed test from a completed test.",
          "Judge the result with actual use cases, not a self-rating."
        ]
      },
      {
        "type": "h2",
        "text": "Common questions"
      },
      {
        "type": "h3",
        "text": "Can the assistant improve its own prompt?"
      },
      {
        "type": "p",
        "text": "It can suggest revisions, but those suggestions still need independent review and tests. More elaborate wording is not automatically an improvement."
      },
      {
        "type": "h3",
        "text": "Should I keep every generated rule?"
      },
      {
        "type": "p",
        "text": "No. Keep only rules tied to the task, its risks or a failure you need to prevent."
      },
      {
        "type": "related_prompts",
        "prompts": [
          {
            "title": "Prompt Template Library Organiser",
            "href": "/prompt/prompt-template-library-organiser-ai28",
            "description": "Organise templates and identify clearer input fields."
          },
          {
            "title": "Few-Shot Example Generator",
            "href": "/prompt/few-shot-example-generator-ai11",
            "description": "Develop illustrative examples to review before adding them to a template."
          }
        ]
      }
    ],
    "takeaways": [
      "Remove unnecessary personas and repeated instructions.",
      "Check every input has a clear purpose.",
      "Separate a proposed test from a completed test.",
      "Judge the result with actual use cases, not a self-rating."
    ],
    "updated": "2026-11-03",
    "category": "Meta Prompting",
    "emoji": "🪄",
    "readMinutes": 3
  }
];
