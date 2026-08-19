import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { createClient } from "npm:@supabase/supabase-js@2";

/**
 * Generates 30 short Facebook posts promoting Paste Prompts and stores them
 * in the fb_post_pool table. Consumes AI credits ONCE — the daily poster then
 * cycles through this pool for ~90 days before this function needs to run
 * again. Auth: admin JWT or the MAINTENANCE_SECRET header.
 */

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  if (!(await authorize(req, supabase))) return json({ error: "Unauthorized" }, 401);

  // ---- Determine next cycle ----
  const { data: latest } = await supabase
    .from("fb_post_pool")
    .select("cycle_id")
    .order("cycle_id", { ascending: false })
    .limit(1)
    .maybeSingle();
  const nextCycle = ((latest?.cycle_id as number | undefined) ?? 0) + 1;

  // ---- Generate 30 posts via Lovable AI (single call) ----
  const apiKey = Deno.env.get("LOVABLE_API_KEY");
  if (!apiKey) return json({ error: "AI unavailable" }, 500);

  const sys = `You write native, high-converting Facebook posts for Paste Prompts, an AI prompt marketplace at https://pasteprompts.co.uk.
Style: punchy, friendly, benefit-led. 1–3 sentences. Include a soft CTA and 1–3 hashtags. No markdown.
Audience: split across (a) prompt buyers wanting ready-to-use ChatGPT / Midjourney prompts, (b) creators who want to sell their prompts and earn money, (c) casual visitors who might sign up for the free library.
Mix angles: free library, top-earning creators, one-click copy, curated categories, ChatGPT tips, community proof, "get paid for your prompts", weekly drops.`;

  const user = `Generate exactly 30 unique Facebook posts as a JSON array. Each item MUST be an object:
{ "content": string, "has_media": boolean, "emoji_only": boolean }
Rules:
- Exactly 12 of the 30 (40%) must have "has_media": true. Of those 12, half should be "emoji_only": true (emoji-forward opener), half must start with an "[Image: ...]" brief.
- Every image brief MUST use this exact structure: "[Image: SHORT HEADLINE | Scene: DETAILED PASTE PROMPTS UI]". The SHORT HEADLINE is max 8 words and appears on the graphic. The Scene must explicitly name Paste Prompts, pasteprompts.co.uk, the exact page or feature shown, visible interface elements, and realistic on-screen data. Never request generic devices, people, faces, portraits, photographs, abstract art, or an unspecified marketplace.
- Use only these six specific briefs, once each: "[Image: Turn prompts into earnings | Scene: Paste Prompts creator earnings leaderboard at pasteprompts.co.uk showing four ranked prompt sellers, prompt sales totals in pounds, green payout badges and a rising monthly sales chart in the dark purple branded dashboard]", "[Image: Copy a proven prompt in one click | Scene: Paste Prompts prompt detail page at pasteprompts.co.uk showing a complete ChatGPT marketing prompt inside the prompt editor and a large purple Copy prompt button with a copied confirmation]", "[Image: Discover prompts buyers rate five stars | Scene: Paste Prompts reviews panel at pasteprompts.co.uk showing five gold stars, a 4.9 rating, verified buyer badges and three short reviews beneath a featured AI prompt]", "[Image: Find the right prompt by category | Scene: Paste Prompts browse page at pasteprompts.co.uk showing a grid of six prompt cards labelled Marketing, Image Generation, Coding, Business, Writing and Productivity with prices and ratings]", "[Image: Sell your first AI prompt today | Scene: Paste Prompts creator upload page at pasteprompts.co.uk showing prompt title, AI model, category and price fields beside a purple Publish prompt button and an earnings preview]", "[Image: Free prompts ready to copy and use | Scene: Paste Prompts free prompt library at pasteprompts.co.uk showing six clearly labelled free ChatGPT and image-generation prompt cards with Free badges, star ratings and Copy buttons]".
- The remaining 18 must be "has_media": false and "emoji_only": false — plain text only, NO emojis at all.
- Include the URL https://pasteprompts.co.uk in most posts.
- Rotate CTAs: "Browse free prompts", "Start selling yours", "Join free", "Grab today's drop", "See top creators".
- No duplicates, no numbered lists, no "Post 1:" prefixes.
Return ONLY the JSON array, no prose, no code fences.`;

  const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages: [{ role: "system", content: sys }, { role: "user", content: user }],
      response_format: { type: "json_object" },
    }),
  });
  if (!resp.ok) {
    const t = await resp.text();
    return json({ error: `AI ${resp.status}: ${t.slice(0, 300)}` }, resp.status === 429 ? 429 : 502);
  }
  const data = await resp.json();
  const raw = data?.choices?.[0]?.message?.content ?? "";

  // Parse — model may return {"posts":[...]} or a bare array wrapped in an object
  let arr: Array<{ content: string; has_media?: boolean; emoji_only?: boolean }> = [];
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) arr = parsed;
    else if (Array.isArray(parsed?.posts)) arr = parsed.posts;
    else if (Array.isArray(parsed?.data)) arr = parsed.data;
    else {
      // Take first array-valued property
      for (const v of Object.values(parsed)) {
        if (Array.isArray(v)) { arr = v as typeof arr; break; }
      }
    }
  } catch (e) {
    return json({ error: "AI returned invalid JSON", raw: String(raw).slice(0, 400) }, 502);
  }

  arr = arr.filter((p) => p && typeof p.content === "string" && p.content.trim().length > 0).slice(0, 30);
  if (arr.length < 20) return json({ error: `Only ${arr.length} posts parsed`, raw: String(raw).slice(0, 400) }, 502);

  const rows = arr.map((p) => ({
    content: p.content.trim(),
    has_media: !!p.has_media,
    emoji_only: !!p.emoji_only,
    cycle_id: nextCycle,
  }));

  const { error: insErr } = await supabase.from("fb_post_pool").insert(rows);
  if (insErr) return json({ error: insErr.message }, 500);

  // Seed the per-cycle settings row (attach_media defaults to true)
  await supabase.from("fb_autopilot_cycles").insert({ cycle_id: nextCycle }).select();

  return json({ ok: true, cycle_id: nextCycle, generated: rows.length });
});

function json(obj: unknown, status = 200) {
  return new Response(JSON.stringify(obj), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
}

async function authorize(req: Request, supabase: ReturnType<typeof createClient>): Promise<boolean> {
  const providedSecret = req.headers.get("x-maintenance-secret");
  if (providedSecret) {
    const envSecret = Deno.env.get("MAINTENANCE_SECRET");
    if (envSecret && providedSecret === envSecret) return true;
    const { data } = await supabase.schema("vault").from("decrypted_secrets").select("decrypted_secret").eq("name", "fb_autopilot_cron_token").maybeSingle();
    if (data?.decrypted_secret && providedSecret === data.decrypted_secret) return true;
  }
  const token = req.headers.get("Authorization")?.replace("Bearer ", "");
  if (!token) return false;
  const { data: u } = await supabase.auth.getUser(token);
  if (!u?.user) return false;
  const { data: isAdmin } = await supabase.rpc("has_role", { _user_id: u.user.id, _role: "admin" });
  return !!isAdmin;
}
