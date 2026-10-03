import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

export const getRouter = () => {
  // ported from src/App.tsx — preserve the app's React Query defaults
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: 1, refetchOnWindowFocus: false } },
  });

  const router = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
    // Plain string query params (react-router semantics): the compat shim reads
    // raw URLSearchParams, so values like "true" must not be JSON-quoted.
    parseSearch: (s: string) => Object.fromEntries(new URLSearchParams(s)),
    stringifySearch: (obj: Record<string, unknown>) => {
      const p = new URLSearchParams();
      for (const [k, v] of Object.entries(obj)) {
        if (v === undefined || v === null) continue;
        p.set(k, typeof v === "string" ? v : JSON.stringify(v));
      }
      const out = p.toString();
      return out ? `?${out}` : "";
    },
  });

  return router;
};
