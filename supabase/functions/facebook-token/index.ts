import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { createClient } from "npm:@supabase/supabase-js@2";
import {
  GRAPH_VERSION,
  debugToken,
  exchangeForLongLivedUserToken,
  getPageCredentials,
  getPageTokenFromUserToken,
} from "../_shared/facebook.ts";

/**
 * Admin-only Facebook token manager.
 *
 * Actions (POST, admin JWT required):
 *  - "status"     -> current connection, token type, expiry, Graph version
 *  - "connect"    -> { short_token, page_id? } exchange a short-lived user
 *                    token for a long-lived one, mint the never-expiring Page
 *                    token and store it in public.fb_credentials
 *  - "refresh"    -> re-mint the Page token from the stored user token
 *  - "disconnect" -> clear the stored credentials
 *
 * Requires secrets FACEBOOK_APP_ID and FACEBOOK_APP_SECRET.
 */

function json(obj: unknown, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  try {
    const jwt = req.headers.get("Authorization")?.replace("Bearer ", "");
    if (!jwt) return json({ error: "Unauthorized" }, 401);
    const { data: userData, error: userErr } = await supabase.auth.getUser(jwt);
    if (userErr || !userData?.user) return json({ error: "Unauthorized" }, 401);
    const { data: isAdmin } = await supabase.rpc("has_role", {
      _user_id: userData.user.id,
      _role: "admin",
    });
    if (!isAdmin) {
      const { data: prof } = await supabase.from("profiles").select("role").eq("id", userData.user.id).maybeSingle();
      if (prof?.role !== "admin") return json({ error: "Forbidden" }, 403);
    }

    const appId = Deno.env.get("FACEBOOK_APP_ID");
    const appSecret = Deno.env.get("FACEBOOK_APP_SECRET");

    const body = await req.json().catch(() => ({} as Record<string, unknown>));
    const action = String(body.action ?? "status");

    if (action === "get_groups") {
      const { data, error } = await supabase
        .from("fb_groups")
        .select("id, group_id, name, active, last_posted_at, last_error")
        .order("name", { ascending: true });
      if (error) return json({ error: error.message }, 500);
      return json({ ok: true, groups: data ?? [] });
    }

    if (action === "add_group") {
      const groupId = String(body.group_id ?? "").trim();
      const groupName = String(body.name ?? "").trim() || `Group ${groupId}`;
      if (!groupId) return json({ error: "group_id is required" }, 400);

      const { data: existing } = await supabase
        .from("fb_groups")
        .select("id")
        .eq("group_id", groupId)
        .maybeSingle();

      if (existing) {
        const { error: upErr } = await supabase
          .from("fb_groups")
          .update({ name: groupName, active: true })
          .eq("id", existing.id);
        if (upErr) return json({ error: upErr.message }, 500);
        return json({ ok: true, id: existing.id });
      } else {
        const { data: insData, error: insErr } = await supabase
          .from("fb_groups")
          .insert({ group_id: groupId, name: groupName, active: true })
          .select("id")
          .single();
        if (insErr) return json({ error: insErr.message }, 500);
        return json({ ok: true, id: insData?.id });
      }
    }

    if (action === "toggle_group") {
      const id = String(body.id ?? "");
      const active = Boolean(body.active);
      if (!id) return json({ error: "id is required" }, 400);

      const { error } = await supabase
        .from("fb_groups")
        .update({ active })
        .eq("id", id);
      if (error) return json({ error: error.message }, 500);
      return json({ ok: true });
    }

    if (action === "delete_group") {
      const id = String(body.id ?? "");
      if (!id) return json({ error: "id is required" }, 400);

      const { error } = await supabase
        .from("fb_groups")
        .delete()
        .eq("id", id);
      if (error) return json({ error: error.message }, 500);
      return json({ ok: true });
    }

    if (action === "status") {
      const { data } = await supabase
        .from("fb_credentials")
        .select("page_id, page_name, expires_at, token_type, last_checked_at, last_error, page_access_token, user_access_token")
        .eq("id", 1)
        .maybeSingle();
      const creds = await getPageCredentials(supabase);
      let tokenInfo: Record<string, unknown> | null = null;
      if (appId && appSecret && creds.token) {
        const d = await debugToken(creds.token, appId, appSecret);
        tokenInfo = {
          valid: d.valid,
          scopes: d.scopes,
          type: d.type,
          expires_at: d.expires_at ? new Date(d.expires_at * 1000).toISOString() : null,
          never_expires: d.expires_at === 0,
          error: d.error ?? null,
        };
      }
      return json({
        graph_version: GRAPH_VERSION,
        app_configured: !!appId && !!appSecret,
        connected: !!creds.pageId && !!creds.token,
        source: creds.source,
        page_id: data?.page_id ?? creds.pageId ?? null,
        page_name: data?.page_name ?? null,
        stored_expires_at: data?.expires_at ?? null,
        has_user_token: !!data?.user_access_token,
        last_checked_at: data?.last_checked_at ?? null,
        last_error: data?.last_error ?? null,
        token: tokenInfo,
      });
    }

    if (action === "connect" || action === "refresh") {
      let userToken: string | null = null;
      let userExpiresAt: string | null = null;
      const isExtended = !!body.is_extended;

      if (action === "connect") {
        const shortToken = String(body.short_token ?? "").trim();
        if (shortToken.length < 20) return json({ error: "Paste a valid access token." }, 400);
        
        if (isExtended) {
          userToken = shortToken;
          if (appId && appSecret) {
            try {
              const d = await debugToken(shortToken, appId, appSecret);
              if (d.valid && d.expires_at) {
                userExpiresAt = new Date(d.expires_at * 1000).toISOString();
              }
            } catch (_) {
              // Ignore debug errors for fallback
            }
          }
        } else if (appId && appSecret) {
          const longLived = await exchangeForLongLivedUserToken(shortToken, appId, appSecret);
          userToken = longLived.token;
          userExpiresAt = longLived.expiresAt;
        } else {
          // No app credentials yet: use the pasted token as-is. If it is already
          // a long-lived token the Page token minted from it will not expire.
          userToken = shortToken;
          userExpiresAt = null;
        }
      } else {
        const { data } = await supabase
          .from("fb_credentials").select("user_access_token, expires_at").eq("id", 1).maybeSingle();
        userToken = (data?.user_access_token as string) ?? null;
        userExpiresAt = (data?.expires_at as string) ?? null;
        if (!userToken) return json({ error: "No stored user token — connect again." }, 400);
        if (!appId || !appSecret) {
          return json({ error: "Refreshing needs FACEBOOK_APP_ID / FACEBOOK_APP_SECRET." }, 400);
        }
        // Re-exchange keeps rolling the 60-day window forward.
        const rolled = await exchangeForLongLivedUserToken(userToken, appId, appSecret);
        userToken = rolled.token;
        userExpiresAt = rolled.expiresAt;
      }

      const requestedPage = typeof body.page_id === "string" && body.page_id
        ? (body.page_id as string)
        : Deno.env.get("FACEBOOK_PAGE_ID") ?? null;
      
      let pageIdResult = "";
      let pageNameResult = "";
      let pageTokenResult = "";

      try {
        const page = await getPageTokenFromUserToken(userToken!, requestedPage);
        pageIdResult = page.pageId;
        pageNameResult = page.pageName;
        pageTokenResult = page.token;
      } catch (err) {
        if (isExtended) {
          // If already extended and getPageTokenFromUserToken fails, check if the token is already a Page token
          const meRes = await fetch(`${GRAPH}/me?fields=id,name&access_token=${encodeURIComponent(userToken!)}`);
          const meBody = await meRes.json().catch(() => ({}));
          if (meRes.ok && meBody?.id) {
            pageIdResult = meBody.id;
            pageNameResult = meBody.name || "Pasted Page Connection";
            pageTokenResult = userToken!;
          } else {
            throw err;
          }
        } else {
          throw err;
        }
      }

      const { error: upErr } = await supabase.from("fb_credentials").upsert({
        id: 1,
        page_id: pageIdResult,
        page_name: pageNameResult,
        page_access_token: pageTokenResult,
        user_access_token: userToken,
        token_type: "long_lived",
        // Page tokens derived from a long-lived user token do not expire, but
        // we track the user token's window so refresh can be nudged in time.
        expires_at: userExpiresAt,
        last_checked_at: new Date().toISOString(),
        last_error: null,
        updated_at: new Date().toISOString(),
      });
      if (upErr) return json({ error: upErr.message }, 500);

      const info = appId && appSecret ? await debugToken(pageTokenResult, appId, appSecret) : null;
      return json({
        ok: true,
        page_id: pageIdResult,
        page_name: pageNameResult,
        user_token_expires_at: userExpiresAt,
        page_token_never_expires: info ? info.expires_at === 0 : null,
        scopes: info?.scopes ?? [],
        graph_version: GRAPH_VERSION,
      });
    }

    if (action === "disconnect") {
      await supabase.from("fb_credentials").update({
        page_id: null,
        page_name: null,
        page_access_token: null,
        user_access_token: null,
        expires_at: null,
        last_error: null,
        updated_at: new Date().toISOString(),
      }).eq("id", 1);
      return json({ ok: true });
    }

    return json({ error: "Unknown action" }, 400);
  } catch (e) {
    console.error("facebook-token error:", (e as Error).message);
    return json({ error: (e as Error).message }, 500);
  }
});
