// Validates a client-supplied returnUrl to prevent open-redirect attacks.
// Only our own production domains and Lovable preview/dev origins are allowed.
// Returns the URL string if valid, otherwise null.
export function safeReturnUrl(returnUrl: unknown): string | null {
  if (typeof returnUrl !== "string" || returnUrl.length === 0 || returnUrl.length > 2048) {
    return null;
  }
  let url: URL;
  try {
    url = new URL(returnUrl);
  } catch {
    return null;
  }

  // Allow http only for localhost dev; everything else must be https.
  const isLocalhost = url.hostname === "localhost" || url.hostname === "127.0.0.1";
  if (url.protocol !== "https:" && !(isLocalhost && url.protocol === "http:")) {
    return null;
  }

  const host = url.hostname.toLowerCase();
  const allowed =
    host === "pasteprompts.co.uk" ||
    host === "www.pasteprompts.co.uk" ||
    host.endsWith(".lovable.app") ||
    host.endsWith(".lovableproject.com") ||
    isLocalhost;

  return allowed ? url.toString() : null;
}
