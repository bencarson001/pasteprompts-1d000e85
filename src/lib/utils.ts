import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Returns a safe http(s) URL for use in an href, or undefined if the value
 * is missing or uses an unsafe scheme (e.g. javascript:, data:). Prevents
 * stored-XSS via user-supplied links.
 */
export function safeExternalUrl(value?: string | null): string | undefined {
  if (!value) return undefined;
  const trimmed = value.trim();
  return /^https?:\/\//i.test(trimmed) ? trimmed : undefined;
}

