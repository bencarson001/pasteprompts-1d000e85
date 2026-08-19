import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { publishToFacebook } from "../_shared/facebook.ts";

/**
 * Processes due scheduled social posts.
 * Runs on a schedule (pg_cron) and can be triggered manually by an admin.
 *
 * For each post whose scheduled_at <= now() and status = 'scheduled', it
 * attempts delivery to the target platform through the Lovable connector
 * gateway (using the connection the workspace has linked for that platform).
 * The post's status is updated to 'posted' or 'failed' with a result payload.
 *
 * Gated by the "social_posting" feature flag.
 */

const GATEWAY = "https://connector-gateway.lovable.dev";

// Maps an internal platform name to the connector id + the env var holding the
// connection's gateway API key (populated once the connector is linked).
const PLATFORM_CONNECTORS: Record<string, { connector: string; keyEnv: string }> = {
  linkedin: { connector: "linkedin", keyEnv: "LINKEDIN_API_KEY" },
  tiktok: { connector: "tiktok", keyEnv: "TIKTOK_API_KEY" },
  telegram: { connector: "telegram", keyEnv: "TELEGRAM_API_KEY" },
  twitch: { connector: "twitch", keyEnv: "TWITCH_API_KEY" },
  slack: { connector: "slack", keyEnv: "SLACK_API_KEY" },
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  // ---- Auth: admin JWT or shared scheduler secret ----------------------
  const maintenanceSecret = Deno.env.get("MAINTENANCE_SECRET");
  const providedSecret = req.headers.get("x-maintenance-secret");
  const hasValidSecret = !!maintenanceSecret && providedSecret === maintenanceSecret;
  if (!hasValidSecret) {
    const token = req.headers.get("Authorization")?.replace("Bearer ", "");
    if (!token) return json({ error: "Unauthorized" }, 401);
    const { data: userData, error: userErr } = await supabase.auth.getUser(token);
    if (userErr || !userData?.user) return json({ error: "Unauthorized" }, 401);
    const { data: isAdmin } = await supabase.rpc("has_role", { _user_id: userData.user.id, _role: "admin" });
    if (!isAdmin) return json({ error: "Forbidden" }, 403);
  }

  // ---- Feature flag gate ----------------------------------------------
  const { data: flag } = await supabase.from("feature_flags").select("enabled").eq("key", "social_posting").maybeSingle();
  if (flag && flag.enabled === false) {
    return json({ ok: true, skipped: "social_posting disabled", processed: 0 });
  }

  const lovableKey = Deno.env.get("LOVABLE_API_KEY");

  const { data: due } = await supabase
    .from("scheduled_posts")
    .select("id, platform, caption, media_url")
    .eq("status", "scheduled")
    .lte("scheduled_at", new Date().toISOString())
    .order("scheduled_at", { ascending: true })
    .limit(25);

  let posted = 0;
  let failed = 0;

  for (const p of due ?? []) {
    const platform = String(p.platform ?? "").toLowerCase();
    const result = await deliver(supabase, platform, String(p.caption ?? ""), (p.media_url as string) ?? null, lovableKey);
    await supabase
      .from("scheduled_posts")
      .update({
        status: result.ok ? "posted" : "failed",
        result: { ...result, posted_at: new Date().toISOString() },
        updated_at: new Date().toISOString(),
      })
      .eq("id", p.id);
    if (result.ok) {
      posted++;
    } else {
      failed++;
    }
  }

  return json({ ok: true, processed: (due ?? []).length, posted, failed });
});

async function deliver(
  supabase: ReturnType<typeof createClient>,
  platform: string,
  caption: string,
  mediaUrl: string | null,
  lovableKey?: string,
): Promise<{ ok: boolean; detail: string }> {
  // Facebook posts publish straight through the Graph API using the Page
  // credentials, and are also shared to 9 random active groups.
  if (platform === "facebook") {
    const r = await publishToFacebook(supabase as never, caption, mediaUrl);
    const shared = r.groups.filter((g) => g.ok).length;
    if (!r.pageOk) return { ok: false, detail: r.error ?? "Facebook post failed." };
    return { ok: true, detail: `Posted to the Page and shared to ${shared} group${shared === 1 ? "" : "s"}.` };
  }

  const map = PLATFORM_CONNECTORS[platform];
  if (!map) {
    return { ok: false, detail: `No connector available for "${platform}". Connect a supported platform (LinkedIn, TikTok, Telegram, Twitch, Slack).` };
  }
  const connKey = Deno.env.get(map.keyEnv);
  if (!lovableKey || !connKey) {
    return { ok: false, detail: `${platform} is not connected yet. Link the ${platform} connector in Settings → Connectors to enable auto-posting.` };
  }

  try {
    if (platform === "telegram") {
      const chatId = Deno.env.get("TELEGRAM_CHAT_ID");
      if (!chatId) return { ok: false, detail: "Set TELEGRAM_CHAT_ID secret (target channel/chat id)." };
      const r = await gateway(map.connector, "sendMessage", { chat_id: chatId, text: caption }, lovableKey, connKey);
      return r;
    }
    if (platform === "slack") {
      const channel = Deno.env.get("SLACK_CHANNEL_ID");
      if (!channel) return { ok: false, detail: "Set SLACK_CHANNEL_ID secret (target channel)." };
      const r = await gateway(map.connector, "api/chat.postMessage", { channel, text: caption }, lovableKey, connKey);
      return r;
    }
    // LinkedIn / TikTok / Twitch require account-specific identifiers and
    // (for TikTok) hosted media. Record a clear, actionable result.
    return {
      ok: false,
      detail: `${platform} connector linked, but posting needs extra setup (author/page id${platform === "tiktok" ? " and a hosted video" : ""}). Caption is ready: "${caption.slice(0, 60)}…"`,
    };
  } catch (e) {
    return { ok: false, detail: (e as Error).message };
  }
}

async function gateway(
  connector: string,
  path: string,
  body: unknown,
  lovableKey: string,
  connKey: string,
): Promise<{ ok: boolean; detail: string }> {
  const res = await fetch(`${GATEWAY}/${connector}/${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${lovableKey}`,
      "X-Connection-Api-Key": connKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  if (!res.ok) return { ok: false, detail: `Gateway ${res.status}: ${text.slice(0, 200)}` };
  return { ok: true, detail: "Posted successfully." };
}

function json(obj: unknown, status = 200) {
  return new Response(JSON.stringify(obj), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
}
