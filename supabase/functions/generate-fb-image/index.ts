import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { createClient } from "npm:@supabase/supabase-js@2";

/**
 * Generates images for Facebook autopilot posts that contain an "[Image: ...]"
 * brief, using Pollinations (free, no API key) so no Lovable AI credits are
 * consumed. The rendered image is stored in the private `fb-media` bucket and a
 * long-lived signed URL is written to fb_post_pool.image_url so the daily
 * poster can attach it.
 *
 * Body: { post_id: "uuid" }  → single post
 *       { all: true, cycle_id?: number } → every [Image:...] post missing an image
 * Auth: admin JWT or MAINTENANCE_SECRET header.
 */

const BUCKET = "fb-media";
const SIGNED_URL_TTL = 60 * 60 * 24 * 365 * 5; // 5 years

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  if (!(await authorize(req, supabase))) return json({ error: "Unauthorized" }, 401);

  const body = await req.json().catch(() => ({} as Record<string, unknown>));
  const postId = typeof body?.post_id === "string" ? body.post_id : null;
  const doAll = body?.all === true;
  const force = body?.force === true;

  let rows: Array<{ id: string; content: string; image_url: string | null }> = [];

  if (postId) {
    const { data } = await supabase
      .from("fb_post_pool")
      .select("id, content, image_url")
      .eq("id", postId)
      .maybeSingle();
    if (!data) return json({ error: "Post not found" }, 404);
    rows = [data as typeof rows[number]];
  } else if (doAll) {
    let cycleId = typeof body?.cycle_id === "number" ? (body.cycle_id as number) : null;
    if (!cycleId) {
      const { data: cur } = await supabase
        .from("fb_post_pool")
        .select("cycle_id")
        .order("cycle_id", { ascending: false })
        .limit(1)
        .maybeSingle();
      cycleId = (cur?.cycle_id as number | undefined) ?? null;
    }
    if (!cycleId) return json({ error: "No post pool yet" }, 400);
    const { data } = await supabase
      .from("fb_post_pool")
      .select("id, content, image_url")
      .eq("cycle_id", cycleId)
      .limit(300);
    rows = ((data ?? []) as typeof rows).filter(
      (r) => imageBrief(r.content) !== null && (force || !r.image_url),
    );
  } else {
    return json({ error: "Provide post_id or all:true" }, 400);
  }

  const results: Array<{ id: string; ok: boolean; image_url?: string; error?: string }> = [];

  for (const row of rows) {
    const brief = imageBrief(row.content);
    if (!brief) {
      results.push({ id: row.id, ok: false, error: "No [Image: ...] brief in this post" });
      continue;
    }
    try {
      const url = await renderAndStore(supabase, row.id, brief);
      await supabase.from("fb_post_pool").update({ image_url: url }).eq("id", row.id);
      results.push({ id: row.id, ok: true, image_url: url });
    } catch (e) {
      results.push({ id: row.id, ok: false, error: (e as Error).message });
    }
  }

  const generated = results.filter((r) => r.ok).length;
  return json({ ok: generated > 0 || results.length === 0, generated, total: results.length, results });
});

/** Pulls the brief out of "[Image: bright neon prompt card]" (case-insensitive). */
function imageBrief(content: string): string | null {
  const m = content.match(/\[\s*image\s*:\s*([^\]]+)\]/i);
  const brief = m?.[1]?.trim();
  return brief && brief.length > 2 ? brief : null;
}

/**
 * Every image is a Paste Prompts branded graphic drawn deterministically as
 * SVG and rasterised to PNG — no AI image model, no credits, and no chance of
 * an off-brand result (free text-to-image providers kept rendering stock
 * portraits instead of the marketplace).
 *
 * The post's "[Image: ...]" brief drives the headline and the mini UI scene.
 */

/** Wraps text to `max` chars per line, up to `lines` lines. */
function wrap(text: string, max: number, lines: number): string[] {
  const words = text.replace(/\s+/g, " ").trim().split(" ");
  const out: string[] = [];
  let cur = "";
  for (const w of words) {
    if ((cur + " " + w).trim().length > max) {
      out.push(cur.trim());
      cur = w;
      if (out.length === lines) break;
    } else cur = `${cur} ${w}`;
  }
  if (out.length < lines && cur.trim()) out.push(cur.trim());
  const last = out.length - 1;
  if (last >= 0 && words.join(" ").length > out.join(" ").length) out[last] = `${out[last]}…`;
  return out;
}

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/** A dark app-window frame with a URL bar, used to host every scene. */
function windowFrame(path: string, inner: string, title: string): string {
  return (
    `<rect x="96" y="620" width="1008" height="500" rx="26" fill="#111730" stroke="#8b5cf6" stroke-opacity="0.45"/>` +
    `<rect x="96" y="620" width="1008" height="72" rx="26" fill="#171f3d"/>` +
    `<rect x="96" y="668" width="1008" height="24" fill="#171f3d"/>` +
    `<circle cx="132" cy="656" r="9" fill="#ef4444"/><circle cx="160" cy="656" r="9" fill="#f59e0b"/><circle cx="188" cy="656" r="9" fill="#22c55e"/>` +
    `<rect x="220" y="638" width="620" height="38" rx="19" fill="#0b1020" stroke="#8b5cf6" stroke-opacity="0.25"/>` +
    `<text x="244" y="663" font-family="Inter" font-size="21" font-weight="500" fill="#a5b4fc">pasteprompts.co.uk${esc(path)}</text>` +
    `<text x="1064" y="664" font-family="Inter" font-size="22" font-weight="700" fill="#ffffff" fill-opacity="0.55" text-anchor="end">${esc(title)}</text>` +
    inner
  );
}

const star = (x: number, y: number, s = 30) =>
  `<text x="${x}" y="${y}" font-family="Inter" font-size="${s}" fill="#fbbf24">★</text>`;

/** Picks a detailed on-brand scene from the brief. */
function sceneFor(brief: string): string {
  const b = brief.toLowerCase();
  const row = (x: number, y: number, w: number, h: number, o = 0.05) =>
    `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="16" fill="#ffffff" fill-opacity="${o}" stroke="#8b5cf6" stroke-opacity="0.22"/>`;

  if (/leader ?board|top[- ]earn|creator|earn|income|payout|sales|revenue|money|paid|dashboard/.test(b)) {
    const people = [
      ["Amelia R.", "142 prompt sales", "£2,480"],
      ["Jordan K.", "118 prompt sales", "£1,915"],
      ["Priya S.", "97 prompt sales", "£1,540"],
      ["Marcus T.", "83 prompt sales", "£1,210"],
    ];
    let rows = `<text x="132" y="742" font-family="Inter" font-size="26" font-weight="700" fill="#ffffff">Top creators this month</text>`;
    people.forEach(([name, sub, amt], i) => {
      const y = 762 + i * 82;
      rows +=
        row(128, y, 600, 70) +
        `<circle cx="170" cy="${y + 35}" r="22" fill="url(#g1)"/>` +
        `<text x="170" y="${y + 44}" font-family="Inter" font-size="22" font-weight="800" fill="#ffffff" text-anchor="middle">${i + 1}</text>` +
        `<text x="210" y="${y + 30}" font-family="Inter" font-size="24" font-weight="700" fill="#ffffff">${name}</text>` +
        `<text x="210" y="${y + 55}" font-family="Inter" font-size="19" font-weight="500" fill="#ffffff" fill-opacity="0.5">${sub}</text>` +
        `<rect x="592" y="${y + 20}" width="112" height="32" rx="16" fill="#22c55e" fill-opacity="0.9"/>` +
        `<text x="648" y="${y + 42}" font-family="Inter" font-size="20" font-weight="800" fill="#06240f" text-anchor="middle">${amt}</text>`;
    });
    let bars = "";
    const labels = ["Apr", "May", "Jun", "Jul", "Aug"];
    for (let i = 0; i < 5; i++) {
      const h = 60 + i * 42;
      bars +=
        `<rect x="${790 + i * 58}" y="${1040 - h}" width="36" height="${h}" rx="10" fill="url(#g1)"/>` +
        `<text x="${808 + i * 58}" y="1070" font-family="Inter" font-size="17" font-weight="600" fill="#ffffff" fill-opacity="0.45" text-anchor="middle">${labels[i]}</text>`;
    }
    const panel =
      row(760, 730, 320, 360, 0.04) +
      `<text x="790" y="770" font-family="Inter" font-size="22" font-weight="700" fill="#ffffff">Monthly payouts</text>` +
      `<text x="790" y="812" font-family="Inter" font-size="40" font-weight="800" fill="#22c55e">£8,940</text>` +
      `<text x="790" y="840" font-family="Inter" font-size="18" font-weight="600" fill="#ffffff" fill-opacity="0.45">+38% vs last month</text>`;
    return windowFrame("/creators", rows + panel + bars, "Earnings");
  }

  if (/copy|one[- ]click|button|paste/.test(b)) {
    const inner =
      `<text x="132" y="742" font-family="Inter" font-size="30" font-weight="800" fill="#ffffff">High-converting ad copy generator</text>` +
      `<rect x="128" y="762" width="150" height="32" rx="16" fill="#8b5cf6" fill-opacity="0.85"/>` +
      `<text x="203" y="784" font-family="Inter" font-size="18" font-weight="700" fill="#ffffff" text-anchor="middle">ChatGPT</text>` +
      `<rect x="292" y="762" width="150" height="32" rx="16" fill="#ffffff" fill-opacity="0.1"/>` +
      `<text x="367" y="784" font-family="Inter" font-size="18" font-weight="600" fill="#ffffff" fill-opacity="0.7" text-anchor="middle">Marketing</text>` +
      star(462, 787, 26) + `<text x="492" y="787" font-family="Inter" font-size="18" font-weight="700" fill="#ffffff" fill-opacity="0.7">4.9 (212)</text>` +
      row(128, 816, 700, 200, 0.05) +
      `<text x="156" y="852" font-family="Inter" font-size="20" font-weight="500" fill="#ffffff" fill-opacity="0.72">You are a senior direct-response copywriter.</text>` +
      `<text x="156" y="884" font-family="Inter" font-size="20" font-weight="500" fill="#ffffff" fill-opacity="0.72">Write 5 Facebook ad variations for [PRODUCT],</text>` +
      `<text x="156" y="916" font-family="Inter" font-size="20" font-weight="500" fill="#ffffff" fill-opacity="0.72">audience [AUDIENCE], tone [TONE]. Include a</text>` +
      `<text x="156" y="948" font-family="Inter" font-size="20" font-weight="500" fill="#ffffff" fill-opacity="0.72">hook, 2 benefits and a single clear CTA…</text>` +
      `<rect x="860" y="816" width="200" height="64" rx="32" fill="url(#g1)"/>` +
      `<text x="960" y="857" font-family="Inter" font-size="25" font-weight="800" fill="#ffffff" text-anchor="middle">Copy prompt</text>` +
      `<rect x="860" y="898" width="200" height="44" rx="22" fill="#22c55e" fill-opacity="0.18" stroke="#22c55e" stroke-opacity="0.6"/>` +
      `<text x="960" y="927" font-family="Inter" font-size="20" font-weight="700" fill="#22c55e" text-anchor="middle">✓ Copied</text>` +
      `<text x="156" y="1000" font-family="Inter" font-size="19" font-weight="600" fill="#ffffff" fill-opacity="0.4">1,482 copies · Free to use</text>`;
    return windowFrame("/prompt/ad-copy-generator", inner, "Prompt");
  }

  if (/review|star|rating|proof|testimonial/.test(b)) {
    const reviews = [
      ["Verified buyer", "Saved me hours — output was usable first try."],
      ["Verified buyer", "Best £4 I've spent on ChatGPT prompts."],
      ["Verified buyer", "Clear placeholders, works in Claude too."],
    ];
    let inner =
      `<text x="132" y="746" font-family="Inter" font-size="30" font-weight="800" fill="#ffffff">Reviews</text>` +
      `<text x="132" y="806" font-family="Inter" font-size="56" font-weight="800" fill="#ffffff">4.9</text>`;
    for (let i = 0; i < 5; i++) inner += star(228 + i * 42, 802, 40);
    inner += `<text x="440" y="800" font-family="Inter" font-size="20" font-weight="600" fill="#ffffff" fill-opacity="0.5">based on 212 verified purchases</text>`;
    reviews.forEach(([who, text], i) => {
      const y = 836 + i * 84;
      inner +=
        row(128, y, 952, 72) +
        `<circle cx="168" cy="${y + 36}" r="20" fill="url(#g1)"/>` +
        star(196, y + 32, 22) + star(220, y + 32, 22) + star(244, y + 32, 22) + star(268, y + 32, 22) + star(292, y + 32, 22) +
        `<text x="330" y="${y + 32}" font-family="Inter" font-size="18" font-weight="700" fill="#22c55e">${who}</text>` +
        `<text x="196" y="${y + 60}" font-family="Inter" font-size="20" font-weight="500" fill="#ffffff" fill-opacity="0.7">${text}</text>`;
    });
    return windowFrame("/prompt/reviews", inner, "Ratings");
  }

  // Default: marketplace grid of real prompt cards
  const cards = [
    ["Marketing", "Ad copy generator", "£4.99", "4.9"],
    ["Image Gen", "Midjourney style kit", "£3.49", "4.8"],
    ["Coding", "Bug-fix pair partner", "Free", "5.0"],
    ["Business", "Investor pitch deck", "£6.99", "4.9"],
    ["Writing", "Blog outline builder", "Free", "4.7"],
    ["Productivity", "Weekly planner GPT", "£2.99", "4.8"],
  ];
  let grid = `<text x="132" y="742" font-family="Inter" font-size="26" font-weight="700" fill="#ffffff">Browse prompts by category</text>`;
  cards.forEach(([cat, name, price, rating], i) => {
    const x = 128 + (i % 3) * 320;
    const y = 762 + Math.floor(i / 3) * 168;
    grid +=
      row(x, y, 296, 148, 0.05) +
      `<rect x="${x + 22}" y="${y + 20}" width="${28 + cat.length * 10}" height="28" rx="14" fill="#8b5cf6" fill-opacity="0.85"/>` +
      `<text x="${x + 36 + cat.length * 5}" y="${y + 40}" font-family="Inter" font-size="16" font-weight="700" fill="#ffffff" text-anchor="middle">${cat}</text>` +
      `<text x="${x + 22}" y="${y + 82}" font-family="Inter" font-size="22" font-weight="700" fill="#ffffff">${name}</text>` +
      `<text x="${x + 22}" y="${y + 122}" font-family="Inter" font-size="22" font-weight="800" fill="#22c55e">${price}</text>` +
      star(x + 190, y + 122, 22) +
      `<text x="${x + 216}" y="${y + 122}" font-family="Inter" font-size="19" font-weight="700" fill="#ffffff" fill-opacity="0.6">${rating}</text>`;
  });
  return windowFrame("/browse", grid, "Marketplace");
}


function buildSvg(brief: string): string {
  // Structured briefs keep the concise public headline before "| Scene:".
  const displayHeadline = brief.split(/\|\s*scene\s*:/i)[0]?.trim() || brief;
  const headline = wrap(displayHeadline.replace(/^(a|an|the)\s+/i, ""), 26, 3).map(esc);
  const top = headline.length === 3 ? 288 : headline.length === 2 ? 330 : 380;
  const lines = headline
    .map((l, i) => `<text x="120" y="${top + i * 82}" font-family="Inter" font-size="70" font-weight="800" fill="#ffffff">${l}</text>`)
    .join("");
  const urlY = top + (headline.length - 1) * 82 + 62;


  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="1200" viewBox="0 0 1200 1200">
  <defs>
    <linearGradient id="g1" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#8b5cf6"/><stop offset="100%" stop-color="#3b82f6"/>
    </linearGradient>
    <radialGradient id="glow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#8b5cf6" stop-opacity="0.55"/><stop offset="100%" stop-color="#8b5cf6" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="1200" height="1200" fill="#0b1020"/>
  <circle cx="1050" cy="150" r="420" fill="url(#glow)"/>
  <circle cx="120" cy="1120" r="360" fill="url(#glow)"/>
  <rect x="112" y="112" width="176" height="60" rx="30" fill="url(#g1)"/>
  <text x="200" y="153" font-family="Inter" font-size="30" font-weight="800" fill="#ffffff" text-anchor="middle">Paste</text>
  <text x="308" y="153" font-family="Inter" font-size="30" font-weight="800" fill="#c4b5fd">Prompts</text>
  ${lines}
  <text x="120" y="${urlY}" font-family="Inter" font-size="32" font-weight="600" fill="#a5b4fc">pasteprompts.co.uk</text>
  ${sceneFor(brief)}
</svg>`;
}

/** Loads the resvg wasm module + Inter fonts once per isolate. */
let renderer: Promise<{ Resvg: new (svg: string, opts?: unknown) => { render: () => { asPng: () => Uint8Array } }; fonts: Uint8Array[] }> | null = null;
function getRenderer() {
  if (!renderer) {
    renderer = (async () => {
      const { initWasm, Resvg } = await import("npm:@resvg/resvg-wasm@2.6.2");
      await initWasm(fetch("https://unpkg.com/@resvg/resvg-wasm@2.6.2/index_bg.wasm"));
      const urls = [
        "https://cdn.jsdelivr.net/fontsource/fonts/inter@latest/latin-800-normal.ttf",
        "https://cdn.jsdelivr.net/fontsource/fonts/inter@latest/latin-700-normal.ttf",
        "https://cdn.jsdelivr.net/fontsource/fonts/inter@latest/latin-600-normal.ttf",
        "https://cdn.jsdelivr.net/fontsource/fonts/inter@latest/latin-500-normal.ttf",
        "https://cdn.jsdelivr.net/fontsource/fonts/inter@latest/latin-400-normal.ttf",
      ];

      const fonts: Uint8Array[] = [];
      for (const u of urls) {
        const r = await fetch(u);
        if (r.ok) fonts.push(new Uint8Array(await r.arrayBuffer()));
      }
      return { Resvg, fonts };
    })();
  }
  return renderer;
}

async function renderAndStore(
  supabase: ReturnType<typeof createClient>,
  postId: string,
  brief: string,
): Promise<string> {
  const { Resvg, fonts } = await getRenderer();
  const svg = buildSvg(brief);
  const resvg = new Resvg(svg, {
    font: { fontBuffers: fonts, defaultFontFamily: "Inter", loadSystemFonts: false },
  });
  const bytes = resvg.render().asPng() as Uint8Array;
  if (bytes.byteLength < 1000) throw new Error("Rendered image was empty");

  const stamp = Date.now();
  const path = `pool/${postId}-${stamp}.png`;
  const { error: upErr } = await supabase.storage
    .from(BUCKET)
    .upload(path, bytes, { contentType: "image/png", upsert: true });
  if (upErr) throw new Error(upErr.message);

  const { data: signed, error: sErr } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(path, SIGNED_URL_TTL);
  if (sErr || !signed?.signedUrl) throw new Error(sErr?.message ?? "Could not sign image URL");
  return signed.signedUrl;
}


function json(obj: unknown, status = 200) {
  return new Response(JSON.stringify(obj), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
}

async function authorize(req: Request, supabase: ReturnType<typeof createClient>): Promise<boolean> {
  const providedSecret = req.headers.get("x-maintenance-secret");
  if (providedSecret) {
    const envSecret = Deno.env.get("MAINTENANCE_SECRET");
    if (envSecret && providedSecret === envSecret) return true;
  }
  const token = req.headers.get("Authorization")?.replace("Bearer ", "");
  if (!token) return false;
  const { data: u } = await supabase.auth.getUser(token);
  if (!u?.user) return false;
  const { data: isAdmin } = await supabase.rpc("has_role", { _user_id: u.user.id, _role: "admin" });
  return !!isAdmin;
}
