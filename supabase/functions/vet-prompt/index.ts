import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { createClient } from "npm:@supabase/supabase-js@2";

// AI auto-vetting for newly submitted prompts. Enforces a 200-character
// minimum on the prompt body and asks Lovable AI to judge overall quality.
// Requires an authenticated user. Returns { approved, reason }.

const MIN_BODY_CHARS = 200;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    // --- Auth: require an authenticated user ---
    const authHeader = req.headers.get("Authorization");
    const token = authHeader?.replace("Bearer ", "");
    if (!token) return json({ approved: false, reason: "Unauthorized" }, 401);
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: `Bearer ${token}` } } },
    );
    const { data: userData, error: userErr } = await supabase.auth.getUser(token);
    if (userErr || !userData?.user) return json({ approved: false, reason: "Unauthorized" }, 401);

    const { title, description, body, example_output } = await req.json();

    if (typeof body !== "string" || body.trim().length < MIN_BODY_CHARS) {
      return json({
        approved: false,
        reason: `Prompts must be at least ${MIN_BODY_CHARS} characters. Add more detail, structure and placeholders.`,
      });
    }

    // Respect the admin AI on/off switch (feature flag "ai_vetting").
    if (!(await aiFlagEnabled(supabase, "ai_vetting"))) {
      return json({ approved: true, reason: "Passed length check (AI vetting is turned off)." });
    }

    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) {
      // Fail open on length-only check if AI is unavailable.
      return json({ approved: true, reason: "Passed length check (AI review unavailable)." });
    }

    const prompt = `You are a strict quality reviewer for an AI prompt marketplace. Decide if this prompt listing is high quality, genuinely useful, well-structured, and not spam, gibberish, or a low-effort "act as a..." one-liner.

TITLE: ${String(title ?? "").slice(0, 300)}
DESCRIPTION: ${String(description ?? "").slice(0, 1000)}
PROMPT BODY: ${String(body).slice(0, 4000)}
EXAMPLE OUTPUT: ${String(example_output ?? "").slice(0, 1000)}

Respond ONLY with JSON: {"approved": boolean, "reason": "short explanation (max 200 chars)"}. Approve only if it would deliver real value to a buyer.`;

    const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
      }),
    });

    if (resp.status === 429) return json({ approved: false, reason: "Review temporarily rate-limited. Please try again shortly." });
    if (resp.status === 402) return json({ approved: true, reason: "Passed length check (AI credits exhausted)." });
    if (!resp.ok) {
      console.error("vet-prompt AI error", resp.status, await resp.text());
      return json({ approved: true, reason: "Passed length check (AI review unavailable)." });
    }

    const data = await resp.json();
    const content = data?.choices?.[0]?.message?.content ?? "{}";
    let parsed: { approved?: boolean; reason?: string } = {};
    try { parsed = JSON.parse(content); } catch { parsed = {}; }

    return json({
      approved: parsed.approved === true,
      reason: parsed.reason || (parsed.approved ? "Approved by AI review." : "Did not meet the quality bar."),
    });
  } catch (e) {
    console.error("vet-prompt error", (e as Error).message);
    return json({ approved: false, reason: "Could not vet the prompt. Please try again." }, 200);
  }
});

function json(obj: unknown, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

// Returns true unless an admin has explicitly turned the AI process off via a
// feature flag. Missing flag = enabled (preserves default behaviour).
async function aiFlagEnabled(supabase: ReturnType<typeof createClient>, key: string): Promise<boolean> {
  try {
    const { data } = await supabase.from("feature_flags").select("enabled").eq("key", key).maybeSingle();
    if (data && data.enabled === false) return false;
    return true;
  } catch {
    return true;
  }
}
