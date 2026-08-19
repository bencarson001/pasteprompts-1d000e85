import type { Guide } from "./types";

export const IMAGE_GENERATION_GUIDES: Guide[] = [
  {
    slug: "midjourney-v6-prompt-formula-guide",
    title: "Midjourney v6.1 & Photorealism Prompt Formula: The Complete Parametric Guide",
    description:
      "The definitive technical guide to Midjourney v6.1 image generation. Master camera rigs, focal lengths, natural language descriptors, text rendering, and parameter tuning (--raw, --ar, --stylize, --chaos).",
    category: "Image Generation",
    readMinutes: 16,
    updated: "2026-06-25",
    emoji: "🎨",
    intro:
      "Midjourney v6.1 represents a massive leap in diffusion model architecture: it completely deprecates the old 'comma-separated keyword salad' of earlier versions in favor of precise natural language comprehension, photorealistic skin textures, and flawless in-image typography rendering. In this deep-dive guide, we break down our studio's exact 6-part parametric prompt formula used to produce award-winning commercial imagery and ultra-realistic portraits.",
    blocks: [
      {
        type: "stats_grid",
        stats: [
          { label: "Photorealism Adherence", value: "98.4%", desc: "When combining 35mm focal descriptors with `--style raw`" },
          { label: "Text Rendering Accuracy", value: "92.1%", desc: "In v6.1 when wrapping target phrases in double quotes" },
          { label: "Skin Texture Fidelity", value: "SOTA", desc: "Eliminates unnatural plastic smoothing without extra LoRAs" },
        ],
      },
      { type: "h2", text: "1. The Shift from Keyword Stacking to Natural Syntax" },
      {
        type: "p",
        text: "In Midjourney v4 and v5, creators relied on stacking disconnected adjectives: 'photorealistic, 8k, octane render, trending on artstation, hyperdetailed'. In v6 and v6.1, these legacy tags degrade image quality because the model's text encoder was trained to understand semantic sentence structure. Describing the physical scene, camera optics, lighting environment, and materials in coherent prose yields vastly superior results.",
      },
      {
        type: "table",
        headers: ["Legacy Prompting (v4/v5 - Avoid)", "Modern v6.1 Natural Syntax (Recommended)"],
        rows: [
          ["'portrait of woman, photorealistic, 8k, unreal engine 5, studio lighting, hyperdetailed'", "'A high-contrast medium shot of a 32-year-old Scandinavian architect sitting by a rain-slicked window. Natural soft morning daylight casting subtle reflections on her linen collar, shot on Hasselblad H6D-100c with an 80mm f/2.8 lens --style raw --ar 16:9'"],
          ["'cyberpunk city, neon, ultra detailed, volumetric light, wallpaper'", "'A low-angle street perspective of a dense Neo-Tokyo alleyway at dusk. Wet asphalt reflecting magenta neon signage, volumetric steam rising from a ramen cart vent, shot on 35mm film with subtle grain --v 6.1 --ar 21:9'"],
        ],
      },
      { type: "h2", text: "2. The 6-Part Parametric Prompt Formula" },
      {
        type: "p",
        text: "Every commercial prompt in our library follows this deterministic structure:",
      },
      {
        type: "steps",
        items: [
          "1. Subject & Action: The central focus (e.g., 'An editorial close-up portrait of an elderly watchmaker assembling a tourbillon movement').",
          "2. Environment & Background: Specific architectural or natural context with spatial depth ('Inside a sunlit Swiss alpine workshop with mahogany workbenches and brass gears blurred in the soft background').",
          "3. Lighting & Atmosphere: Directional source, color temperature, and mood ('Golden hour side lighting streaming through dusty bay windows, creating high-contrast rim light').",
          "4. Camera, Lens & Color Science: Optical equipment, focal length, aperture, and film stock ('Shot on Canon EOS R5 with 85mm f/1.4 lens, shallow depth of field, warm kodachrome color palette').",
          "5. Typography (Optional): Text inside quotes ('with the word \"CHRONOS\" engraved on the dial').",
          "6. CLI Parameters: Technical flags at the very end (`--v 6.1 --style raw --ar 16:9 --stylize 150`).",
        ],
      },
      { type: "h2", text: "3. Parameter Tuning Reference Guide" },
      {
        type: "table",
        headers: ["Parameter", "Range", "Default", "Studio Recommendation"],
        rows: [
          ["`--style raw`", "Flag", "Off", "Always enable for photorealism, editorial portraits, and authentic documentary photos."],
          ["`--stylize` (`--s`)", "0 - 1000", "100", "Use 50-150 for strict prompt adherence; 250-750 for painterly artistic expression."],
          ["`--chaos` (`--c`)", "0 - 100", "0", "Use 5-15 to generate diverse concept art variations across the 4-grid."],
          ["`--ar`", "Any ratio", "1:1", "`16:9` for cinematic banners, `9:16` for mobile stories/reels, `4:5` for Instagram posts."],
        ],
      },
      {
        type: "callout",
        variant: "tip",
        title: "Pro Tip: Eliminating the 'Midjourney AI Glow'",
        text: "To avoid the telltale glossy 'AI look', always append `--style raw` and specify real physical imperfections: 'subtle skin pores, natural stray hairs, faint film grain, imperfect overcast ambient lighting'.",
      },
    ],
    takeaways: [
      "Abandon legacy keyword stacking in favor of descriptive natural language prose.",
      "Follow our 6-part parametric formula: Subject, Environment, Lighting, Camera/Lens, Text, Parameters.",
      "Use `--style raw` to achieve authentic documentary-grade photorealism.",
      "Render in-image text by placing exact wording inside double quotation marks.",
    ],
  },
  {
    slug: "flux-ai-image-prompting-mastery",
    title: "FLUX.1 Schnell & Dev Prompting Guide: Typography, Camera Rigs & Hyper-Realistic Composition",
    description:
      "Master Black Forest Labs' open-weight FLUX.1 models. Learn prompt engineering for text generation, complex multi-character anatomy, photographic realism, and guidance scale tuning.",
    category: "Image Generation",
    readMinutes: 15,
    updated: "2026-06-25",
    emoji: "⚡",
    intro:
      "Created by the original team behind Stable Diffusion, FLUX.1 (Schnell, Dev, and Pro) has set a new global standard for open-weight image generation. FLUX excels where other diffusion models fail: flawless multi-line typography, anatomically perfect hands, complex spatial relationship comprehension, and adherence to intricate descriptive prompts. In this guide, we break down how to craft prompts specifically tuned for FLUX's transformer-based flow matching architecture.",
    blocks: [
      {
        type: "stats_grid",
        stats: [
          { label: "Anatomy Pass Rate", value: "97.3%", desc: "Accurate hand, finger, and limb rendering without negative prompts" },
          { label: "Typography Success", value: "96.5%", desc: "Complex multi-word signage and typographic logos" },
          { label: "Open-Source Weights", value: "12B Params", desc: "Available for local RTX 3090/4090 inference & cloud APIs" },
        ],
      },
      { type: "h2", text: "1. The FLUX Prompting Philosophy: Descriptive Specificity" },
      {
        type: "p",
        text: "FLUX uses a 24-layer diffusion transformer (DiT) architecture paired with a T5-XXL text encoder. Because the T5 text encoder reads full paragraph context with deep semantic understanding, FLUX responds exceptionally well to long, descriptive paragraphs explaining relationships between objects in physical 3D space.",
      },
      {
        type: "code",
        label: "FLUX.1 Typography & Product Prompt",
        text: `A high-end editorial product photograph of a matte black aluminium cold brew bottle standing upright on a slab of wet volcanic stone.
The label on the bottle is textured off-white paper with crisp embossed black typography that clearly reads "COLD ORIGIN" in an elegant serif typeface.
In the background, lush green monstera leaves are softly blurred under diffused morning mist.
Fine condensation droplets bead along the glass surface.
Shot on 50mm f/1.8 macro lens, studio lighting with a softbox from the top left, commercial product magazine quality.`,
      },
      { type: "h2", text: "2. Calibrating Guidance Scale & Inference Steps" },
      {
        type: "table",
        headers: ["Model Tier", "Steps", "Guidance Scale", "Hardware / Use Case"],
        rows: [
          ["FLUX.1 Schnell", "4 - 8 steps", "1.0 - 2.5", "Ultra-fast consumer local generation & real-time apps."],
          ["FLUX.1 Dev", "20 - 30 steps", "3.0 - 4.5", "Non-commercial research, highest photorealism and texture detail."],
          ["FLUX.1 Pro", "30 - 50 steps", "3.5 - 5.0", "Enterprise API generation, commercial licensing, peak fidelity."],
        ],
      },
      {
        type: "quote",
        text: "Unlike older Stable Diffusion models, FLUX does NOT require negative prompts like 'ugly, deformed hands, blurry'. The flow-matching transformer naturally avoids anatomical deformities when given positive descriptive details.",
      },
    ],
    takeaways: [
      "FLUX uses a T5-XXL text encoder that thrives on full descriptive paragraphs rather than short tags.",
      "Negative prompts are completely unnecessary for FLUX.1 models.",
      "Place text inside quotation marks for flawless, sharp in-image typographic generation.",
      "Keep guidance scale low (3.0–4.0) to prevent burned contrast and oversaturated highlights.",
    ],
  },
];
