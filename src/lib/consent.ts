/**
 * Visitor cookie choice. Analytics and advertising scripts must only load
 * after an explicit "accepted" choice; "essential" (or no choice) blocks them.
 */
export const CONSENT_KEY = "pp_cookie_consent";
export const CONSENT_VERSION = "2026-11-03";
const CHANGE_EVENT = "pp-consent-change";
const OPEN_EVENT = "pp-consent-open";

export type ConsentChoice = "accepted" | "essential";

export function getConsent(): ConsentChoice | null {
  try {
    const raw = localStorage.getItem(CONSENT_KEY);
    if (!raw) return null;
    if (raw === "accepted" || raw === "essential") return raw; // legacy value
    const parsed = JSON.parse(raw) as { choice?: string };
    return parsed.choice === "accepted" || parsed.choice === "essential" ? parsed.choice : null;
  } catch {
    return null;
  }
}

export function setConsent(choice: ConsentChoice) {
  try {
    localStorage.setItem(
      CONSENT_KEY,
      JSON.stringify({ choice, version: CONSENT_VERSION, decidedAt: new Date().toISOString() }),
    );
  } catch {
    /* storage blocked */
  }
  window.dispatchEvent(new CustomEvent(CHANGE_EVENT));
}

export function hasMarketingConsent() {
  return getConsent() === "accepted";
}

/** Fires for changes in this tab and in other open tabs. */
export function onConsentChange(cb: () => void) {
  const storage = (e: StorageEvent) => e.key === CONSENT_KEY && cb();
  window.addEventListener(CHANGE_EVENT, cb);
  window.addEventListener("storage", storage);
  return () => {
    window.removeEventListener(CHANGE_EVENT, cb);
    window.removeEventListener("storage", storage);
  };
}

export function openConsentSettings() {
  window.dispatchEvent(new CustomEvent(OPEN_EVENT));
}

export function onConsentOpen(cb: () => void) {
  window.addEventListener(OPEN_EVENT, cb);
  return () => window.removeEventListener(OPEN_EVENT, cb);
}

const GA_ID = "G-D0T32ZB520";
let gaLoaded = false;

/** Loads Google Analytics only when the visitor accepted all cookies. */
export function loadAnalyticsIfAllowed() {
  if (gaLoaded || !hasMarketingConsent()) return;
  gaLoaded = true;
  const w = window as unknown as { dataLayer: unknown[]; gtag: (...a: unknown[]) => void };
  w.dataLayer = w.dataLayer || [];
  w.gtag = function gtag() {
    // eslint-disable-next-line prefer-rest-params
    w.dataLayer.push(arguments);
  };
  w.gtag("js", new Date());
  w.gtag("config", GA_ID);
  const s = document.createElement("script");
  s.async = true;
  s.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
  document.head.appendChild(s);
}

/** Scripts already running cannot be unloaded, so a withdrawal reloads the page. */
export function wereTagsLoaded() {
  return gaLoaded || !!document.querySelector('script[src*="adsbygoogle.js"]');
}
