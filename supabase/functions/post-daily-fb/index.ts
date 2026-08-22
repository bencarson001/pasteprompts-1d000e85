import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { createClient } from "npm:@supabase/supabase-js@2";
import { publishToFacebook } from "../_shared/facebook.ts";

/**
 * Posts one random unposted Facebook post from the current cycle in
 * fb_post_pool. When every post in the current cycle is used, it starts a new
 * cycle (a shuffled repeat of the same 30 items) so no post repeats within a
 * 30-day window. Consumes zero AI credits.
 *
 * Requires Facebook Page credentials as secrets:
 *   FACEBOOK_PAGE_ID, FACEBOOK_PAGE_ACCESS_TOKEN
 * If the token isn't set, the post is marked posted="dry-run" so the schedule
 * keeps rotating without failing.
 *
 * Auth: admin JWT or MAINTENANCE_SECRET header (for pg_cron).
 */

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  if (!(await authorize(req, supabase))) return json({ error: "Unauthorized" }, 401);

  // Scheduled invocations run hourly. The admin-configured schedule
  // (fb_autopilot_schedule) decides which local hour / weekdays publish and for
  // how many weeks. Manual/admin calls bypass every guard.
  const body = await req.json().catch(() => ({} as Record<string, unknown>));
  const forcedId = typeof body?.post_id === "string" ? (body.post_id as string) : null;

  if (body?.scheduled) {
    const { data: sched } = await supabase
      .from("fb_autopilot_schedule")
      .select("enabled, days_of_week, post_hour, start_date, weeks")
      .eq("id", 1)
      .maybeSingle();

    if (sched && sched.enabled === false) return json({ ok: true, skipped: "autopilot disabled" });

    const postHour = (sched?.post_hour as number | undefined) ?? 18;
    const days = (sched?.days_of_week as number[] | undefined) ?? [0, 1, 2, 3, 4, 5, 6];

    const london = new Intl.DateTimeFormat("en-GB", {
      timeZone: "Europe/London", hour: "2-digit", hour12: false, weekday: "short",
      year: "numeric", month: "2-digit", day: "2-digit",
    }).formatToParts(new Date());
    const part = (t: string) => london.find((p) => p.type === t)?.value ?? "";
    const hour = Number(part("hour")) % 24;
    if (hour !== postHour) return json({ ok: true, skipped: `not ${postHour}:00 Europe/London` });

    const todayLondon = `${part("year")}-${part("month")}-${part("day")}`;
    const dow = new Date(`${todayLondon}T12:00:00Z`).getUTCDay();
    if (!days.includes(dow)) return json({ ok: true, skipped: "not a scheduled weekday" });

    if (sched?.start_date && sched?.weeks) {
      const start = new Date(`${sched.start_date}T00:00:00Z`).getTime();
      const end = start + (sched.weeks as number) * 7 * 86400000;
      const today = new Date(`${todayLondon}T00:00:00Z`).getTime();
      if (today < start) return json({ ok: true, skipped: "schedule not started" });
      if (today >= end) return json({ ok: true, skipped: "schedule finished" });
    }

    const { data: recent } = await supabase
      .from("fb_post_pool")
      .select("posted_at")
      .not("posted_at", "is", null)
      .order("posted_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (recent?.posted_at) {
      const lastLondon = new Intl.DateTimeFormat("en-CA", {
        timeZone: "Europe/London", year: "numeric", month: "2-digit", day: "2-digit",
      }).format(new Date(recent.posted_at as string));
      if (lastLondon === todayLondon) return json({ ok: true, skipped: "already posted today" });
    }
  }

  type Pick = { id: string; content: string; has_media: boolean; emoji_only: boolean; image_url: string | null; cycle_id?: number };

  let pick: Pick | null = null;
  let activeCycle = 0;

  if (forcedId) {
    // Admin asked for one specific post from the pool.
    const { data: one } = await supabase
      .from("fb_post_pool")
      .select("id, content, has_media, emoji_only, image_url, cycle_id")
      .eq("id", forcedId)
      .maybeSingle();
    if (!one) return json({ error: "Post not found" }, 404);
    pick = one as Pick;
    activeCycle = (one.cycle_id as number) ?? 0;
  } else {
    // Find current cycle
    const { data: cur } = await supabase
      .from("fb_post_pool")
      .select("cycle_id")
      .order("cycle_id", { ascending: false })
      .limit(1)
      .maybeSingle();
    const cycleId = (cur?.cycle_id as number | undefined) ?? 0;
    if (!cycleId) return json({ error: "No post pool. Generate one first." }, 400);
    activeCycle = cycleId;

    // Try to pick an unposted post in this cycle
    const { data: candidates } = await supabase
      .from("fb_post_pool")
      .select("id, content, has_media, emoji_only, image_url")
      .eq("cycle_id", cycleId)
      .is("posted_at", null)
      .limit(200);

    if (candidates && candidates.length > 0) {
      pick = candidates[Math.floor(Math.random() * candidates.length)] as Pick;
    } else {
      // Cycle exhausted → ask the AI for 30 brand-new posts, then post one.
      const genRes = await fetch(`${Deno.env.get("SUPABASE_URL")}/functions/v1/generate-fb-post-pool`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
          "x-maintenance-secret": Deno.env.get("MAINTENANCE_SECRET") ?? "",
        },
        body: "{}",
      });
      const genBody = await genRes.json().catch(() => ({}));
      if (!genRes.ok || !genBody?.ok) {
        return json({ error: `Pool exhausted and regeneration failed: ${genBody?.error ?? genRes.status}` }, 502);
      }
      const nextCycle = genBody.cycle_id as number;
      const { data: fresh } = await supabase
        .from("fb_post_pool")
        .select("id, content, has_media, emoji_only, image_url")
        .eq("cycle_id", nextCycle)
        .is("posted_at", null);
      if (!fresh?.length) return json({ error: "Regenerated pool is empty" }, 500);
      activeCycle = nextCycle;
      pick = fresh[Math.floor(Math.random() * fresh.length)] as Pick;
    }
  }
  if (!pick) return json({ error: "Nothing to post" }, 500);


  // Look up the cycle's "attach media" toggle (defaults to true if row missing)
  const { data: cycleRow } = await supabase
    .from("fb_autopilot_cycles")
    .select("attach_media")
    .eq("cycle_id", activeCycle)
    .maybeSingle();
  const attachMedia = cycleRow ? !!cycleRow.attach_media : true;
  const useImage = attachMedia && !!pick.image_url;

  // Publish to the Page, then share to 9 random active groups.
  const published = await publishToFacebook(
    supabase as never,
    pick.content,
    useImage ? pick.image_url : null,
  );
  const fbPostId = published.fbPostId;
  const groupsPosted = published.groups.filter((g) => g.ok).length;
  const groupErrors = published.groups.filter((g) => !g.ok).map((g) => `${g.group_id}: ${g.error}`);
  const errorText = published.error
    ?? (groupErrors.length ? `groups failed → ${groupErrors.join(" | ")}`.slice(0, 500) : null);

  await supabase
    .from("fb_post_pool")
    .update({
      posted_at: new Date().toISOString(),
      fb_post_id: fbPostId,
      last_error: errorText,
    })
    .eq("id", pick.id);

  return json({ ok: !errorText || errorText.startsWith("dry-run"), id: pick.id, cycle_id: activeCycle, fb_post_id: fbPostId, with_image: useImage, groups_posted: groupsPosted, groups: published.groups, error: errorText });
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
