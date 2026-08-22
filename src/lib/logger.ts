import { supabase } from "@/integrations/supabase/client";

export type LogLevel = "fatal" | "error" | "warn" | "info" | "debug";
export type LogScope = "payment" | "admin" | "auth" | "social" | "ai" | "system" | "client";

export interface LogEntry {
  id: string;
  level: LogLevel;
  message: string;
  scope: LogScope;
  details?: Record<string, unknown> | string | null;
  user_id?: string | null;
  path?: string;
  stack?: string;
  created_at: string;
}

const STORAGE_KEY = "paste_prompts_local_errors_v1";

// In-memory fallback buffer for instant preview & offline visibility
const memoryBuffer: LogEntry[] = [];

/** Reads stored local logs from localStorage */
export function getStoredLocalLogs(): LogEntry[] {
  if (typeof window === "undefined") return memoryBuffer;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? (JSON.parse(raw) as LogEntry[]) : [];
    const map = new Map<string, LogEntry>();
    for (const item of [...memoryBuffer, ...parsed]) {
      if (item && item.id) map.set(item.id, item);
    }
    return Array.from(map.values()).sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  } catch {
    return memoryBuffer;
  }
}

/** Core centralized error logging engine */
export async function logError(
  level: LogLevel,
  message: string,
  options?: {
    scope?: LogScope;
    details?: unknown;
    error?: Error | unknown;
    userId?: string;
  }
): Promise<LogEntry> {
  const scope: LogScope = options?.scope ?? "system";
  const errObj = options?.error instanceof Error ? options.error : null;
  const stack = errObj?.stack || (typeof options?.error === "string" ? options.error : undefined);
  const path = typeof window !== "undefined" ? window.location.pathname : "";

  const detailObj = {
    scope,
    path,
    stack,
    details: options?.details || (errObj ? errObj.message : undefined),
    userAgent: typeof navigator !== "undefined" ? navigator.userAgent : "server",
    timestamp: new Date().toISOString(),
  };

  const formattedMsg = message.startsWith("[") ? message : `[${scope.toUpperCase()}] ${message}`;

  const entry: LogEntry = {
    id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    level,
    message: formattedMsg,
    scope,
    details: detailObj,
    path,
    stack,
    created_at: new Date().toISOString(),
  };

  // 1. Add to memory & local storage
  memoryBuffer.unshift(entry);
  if (memoryBuffer.length > 200) memoryBuffer.pop();

  try {
    if (typeof window !== "undefined") {
      const existing = getStoredLocalLogs();
      const updated = [entry, ...existing.filter((e) => e.id !== entry.id)].slice(0, 200);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    }
  } catch (e) {
    console.warn("Could not save to localStorage:", e);
  }

  // 2. Persist to Supabase database error_logs table
  try {
    const { data: auth } = await supabase.auth.getUser();
    await supabase.from("error_logs").insert({
      level,
      message: formattedMsg,
      user_id: options?.userId || auth.user?.id || null,
      details: detailObj as never,
    }).then(() => {}, (dbErr) => {
      console.warn("Supabase error_logs insert notice:", dbErr?.message);
    });
  } catch (err) {
    console.warn("Database error logging warning:", err);
  }

  // 3. Log to browser console
  console.error(`🚨 [LOG:${level.toUpperCase()}][${scope.toUpperCase()}] ${message}`, options?.details || "", options?.error || "");

  // 4. Dispatch event for real-time UI notification
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("app:error_logged", { detail: entry }));
  }

  return entry;
}

/** Convenience shortcut for Payment System errors */
export function logPaymentError(message: string, error?: Error | unknown, details?: unknown) {
  return logError("error", message, { scope: "payment", error, details });
}

/** Convenience shortcut for Admin System errors */
export function logAdminError(message: string, error?: Error | unknown, details?: unknown) {
  return logError("error", message, { scope: "admin", error, details });
}

/** Clear local logs */
export function clearLocalLogs() {
  memoryBuffer.length = 0;
  if (typeof window !== "undefined") {
    localStorage.removeItem(STORAGE_KEY);
  }
}
