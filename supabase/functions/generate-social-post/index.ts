import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { createClient } from "npm:@supabase/supabase-js@2";

// Generates an on-brand social caption for a chosen platform using Lovable AI.
// Admin-only: requires a valid JWT belonging to a user with the 'admin' role.

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    // --- Auth: require an authenticated admin ---
    const authHeader = req.headers.get("Authorization");
    const token = authHeader?.replace("Bearer ", "");
    if (!token) return json({ caption: "", error: "Unauthorized" }, 401);

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: `Bearer ${token}` } } },
    );
    const { data: userData, error: userErr } = await supabase.auth.getUser(token);
    if (userErr || !userData?.user) return json({ caption: "", error: "Unauthorized" }, 401);
    const { data: isAdmin } = await supabase.rpc("has_role", { _user_id: userData.user.id, _role: "admin" });
    if (!isAdmin) return json({ caption: "", error: "Forbidden" }, 403);

    // Respect the admin AI on/off switch (feature flag "ai_social_captions").
    try {
      const { data: flag } = await supabase.from("feature_flags").select("enabled").eq("key", "ai_social_captions").maybeSingle();
      if (flag && flag.enabled === false) return json({ caption: "", error: "AI caption generation is turned off." }, 200);
    } catch { /* default enabled */ }

    const { platform, topic, promptTitle } = await req.json();
    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) return json({ caption: "" });

    const sys = `You write punchy, native social media captions for Paste Prompts, an AI prompt marketplace. Match the platform's style. Keep it tight, add 2-4 relevant hashtags, include a soft call to action to visit pasteprompts.co.uk. No markdown.`;
    const user = `Platform: ${String(platform ?? "general")}
Topic: ${String(topic ?? "AI prompts that actually work")}
${promptTitle ? `Featured prompt: ${promptTitle}` : ""}
Write one ready-to-post caption.`;

    const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [{ role: "system", content: sys }, { role: "user", content: user }],
      }),
    });
    if (resp.status === 429) return json({ caption: "", error: "Rate limited, try again shortly." }, 200);
    if (resp.status === 402) return json({ caption: "", error: "AI credits exhausted." }, 200);
    if (!resp.ok) return json({ caption: "", error: "AI unavailable." }, 200);
    const data = await resp.json();
    return json({ caption: (data?.choices?.[0]?.message?.content ?? "").trim() });
  } catch (e) {
    console.error("generate-social-post error:", (e as Error).message);
    return json({ caption: "", error: "An unexpected error occurred." }, 200);
  }
});

function json(obj: unknown, status = 200) {
  return new Response(JSON.stringify(obj), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
}
