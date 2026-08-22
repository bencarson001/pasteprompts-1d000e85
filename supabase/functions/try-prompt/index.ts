import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

// "Try before you buy" sandbox. Runs a prompt against Lovable AI.
// - Free / owned / purchased prompts: runs the real prompt body.
// - Locked paid prompts: runs a teaser built from the public title + description
//   only, so the paid body is never exposed.

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) throw new Error("AI is not configured");

    const { promptId, userInput } = await req.json();
    if (!promptId || typeof promptId !== "string") {
      return new Response(JSON.stringify({ error: "promptId is required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const service = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // Respect the admin "Try it live" switch (feature flag "ai_try_sandbox").
    // Disabled by default so the site doesn't consume AI credits.
    try {
      const { data: flag } = await service
        .from("feature_flags").select("enabled").eq("key", "ai_try_sandbox").maybeSingle();
      if (!flag || flag.enabled === false) {
        return new Response(
          JSON.stringify({ error: "Live preview is turned off. Buy the prompt to copy and use the full version." }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
    } catch { /* if the flag can't be read, fall through */ }

    const { data: prompt } = await service
      .from("prompts")
      .select("id, title, description, body, is_free, creator_id, status")
      .eq("id", promptId)
      .maybeSingle();
    if (!prompt || prompt.status !== "approved") {
      return new Response(JSON.stringify({ error: "Prompt not available" }), {
        status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Determine entitlement from the caller's JWT (optional).
    let userId: string | null = null;
    const authHeader = req.headers.get("Authorization");
    if (authHeader?.startsWith("Bearer ")) {
      const anon = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_ANON_KEY")!,
        { global: { headers: { Authorization: authHeader } } },
      );
      const { data } = await anon.auth.getClaims(authHeader.replace("Bearer ", ""));
      userId = (data?.claims?.sub as string) ?? null;
    }

    let entitled = !!prompt.is_free;
    if (!entitled && userId) {
      if (userId === prompt.creator_id) entitled = true;
      else {
        const { data: purchased } = await service.rpc("has_purchased", {
          _user_id: userId, _prompt_id: promptId,
        });
        entitled = !!purchased;
      }
    }

    const sampleInput = typeof userInput === "string" ? userInput.slice(0, 800) : "";

    const systemPrompt = entitled
      ? `You are running a marketplace prompt for the user. Execute it faithfully and return a high-quality result.`
      : `You are giving a SHORT teaser preview of what a paid AI prompt could produce, based only on its public title and description. Produce a brief, compelling sample (max ~120 words) that shows the value but is clearly a teaser. End with: "— unlock the full prompt for the complete version."`;

    const userMessage = entitled
      ? `${prompt.body}${sampleInput ? `\n\n---\nUser input:\n${sampleInput}` : ""}`
      : `Prompt title: ${prompt.title}\nDescription: ${prompt.description}${sampleInput ? `\nUser context: ${sampleInput}` : ""}`;

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userMessage },
        ],
        temperature: 0.7,
        max_tokens: entitled ? 1200 : 320,
      }),
    });

    if (res.status === 429) {
      return new Response(JSON.stringify({ error: "Rate limit reached. Please try again shortly." }), {
        status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (res.status === 402) {
      return new Response(JSON.stringify({ error: "AI credits exhausted. Please try later." }), {
        status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!res.ok) throw new Error(`AI gateway error ${res.status}`);

    const json = await res.json();
    const output = json?.choices?.[0]?.message?.content ?? "";

    return new Response(JSON.stringify({ output, teaser: !entitled }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("try-prompt error:", (e as Error).message);
    return new Response(JSON.stringify({ error: "An unexpected error occurred." }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
