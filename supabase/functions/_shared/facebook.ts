/**
 * Shared Facebook publishing helpers.
 *
 * publishToFacebook() posts to the connected Page and then shares the same
 * content to a random selection of active groups from public.fb_groups
 * (9 by default). Group posting uses the same Page access token; groups that
 * reject the post are recorded with their error and never block the Page post.
 */

/** Graph API version. Override with FACEBOOK_GRAPH_VERSION (e.g. "v23.0"). */
export const GRAPH_VERSION = Deno.env.get("FACEBOOK_GRAPH_VERSION") ?? "v23.0";
const GRAPH = `https://graph.facebook.com/${GRAPH_VERSION}`;

/**
 * Resolve the Page credentials: the admin-stored long-lived token in
 * public.fb_credentials wins; the FACEBOOK_* secrets are the fallback.
 */
export async function getPageCredentials(
  supabase: Client,
): Promise<{ pageId: string | null; token: string | null; source: "db" | "env" | "none" }> {
  try {
    const { data } = await supabase
      .from("fb_credentials")
      .select("page_id, page_access_token, expires_at")
      .eq("id", 1)
      .maybeSingle();
    const row = data as { page_id?: string; page_access_token?: string; expires_at?: string } | null;
    const notExpired = !row?.expires_at || new Date(row.expires_at).getTime() > Date.now();
    if (row?.page_id && row?.page_access_token && notExpired) {
      return { pageId: row.page_id, token: row.page_access_token, source: "db" };
    }
  } catch { /* fall through to env */ }
  const pageId = Deno.env.get("FACEBOOK_PAGE_ID") ?? null;
  const token = Deno.env.get("FACEBOOK_PAGE_ACCESS_TOKEN") ?? null;
  return { pageId, token, source: pageId && token ? "env" : "none" };
}

/** Exchange a short-lived user token for a ~60-day long-lived user token. */
export async function exchangeForLongLivedUserToken(
  shortToken: string,
  appId: string,
  appSecret: string,
): Promise<{ token: string; expiresAt: string | null }> {
  const url = `${GRAPH}/oauth/access_token?${new URLSearchParams({
    grant_type: "fb_exchange_token",
    client_id: appId,
    client_secret: appSecret,
    fb_exchange_token: shortToken,
  })}`;
  const res = await fetch(url);
  const body = await res.json().catch(() => ({}));
  if (!res.ok || !body?.access_token) {
    throw new Error(`Long-lived exchange failed: ${JSON.stringify(body).slice(0, 300)}`);
  }
  const expiresIn = Number(body.expires_in ?? 0);
  return {
    token: body.access_token as string,
    expiresAt: expiresIn ? new Date(Date.now() + expiresIn * 1000).toISOString() : null,
  };
}

/**
 * Fetch the Page access token derived from a long-lived *user* token.
 * Page tokens minted this way do not expire while the user token is valid.
 */
export async function getPageTokenFromUserToken(
  userToken: string,
  pageId?: string | null,
): Promise<{ pageId: string; pageName: string; token: string }> {
  const res = await fetch(`${GRAPH}/me/accounts?fields=id,name,access_token&access_token=${encodeURIComponent(userToken)}`);
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(`Could not list Pages: ${JSON.stringify(body).slice(0, 300)}`);
  const pages = (body?.data ?? []) as Array<{ id: string; name: string; access_token: string }>;
  if (!pages.length) throw new Error("This account manages no Pages (or the token lacks pages_show_list).");
  const page = pageId ? pages.find((p) => p.id === pageId) : pages[0];
  if (!page) throw new Error(`Page ${pageId} not found on this account.`);
  return { pageId: page.id, pageName: page.name, token: page.access_token };
}

/** Inspect a token: validity, expiry, scopes. */
export async function debugToken(
  token: string,
  appId: string,
  appSecret: string,
): Promise<{ valid: boolean; expires_at: number; scopes: string[]; type: string; error?: string }> {
  const res = await fetch(
    `${GRAPH}/debug_token?input_token=${encodeURIComponent(token)}&access_token=${encodeURIComponent(`${appId}|${appSecret}`)}`,
  );
  const body = await res.json().catch(() => ({}));
  const d = body?.data ?? {};
  return {
    valid: !!d.is_valid,
    expires_at: Number(d.expires_at ?? 0),
    scopes: (d.scopes ?? []) as string[],
    type: String(d.type ?? "unknown"),
    error: d?.error?.message,
  };
}

export interface FacebookPostResult {
  pageOk: boolean;
  fbPostId: string | null;
  error: string | null;
  groups: Array<{ group_id: string; ok: boolean; post_id?: string; error?: string }>;
}

// Generic Minimal Supabase Client interface for Facebook helpers
type Client = {
  from: (t: string) => {
    select: (s: string, opts?: unknown) => unknown;
    update: (data: unknown) => { eq: (k: string, v: unknown) => Promise<unknown> };
  };
};

async function postTo(
  targetId: string,
  message: string,
  imageUrl: string | null,
  token: string,
): Promise<{ ok: boolean; id: string | null; error: string | null }> {
  const useImage = !!imageUrl;
  const endpoint = useImage ? `${GRAPH}/${targetId}/photos` : `${GRAPH}/${targetId}/feed`;
  const payload: Record<string, unknown> = useImage
    ? { url: imageUrl, caption: message, access_token: token }
    : { message, access_token: token };
  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) return { ok: false, id: null, error: `FB ${res.status}: ${JSON.stringify(body).slice(0, 300)}` };
    return { ok: true, id: (body?.post_id as string) ?? (body?.id as string) ?? null, error: null };
  } catch (e) {
    return { ok: false, id: null, error: (e as Error).message };
  }
}

/** Share to `count` randomly chosen active groups. Never throws. */
export async function shareToRandomGroups(
  supabase: Client,
  message: string,
  imageUrl: string | null,
  token: string,
  count = 9,
): Promise<FacebookPostResult["groups"]> {
  const { data: groups } = await supabase
    .from("fb_groups")
    .select("id, group_id")
    .eq("active", true)
    .limit(200);
  const list = (groups ?? []) as Array<{ id: string; group_id: string }>;
  if (!list.length) return [];

  // Fisher-Yates shuffle, then take up to `count`.
  for (let i = list.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [list[i], list[j]] = [list[j], list[i]];
  }
  const picked = list.slice(0, count);

  const results: FacebookPostResult["groups"] = [];
  for (const g of picked) {
    const r = await postTo(g.group_id, message, imageUrl, token);
    results.push({ group_id: g.group_id, ok: r.ok, post_id: r.id ?? undefined, error: r.error ?? undefined });
    await supabase
      .from("fb_groups")
      .update({ last_posted_at: r.ok ? new Date().toISOString() : undefined, last_error: r.error })
      .eq("id", g.id);
  }
  return results;
}

/**
 * Remove any "[Image: ... ]" brief from post copy so only the human-facing
 * text is published. Handles nested-free brackets and tidies leftover space.
 */
export function stripImageBrief(text: string): string {
  return text
    .replace(/\[\s*image\s*:[^\]]*\]/gi, " ")
    .replace(/[ \t]{2,}/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .split("\n")
    .map((l) => l.trim())
    .join("\n")
    .trim();
}

/** Post to the Page, then share to 9 random active groups (if enabled). */
export async function publishToFacebook(
  supabase: Client,
  rawMessage: string,
  imageUrl: string | null,
  opts: { groupCount?: number; shareToGroups?: boolean } = {},
): Promise<FacebookPostResult> {
  const message = stripImageBrief(rawMessage);
  const { pageId, token } = await getPageCredentials(supabase);
  if (!pageId || !token) {
    return {
      pageOk: false,
      fbPostId: null,
      error: "dry-run: no Facebook Page connection (connect a long-lived token in the admin hub, or set FACEBOOK_PAGE_ID / FACEBOOK_PAGE_ACCESS_TOKEN)",
      groups: [],
    };
  }

  const page = await postTo(pageId, message, imageUrl, token);
  const shouldShareGroups = opts.shareToGroups !== false && (opts.groupCount ?? 9) > 0;
  const groups = page.ok && shouldShareGroups
    ? await shareToRandomGroups(supabase, message, imageUrl, token, opts.groupCount ?? 9)
    : [];
  return { pageOk: page.ok, fbPostId: page.id, error: page.error, groups };
}
