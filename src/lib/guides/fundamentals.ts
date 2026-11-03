import type { Guide } from "./types";

export const FUNDAMENTAL_GUIDES: Guide[] = [
  {
    "slug": "how-to-write-effective-ai-prompts",
    "title": "How to Write Effective AI Prompts: A Practical Guide",
    "description": "Write clearer AI prompts with a specific task, useful context, examples and an output format. Includes an editable template and checks for common mistakes.",
    "intro": "Start with the job you need done, give the facts the assistant cannot know, and describe a usable answer. A clearer brief reduces guesswork, but it cannot make an AI response automatically correct.",
    "blocks": [
      {
        "type": "callout",
        "title": "Short answer",
        "text": "Start with the job you need done, give the facts the assistant cannot know, and describe a usable answer. A clearer brief reduces guesswork, but it cannot make an AI response automatically correct.",
        "variant": "info"
      },
      {
        "type": "h2",
        "text": "Name the task, not just a role"
      },
      {
        "type": "p",
        "text": "“Act as a marketing expert” says little about the work. “Draft a customer email explaining our delivery delay” gives the assistant a concrete task. Add the reader, purpose and next action. A role can suggest a perspective, but it is optional and is not evidence of expertise."
      },
      {
        "type": "h2",
        "text": "Give context that changes the answer"
      },
      {
        "type": "p",
        "text": "Supply the product details, source text, deadline or code the task depends on. Leave out confidential information unless you are authorised to share it with that service. Separate reference material from instructions using headings so you can see what belongs where; headings are not a security barrier."
      },
      {
        "type": "h2",
        "text": "Specify a workable output"
      },
      {
        "type": "p",
        "text": "Ask for the shape you need: a short email, a table, a checklist or a code change. State important limits and show a brief example if tone or formatting matters. Avoid contradictory requirements such as “include every detail” and “keep it under fifty words”."
      },
      {
        "type": "h2",
        "text": "Improve one thing at a time"
      },
      {
        "type": "p",
        "text": "If the first answer is wrong, identify whether it lacks facts, uses the wrong tone or misses a required section. Change that part of the prompt and compare on the same input. Keep useful versions along with the model and date you actually tested them."
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
        "text": "Draft an email to [customer type] about [situation].\nUse only these facts: [confirmed facts].\nTone: calm, clear and direct. Maximum 150 words.\nInclude: what happened, what we can do, and the next action.\nDo not invent dates, discounts or promises. If a required fact is missing, ask for it before drafting."
      },
      {
        "type": "h2",
        "text": "Check the result before using it"
      },
      {
        "type": "list",
        "items": [
          "Check every factual claim against your source material.",
          "Confirm the intended reader can find the next action.",
          "Remove invented evidence and unnecessary jargon.",
          "Try the template on another real input before calling it reusable."
        ]
      },
      {
        "type": "h2",
        "text": "Common questions"
      },
      {
        "type": "h3",
        "text": "Do longer prompts work better?"
      },
      {
        "type": "p",
        "text": "Only when the extra material helps the task. Repeated instructions and irrelevant background can obscure what matters."
      },
      {
        "type": "h3",
        "text": "Do I need a special phrase?"
      },
      {
        "type": "p",
        "text": "No phrase guarantees a useful answer. Clear facts, an explicit deliverable and review are more useful than an elaborate persona."
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
            "title": "Document Summarisation Engine",
            "href": "/prompt/document-summarisation-engine-ai14",
            "description": "Summarise supplied documents and check the summary against the original."
          }
        ]
      }
    ],
    "takeaways": [
      "Check every factual claim against your source material.",
      "Confirm the intended reader can find the next action.",
      "Remove invented evidence and unnecessary jargon.",
      "Try the template on another real input before calling it reusable."
    ],
    "updated": "2026-11-03",
    "category": "Fundamentals",
    "emoji": "✍️",
    "readMinutes": 3
  },
  {
    "slug": "anatomy-of-a-perfect-prompt-template",
    "title": "How to Build a Reusable AI Prompt Template",
    "description": "Build a reusable AI prompt with clear input fields, missing-data rules and an output format. Learn what to test before sharing or selling a template.",
    "intro": "A reusable template keeps the task and checks stable while letting the user replace the facts. Useful placeholders are easy to understand; they are not a guarantee of consistent or secure output.",
    "blocks": [
      {
        "type": "callout",
        "title": "Short answer",
        "text": "A reusable template keeps the task and checks stable while letting the user replace the facts. Useful placeholders are easy to understand; they are not a guarantee of consistent or secure output.",
        "variant": "info"
      },
      {
        "type": "h2",
        "text": "Separate fixed instructions from inputs"
      },
      {
        "type": "p",
        "text": "Keep the objective, output format and review rules in one section. Put changing material into clearly named fields such as [AUDIENCE], [SOURCE NOTES] and [DEADLINE]. A placeholder is a convention for the reader, not executable validation."
      },
      {
        "type": "h2",
        "text": "Describe what each field needs"
      },
      {
        "type": "p",
        "text": "Tell the user whether a field expects a sentence, a list or a document. Mark optional inputs. If a deadline or figure is absent, tell the assistant to flag the gap instead of supplying one. Include a small fictional input example and label it as illustrative."
      },
      {
        "type": "h2",
        "text": "Plan for awkward inputs"
      },
      {
        "type": "p",
        "text": "Try short notes, incomplete facts, conflicting dates and content outside the intended subject. In an automated application, validate values and permissions in code. Delimiters can help readability but cannot stop prompt injection or replace access controls."
      },
      {
        "type": "h2",
        "text": "Keep a record of real tests"
      },
      {
        "type": "p",
        "text": "Store the template version, model used, sample inputs, failures and changes. Do not call a template tested on a model simply because its name appears in the instructions. A format example and an actual model output should be labelled differently."
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
        "text": "Task: turn [SOURCE NOTES] into a project update for [AUDIENCE].\nRequired sections: current status, decisions, next actions.\nUse [DEADLINE] only when supplied; otherwise write “deadline not specified”.\nDo not add progress figures or commitments.\nBefore drafting, list any missing facts that would change the update."
      },
      {
        "type": "h2",
        "text": "Check the result before using it"
      },
      {
        "type": "list",
        "items": [
          "Make every required input understandable without extra explanation.",
          "Check that missing values remain visibly missing.",
          "Test both an ordinary and an incomplete input.",
          "Keep untrusted content separate and enforce application permissions outside the prompt."
        ]
      },
      {
        "type": "h2",
        "text": "Common questions"
      },
      {
        "type": "h3",
        "text": "Are double curly brackets required?"
      },
      {
        "type": "p",
        "text": "No. Brackets, labelled fields or forms can all work. Use one convention consistently and explain how to replace it."
      },
      {
        "type": "h3",
        "text": "Can one template cover every situation?"
      },
      {
        "type": "p",
        "text": "Usually not. Split templates when the audience, risks or output requirements differ materially."
      },
      {
        "type": "related_prompts",
        "prompts": [
          {
            "title": "Prompt Template Library Organiser",
            "href": "/prompt/prompt-template-library-organiser-ai28",
            "description": "Organise a library of reusable prompts with clearer names and inputs."
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
      "Make every required input understandable without extra explanation.",
      "Check that missing values remain visibly missing.",
      "Test both an ordinary and an incomplete input.",
      "Keep untrusted content separate and enforce application permissions outside the prompt."
    ],
    "updated": "2026-11-03",
    "category": "Fundamentals",
    "emoji": "📐",
    "readMinutes": 3
  },
  {
    "slug": "common-prompting-mistakes",
    "title": "Common AI Prompting Mistakes and How to Fix Them",
    "description": "Fix vague requests, conflicting rules, missing sources and unchecked AI output. Practical examples for writing, research and repeatable everyday tasks.",
    "intro": "The most useful fix is often a clearer task or a better source, not a longer prompt. Diagnose the failure first and change the instruction that caused it.",
    "blocks": [
      {
        "type": "callout",
        "title": "Short answer",
        "text": "The most useful fix is often a clearer task or a better source, not a longer prompt. Diagnose the failure first and change the instruction that caused it.",
        "variant": "info"
      },
      {
        "type": "h2",
        "text": "Vague requests and hidden assumptions"
      },
      {
        "type": "p",
        "text": "“Make this better” leaves the assistant to choose the goal. Say whether you need a shorter message, a clearer explanation or a friendlier tone. Provide the reader and intended action. Polite language is fine; the problem is missing information, not saying please."
      },
      {
        "type": "h2",
        "text": "Conflicting rules and overloaded tasks"
      },
      {
        "type": "p",
        "text": "An exhaustive analysis cannot also be a tiny summary. Put essential requirements first, distinguish optional ones and split unrelated tasks. Research, fact-checking and drafting benefit from separate review points rather than one instruction to do everything."
      },
      {
        "type": "h2",
        "text": "Asking for facts without evidence"
      },
      {
        "type": "p",
        "text": "An instruction to be accurate does not give the model access to current facts. Supply your source or use a tool that can retrieve it, then check the citation. If no source supports a figure, leave it out. Asking for a confident tone should never override uncertainty."
      },
      {
        "type": "h2",
        "text": "Treating a plausible answer as a finished result"
      },
      {
        "type": "p",
        "text": "Fluent prose and tidy code can still be wrong. Review claims, run tests and check that the output actually meets the brief. If your prompt fails repeatedly, save a concrete failing input and use it when comparing the revision."
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
        "text": "Review this draft against the brief.\nBrief: [AUDIENCE, PURPOSE, CONFIRMED FACTS].\nDraft: [TEXT].\nReturn a table: issue, evidence in the draft, suggested change.\nSeparate factual gaps from stylistic suggestions. Do not invent facts to fill gaps."
      },
      {
        "type": "h2",
        "text": "Check the result before using it"
      },
      {
        "type": "list",
        "items": [
          "Name one concrete deliverable.",
          "Resolve contradictory length and detail requirements.",
          "Supply sources for factual tasks.",
          "Review the output instead of trusting confident wording."
        ]
      },
      {
        "type": "h2",
        "text": "Common questions"
      },
      {
        "type": "h3",
        "text": "Should I ban every unwanted phrase?"
      },
      {
        "type": "p",
        "text": "A short list can help, but also say what you want instead: plain language, concrete facts or a direct opening."
      },
      {
        "type": "h3",
        "text": "Is a bad answer always a bad prompt?"
      },
      {
        "type": "p",
        "text": "No. The model, available tools and source quality also matter. Some tasks need specialist review rather than another prompt."
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
            "title": "Debug This Error Systematically",
            "href": "/prompt/debug-this-error-systematically-pp2",
            "description": "Separate a debugging hypothesis from evidence and choose a way to confirm it."
          }
        ]
      }
    ],
    "takeaways": [
      "Name one concrete deliverable.",
      "Resolve contradictory length and detail requirements.",
      "Supply sources for factual tasks.",
      "Review the output instead of trusting confident wording."
    ],
    "updated": "2026-11-03",
    "category": "Fundamentals",
    "emoji": "⚠️",
    "readMinutes": 3
  },
  {
    "slug": "how-to-remove-a-prompt-from-chatgpt",
    "title": "How to Delete a ChatGPT Prompt or Conversation",
    "description": "Delete or archive ChatGPT chats, manage saved memories and change training settings. Understand what each control does before removing sensitive information.",
    "intro": "To remove a saved conversation from ChatGPT, delete the chat. Archiving only hides it from the main list, and changing training settings does not delete your history or saved memories.",
    "blocks": [
      {
        "type": "callout",
        "title": "Short answer",
        "text": "To remove a saved conversation from ChatGPT, delete the chat. Archiving only hides it from the main list, and changing training settings does not delete your history or saved memories.",
        "variant": "info"
      },
      {
        "type": "h2",
        "text": "Delete a conversation or archive it"
      },
      {
        "type": "p",
        "text": "Find the conversation in ChatGPT, open its menu and select Delete, then confirm. On a phone the menu location may differ. Archive is useful for tidying your sidebar, but archived chats remain in the account. Open Settings, then Data controls, to manage archived chats. Deletion removes the conversation rather than just one selected prompt."
      },
      {
        "type": "h2",
        "text": "Understand what deletion means"
      },
      {
        "type": "p",
        "text": "OpenAI says deleted chats are scheduled for permanent deletion within 30 days, with exceptions where content was already de-identified or must be kept for legal or security reasons. You cannot restore a deleted chat through the normal interface. Do not describe deletion as immediate removal from every system or as proof of legal compliance."
      },
      {
        "type": "h2",
        "text": "Change training settings separately"
      },
      {
        "type": "p",
        "text": "For a personal workspace, open Settings and Data controls and review Improve the model for everyone. Turning it off is separate from deleting chats: saved conversations remain in your history. Account type and available settings can differ, so follow the controls shown in your own workspace."
      },
      {
        "type": "h2",
        "text": "Check memories, files and reusable instructions"
      },
      {
        "type": "p",
        "text": "A conversation, saved memory, uploaded file and custom instruction are different things. If sensitive information was saved as a memory or reused in instructions, review those controls separately. Removing a chat does not by itself prove every copy or reference has been removed. Follow current official help for your account."
      },
      {
        "type": "h2",
        "text": "Use the official help for changing controls"
      },
      {
        "type": "p",
        "text": "The interface and retention policies can change. The source links below point to OpenAI’s deletion, data-control and retention guidance. If the material involves client data or regulated information, follow your organisation’s policy rather than relying on this general guide."
      },
      {
        "type": "h2",
        "text": "Check the result before using it"
      },
      {
        "type": "list",
        "items": [
          "Confirm you chose Delete rather than Archive.",
          "Review saved memories and reusable instructions separately.",
          "Treat training preferences and history deletion as different controls.",
          "Avoid uploading confidential data without permission."
        ]
      },
      {
        "type": "h2",
        "text": "Common questions"
      },
      {
        "type": "h3",
        "text": "Can I delete just one message?"
      },
      {
        "type": "p",
        "text": "Deleting a conversation removes the saved thread. The current interface may let you edit messages, but editing is not the same as erasing all stored versions."
      },
      {
        "type": "h3",
        "text": "Does turning off training remove old chats?"
      },
      {
        "type": "p",
        "text": "No. It changes a data-sharing setting; use the separate deletion controls to remove chats."
      },
      {
        "type": "related_prompts",
        "prompts": [
          {
            "title": "Document Summarisation Engine",
            "href": "/prompt/document-summarisation-engine-ai14",
            "description": "Summarise supplied documents and check the summary against the original."
          }
        ]
      }
    ],
    "takeaways": [
      "Confirm you chose Delete rather than Archive.",
      "Review saved memories and reusable instructions separately.",
      "Treat training preferences and history deletion as different controls.",
      "Avoid uploading confidential data without permission."
    ],
    "updated": "2026-11-03",
    "category": "Fundamentals",
    "emoji": "🔒",
    "readMinutes": 3
  }
];
