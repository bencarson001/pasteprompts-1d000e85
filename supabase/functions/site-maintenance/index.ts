import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

/**
 * Autonomous site-maintenance agent.
 * Runs on a schedule (pg_cron) and can also be triggered manually by an admin.
 * Tasks:
 *   1. Recompute trending scores for every prompt.
 *   2. Refresh the featured shelf (top prompts by trending score).
 *   3. AI-moderate pending submissions using Lovable AI (approve clearly-good,
 *      reject spam/unsafe; leave anything uncertain for a human).
 *   4. Write an audit record to maintenance_runs.
 */
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  // ---- Authentication: admins only -------------------------------------
  // This handler runs with the service-role key and can burn AI credits,
  // auto-moderate prompts, and reset featured content. It must never be
  // callable anonymously. Allow either an authenticated admin JWT or a
  // shared scheduler secret (MAINTENANCE_SECRET, used by pg_cron).
  const maintenanceSecret = Deno.env.get("MAINTENANCE_SECRET");
  const providedSecret = req.headers.get("x-maintenance-secret");
  const hasValidSecret = !!maintenanceSecret && providedSecret === maintenanceSecret;

  if (!hasValidSecret) {
    const authHeader = req.headers.get("Authorization");
    const token = authHeader?.replace("Bearer ", "");
    if (!token) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const { data: userData, error: userError } = await supabase.auth.getUser(token);
    if (userError || !userData?.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const { data: isAdmin } = await supabase.rpc("has_role", {
      _user_id: userData.user.id,
      _role: "admin",
    });
    if (!isAdmin) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  }

  const tasks: string[] = [];
  const summary: Record<string, unknown> = {};
  let ok = true;

  try {
    // 1. Trending recompute -------------------------------------------------
    try {
      await supabase.rpc("recompute_trending");
      tasks.push("recompute_trending");
      summary.trending = "recomputed";
    } catch (e) {
      ok = false;
      summary.trendingError = (e as Error).message;
    }

    // 2. Refresh featured shelf (top 8 by trending) -------------------------
    try {
      const { data: top } = await supabase
        .from("prompts")
        .select("id")
        .eq("status", "approved")
        .order("trending_score", { ascending: false })
        .limit(8);
      const topIds = (top ?? []).map((p) => p.id);
      // Unfeature everything, then feature the current top performers.
      await supabase.from("prompts").update({ featured: false }).eq("featured", true);
      if (topIds.length) {
        await supabase.from("prompts").update({ featured: true }).in("id", topIds);
      }
      tasks.push("refresh_featured");
      summary.featured = topIds.length;
    } catch (e) {
      ok = false;
      summary.featuredError = (e as Error).message;
    }

    // 3. AI moderation of pending prompts -----------------------------------
    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    const { data: modFlag } = await supabase.from("feature_flags").select("enabled").eq("key", "ai_moderation").maybeSingle();
    const aiModerationOn = !(modFlag && modFlag.enabled === false);
    if (apiKey && aiModerationOn) {
      try {
        const { data: pending } = await supabase
          .from("prompts")
          .select("id, title, description, body")
          .eq("status", "pending")
          .order("created_at", { ascending: true })
          .limit(15);

        let approved = 0;
        let rejected = 0;
        let flagged = 0;

        for (const p of pending ?? []) {
          const verdict = await moderate(apiKey, p);
          if (verdict === "approve") {
            await supabase.from("prompts").update({ status: "approved" }).eq("id", p.id);
            approved++;
          } else if (verdict === "reject") {
            await supabase.from("prompts").update({ status: "rejected" }).eq("id", p.id);
            rejected++;
          } else {
            flagged++; // leave as pending for a human
          }
        }
        tasks.push("ai_moderation");
        summary.moderation = { reviewed: pending?.length ?? 0, approved, rejected, flagged };
      } catch (e) {
        summary.moderationError = (e as Error).message;
      }
    }

    // 4. Remove stale creator listings (no sales for 2 months) and grant
    //    the creator a replacement upload credit. Platform (admin-owned)
    //    prompts and prompts with sales are never touched here.
    try {
      const { data: removed } = await supabase.rpc("cleanup_stale_creator_prompts");
      tasks.push("cleanup_stale_creator_prompts");
      summary.staleCreatorPromptsRemoved = removed ?? 0;
    } catch (e) {
      summary.cleanupError = (e as Error).message;
    }

    // 5. Audit log ----------------------------------------------------------
    await supabase.from("maintenance_runs").insert({ tasks, summary, ok });

    return new Response(JSON.stringify({ ok, tasks, summary }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("site-maintenance error:", (e as Error).message);
    await supabase.from("maintenance_runs").insert({ tasks, summary: { fatal: (e as Error).message }, ok: false });
    return new Response(JSON.stringify({ ok: false, error: "An unexpected error occurred." }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

async function moderate(
  apiKey: string,
  prompt: { title: string; description: string; body: string },
): Promise<"approve" | "reject" | "flag"> {
  const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages: [
        {
          role: "system",
          content:
            "You are a strict but fair content moderator for an AI-prompt marketplace. " +
            "Reply with EXACTLY one word: APPROVE, REJECT, or FLAG. " +
            "APPROVE: a genuine, well-formed, useful, safe prompt. " +
            "REJECT: spam, gibberish, plagiarism, illegal, hateful, sexual, or clearly low-effort content. " +
            "FLAG: anything you are unsure about (a human will review).",
        },
        {
          role: "user",
          content: `TITLE: ${prompt.title}\nDESCRIPTION: ${prompt.description}\nPROMPT BODY:\n${(prompt.body ?? "").slice(0, 4000)}`,
        },
      ],
      temperature: 0,
    }),
  });

  if (!res.ok) return "flag";
  const json = await res.json();
  const text = (json?.choices?.[0]?.message?.content ?? "").toUpperCase();
  if (text.includes("APPROVE")) return "approve";
  if (text.includes("REJECT")) return "reject";
  return "flag";
}
