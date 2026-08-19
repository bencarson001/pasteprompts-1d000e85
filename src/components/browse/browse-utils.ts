import {
  Banknote,
  Bot,
  Briefcase,
  Gem,
  Image,
  Layers,
  PenTool,
  Play,
  Sparkles,
  Video,
  Zap,
  type LucideIcon,
} from "lucide-react";

export type PriceBand = "free" | "paid" | "all";

export const PRICE_LABELS: Record<PriceBand, string> = {
  free: "Free",
  paid: "Paid",
  all: "All prompts",
};

/** Build a guided-browse path. category requires model; model requires price. */
export function browsePath(price?: string, model?: string, category?: string): string {
  if (!price) return "/browse";
  const parts = ["browse", price];
  if (model) {
    parts.push(model);
    if (category) parts.push(category);
  }
  return "/" + parts.join("/");
}

// Lucide icons keyed by the icon name stored on each category row.
export const CATEGORY_ICONS: Record<string, LucideIcon> = {
  banknote: Banknote,
  play: Play,
  briefcase: Briefcase,
  "pen-tool": PenTool,
  zap: Zap,
  sparkles: Sparkles,
};

export function categoryIcon(icon?: string | null): LucideIcon {
  return (icon && CATEGORY_ICONS[icon]) || Sparkles;
}

// Lucide icon per AI platform/model.
export const MODEL_ICONS: Record<string, LucideIcon> = {
  chatgpt: Bot,
  claude: Sparkles,
  gemini: Gem,
  midjourney: Image,
  dalle: Image,
  sora: Video,
  other: Layers,
};

export function modelIcon(model: string): LucideIcon {
  return MODEL_ICONS[model] || Layers;
}
