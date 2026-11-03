import type { Guide } from "./types";

export const IMAGE_GENERATION_GUIDES: Guide[] = [
  {
    "slug": "midjourney-v6-prompt-formula-guide",
    "title": "Midjourney Prompts: Subject, Lighting and Composition",
    "description": "Write clearer Midjourney image prompts with subject, setting, lighting and composition. Check version-specific parameters and review generated images for errors.",
    "intro": "Describe the visible scene and the result you need. This guide keeps its v6-era URL, but parameters depend on your selected Midjourney version and should be checked before use.",
    "blocks": [
      {
        "type": "callout",
        "title": "Short answer",
        "text": "Describe the visible scene and the result you need. This guide keeps its v6-era URL, but parameters depend on your selected Midjourney version and should be checked before use.",
        "variant": "info"
      },
      {
        "type": "h2",
        "text": "Describe what must be visible"
      },
      {
        "type": "p",
        "text": "Start with the subject and action, then add the setting and relationship between objects. “A ceramic mug beside a folded linen napkin on a kitchen table” is easier to assess than a string of praise such as “masterpiece, stunning, perfect”. State whether the image is an illustration, concept or photograph-style scene."
      },
      {
        "type": "h2",
        "text": "Direct composition and light"
      },
      {
        "type": "p",
        "text": "Specify viewpoint, framing, background and light direction. Lens language can suggest a visual effect but does not simulate a real camera reliably. Leave room for a headline if the image will be part of a layout. Avoid asking for several incompatible lighting conditions."
      },
      {
        "type": "h2",
        "text": "Check parameters for the chosen version"
      },
      {
        "type": "p",
        "text": "Aspect ratio, stylisation, reference images and raw-mode controls may be available, but syntax and supported combinations change. Use current Midjourney documentation and the controls in your interface. Do not assume flags from v6 work unchanged on another version."
      },
      {
        "type": "h2",
        "text": "Inspect details and usage rights"
      },
      {
        "type": "p",
        "text": "Generated text, hands, reflections, product geometry and repeated objects can be wrong. Add critical typography in a design tool if accuracy matters. Check the service’s current terms and rights for any reference images. A generated product scene is not evidence of a real product shoot."
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
        "text": "A photograph-style image of [SUBJECT] in [SETTING].\nComposition: [VIEWPOINT AND FRAMING].\nLighting: [DIRECTION AND SOFTNESS].\nMaterials and colours: [CONFIRMED DETAILS].\nBackground: [WHAT TO INCLUDE]. Leave [AREA] uncluttered for later text.\nUse only parameters supported by my selected model version."
      },
      {
        "type": "h2",
        "text": "Check the result before using it"
      },
      {
        "type": "list",
        "items": [
          "Check supported settings in the current interface.",
          "Inspect text, anatomy and product geometry.",
          "Use reference images only with permission.",
          "Label concepts so they cannot be mistaken for documentary photographs."
        ]
      },
      {
        "type": "h2",
        "text": "Common questions"
      },
      {
        "type": "h3",
        "text": "Does naming a camera guarantee realism?"
      },
      {
        "type": "p",
        "text": "No. Camera and lens terms suggest a look; inspect whether the resulting perspective and depth of field fit your scene."
      },
      {
        "type": "h3",
        "text": "Can I rely on generated lettering?"
      },
      {
        "type": "p",
        "text": "Not for critical spelling, labels or legal wording. Review it closely or add text separately."
      },
      {
        "type": "related_prompts",
        "prompts": [
          {
            "title": "Midjourney Image Prompt Refiner",
            "href": "/prompt/midjourney-image-prompt-refiner-ai4",
            "description": "Refine a scene brief for Midjourney; verify suggested settings against your model version."
          },
          {
            "title": "Midjourney Style Reference Pack",
            "href": "/prompt/midjourney-style-reference-pack-ai5",
            "description": "Build a reusable visual brief and review consistency across actual generations."
          }
        ]
      }
    ],
    "takeaways": [
      "Check supported settings in the current interface.",
      "Inspect text, anatomy and product geometry.",
      "Use reference images only with permission.",
      "Label concepts so they cannot be mistaken for documentary photographs."
    ],
    "updated": "2026-11-03",
    "category": "Image Generation",
    "emoji": "🎨",
    "readMinutes": 3
  },
  {
    "slug": "flux-ai-image-prompting-mastery",
    "title": "Flux Image Prompts: Products, Portraits and Text",
    "description": "Write practical Flux prompts for product images, portraits and visual concepts. Learn how to describe composition and check anatomy, lettering and model licences.",
    "intro": "Give Flux a specific scene, visible materials and clear composition. Different Flux models and hosting services expose different controls; no prompt can guarantee accurate text, anatomy or product detail.",
    "blocks": [
      {
        "type": "callout",
        "title": "Short answer",
        "text": "Give Flux a specific scene, visible materials and clear composition. Different Flux models and hosting services expose different controls; no prompt can guarantee accurate text, anatomy or product detail.",
        "variant": "info"
      },
      {
        "type": "h2",
        "text": "Write a scene rather than a list of compliments"
      },
      {
        "type": "p",
        "text": "Name the subject, location, action and visual treatment. Describe which objects sit in front of or behind others. Keep the brief focused: extra adjectives do not compensate for conflicting instructions or missing product details."
      },
      {
        "type": "h2",
        "text": "Protect the details that matter"
      },
      {
        "type": "p",
        "text": "For a product image, supply shape, material, colour and reference material you are authorised to use. For a portrait, specify pose, framing and lighting rather than promising anatomically correct results. Check fingers, jewellery, edges, shadows and reflections after generation."
      },
      {
        "type": "h2",
        "text": "Handle text and settings carefully"
      },
      {
        "type": "p",
        "text": "Put desired wording in quotes if the tool supports it, then inspect every character. Critical labels and logos are often better added afterwards. Guidance, steps and negative-prompt support vary across Flux variants and providers; use their documentation rather than a universal settings table."
      },
      {
        "type": "h2",
        "text": "Check licensing before commercial use"
      },
      {
        "type": "p",
        "text": "Flux is a family of models, not one licence. Weight licences, hosted-service terms and output-use conditions can differ. Confirm the terms for the exact model and service. Do not describe all variants as unrestricted open-source commercial tools."
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
        "text": "A product photograph-style image of [PRODUCT] on [SURFACE].\nPreserve these supplied details: [SHAPE, MATERIALS, COLOUR].\nCamera view: [ANGLE]. Lighting: [DIRECTION AND QUALITY].\nBackground: [SETTING], with no unrelated objects.\nIf text is needed, it reads “[WORDING]”; I will verify or replace it before publication.\nReference material: [AUTHORISED REFERENCE]."
      },
      {
        "type": "h2",
        "text": "Check the result before using it"
      },
      {
        "type": "list",
        "items": [
          "Inspect anatomy, text, edges and reflections.",
          "Check exact model and provider settings.",
          "Confirm licence and reference-image rights.",
          "Do not present generated scenes as proof of product performance."
        ]
      },
      {
        "type": "h2",
        "text": "Common questions"
      },
      {
        "type": "h3",
        "text": "Are negative prompts supported?"
      },
      {
        "type": "p",
        "text": "That depends on the model and interface. Check the service rather than assuming all Flux variants handle them the same way."
      },
      {
        "type": "h3",
        "text": "Will Flux spell every label correctly?"
      },
      {
        "type": "p",
        "text": "No. Verify lettering and add critical text separately when accuracy matters."
      },
      {
        "type": "related_prompts",
        "prompts": [
          {
            "title": "Photorealistic Product Hero",
            "href": "/prompt/photorealistic-product-hero-flux-pp41",
            "description": "Plan a product hero shot from the product details you supply."
          },
          {
            "title": "Premium Editorial Portrait",
            "href": "/prompt/premium-editorial-portrait-flux-pp42",
            "description": "Set a portrait brief with pose, lighting and texture requirements."
          },
          {
            "title": "Clean E-Commerce Product Set",
            "href": "/prompt/clean-e-commerce-product-set-flux-pp47",
            "description": "Prepare a consistent set of product-view instructions and inspect the generated geometry."
          }
        ]
      }
    ],
    "takeaways": [
      "Inspect anatomy, text, edges and reflections.",
      "Check exact model and provider settings.",
      "Confirm licence and reference-image rights.",
      "Do not present generated scenes as proof of product performance."
    ],
    "updated": "2026-11-03",
    "category": "Image Generation",
    "emoji": "⚡",
    "readMinutes": 3
  }
];
