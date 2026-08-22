import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { createClient, SupabaseClient } from "npm:@supabase/supabase-js@2";

/**
 * TikTok automation pipeline.
 *
 * Actions (POST { action, ... }):
 *  - "tick"     : scheduler entrypoint (cron via maintenance secret, or admin).
 *                 Decides whether automation is due and runs the pipeline.
 *  - "run-now"  : admin-triggered. Generates one video immediately (optional
 *                 source override) and posts it when auto_post / post=true.
 *  - "generate" : (re)generate a specific queued video by id.
 *  - "post"     : post a specific ready video by id to TikTok.
 *
 * Pipeline: pick content (random mix of trending prompts / AI tips) ->
 *           AI script + caption -> AI slide images -> render MP4 (Shotstack)
 *           -> upload to storage -> post to TikTok (connector gateway).
 */

const AI_GATEWAY = "https://ai.gateway.lovable.dev/v1/chat/completions";
const TIKTOK_GATEWAY = "https://connector-gateway.lovable.dev/tiktok";
const BUCKET = "tiktok-media";

const TIP_TOPICS = [
  "ChatGPT prompts that save hours at work",
  "Midjourney prompt tricks for stunning images",
  "Prompts every marketer should steal",
  "Writing prompts that beat writer's block",
  "Prompts to turn AI into your study buddy",
  "Coding prompts that 10x your output",
  "Prompts for irresistible social media captions",
  "Business prompts that find hidden revenue",
  "Prompts that make AI sound human",
  "Productivity prompts for a focused day",
];

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
    const body = await req.json().catch(() => ({}));
    const action = String(body.action ?? "tick");

    const { data: settings } = await supabase
      .from("tiktok_automation_settings").select("*").eq("id", "default").maybeSingle();
    if (!settings) return json({ error: "Settings not found" }, 500);

    // ---- Auth: admin JWT, scheduler secret, service-role, or DB cron secret ----
    const token = req.headers.get("Authorization")?.replace("Bearer ", "");
    const maintenanceSecret = Deno.env.get("MAINTENANCE_SECRET");
    const providedSecret = req.headers.get("x-maintenance-secret");
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const cronSecret = req.headers.get("x-cron-secret");
    const hasValidSecret = !!maintenanceSecret && providedSecret === maintenanceSecret;
    const hasServiceAuth = !!serviceKey && token === serviceKey;
    const hasCronAuth = !!settings.cron_secret && cronSecret === settings.cron_secret;
    if (!hasValidSecret && !hasServiceAuth && !hasCronAuth) {
      if (!token) return json({ error: "Unauthorized" }, 401);
      const { data: userData, error: userErr } = await supabase.auth.getUser(token);
      if (userErr || !userData?.user) return json({ error: "Unauthorized" }, 401);
      const { data: isAdmin } = await supabase.rpc("has_role", { _user_id: userData.user.id, _role: "admin" });
      if (!isAdmin) return json({ error: "Forbidden" }, 403);
    }

    if (action === "tick") {
      if (!settings.enabled) return json({ ok: true, skipped: "automation disabled" });
      if (!isDue(settings)) {
        return json({ ok: true, skipped: "not due", next_run_at: settings.next_run_at });
      }
      const created: string[] = [];
      const runs = Math.max(1, Math.min(5, settings.posts_per_run ?? 1));
      for (let i = 0; i < runs; i++) {
        const id = await pipeline(supabase, settings, { post: settings.auto_post });
        if (id) created.push(id);
      }
      await supabase.from("tiktok_automation_settings").update({
        last_run_at: new Date().toISOString(),
        next_run_at: computeNextRun(settings).toISOString(),
      }).eq("id", "default");
      return json({ ok: true, created });
    }

    if (action === "run-now") {
      const override = body.source_type as ("prompt" | "tip" | undefined);
      const post = body.post ?? settings.auto_post;
      const id = await pipeline(supabase, { ...settings, content_source: override ?? settings.content_source }, { post, promptId: body.prompt_id });
      return json({ ok: true, id });
    }

    if (action === "generate") {
      if (!body.id) return json({ error: "id required" }, 400);
      const ok = await generateForVideo(supabase, settings, body.id);
      return json({ ok });
    }

    if (action === "post") {
      if (!body.id) return json({ error: "id required" }, 400);
      const { data: video } = await supabase.from("tiktok_videos").select("*").eq("id", body.id).maybeSingle();
      if (!video) return json({ error: "video not found" }, 404);
      const result = await postToTikTok(supabase, video.id, video.video_url, video.caption ?? "");
      return json(result);
    }

    return json({ error: "Unknown action" }, 400);
  } catch (e) {
    console.error("tiktok-automation error:", (e as Error).message);
    return json({ error: "An unexpected error occurred." }, 500);
  }
});

/* ----------------- Scheduling ----------------- */

function isDue(s: Record<string, unknown>): boolean {
  const now = new Date();
  const mode = String(s.schedule_mode ?? "interval");
  const last = s.last_run_at ? new Date(s.last_run_at as string) : null;

  const intervalDue = () => {
    const hrs = Number(s.interval_hours ?? 24);
    if (!last) return true;
    return now.getTime() - last.getTime() >= hrs * 3600_000;
  };

  const slotsDue = () => {
    const slots = (s.time_slots as Array<{ day: string | number; time: string }>) ?? [];
    if (!slots.length) return false;
    const tz = String(s.timezone ?? "Europe/London");
    const local = nowInZone(now, tz);
    for (const slot of slots) {
      const [h, m] = String(slot.time ?? "").split(":").map(Number);
      if (Number.isNaN(h)) continue;
      const dayMatch = slot.day === "daily" || Number(slot.day) === local.weekday;
      if (!dayMatch) continue;
      // within the slot window (this minute up to 20 min after), and not already run in this window
      const slotMinutes = h * 60 + (m || 0);
      const nowMinutes = local.hour * 60 + local.minute;
      const diff = nowMinutes - slotMinutes;
      if (diff >= 0 && diff <= 20) {
        if (!last || now.getTime() - last.getTime() > 25 * 60_000) return true;
      }
    }
    return false;
  };

  if (mode === "interval") return intervalDue();
  if (mode === "slots") return slotsDue();
  return intervalDue() || slotsDue(); // both
}

function nowInZone(date: Date, tz: string) {
  const fmt = new Intl.DateTimeFormat("en-GB", {
    timeZone: tz, weekday: "short", hour: "2-digit", minute: "2-digit", hour12: false,
  });
  const parts = Object.fromEntries(fmt.formatToParts(date).map((p) => [p.type, p.value]));
  const weekdayMap: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
  return {
    weekday: weekdayMap[parts.weekday as string] ?? 0,
    hour: Number(parts.hour) % 24,
    minute: Number(parts.minute),
  };
}

function computeNextRun(s: Record<string, unknown>): Date {
  const hrs = Number(s.interval_hours ?? 24);
  return new Date(Date.now() + hrs * 3600_000);
}

/* ----------------- Pipeline ----------------- */

async function pipeline(
  supabase: SupabaseClient,
  settings: Record<string, unknown>,
  opts: { post?: boolean; promptId?: string },
): Promise<string | null> {
  const content = await pickContent(supabase, settings, opts.promptId);

  const { data: inserted, error } = await supabase.from("tiktok_videos").insert({
    status: "generating",
    source_type: content.source_type,
    prompt_id: content.prompt_id ?? null,
    topic: content.topic,
  }).select("id").single();
  if (error || !inserted) {
    console.error("insert video failed:", error?.message);
    return null;
  }
  const id = inserted.id as string;

  const ok = await generateForVideo(supabase, settings, id, content);
  if (ok && opts.post) {
    const { data: v } = await supabase.from("tiktok_videos").select("video_url, caption").eq("id", id).maybeSingle();
    if (v?.video_url) await postToTikTok(supabase, id, v.video_url, v.caption ?? "");
  }
  return id;
}

interface Content {
  source_type: "prompt" | "tip";
  prompt_id?: string;
  topic: string;
  detail?: string;
}

async function pickContent(supabase: SupabaseClient, settings: Record<string, unknown>, promptId?: string): Promise<Content> {
  let source = String(settings.content_source ?? "random");
  if (source === "random") source = Math.random() < 0.5 ? "prompt" : "tip";

  if (source === "prompt") {
    if (promptId) {
      const { data: p } = await supabase.from("prompts").select("id, title, description").eq("id", promptId).maybeSingle();
      if (p) return { source_type: "prompt", prompt_id: p.id, topic: p.title, detail: p.description ?? "" };
    }
    const { data: prompts } = await supabase
      .from("prompts").select("id, title, description")
      .eq("status", "approved").order("trending_score", { ascending: false }).limit(30);
    if (prompts && prompts.length) {
      const { data: recent } = await supabase
        .from("tiktok_videos").select("prompt_id").order("created_at", { ascending: false }).limit(15);
      const used = new Set((recent ?? []).map((r) => r.prompt_id).filter(Boolean));
      const fresh = prompts.filter((p) => !used.has(p.id));
      const pool = fresh.length ? fresh : prompts;
      const pick = pool[Math.floor(Math.random() * pool.length)];
      return { source_type: "prompt", prompt_id: pick.id, topic: pick.title, detail: pick.description ?? "" };
    }
    // fall through to tip if no prompts
  }

  const topic = TIP_TOPICS[Math.floor(Math.random() * TIP_TOPICS.length)];
  return { source_type: "tip", topic };
}

async function generateForVideo(
  supabase: SupabaseClient,
  settings: Record<string, unknown>,
  id: string,
  content?: Content,
): Promise<boolean> {
  try {
    await supabase.from("tiktok_videos").update({ status: "generating", error: null }).eq("id", id);

    if (!content) {
      const { data: v } = await supabase.from("tiktok_videos").select("source_type, prompt_id, topic").eq("id", id).maybeSingle();
      content = {
        source_type: (v?.source_type as "prompt" | "tip") ?? "tip",
        prompt_id: v?.prompt_id ?? undefined,
        topic: v?.topic ?? "AI prompts that actually work",
      };
      if (content.prompt_id) {
        const { data: p } = await supabase.from("prompts").select("description").eq("id", content.prompt_id).maybeSingle();
        content.detail = p?.description ?? "";
      }
    }

    const slideCount = Math.max(2, Math.min(6, Number(settings.slide_count ?? 4)));
    const script = await generateScript(content, slideCount, String(settings.caption_instructions ?? ""));

    // Generate an image per slide.
    const imageStyle = String(settings.image_style ?? "bold modern gradient, clean typography");
    const slides: Array<{ text: string; image_url: string }> = [];
    for (let i = 0; i < script.slides.length; i++) {
      const slide = script.slides[i];
      const imgPrompt = `${slide.visual || slide.text}. Style: ${imageStyle}. Vertical 9:16 social media background, no text, no watermark.`;
      let imageUrl = "";
      try {
        const b64 = await generateImage(imgPrompt);
        if (b64) imageUrl = await uploadImage(supabase, id, i, b64);
      } catch (e) {
        console.error("image gen failed:", (e as Error).message);
      }
      slides.push({ text: slide.text, image_url: imageUrl });
    }

    await supabase.from("tiktok_videos").update({ caption: script.caption, slides }).eq("id", id);

    // Render MP4.
    const shotstackKey = Deno.env.get("SHOTSTACK_API_KEY");
    if (!shotstackKey) {
      await supabase.from("tiktok_videos").update({
        status: "failed",
        error: "Video render service not configured. Add a SHOTSTACK_API_KEY to enable MP4 rendering. Slides and caption are ready for preview.",
      }).eq("id", id);
      return false;
    }

    const videoUrl = await renderVideo(slides, shotstackKey);
    if (!videoUrl) {
      await supabase.from("tiktok_videos").update({ status: "failed", error: "Render timed out or failed." }).eq("id", id);
      return false;
    }
    await supabase.from("tiktok_videos").update({ status: "ready", video_url: videoUrl, error: null }).eq("id", id);
    return true;
  } catch (e) {
    console.error("generateForVideo error:", (e as Error).message);
    await supabase.from("tiktok_videos").update({ status: "failed", error: "Generation failed." }).eq("id", id);
    return false;
  }
}

/* ----------------- AI helpers ----------------- */

interface Script { caption: string; slides: Array<{ text: string; visual?: string }> }

async function generateScript(content: Content, slideCount: number, instructions: string): Promise<Script> {
  const apiKey = Deno.env.get("LOVABLE_API_KEY");
  const fallback: Script = {
    caption: `${content.topic} 🚀 Discover more free AI prompts at pasteprompts.co.uk #AIprompts #ChatGPT #pasteprompts`,
    slides: Array.from({ length: slideCount }, (_, i) => ({ text: i === 0 ? content.topic : `Tip ${i}` })),
  };
  if (!apiKey) return fallback;

  const sys = `You script short vertical TikTok slideshow videos for Paste Prompts, an AI prompt marketplace (pasteprompts.co.uk). Return STRICT JSON only.`;
  const user = `Create a ${slideCount}-slide TikTok slideshow about: "${content.topic}".
${content.detail ? `Context: ${content.detail}` : ""}
${instructions ? `Extra direction: ${instructions}` : ""}
Rules: slide 1 is a scroll-stopping hook, final slide is a CTA to visit pasteprompts.co.uk for free prompts. Each slide "text" <= 80 chars, punchy. Provide a "visual" describing the background image for each slide.
Return JSON exactly: {"caption": string (with 3-5 hashtags), "slides": [{"text": string, "visual": string}]}`;

  const resp = await fetch(AI_GATEWAY, {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages: [{ role: "system", content: sys }, { role: "user", content: user }],
    }),
  });
  if (!resp.ok) return fallback;
  const data = await resp.json();
  const raw = (data?.choices?.[0]?.message?.content ?? "").trim();
  try {
    const parsed = JSON.parse(raw.replace(/^```json/i, "").replace(/```$/, "").trim());
    if (parsed.slides?.length) return parsed as Script;
  } catch { /* fall back */ }
  return fallback;
}

async function generateImage(prompt: string): Promise<string> {
  const apiKey = Deno.env.get("LOVABLE_API_KEY");
  if (!apiKey) return "";
  const resp = await fetch(AI_GATEWAY, {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash-image-preview",
      messages: [{ role: "user", content: prompt }],
      modalities: ["image", "text"],
    }),
  });
  if (!resp.ok) return "";
  const data = await resp.json();
  const url = data?.choices?.[0]?.message?.images?.[0]?.image_url?.url ?? "";
  return url; // data:image/png;base64,....
}

async function uploadImage(supabase: SupabaseClient, videoId: string, index: number, dataUrl: string): Promise<string> {
  const match = dataUrl.match(/^data:(image\/\w+);base64,(.+)$/);
  if (!match) return "";
  const contentType = match[1];
  const ext = contentType.split("/")[1] || "png";
  const bytes = Uint8Array.from(atob(match[2]), (c) => c.charCodeAt(0));
  const path = `${videoId}/slide-${index}.${ext}`;
  const { error } = await supabase.storage.from(BUCKET).upload(path, bytes, { contentType, upsert: true });
  if (error) { console.error("upload error:", error.message); return ""; }
  const { data } = await supabase.storage.from(BUCKET).createSignedUrl(path, 60 * 60 * 24 * 7);
  return data?.signedUrl ?? "";
}

/* ----------------- Render (Shotstack) ----------------- */

async function renderVideo(slides: Array<{ text: string; image_url: string }>, apiKey: string): Promise<string> {
  const env = Deno.env.get("SHOTSTACK_ENV") || "stage";
  const base = `https://api.shotstack.io/edit/${env}`;

  // Preferred path: render a saved Shotstack template with merge fields.
  const templateId = Deno.env.get("SHOTSTACK_TEMPLATE_ID");
  if (templateId) {
    const merge = slides.flatMap((s, i) => [
      { find: `TEXT_${i + 1}`, replace: s.text },
      { find: `IMAGE_${i + 1}`, replace: s.image_url },
    ]);
    // Some saved templates include extra placeholders (e.g. AGENT_PICTURE).
    // Any unreplaced {{ ... }} is sent to Shotstack as a literal asset URL and
    // fails the render, so always supply a value for the known extras.
    const firstImage = slides.find((s) => s.image_url)?.image_url || "";
    merge.push({ find: "AGENT_PICTURE", replace: firstImage });
    const resp = await fetch(`${base}/templates/render`, {
      method: "POST",
      headers: { "x-api-key": apiKey, "Content-Type": "application/json" },
      body: JSON.stringify({ id: templateId, merge }),
    });
    if (resp.ok) {
      const d = await resp.json();
      const renderId = d?.response?.id;
      if (renderId) {
        const url = await pollRender(base, apiKey, renderId);
        if (url) return url;
      }
    } else {
      console.error("shotstack template render error:", resp.status, (await resp.text()).slice(0, 200));
    }
    // fall through to the built-in timeline render
  }

  const per = 3.5;
  const imageClips: unknown[] = [];
  const textClips: unknown[] = [];
  slides.forEach((s, i) => {
    const start = i * per;
    if (s.image_url) {
      imageClips.push({
        asset: { type: "image", src: s.image_url },
        start, length: per, fit: "cover",
        effect: i % 2 === 0 ? "zoomIn" : "slideLeft",
        transition: { in: "fade", out: "fade" },
      });
    }
    textClips.push({
      asset: {
        type: "title", text: s.text, style: "subtitle",
        color: "#ffffff", size: "large", background: "#000000aa", position: "center",
      },
      start, length: per, position: "center",
      transition: { in: "slideUp", out: "fade" },
    });
  });

  const payload = {
    timeline: { background: "#0b0b12", tracks: [{ clips: textClips }, { clips: imageClips }] },
    output: { format: "mp4", size: { width: 1080, height: 1920 }, fps: 30 },
  };

  const renderResp = await fetch(`${base}/render`, {
    method: "POST",
    headers: { "x-api-key": apiKey, "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!renderResp.ok) {
    console.error("shotstack render error:", renderResp.status, (await renderResp.text()).slice(0, 200));
    return "";
  }
  const renderData = await renderResp.json();
  const renderId = renderData?.response?.id;
  if (!renderId) return "";

  return await pollRender(base, apiKey, renderId);
}

// Polls a Shotstack render for up to ~80s and returns the finished MP4 URL.
async function pollRender(base: string, apiKey: string, renderId: string): Promise<string> {
  for (let i = 0; i < 27; i++) {
    await new Promise((r) => setTimeout(r, 3000));
    const statusResp = await fetch(`${base}/render/${renderId}`, { headers: { "x-api-key": apiKey } });
    if (!statusResp.ok) continue;
    const status = await statusResp.json();
    const st = status?.response?.status;
    if (st === "done") return status?.response?.url ?? "";
    if (st === "failed") { console.error("shotstack failed:", status?.response?.error); return ""; }
  }
  return "";
}

/* ----------------- TikTok posting ----------------- */

const TIKTOK_TOKEN_URL = "https://open.tiktokapis.com/v2/oauth/token/";
const TIKTOK_PUBLISH_URL = "https://open.tiktokapis.com/v2/post/publish/video/init/";

// Returns a valid access token for the connected TikTok account, refreshing it
// if it has expired. Null if the account is not connected via OAuth.
async function getDirectAccessToken(supabase: SupabaseClient): Promise<string | null> {
  const clientKey = Deno.env.get("TIKTOK_CLIENT_KEY");
  const clientSecret = Deno.env.get("TIKTOK_CLIENT_SECRET");
  if (!clientKey || !clientSecret) return null;

  const { data: s } = await supabase
    .from("tiktok_automation_settings")
    .select("tt_access_token, tt_refresh_token, tt_token_expires_at")
    .eq("id", "default").maybeSingle();
  if (!s?.tt_access_token || !s?.tt_refresh_token) return null;

  const expiresAt = s.tt_token_expires_at ? new Date(s.tt_token_expires_at).getTime() : 0;
  if (expiresAt > Date.now() + 30_000) return s.tt_access_token as string;

  // Refresh.
  try {
    const res = await fetch(TIKTOK_TOKEN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_key: clientKey,
        client_secret: clientSecret,
        grant_type: "refresh_token",
        refresh_token: s.tt_refresh_token as string,
      }),
    });
    if (!res.ok) {
      console.error("tiktok token refresh failed:", res.status, (await res.text()).slice(0, 200));
      return null;
    }
    const tok = await res.json();
    await supabase.from("tiktok_automation_settings").update({
      tt_access_token: tok.access_token,
      tt_refresh_token: tok.refresh_token ?? s.tt_refresh_token,
      tt_token_expires_at: new Date(Date.now() + (Number(tok.expires_in ?? 86400) - 60) * 1000).toISOString(),
    }).eq("id", "default");
    return tok.access_token as string;
  } catch (e) {
    console.error("tiktok refresh error:", (e as Error).message);
    return null;
  }
}

async function postToTikTok(supabase: SupabaseClient, id: string, videoUrl: string | null, caption: string) {
  if (!videoUrl) {
    await supabase.from("tiktok_videos").update({ status: "failed", error: "No rendered video to post." }).eq("id", id);
    return { ok: false, error: "No rendered video to post." };
  }

  await supabase.from("tiktok_videos").update({ status: "posting", error: null }).eq("id", id);

  // Prefer the site's own OAuth connection (has the video.publish scope).
  const accessToken = await getDirectAccessToken(supabase);

  try {
    let resp: Response;
    if (accessToken) {
      resp = await fetch(TIKTOK_PUBLISH_URL, {
        method: "POST",
        headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          post_info: { title: caption.slice(0, 2200), privacy_level: "SELF_ONLY", disable_comment: false },
          source_info: { source: "PULL_FROM_URL", video_url: videoUrl },
        }),
      });
    } else {
      // Fall back to the connector gateway (may be read-only).
      const lovableKey = Deno.env.get("LOVABLE_API_KEY");
      const tiktokKey = Deno.env.get("TIKTOK_API_KEY");
      if (!lovableKey || !tiktokKey) {
        await supabase.from("tiktok_videos").update({
          status: "ready",
          error: "TikTok account not connected. Connect your TikTok account in the admin hub to enable auto-posting.",
        }).eq("id", id);
        return { ok: false, error: "TikTok not connected." };
      }
      resp = await fetch(`${TIKTOK_GATEWAY}/post/publish/video/init/`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${lovableKey}`,
          "X-Connection-Api-Key": tiktokKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          post_info: { title: caption.slice(0, 2200), privacy_level: "SELF_ONLY", disable_comment: false },
          source_info: { source: "PULL_FROM_URL", video_url: videoUrl },
        }),
      });
    }

    const text = await resp.text();
    if (!resp.ok) {
      await supabase.from("tiktok_videos").update({
        status: "failed", error: `TikTok ${resp.status}: ${text.slice(0, 300)}`,
      }).eq("id", id);
      return { ok: false, error: `TikTok ${resp.status}`, detail: text.slice(0, 300) };
    }
    const data = JSON.parse(text || "{}");
    const publishId = data?.data?.publish_id ?? null;
    await supabase.from("tiktok_videos").update({
      status: "posted", tiktok_post_id: publishId, result: data, posted_at: new Date().toISOString(), error: null,
    }).eq("id", id);
    return { ok: true, publish_id: publishId };
  } catch (e) {
    await supabase.from("tiktok_videos").update({ status: "failed", error: (e as Error).message }).eq("id", id);
    return { ok: false, error: (e as Error).message };
  }
}
