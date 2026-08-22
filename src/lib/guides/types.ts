export type GuideBlock =
  | { type: "p"; text: string }
  | { type: "h2"; text: string }
  | { type: "h3"; text: string }
  | { type: "list"; items: string[] }
  | { type: "steps"; items: string[] }
  | { type: "quote"; text: string }
  | { type: "code"; label?: string; text: string }
  | { type: "table"; headers: string[]; rows: string[][] }
  | { type: "callout"; title: string; text: string; variant?: "info" | "tip" | "warning" }
  | { type: "stats_grid"; stats: { label: string; value: string; desc: string }[] }
  | { type: "related_prompts"; prompts: { title: string; href: string; description: string }[] };

export interface Guide {
  slug: string;
  title: string;
  description: string;
  category: string;
  readMinutes: number;
  updated: string; // ISO date
  emoji: string;
  intro: string;
  blocks: GuideBlock[];
  takeaways: string[];
}
