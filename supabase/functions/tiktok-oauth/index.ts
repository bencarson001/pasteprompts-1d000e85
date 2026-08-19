import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { createClient } from "npm:@supabase/supabase-js@2";

/**
 * TikTok OAuth (Content Posting API) using the site's own TikTok app
 * credentials (TIKTOK_CLIENT_KEY / TIKTOK_CLIENT_SECRET).
 *
 * This grants the `video.publish` / `video.upload` scopes that the read-only
 * connector cannot, so the auto-pilot can post videos directly.
 *
 * Endpoints:
 *  - GET  ?code=...&state=...   -> OAuth redirect callback (no auth; verified by state)
 *  - POST { action: "auth-url" }    (admin) -> returns the TikTok authorize URL
 *  - POST { action: "status" }      (admin) -> returns connection status
 *  - POST { action: "disconnect" }  (admin) -> clears stored tokens
 *
 * Redirect URI to register in the TikTok developer portal:
 *   https://<project-ref>.supabase.co/functions/v1/tiktok-oauth
 */

const AUTH_BASE = "https://www.tiktok.com/v2/auth/authorize/";
const TOKEN_URL = "https://open.tiktokapis.com/v2/oauth/token/";
const USERINFO_URL = "https://open.tiktokapis.com/v2/user/info/?fields=open_id,union_id,display_name";
const SCOPES = "user.info.basic,video.publish,video.upload";

function json(obj: unknown, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function html(body: string, status = 200) {
  return new Response(
    `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>TikTok</title><style>body{font-family:system-ui,sans-serif;background:#0b0b12;color:#fff;display:grid;place-items:center;height:100vh;margin:0;text-align:center}div{max-width:420px;padding:2rem}h1{font-size:1.4rem}p{color:#aaa}</style></head><body><div>${body}</div><script>setTimeout(function(){window.close()},2500)</script></body></html>`,
    { status, headers: { "Content-Type": "text/html; charset=utf-8" } },
  );
}

function redirectUri(): string {
  return `${Deno.env.get("SUPABASE_URL")}/functions/v1/tiktok-oauth`;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );
  const clientKey = Deno.env.get("TIKTOK_CLIENT_KEY");
  const clientSecret = Deno.env.get("TIKTOK_CLIENT_SECRET");

  try {
    // ---- OAuth callback (GET) -------------------------------------------
    if (req.method === "GET") {
      const url = new URL(req.url);
      const code = url.searchParams.get("code");
      const state = url.searchParams.get("state");
      const err = url.searchParams.get("error");
      if (err) return html(`<h1>Could not connect</h1><p>${escapeHtml(err)}</p>`, 400);
      if (!code || !state) return html(`<h1>Missing authorization</h1><p>Try connecting again.</p>`, 400);
      if (!clientKey || !clientSecret) return html(`<h1>App not configured</h1>`, 500);

      const { data: settings } = await supabase
        .from("tiktok_automation_settings").select("tt_oauth_state").eq("id", "default").maybeSingle();
      if (!settings || settings.tt_oauth_state !== state) {
        return html(`<h1>Security check failed</h1><p>Please start the connection again.</p>`, 400);
      }

      const tokenRes = await fetch(TOKEN_URL, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          client_key: clientKey,
          client_secret: clientSecret,
          code,
          grant_type: "authorization_code",
          redirect_uri: redirectUri(),
        }),
      });
      const tokenText = await tokenRes.text();
      if (!tokenRes.ok) {
        console.error("tiktok token exchange failed:", tokenRes.status, tokenText.slice(0, 200));
        return html(`<h1>Connection failed</h1><p>Could not get an access token. Check the redirect URI in your TikTok app.</p>`, 400);
      }
      const tok = JSON.parse(tokenText);

      let username: string | null = null;
      try {
        const ui = await fetch(USERINFO_URL, { headers: { Authorization: `Bearer ${tok.access_token}` } });
        if (ui.ok) {
          const uj = await ui.json();
          username = uj?.data?.user?.display_name ?? null;
        }
      } catch { /* non-fatal */ }

      await supabase.from("tiktok_automation_settings").update({
        tt_access_token: tok.access_token,
        tt_refresh_token: tok.refresh_token,
        tt_token_expires_at: new Date(Date.now() + (Number(tok.expires_in ?? 86400) - 60) * 1000).toISOString(),
        tt_open_id: tok.open_id ?? null,
        tt_scope: tok.scope ?? null,
        tt_username: username,
        tt_oauth_state: null,
      }).eq("id", "default");

      return html(`<h1>✅ TikTok connected${username ? ` as ${username}` : ""}</h1><p>You can close this window and return to the admin hub.</p>`);
    }

    // ---- Admin actions (POST) -------------------------------------------
    const token = req.headers.get("Authorization")?.replace("Bearer ", "");
    if (!token) return json({ error: "Unauthorized" }, 401);
    const { data: userData, error: userErr } = await supabase.auth.getUser(token);
    if (userErr || !userData?.user) return json({ error: "Unauthorized" }, 401);
    const { data: isAdmin } = await supabase.rpc("has_role", { _user_id: userData.user.id, _role: "admin" });
    if (!isAdmin) return json({ error: "Forbidden" }, 403);

    const body = await req.json().catch(() => ({}));
    const action = String(body.action ?? "status");

    if (action === "auth-url") {
      if (!clientKey || !clientSecret) {
        return json({ error: "TikTok app credentials are not configured." }, 400);
      }
      const state = crypto.randomUUID().replace(/-/g, "");
      await supabase.from("tiktok_automation_settings").update({ tt_oauth_state: state }).eq("id", "default");
      const authUrl = `${AUTH_BASE}?${new URLSearchParams({
        client_key: clientKey,
        scope: SCOPES,
        response_type: "code",
        redirect_uri: redirectUri(),
        state,
      })}`;
      return json({ url: authUrl, redirect_uri: redirectUri() });
    }

    if (action === "status") {
      const { data: s } = await supabase
        .from("tiktok_automation_settings")
        .select("tt_open_id, tt_username, tt_scope, tt_token_expires_at")
        .eq("id", "default").maybeSingle();
      return json({
        connected: !!s?.tt_open_id,
        username: s?.tt_username ?? null,
        scope: s?.tt_scope ?? null,
        expires_at: s?.tt_token_expires_at ?? null,
        configured: !!clientKey && !!clientSecret,
        redirect_uri: redirectUri(),
      });
    }

    if (action === "disconnect") {
      await supabase.from("tiktok_automation_settings").update({
        tt_access_token: null, tt_refresh_token: null, tt_token_expires_at: null,
        tt_open_id: null, tt_username: null, tt_scope: null, tt_oauth_state: null,
      }).eq("id", "default");
      return json({ ok: true });
    }

    return json({ error: "Unknown action" }, 400);
  } catch (e) {
    console.error("tiktok-oauth error:", (e as Error).message);
    return json({ error: "An unexpected error occurred." }, 500);
  }
});
