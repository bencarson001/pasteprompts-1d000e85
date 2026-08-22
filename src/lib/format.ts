/** Format pence as GBP, e.g. 499 -> "£4.99", 0 -> "Free" */
export function formatPrice(pence: number, isFree?: boolean): string {
  if (isFree || pence === 0) return "Free";
  return new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(pence / 100);
}

export function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return `${n}`;
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80);
}

export const MODEL_LABELS: Record<string, string> = {
  chatgpt: "ChatGPT",
  claude: "Claude",
  gemini: "Gemini",
  midjourney: "Midjourney",
  dalle: "DALL·E",
  sora: "Sora",
  other: "Other",
};

export const MODELS = ["chatgpt", "claude", "gemini", "midjourney", "dalle", "sora", "other"] as const;

// ---- Membership tiers ----
export type TierKey = "free" | "pro" | "platinum";

export interface TierInfo {
  key: TierKey;
  name: string;
  pricePounds: number;
  monthlyPriceId: string | null;
  yearlyPriceId: string | null;
  quota: number;
  earningPence: number;
  feePence: number;
  blurb: string;
}

// All single prompts sell for 25p. The creator's tier sets their cut.
export const TIERS: Record<TierKey, TierInfo> = {
  free: {
    key: "free", name: "Free", pricePounds: 0, monthlyPriceId: null, yearlyPriceId: null,
    quota: 15, earningPence: 15, feePence: 10,
    blurb: "Start selling for free.",
  },
  pro: {
    key: "pro", name: "Pro", pricePounds: 9.99, monthlyPriceId: "pro_monthly", yearlyPriceId: "pro_yearly",
    quota: 50, earningPence: 18, feePence: 7,
    blurb: "Upload more, earn more.",
  },
  platinum: {
    key: "platinum", name: "Platinum", pricePounds: 15.99, monthlyPriceId: "platinum_monthly", yearlyPriceId: "platinum_yearly",
    quota: 200, earningPence: 22, feePence: 3,
    blurb: "Maximum reach and earnings.",
  },
};

export const SINGLE_PRICE_PENCE = 25;

export function timeAgo(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const seconds = Math.floor((Date.now() - d.getTime()) / 1000);
  const intervals: [number, string][] = [
    [31536000, "year"],
    [2592000, "month"],
    [604800, "week"],
    [86400, "day"],
    [3600, "hour"],
    [60, "minute"],
  ];
  for (const [secs, label] of intervals) {
    const count = Math.floor(seconds / secs);
    if (count >= 1) return `${count} ${label}${count > 1 ? "s" : ""} ago`;
  }
  return "just now";
}
