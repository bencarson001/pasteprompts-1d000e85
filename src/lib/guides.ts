/**
 * Practical editorial guides for the Paste Prompts Learn hub.
 * Examples are illustrative unless a recorded test is explicitly documented.
 * Guide metadata, sitemap entries and page rendering share this inventory.
 */

import { FUNDAMENTAL_GUIDES } from "./guides/fundamentals";
import { MODELS_AND_REASONING_GUIDES } from "./guides/modelsAndReasoning";
import { IMAGE_GENERATION_GUIDES } from "./guides/imageGeneration";
import { BUSINESS_AND_SEO_GUIDES } from "./guides/businessAndSeo";
import { TECH_AND_SECURITY_GUIDES } from "./guides/techAndSecurity";
import type { Guide, GuideBlock } from "./guides/types";

export type { Guide, GuideBlock };

export const GUIDES: Guide[] = [
  ...FUNDAMENTAL_GUIDES,
  ...MODELS_AND_REASONING_GUIDES,
  ...IMAGE_GENERATION_GUIDES,
  ...BUSINESS_AND_SEO_GUIDES,
  ...TECH_AND_SECURITY_GUIDES,
];

export const GUIDE_CATEGORIES = Array.from(new Set(GUIDES.map((g) => g.category)));

export function getGuide(slug: string): Guide | undefined {
  return GUIDES.find((g) => g.slug === slug);
}

export function relatedGuides(slug: string, limit = 3): Guide[] {
  const current = getGuide(slug);
  if (!current) return GUIDES.slice(0, limit);
  const sameCat = GUIDES.filter((g) => g.slug !== slug && g.category === current.category);
  const rest = GUIDES.filter((g) => g.slug !== slug && g.category !== current.category);
  return [...sameCat, ...rest].slice(0, limit);
}
