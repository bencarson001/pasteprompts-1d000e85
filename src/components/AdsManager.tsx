import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { ADSENSE_CLIENT, adsEnabled } from "@/lib/ads";

/**
 * Route-aware AdSense loader (allowlist strategy).
 *
 * Google's "Low value content" policy penalises ads shown on thin, empty or
 * utility pages (search results, sign-in, checkout, dashboards, category grids
 * that may be empty, programmatic landing pages, etc.). Rather than trying to
 * exclude every such route with a denylist, we take the safe inverse approach:
 * only ever inject the AdSense script on pages that we KNOW contain unique,
 * substantial, editorial content — currently the individual long-form guide
 * articles under /guides/:slug. These are the only pages that render an ad unit
 * anyway, so ads are guaranteed to appear exclusively alongside high-value
 * content. This keeps the rest of the site 100% ad-free for both users and the
 * AdSense crawler.
 */

/** Only these route patterns are allowed to load ads. */
function isAdAllowedRoute(path: string): boolean {
  // Individual guide articles: /guides/<slug> (but NOT the /guides hub listing).
  if (/^\/guides\/[^/]+$/.test(path)) return true;
  return false;
}

let injected = false;

export function AdsManager() {
  const { pathname } = useLocation();

  useEffect(() => {
    if (!adsEnabled() || injected) return;
    if (!isAdAllowedRoute(pathname)) return;
    const script = document.createElement("script");
    script.async = true;
    script.crossOrigin = "anonymous";
    script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`;
    document.head.appendChild(script);
    injected = true;
  }, [pathname]);

  return null;
}

export default AdsManager;
