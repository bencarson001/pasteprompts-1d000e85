/**
 * Self-healing for blank/black screens caused by stale service-worker caches.
 *
 * If a dynamic import fails (a hashed chunk that no longer exists after a
 * deploy) the React tree never mounts and the user sees the dark page
 * background with nothing on it. We purge every cache, unregister the service
 * worker and reload exactly once per session so the browser fetches a fresh
 * build instead of sitting on a black screen.
 */
const RELOAD_FLAG = "pp-recovered-at";

function looksLikeChunkFailure(message: string) {
  const m = message.toLowerCase();
  return (
    m.includes("failed to fetch dynamically imported module") ||
    m.includes("error loading dynamically imported module") ||
    m.includes("importing a module script failed") ||
    m.includes("unexpected token '<'")
  );
}

async function purgeAndReload() {
  try {
    const last = Number(sessionStorage.getItem(RELOAD_FLAG) ?? 0);
    // Only self-heal once per session to avoid any reload loop.
    if (last) return;
    sessionStorage.setItem(RELOAD_FLAG, String(Date.now()));
  } catch {
    return;
  }

  try {
    if ("caches" in window) {
      const keys = await caches.keys();
      await Promise.all(keys.map((k) => caches.delete(k)));
    }
    if ("serviceWorker" in navigator) {
      const regs = await navigator.serviceWorker.getRegistrations();
      await Promise.all(regs.map((r) => r.unregister()));
    }
  } catch {
    /* best effort */
  }

  window.location.reload();
}

import { logError } from "@/lib/logger";

export function installAppRecovery() {
  window.addEventListener("error", (event) => {
    const errObj = event.error as Error | undefined;
    const msg = event.message || errObj?.message || "Uncaught window error";
    if (looksLikeChunkFailure(String(msg))) {
      void purgeAndReload();
    } else {
      void logError("error", `Uncaught Error: ${msg}`, { scope: "client", error: errObj || event.message });
    }
  });

  window.addEventListener("unhandledrejection", (event) => {
    const reason = event.reason as { message?: string; stack?: string } | string | undefined;
    const msg = typeof reason === "string" ? reason : (reason?.message ?? "Unhandled promise rejection");
    if (looksLikeChunkFailure(msg)) {
      void purgeAndReload();
    } else {
      void logError("error", `Unhandled Rejection: ${msg}`, { scope: "client", error: reason });
    }
  });
}
