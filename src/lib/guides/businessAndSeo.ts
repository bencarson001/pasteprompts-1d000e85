import type { Guide } from "./types";

export const BUSINESS_AND_SEO_GUIDES: Guide[] = [
  {
    "slug": "ai-prompts-for-seo-and-content-strategy",
    "title": "AI Prompts for SEO: Research, Briefs and Useful Content",
    "description": "Use AI to organise SEO research, draft content briefs and improve existing pages. Keep source checks and reader value ahead of keyword repetition or ranking promises.",
    "intro": "AI can organise your research and help draft useful pages. It cannot supply missing experience, confirm a Google ranking factor from a patent or guarantee rankings or AdSense approval.",
    "blocks": [
      {
        "type": "callout",
        "title": "Short answer",
        "text": "AI can organise your research and help draft useful pages. It cannot supply missing experience, confirm a Google ranking factor from a patent or guarantee rankings or AdSense approval.",
        "variant": "info"
      },
      {
        "type": "h2",
        "text": "Find a real reader question first"
      },
      {
        "type": "p",
        "text": "Use actual customer questions, Search Console queries and reviewed search results. Separate observed demand from ideas suggested by a model. A keyword list is not proof that a topic will bring customers; inspect what readers need and whether your site can answer it honestly."
      },
      {
        "type": "h2",
        "text": "Build a brief from evidence"
      },
      {
        "type": "p",
        "text": "Supply the source material, current page and questions it should answer. Ask for gaps and a proposed outline, not invented original statistics. A genuinely useful addition might be an accurate worked example, a decision checklist or a limitation competitors do not explain."
      },
      {
        "type": "h2",
        "text": "Improve an existing page before adding another"
      },
      {
        "type": "p",
        "text": "Check whether an existing guide already answers the question. Strengthen its title, opening answer and relevant internal links where needed. Avoid near-duplicate pages that repeat the same advice with a different keyword. Schema and keywords do not make thin content useful."
      },
      {
        "type": "h2",
        "text": "Review and measure after publishing"
      },
      {
        "type": "p",
        "text": "Verify factual claims, distinguish illustrative examples from real tests and make the next relevant action clear. In Search Console, compare impressions, clicks and queries after publication, allowing for reporting delays. Track registrations separately; traffic does not establish revenue."
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
        "text": "Using [CURRENT PAGE], [VERIFIED SOURCES] and [READER QUESTIONS], propose a content brief.\nReturn: primary question, short answer, missing evidence, useful sections and relevant existing internal links.\nDo not invent search volumes, benchmarks or first-hand experience.\nFlag sections that duplicate our existing pages: [PAGE LIST]."
      },
      {
        "type": "h2",
        "text": "Check the result before using it"
      },
      {
        "type": "list",
        "items": [
          "Use verified sources and real reader questions.",
          "Keep invented metrics and ranking promises out.",
          "Prefer improving a relevant existing page to creating a duplicate.",
          "Measure clicks and customer actions separately after publication."
        ]
      },
      {
        "type": "h2",
        "text": "Common questions"
      },
      {
        "type": "h3",
        "text": "Can AI content rank?"
      },
      {
        "type": "p",
        "text": "The origin of a draft alone does not establish quality. Useful, accurate content and policy compliance matter; publishing many generic pages is not a shortcut."
      },
      {
        "type": "h3",
        "text": "Does a sitemap request guarantee indexing?"
      },
      {
        "type": "p",
        "text": "No. It helps Google discover URLs, but Google decides whether and when to crawl or index them."
      },
      {
        "type": "related_prompts",
        "prompts": [
          {
            "title": "SEO Content Brief",
            "href": "/prompt/seo-content-brief-pp16",
            "description": "Prepare a content brief from your actual topic research and reader questions."
          },
          {
            "title": "SEO Keyword Cluster Planner",
            "href": "/prompt/seo-keyword-cluster-planner-bus23",
            "description": "Organise keyword research you already collected into proposed topics."
          }
        ]
      }
    ],
    "takeaways": [
      "Use verified sources and real reader questions.",
      "Keep invented metrics and ranking promises out.",
      "Prefer improving a relevant existing page to creating a duplicate.",
      "Measure clicks and customer actions separately after publication."
    ],
    "updated": "2026-11-03",
    "category": "SEO & Strategy",
    "emoji": "🔍",
    "readMinutes": 3
  },
  {
    "slug": "best-chatgpt-prompts-for-small-business",
    "title": "ChatGPT Prompts for Small Business: Useful Daily Tasks",
    "description": "Use ChatGPT for customer emails, product descriptions, procedures and meeting notes. Practical templates with factual checks and links to relevant prompts.",
    "intro": "Start with one low-risk task you repeat, such as drafting a customer update or tidying meeting notes. Review the result and compare editing effort before using AI more widely.",
    "blocks": [
      {
        "type": "callout",
        "title": "Short answer",
        "text": "Start with one low-risk task you repeat, such as drafting a customer update or tidying meeting notes. Review the result and compare editing effort before using AI more widely.",
        "variant": "info"
      },
      {
        "type": "h2",
        "text": "Choose a job with a checkable answer"
      },
      {
        "type": "p",
        "text": "Product descriptions, draft emails and procedure outlines are practical starting points when you can verify the facts. Do not hand over banking decisions, legal advice or staff decisions because a draft sounds confident. AI is an assistant, not an accountable manager."
      },
      {
        "type": "h2",
        "text": "Supply the actual business facts"
      },
      {
        "type": "p",
        "text": "Give the offer, opening hours or policy only when you have confirmed them. For outreach, provide truthful reasons the recipient is relevant; do not manufacture case studies or savings. Remove customer names and personal details unless sharing them is authorised."
      },
      {
        "type": "h2",
        "text": "Turn rough processes into draft instructions"
      },
      {
        "type": "p",
        "text": "Paste your actual steps and ask for a checklist with responsibilities, exceptions and missing details. Have someone who performs the task review it. A procedure is not tested simply because it looks orderly; run through it before using it to train others."
      },
      {
        "type": "h2",
        "text": "Test value on a real small task"
      },
      {
        "type": "p",
        "text": "Compare time spent supplying context and checking the answer with doing the task yourself. Record errors and decide whether a template helps you repeat the work. This guide does not claim measured time savings or extra sales for businesses using these prompts."
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
        "text": "Draft a customer reply using our confirmed policy: [POLICY].\nCustomer issue, with personal information removed: [ISSUE].\nAvailable next steps: [OPTIONS].\nKeep it under 150 words, acknowledge the issue and offer only an authorised action.\nIf the policy does not cover the case, flag it for a person rather than making a promise."
      },
      {
        "type": "h2",
        "text": "Check the result before using it"
      },
      {
        "type": "list",
        "items": [
          "Confirm all business details and policies.",
          "Remove unnecessary personal information.",
          "Try the process before delegating it.",
          "Measure usefulness without assuming sales or time savings."
        ]
      },
      {
        "type": "h2",
        "text": "Common questions"
      },
      {
        "type": "h3",
        "text": "What should I automate first?"
      },
      {
        "type": "p",
        "text": "Start with a draft you can review before it is sent, not an action that spends money or changes a customer account."
      },
      {
        "type": "h3",
        "text": "Can I use AI for cash-flow decisions?"
      },
      {
        "type": "p",
        "text": "It can help organise supplied figures, but calculations and decisions need independent checking and appropriate professional advice."
      },
      {
        "type": "related_prompts",
        "prompts": [
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
            "title": "Meeting Notes to Action Items",
            "href": "/prompt/meeting-notes-to-action-items-pro24",
            "description": "Extract actions from notes, with owners and deadlines checked against the meeting record."
          }
        ]
      }
    ],
    "takeaways": [
      "Confirm all business details and policies.",
      "Remove unnecessary personal information.",
      "Try the process before delegating it.",
      "Measure usefulness without assuming sales or time savings."
    ],
    "updated": "2026-11-03",
    "category": "Business & Ops",
    "emoji": "💼",
    "readMinutes": 3
  },
  {
    "slug": "ai-prompts-for-marketing",
    "title": "AI Marketing Prompts: Clear Briefs, Emails and Campaigns",
    "description": "Draft marketing copy from real offers and audience needs. Includes an editable campaign brief, review checks and links to email and landing-page prompts.",
    "intro": "Good marketing drafts begin with a real offer, a specific audience and evidence you can support. AI can propose wording; only actual customer behaviour can tell you whether it works.",
    "blocks": [
      {
        "type": "callout",
        "title": "Short answer",
        "text": "Good marketing drafts begin with a real offer, a specific audience and evidence you can support. AI can propose wording; only actual customer behaviour can tell you whether it works.",
        "variant": "info"
      },
      {
        "type": "h2",
        "text": "Define the audience and one action"
      },
      {
        "type": "p",
        "text": "State who the message is for, what problem you address and what the reader should do next. Separate what customers have actually told you from a persona invented for planning. Keep the offer consistent across emails, adverts and the destination page."
      },
      {
        "type": "h2",
        "text": "Use structure without manipulation"
      },
      {
        "type": "p",
        "text": "AIDA or problem-solution structures can help order a message, but they are not conversion guarantees. Do not invent scarcity, reviews or customer outcomes. Explain the offer plainly and avoid exaggerating a problem to pressure readers."
      },
      {
        "type": "h2",
        "text": "Ask for a few meaningful variations"
      },
      {
        "type": "p",
        "text": "Change the angle or opening, not just synonyms. Request one factual version, one question-led version and one short version, each supported by the same evidence. Check length limits in the actual channel rather than trusting a model’s character count."
      },
      {
        "type": "h2",
        "text": "Review before sending and learn afterwards"
      },
      {
        "type": "p",
        "text": "Confirm price, conditions, claims and links. Check consent and channel rules before emailing or advertising. Test on a small appropriate audience and compare meaningful actions, not just impressions. A higher open rate alone does not prove more customers."
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
        "text": "Offer: [CONFIRMED OFFER AND CONDITIONS].\nAudience: [RELEVANT READER]. Evidence: [SUPPORTED FACTS].\nDraft three [CHANNEL] messages with different openings and one clear action: [ACTION].\nAvoid invented urgency, testimonials and performance claims.\nFor each version, note which supplied fact supports its main claim."
      },
      {
        "type": "h2",
        "text": "Check the result before using it"
      },
      {
        "type": "list",
        "items": [
          "Keep claims traceable to supplied facts.",
          "Make the offer and next action consistent.",
          "Check consent and channel-specific rules.",
          "Use observed customer actions to judge a test."
        ]
      },
      {
        "type": "h2",
        "text": "Common questions"
      },
      {
        "type": "h3",
        "text": "Should I generate dozens of versions?"
      },
      {
        "type": "p",
        "text": "Only if you can review and test them. A few genuinely different angles are easier to learn from than many near-identical drafts."
      },
      {
        "type": "h3",
        "text": "Can AI invent social proof for a mockup?"
      },
      {
        "type": "p",
        "text": "Keep fictional examples clearly labelled and never publish them as real reviews, sales or customer results."
      },
      {
        "type": "related_prompts",
        "prompts": [
          {
            "title": "Sales Email Sequence",
            "href": "/prompt/sales-email-sequence-pp12",
            "description": "Draft a sales email series around the offer and evidence you supply."
          },
          {
            "title": "High-Converting Landing Page",
            "href": "/prompt/high-converting-landing-page-pp11",
            "description": "Build a landing-page draft from a defined offer; the title is not a promise of conversion performance."
          }
        ]
      }
    ],
    "takeaways": [
      "Keep claims traceable to supplied facts.",
      "Make the offer and next action consistent.",
      "Check consent and channel-specific rules.",
      "Use observed customer actions to judge a test."
    ],
    "updated": "2026-11-03",
    "category": "Marketing",
    "emoji": "🚀",
    "readMinutes": 3
  },
  {
    "slug": "ecommerce-product-descriptions-with-ai",
    "title": "AI Product Descriptions: Accurate Copy for Online Shops",
    "description": "Write product descriptions from confirmed specifications, explain useful benefits and check missing details. Includes an editable e-commerce prompt and real listings.",
    "intro": "Use AI to explain confirmed product details, not to make up features or persuasive proof. A description should help the shopper understand what they are buying and what remains uncertain.",
    "blocks": [
      {
        "type": "callout",
        "title": "Short answer",
        "text": "Use AI to explain confirmed product details, not to make up features or persuasive proof. A description should help the shopper understand what they are buying and what remains uncertain.",
        "variant": "info"
      },
      {
        "type": "h2",
        "text": "Collect the specifications first"
      },
      {
        "type": "p",
        "text": "Supply materials, dimensions, contents, care instructions and applicable restrictions from the product record. Do not assume a photograph proves a material, certification or included accessory. If the information is absent, ask the supplier or omit it."
      },
      {
        "type": "h2",
        "text": "Connect features to supported uses"
      },
      {
        "type": "p",
        "text": "A zip closure may help keep contents contained; it does not establish waterproofing. A compact size may suit small spaces; it does not prove durability. Keep benefits tied to what the actual specifications support, and avoid medical or safety claims without appropriate evidence."
      },
      {
        "type": "h2",
        "text": "Build a readable listing"
      },
      {
        "type": "p",
        "text": "Use a plain opening, short benefit bullets and a specification table where useful. Include the information shoppers need to compare options. Structured copy can be easier to read, but a Markdown table is not a substitute for correct shopping feeds or product structured data."
      },
      {
        "type": "h2",
        "text": "Check against the product record"
      },
      {
        "type": "p",
        "text": "Compare numbers, units, colours and included items with the source. Do not let a model create star ratings, guarantees or a comparison with a competitor you have not investigated. Review the displayed page as well as the draft before publishing."
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
        "text": "Write a description for [PRODUCT] aimed at [BUYER].\nConfirmed specifications: [FACTS].\nReturn a short overview, four factual benefit bullets and a specification table.\nDo not invent materials, certifications, ratings, accessories or warranties.\nList missing details separately instead of guessing."
      },
      {
        "type": "h2",
        "text": "Check the result before using it"
      },
      {
        "type": "list",
        "items": [
          "Match all numbers and units to the product record.",
          "Remove unsupported safety, durability and health claims.",
          "State what is included without adding accessories.",
          "Keep missing information separate from the finished copy."
        ]
      },
      {
        "type": "h2",
        "text": "Common questions"
      },
      {
        "type": "h3",
        "text": "Should every product have completely different wording?"
      },
      {
        "type": "p",
        "text": "Descriptions should reflect real differences. Do not invent distinctions merely to avoid repeated specifications."
      },
      {
        "type": "h3",
        "text": "Can a generated image replace product photography?"
      },
      {
        "type": "p",
        "text": "Use caution: generated details may misrepresent the item. Label illustrative concepts and inspect accuracy before using them commercially."
      },
      {
        "type": "related_prompts",
        "prompts": [
          {
            "title": "Product Description That Sells",
            "href": "/prompt/product-description-that-sells-pp13",
            "description": "Turn supplied product facts into a structured description; review the draft for unsupported claims."
          },
          {
            "title": "Editorial Product Photography",
            "href": "/prompt/editorial-product-photography-pp21",
            "description": "Plan an illustrative product image and check it against the real item."
          }
        ]
      }
    ],
    "takeaways": [
      "Match all numbers and units to the product record.",
      "Remove unsupported safety, durability and health claims.",
      "State what is included without adding accessories.",
      "Keep missing information separate from the finished copy."
    ],
    "updated": "2026-11-03",
    "category": "E-Commerce",
    "emoji": "🛍️",
    "readMinutes": 3
  },
  {
    "slug": "customer-support-and-email-ai-prompts",
    "title": "AI Customer Support Prompts: Replies Without False Promises",
    "description": "Draft clear customer replies from your actual policy. Handle missing details, complaints and escalation without invented refunds, deadlines or account actions.",
    "intro": "Give the assistant the issue and the policy, then review its suggested reply. A sympathetic draft must not promise a refund, replacement or deadline that your team has not authorised.",
    "blocks": [
      {
        "type": "callout",
        "title": "Short answer",
        "text": "Give the assistant the issue and the policy, then review its suggested reply. A sympathetic draft must not promise a refund, replacement or deadline that your team has not authorised.",
        "variant": "info"
      },
      {
        "type": "h2",
        "text": "Supply policy and remove personal details"
      },
      {
        "type": "p",
        "text": "Provide the relevant returns, delivery or account rules and only the customer facts needed for the reply. Remove account credentials and unnecessary personal information. The assistant cannot know whether a refund is due from the customer’s message alone."
      },
      {
        "type": "h2",
        "text": "Acknowledge without overpromising"
      },
      {
        "type": "p",
        "text": "A useful reply recognises the issue, states what is known and explains an available next step. Avoid repeated scripted apologies or claiming an action has been completed when it has not. A draft should say “we can review” rather than “we have refunded” unless that action is confirmed."
      },
      {
        "type": "h2",
        "text": "Flag cases that need a person"
      },
      {
        "type": "p",
        "text": "Escalate unclear policy, suspected fraud, legal threats and sensitive information. Ask the assistant to identify missing details instead of deciding them. Automatic sending needs separate permissions and review rules; this guide is about drafting, not authorising account changes."
      },
      {
        "type": "h2",
        "text": "Check the reply as the customer would read it"
      },
      {
        "type": "p",
        "text": "Verify order references, dates, contact methods and next actions. Make sure there is a way to reach a person when needed. The goal is a truthful, useful response, not a claimed reduction in churn or a guaranteed successful resolution."
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
        "text": "Issue: [CUSTOMER MESSAGE WITH PERSONAL DETAILS REMOVED].\nApplicable policy: [POLICY]. Confirmed actions: [ACTIONS].\nDraft a calm, concise reply with a clear next step.\nDo not promise refunds, replacements or dates not stated above.\nIf the case is outside the policy, provide an escalation note for our team instead."
      },
      {
        "type": "h2",
        "text": "Check the result before using it"
      },
      {
        "type": "list",
        "items": [
          "Use the actual applicable policy.",
          "Do not claim an action has happened unless confirmed.",
          "Escalate gaps and sensitive cases.",
          "Check the customer has a clear next step."
        ]
      },
      {
        "type": "h2",
        "text": "Common questions"
      },
      {
        "type": "h3",
        "text": "Can I send generated replies automatically?"
      },
      {
        "type": "p",
        "text": "Only with a separately designed and tested approval process. A prompt alone cannot safely authorise actions or guarantee compliance."
      },
      {
        "type": "h3",
        "text": "Should the assistant decide refund eligibility?"
      },
      {
        "type": "p",
        "text": "It can summarise a supplied policy, but exceptions and consequential decisions need the responsible person or an authorised application rule."
      },
      {
        "type": "related_prompts",
        "prompts": [
          {
            "title": "Customer Retention Playbook",
            "href": "/prompt/customer-retention-playbook-bus13",
            "description": "Plan follow-up questions and support improvements using your own customer evidence."
          },
          {
            "title": "Sales Email Sequence",
            "href": "/prompt/sales-email-sequence-pp12",
            "description": "Draft a sales email series around the offer and evidence you supply."
          }
        ]
      }
    ],
    "takeaways": [
      "Use the actual applicable policy.",
      "Do not claim an action has happened unless confirmed.",
      "Escalate gaps and sensitive cases.",
      "Check the customer has a clear next step."
    ],
    "updated": "2026-11-03",
    "category": "Customer Support",
    "emoji": "💬",
    "readMinutes": 3
  },
  {
    "slug": "ai-prompts-for-business-productivity",
    "title": "AI Productivity Prompts: Meetings, Updates and Decisions",
    "description": "Turn meeting notes into actions, draft clearer updates and compare options using supplied facts. Practical examples with no invented owners or time-saving claims.",
    "intro": "Use AI to organise information you already have. Ask it to make missing owners, deadlines and evidence visible rather than filling them in.",
    "blocks": [
      {
        "type": "callout",
        "title": "Short answer",
        "text": "Use AI to organise information you already have. Ask it to make missing owners, deadlines and evidence visible rather than filling them in.",
        "variant": "info"
      },
      {
        "type": "h2",
        "text": "Extract commitments from meeting notes"
      },
      {
        "type": "p",
        "text": "Provide an authorised transcript or notes and request separate decisions, actions and open questions. A suggestion made in a meeting is not necessarily a commitment. Ask for the source passage so the team can check who agreed to what."
      },
      {
        "type": "h2",
        "text": "Draft a useful status update"
      },
      {
        "type": "p",
        "text": "State what changed, what is blocked and which decision is needed. Include dates or progress figures only when supplied. A tidy update should not turn a rough estimate into a firm promise or imply that a project is on track without evidence."
      },
      {
        "type": "h2",
        "text": "Compare options without false precision"
      },
      {
        "type": "p",
        "text": "A decision table can clarify criteria, trade-offs and missing data. Do not ask the assistant to invent scores that look objective. Use real costs and constraints, and show when one criterion matters more than another."
      },
      {
        "type": "h2",
        "text": "Close the loop with the team"
      },
      {
        "type": "p",
        "text": "Ask owners to confirm actions and deadlines before circulating the final record. Store the verified version in your normal process. An organised output is useful only if it reflects what happened and leads to an agreed next step."
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
        "text": "From [MEETING NOTES], extract decisions, action items and open questions.\nFor each action: task, named owner, deadline if explicitly stated, and supporting passage.\nUse “not specified” for missing fields.\nSeparate proposals from agreed commitments.\nDo not calculate progress or invent a follow-up date."
      },
      {
        "type": "h2",
        "text": "Check the result before using it"
      },
      {
        "type": "list",
        "items": [
          "Verify actions with the relevant source passage.",
          "Keep proposals separate from commitments.",
          "Leave absent owners and dates unspecified.",
          "Ask the team to confirm the final record."
        ]
      },
      {
        "type": "h2",
        "text": "Common questions"
      },
      {
        "type": "h3",
        "text": "Can it analyse recordings directly?"
      },
      {
        "type": "p",
        "text": "That depends on your service and plan. Check file support and obtain appropriate permission before recording or uploading a meeting."
      },
      {
        "type": "h3",
        "text": "How much time will this save?"
      },
      {
        "type": "p",
        "text": "There is no measured saving promised here. Compare your own preparation and review time on a small repeated task."
      },
      {
        "type": "related_prompts",
        "prompts": [
          {
            "title": "Meeting Notes to Action Items",
            "href": "/prompt/meeting-notes-to-action-items-pro24",
            "description": "Extract actions from notes, with owners and deadlines checked against the meeting record."
          },
          {
            "title": "AI Meeting Notes Summariser",
            "href": "/prompt/ai-meeting-notes-summariser-ai9",
            "description": "Prepare a summary of the supplied meeting record and review it with participants."
          }
        ]
      }
    ],
    "takeaways": [
      "Verify actions with the relevant source passage.",
      "Keep proposals separate from commitments.",
      "Leave absent owners and dates unspecified.",
      "Ask the team to confirm the final record."
    ],
    "updated": "2026-11-03",
    "category": "Productivity",
    "emoji": "📈",
    "readMinutes": 3
  }
];
