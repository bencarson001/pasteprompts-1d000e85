import { supabase } from "@/integrations/supabase/client";
import { db } from "@/lib/db";
import { getStoredLocalLogs, clearLocalLogs } from "@/lib/logger";

/* ---------------- Audit ---------------- */
export async function logAdminAction(action: string, target_type?: string, target_id?: string, detail?: unknown) {
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return;
  await supabase.from("admin_audit").insert({
    admin_id: auth.user.id,
    action,
    target_type: target_type ?? null,
    target_id: target_id ?? null,
    detail: (detail ?? null) as never,
  }).then(() => {}, () => {});
}

export async function fetchAuditLog() {
  const { data } = await supabase.from("admin_audit").select("*").order("created_at", { ascending: false }).limit(200);
  return data ?? [];
}

/* ---------------- Analytics ---------------- */
export interface TopPromptAnalytics {
  id?: string;
  title: string;
  slug: string;
  category?: string;
  views: number;
  sales_count: number;
  copies_count: number;
  ctr: number;
}

export interface CategoryAnalytics {
  name: string;
  slug: string;
  views: number;
  prompts_count: number;
  color?: string;
}

export interface AdminAnalytics {
  days: number;
  page_views: number;
  prompt_views: number;
  unique_visitors: number;
  new_visitors: number;
  repeat_visitors: number;
  sales: number;
  revenue_pence: number;
  free_claims: number;
  repeat_buyers: number;
  total_buyers: number;
  avg_session_seconds: number;
  bounce_rate_pct: number;
  conversion_rate_pct: number;
  daily: { day: string; page_views: number; prompt_views: number; visitors: number }[];
  traffic_sources: { name: string; value: number; color: string }[];
  top_prompts: TopPromptAnalytics[];
  geography: { country: string; code: string; percent: number; color: string }[];
  funnel: { step: string; count: number; percent: number }[];
  category_performance: CategoryAnalytics[];
  seo_signals: {
    pages_indexed: number;
    total_prompts: number;
    avg_time_seconds: number;
    pages_per_session: number;
    mobile_pct: number;
    desktop_pct: number;
  };
}

export async function fetchAdminAnalytics(days = 30): Promise<AdminAnalytics> {
  const sinceDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  const sinceIso = sinceDate.toISOString();

  // Try RPC first
  let rpcData: Partial<AdminAnalytics> | null = null;
  try {
    const { data, error } = await supabase.rpc("admin_analytics", { _days: days } as never);
    if (!error && data) {
      rpcData = data as unknown as Partial<AdminAnalytics>;
    }
  } catch (e) {
    console.warn("fetchAdminAnalytics RPC note:", e);
  }

  // Fetch live tables in parallel for complete, real-time fidelity
  try {
    // The API returns at most 1000 rows per request, so page through everything.
    const fetchAll = async <T,>(build: (from: number, to: number) => PromiseLike<{ data: T[] | null; error: unknown }>, cap = 100000) => {
      const out: T[] = [];
      for (let from = 0; from < cap; from += 1000) {
        const { data, error } = await build(from, from + 999);
        if (error) throw error;
        out.push(...(data || []));
        if (!data || data.length < 1000) break;
      }
      return out;
    };
    const [promptsData, categoriesRes, purchasesData, eventsData] = await Promise.all([
      fetchAll((a, b) =>
        supabase
          .from("prompts")
          .select("id, title, slug, views, sales_count, copies_count, price_pence, is_free, created_at, category:categories(name, slug)")
          .order("views", { ascending: false })
          .order("id")
          .range(a, b)),
      supabase.from("categories").select("id, name, slug"),
      fetchAll<{ id: string; amount_pence: number; is_free: boolean; buyer_id: string; created_at: string }>((a, b) => db.from("purchases").select("id, amount_pence, is_free, buyer_id, created_at").gte("created_at", sinceIso).order("id").range(a, b)),
      fetchAll((a, b) =>
        supabase
          .from("analytics_events")
          .select("id, event_type, visitor_id, session_id, path, is_new_visitor, referrer, created_at")
          .gte("created_at", sinceIso)
          .order("created_at")
          .order("id")
          .range(a, b)),
    ]);
    const promptsRes = { data: promptsData };
    const purchasesRes = { data: purchasesData };
    const eventsRes = { data: eventsData };

    const prompts = promptsRes.data || [];
    const categories = categoriesRes.data || [];
    const purchases = purchasesRes.data || [];
    const events = eventsRes.data || [];

    // Calculate views & metrics
    const promptViewsTotal = prompts.reduce((sum, p) => sum + (Number(p.views) || 0), 0);
    const totalSalesCount = prompts.reduce((sum, p) => sum + (Number(p.sales_count) || 0), 0);
    const totalCopiesCount = prompts.reduce((sum, p) => sum + (Number(p.copies_count) || 0), 0);
    const totalRevenuePence = purchases.reduce((sum, p) => sum + (Number(p.amount_pence) || 0), 0);

    // Event stats if analytics_events has rows
    const eventPageViews = events.filter((e) => e.event_type === "page_view").length;
    const eventPromptViews = events.filter((e) => e.event_type === "prompt_view").length;
    const eventUniqueVisitors = new Set(events.map((e) => e.visitor_id)).size;
    const eventNewVisitors = events.filter((e) => e.is_new_visitor).length;

    // ---- Real metrics only (from analytics_events + purchases) ----
    const pageViews = Math.max(eventPageViews, Number(rpcData?.page_views ?? 0));
    const promptViews = Math.max(eventPromptViews, Number(rpcData?.prompt_views ?? 0));
    const uniqueVisitors = Math.max(eventUniqueVisitors, Number(rpcData?.unique_visitors ?? 0));
    const newVisitors = Math.min(
      uniqueVisitors,
      Math.max(new Set(events.filter((e) => e.is_new_visitor).map((e) => e.visitor_id)).size, Number(rpcData?.new_visitors ?? 0)),
    );
    void eventNewVisitors;
    const repeatVisitors = Math.max(0, uniqueVisitors - newVisitors);

    // Sessions
    const sessions = new Map<string, { first: number; last: number; pages: number }>();
    for (const e of events) {
      const key = e.session_id || e.visitor_id;
      const t = new Date(e.created_at).getTime();
      const s = sessions.get(key) || { first: t, last: t, pages: 0 };
      s.first = Math.min(s.first, t);
      s.last = Math.max(s.last, t);
      if (e.event_type === "page_view" || e.event_type === "prompt_view") s.pages += 1;
      sessions.set(key, s);
    }
    const sessionList = [...sessions.values()];
    const avgSessionSeconds = sessionList.length
      ? Math.round(sessionList.reduce((a, s) => a + (s.last - s.first) / 1000, 0) / sessionList.length)
      : 0;
    const bounceRate = sessionList.length
      ? Math.round((sessionList.filter((s) => s.pages <= 1).length / sessionList.length) * 100)
      : 0;
    const pagesPerSession = sessionList.length
      ? Number((sessionList.reduce((a, s) => a + s.pages, 0) / sessionList.length).toFixed(1))
      : 0;

    // Purchases
    const paid = purchases.filter((p: { is_free: boolean }) => !p.is_free);
    const free = purchases.filter((p: { is_free: boolean }) => p.is_free);
    const buyerCounts = new Map<string, number>();
    for (const p of purchases as { buyer_id: string }[]) buyerCounts.set(p.buyer_id, (buyerCounts.get(p.buyer_id) || 0) + 1);
    const totalBuyers = buyerCounts.size;
    const repeatBuyers = [...buyerCounts.values()].filter((n) => n > 1).length;
    const conversionRate = uniqueVisitors > 0 ? Number(((totalBuyers / uniqueVisitors) * 100).toFixed(1)) : 0;

    // Traffic sources from referrer
    const srcCounts: Record<string, number> = { Direct: 0, Organic: 0, Social: 0, Referral: 0 };
    const seenVisitor = new Set<string>();
    for (const e of events) {
      if (seenVisitor.has(e.visitor_id)) continue;
      seenVisitor.add(e.visitor_id);
      const r = (e.referrer || "").toLowerCase();
      if (!r || r.includes("pasteprompts")) srcCounts.Direct++;
      else if (/google|bing|duckduckgo|yahoo|ecosia/.test(r)) srcCounts.Organic++;
      else if (/facebook|instagram|tiktok|twitter|t\.co|x\.com|reddit|youtube|linkedin|pinterest/.test(r)) srcCounts.Social++;
      else srcCounts.Referral++;
    }
    const srcTotal = Object.values(srcCounts).reduce((a, b) => a + b, 0);
    const srcColors: Record<string, string> = { Direct: "#8B5CF6", Organic: "#06B6D4", Social: "#F59E0B", Referral: "#3B82F6" };
    const trafficSources = srcTotal
      ? Object.entries(srcCounts).map(([name, n]) => ({ name, value: Math.round((n / srcTotal) * 100), color: srcColors[name] }))
      : [];

    // Top prompts (real counts)
    const topPrompts: TopPromptAnalytics[] = prompts.slice(0, 10).map((p) => {
      const views = Number(p.views) || 0;
      const sales = Number(p.sales_count) || 0;
      const copies = Number(p.copies_count) || 0;
      const catObj = p.category as { name?: string; slug?: string } | null;
      return {
        id: p.id,
        title: p.title,
        slug: p.slug,
        category: catObj?.name || "General",
        views,
        sales_count: sales,
        copies_count: copies,
        ctr: views > 0 ? Number((((sales + copies) / views) * 100).toFixed(1)) : 0,
      };
    });

    // Category performance (real)
    const categoryCountMap: Record<string, { count: number; views: number; slug: string }> = {};
    for (const p of prompts) {
      const catObj = p.category as { name?: string; slug?: string } | null;
      const catName = catObj?.name || "Uncategorised";
      if (!categoryCountMap[catName]) categoryCountMap[catName] = { count: 0, views: 0, slug: catObj?.slug || "" };
      categoryCountMap[catName].count += 1;
      categoryCountMap[catName].views += Number(p.views) || 0;
    }
    void categories;
    const categoryPerformance: CategoryAnalytics[] = Object.entries(categoryCountMap)
      .map(([name, s]) => ({ name, slug: s.slug || name.toLowerCase().replace(/\s+/g, "-"), views: s.views, prompts_count: s.count }))
      .sort((a, b) => b.views - a.views);

    // Daily series from real events
    const dayMap = new Map<string, { page_views: number; prompt_views: number; visitors: Set<string> }>();
    const span = Math.min(days, 90);
    for (let i = span - 1; i >= 0; i--) {
      const key = new Date(Date.now() - i * 86400000).toISOString().slice(0, 10);
      dayMap.set(key, { page_views: 0, prompt_views: 0, visitors: new Set() });
    }
    for (const e of events) {
      const d = dayMap.get(e.created_at.slice(0, 10));
      if (!d) continue;
      if (e.event_type === "page_view") d.page_views++;
      if (e.event_type === "prompt_view") d.prompt_views++;
      d.visitors.add(e.visitor_id);
    }
    const daily = [...dayMap.entries()].map(([k, v]) => ({
      day: new Date(k).toLocaleDateString("en-GB", { day: "numeric", month: "short" }),
      page_views: v.page_views,
      prompt_views: v.prompt_views,
      visitors: v.visitors.size,
    }));

    // Funnel (real)
    const promptViewers = new Set(events.filter((e) => e.event_type === "prompt_view").map((e) => e.visitor_id)).size;
    const pct = (n: number) => (uniqueVisitors > 0 ? Math.round((n / uniqueVisitors) * 100) : 0);

    return {
      days,
      page_views: pageViews,
      prompt_views: promptViews,
      unique_visitors: uniqueVisitors,
      new_visitors: newVisitors,
      repeat_visitors: repeatVisitors,
      sales: paid.length,
      revenue_pence: paid.reduce((s: number, p: { amount_pence: number }) => s + (Number(p.amount_pence) || 0), 0),
      free_claims: free.length,
      repeat_buyers: repeatBuyers,
      total_buyers: totalBuyers,
      avg_session_seconds: avgSessionSeconds,
      bounce_rate_pct: bounceRate,
      conversion_rate_pct: conversionRate,
      daily,
      traffic_sources: trafficSources,
      top_prompts: topPrompts,
      geography: [], // Not tracked
      funnel: [
        { step: "Visitors", count: uniqueVisitors, percent: uniqueVisitors ? 100 : 0 },
        { step: "Viewed a prompt", count: promptViewers, percent: pct(promptViewers) },
        { step: "Bought / claimed", count: totalBuyers, percent: pct(totalBuyers) },
      ],
      category_performance: categoryPerformance,
      seo_signals: {
        pages_indexed: 0, // Not tracked — check Google Search Console
        total_prompts: prompts.length,
        avg_time_seconds: avgSessionSeconds,
        pages_per_session: pagesPerSession,
        mobile_pct: 0, // Not tracked
        desktop_pct: 0, // Not tracked
      },
    };
  } catch (err) {
    console.error("fetchAdminAnalytics failed:", err);
    return {
      days, page_views: 0, prompt_views: 0, unique_visitors: 0, new_visitors: 0, repeat_visitors: 0,
      sales: 0, revenue_pence: 0, free_claims: 0, repeat_buyers: 0, total_buyers: 0,
      avg_session_seconds: 0, bounce_rate_pct: 0, conversion_rate_pct: 0, daily: [],
      traffic_sources: [], top_prompts: [], geography: [], funnel: [], category_performance: [],
      seo_signals: { pages_indexed: 0, total_prompts: 0, avg_time_seconds: 0, pages_per_session: 0, mobile_pct: 0, desktop_pct: 0 },
    };
  }
}

/* ---------------- Stats ---------------- */
export type AdminOverviewData = {
  users: number; creators: number;
  prompts: number; approved: number; pending: number; rejected: number;
  approvedFree: number; approvedPaid: number;
  paidSales: number; freeClaims: number;
  grossPence: number; feesPence: number; creatorEarnedPence: number;
  activeSubs: number;
  periodDays: number;
  submissionsByDay: { date: string; count: number }[];
  purchasesByDay: { date: string; paid: number; free: number }[];
  topCategories: { name: string; count: number }[];
  topCreators: { handle: string; count: number }[];
  recent: { kind: "prompt" | "purchase" | "member"; label: string; at: string }[];
  partial: string[];
};

function dayKeys(days: number) {
  const out: string[] = [];
  const now = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now); d.setUTCDate(now.getUTCDate() - i);
    out.push(d.toISOString().slice(0, 10));
  }
  return out;
}

// All figures come straight from the database. Purchases are only written by the
// payment webhook after Stripe confirms payment, so every row is a completed sale/claim.
export async function fetchAdminOverview(periodDays = 30): Promise<AdminOverviewData> {
  const since = new Date(Date.now() - periodDays * 86400000).toISOString();
  const head = { count: "exact" as const, head: true };
  const partial: string[] = [];
  const [users, creators, prompts, approved, pending, rejected, approvedFree, purchases, subs, recentPrompts, recentMembers, cats] = await Promise.all([
    supabase.from("profiles").select("id", head),
    supabase.from("profiles").select("id", head).eq("is_creator", true),
    supabase.from("prompts").select("id", head),
    supabase.from("prompts").select("id", head).eq("status", "approved"),
    supabase.from("prompts").select("id", head).eq("status", "pending"),
    supabase.from("prompts").select("id", head).eq("status", "rejected"),
    supabase.from("prompts").select("id", head).eq("status", "approved").eq("is_free", true),
    supabase.from("purchases").select("amount_pence, platform_fee_pence, creator_earning_pence, is_free, created_at, prompt:prompts(title)").order("created_at", { ascending: false }).limit(5000),
    supabase.from("subscriptions").select("id", head).in("status", ["active", "trialing"]),
    supabase.from("prompts").select("title, status, category_id, created_at, creator:profiles!prompts_creator_id_fkey(handle)").gte("created_at", since).order("created_at", { ascending: false }).limit(2000),
    supabase.from("profiles").select("handle, created_at").order("created_at", { ascending: false }).limit(5),
    supabase.from("categories").select("id, name"),
  ]);
  for (const [name, r] of Object.entries({ users, prompts, purchases, subs, recentPrompts })) {
    if ((r as { error: unknown }).error) partial.push(name);
  }
  const rows = (purchases.data ?? []) as Array<{ amount_pence: number; platform_fee_pence: number; creator_earning_pence: number; is_free: boolean; created_at: string; prompt: { title?: string } | null }>;
  const paidRows = rows.filter((r) => !r.is_free);
  const keys = dayKeys(periodDays);
  const sub = new Map(keys.map((k) => [k, 0]));
  const pur = new Map(keys.map((k) => [k, { paid: 0, free: 0 }]));
  const catName = new Map((cats.data ?? []).map((c) => [c.id as string, c.name as string]));
  const catCount = new Map<string, number>();
  const creatorCount = new Map<string, number>();
  const newPrompts = (recentPrompts.data ?? []) as Array<{ title: string; status: string; category_id: string; created_at: string; creator: { handle?: string } | null }>;
  for (const p of newPrompts) {
    const k = p.created_at.slice(0, 10);
    if (sub.has(k)) sub.set(k, (sub.get(k) ?? 0) + 1);
    const cn = catName.get(p.category_id) ?? "Uncategorised";
    catCount.set(cn, (catCount.get(cn) ?? 0) + 1);
    const h = p.creator?.handle ?? "unknown";
    creatorCount.set(h, (creatorCount.get(h) ?? 0) + 1);
  }
  for (const r of rows) {
    const e = pur.get(r.created_at.slice(0, 10));
    if (e) { if (r.is_free) e.free++; else e.paid++; }
  }
  const recent: AdminOverviewData["recent"] = [
    ...newPrompts.slice(0, 5).map((p) => ({ kind: "prompt" as const, label: `New prompt “${p.title}” (${p.status}) by @${p.creator?.handle ?? "unknown"}`, at: p.created_at })),
    ...rows.slice(0, 5).map((r) => ({ kind: "purchase" as const, label: `${r.is_free ? "Free claim" : "Paid sale"}: ${r.prompt?.title ?? "prompt"}`, at: r.created_at })),
    ...((recentMembers.data ?? []) as Array<{ handle: string; created_at: string }>).map((m) => ({ kind: "member" as const, label: `New member @${m.handle}`, at: m.created_at })),
  ].sort((a, b) => b.at.localeCompare(a.at)).slice(0, 10);
  const top = (m: Map<string, number>) => [...m.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6);
  return {
    users: users.count ?? 0, creators: creators.count ?? 0,
    prompts: prompts.count ?? 0, approved: approved.count ?? 0, pending: pending.count ?? 0, rejected: rejected.count ?? 0,
    approvedFree: approvedFree.count ?? 0, approvedPaid: Math.max(0, (approved.count ?? 0) - (approvedFree.count ?? 0)),
    paidSales: paidRows.length, freeClaims: rows.length - paidRows.length,
    grossPence: paidRows.reduce((s, p) => s + (p.amount_pence ?? 0), 0),
    feesPence: paidRows.reduce((s, p) => s + (p.platform_fee_pence ?? 0), 0),
    creatorEarnedPence: paidRows.reduce((s, p) => s + (p.creator_earning_pence ?? 0), 0),
    activeSubs: subs.count ?? 0,
    periodDays,
    submissionsByDay: keys.map((k) => ({ date: k, count: sub.get(k) ?? 0 })),
    purchasesByDay: keys.map((k) => ({ date: k, ...(pur.get(k) ?? { paid: 0, free: 0 }) })),
    topCategories: top(catCount).map(([name, count]) => ({ name, count })),
    topCreators: top(creatorCount).map(([handle, count]) => ({ handle, count })),
    recent, partial,
  };
}

/* ---------------- Prompts ---------------- */
export const ADMIN_PROMPTS_PAGE = 25;
export async function fetchAdminPrompts(status?: string, q?: string, page = 0) {
  let query = supabase
    .from("prompts")
    .select("id, slug, title, description, example_output, tags, image_url, status, price_pence, is_free, featured, views, sales_count, copies_count, created_at, updated_at, category_id, model, category:categories(name), creator:profiles!prompts_creator_id_fkey(handle, display_name)", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(page * ADMIN_PROMPTS_PAGE, page * ADMIN_PROMPTS_PAGE + ADMIN_PROMPTS_PAGE - 1);
  if (status && status !== "all") query = query.eq("status", status as never);
  const term = q?.trim().replace(/[,()%]/g, " ");
  if (term) query = query.or(`title.ilike.%${term}%,description.ilike.%${term}%`);
  const { data, error, count } = await query;
  if (error) throw error;
  return { rows: data ?? [], total: count ?? 0 };
}

export async function setPromptStatus(id: string, status: "approved" | "rejected" | "pending") {
  const { data, error } = await supabase.from("prompts").update({ status: status as never }).eq("id", id).select("id");
  if (error) throw error;
  if (!data?.length) throw new Error("No change was saved — you may not have permission.");
  await logAdminAction(`prompt.${status}`, "prompt", id);
}

export async function setPromptFeatured(id: string, featured: boolean) {
  const { error } = await supabase.from("prompts").update({ featured }).eq("id", id);
  if (error) throw error;
  await logAdminAction(featured ? "prompt.feature" : "prompt.unfeature", "prompt", id);
}

export async function updatePromptAdmin(id: string, patch: { title?: string; description?: string; body?: string; category_id?: string; model?: string; image_url?: string | null }) {
  const { error } = await supabase.from("prompts").update(patch as never).eq("id", id);
  if (error) throw error;
  await logAdminAction("prompt.edit", "prompt", id);
}

export async function deletePromptAdmin(id: string) {
  const { error } = await supabase.from("prompts").delete().eq("id", id);
  if (error) throw error;
  await logAdminAction("prompt.delete", "prompt", id);
}

export async function bulkPromptStatus(ids: string[], status: "approved" | "rejected") {
  const { data, error } = await supabase.from("prompts").update({ status: status as never }).in("id", ids).select("id");
  if (error) throw error;
  if ((data?.length ?? 0) < ids.length) throw new Error(`Only ${data?.length ?? 0} of ${ids.length} prompts were updated.`);
  await logAdminAction(`prompt.bulk.${status}`, "prompt", ids.join(","));
}

/* ---------------- Users & memberships ---------------- */
// Protected columns (membership_tier, earnings) are read via an admin-only RPC or fallback to profiles.
export async function fetchAdminUsers(q?: string) {
  // Admin-only RPC (checks has_role server-side). Private columns are never read from the table directly.
  const { data, error } = await supabase.rpc("admin_list_users", { _q: q?.trim() || null } as never);
  if (error) throw error;
  return (data ?? []) as Array<{
    id: string; handle: string; display_name: string; avatar_url: string | null;
    is_creator: boolean; membership_tier: string; total_sales: number;
    total_earnings_pence: number; created_at: string;
  }>;
}

export async function setUserTier(userId: string, tier: "free" | "pro" | "platinum") {
  const { error } = await supabase.rpc("admin_set_user_tier", { _user_id: userId, _tier: tier } as never);
  if (error) throw error;
  await logAdminAction("user.set_tier", "user", userId, { tier });
}

export async function setUserCreator(userId: string, is_creator: boolean) {
  const { error } = await supabase.rpc("admin_set_user_creator", { _user_id: userId, _is_creator: is_creator } as never);
  if (error) throw error;
  await logAdminAction("user.set_creator", "user", userId, { is_creator });
}

export async function fetchAdminRoles() {
  const { data } = await supabase.from("user_roles").select("user_id, role");
  return data ?? [];
}

export async function setAdminRole(userId: string, makeAdmin: boolean) {
  if (makeAdmin) {
    const { error } = await supabase.from("user_roles").insert({ user_id: userId, role: "admin" as never });
    if (error && !error.message.includes("duplicate")) throw error;
  } else {
    const { error } = await supabase.from("user_roles").delete().eq("user_id", userId).eq("role", "admin" as never);
    if (error) throw error;
  }
  await logAdminAction(makeAdmin ? "user.grant_admin" : "user.revoke_admin", "user", userId);
}

/* ---------------- Sales ---------------- */
export async function fetchAdminSales() {
  const { data, error } = await supabase
    .from("purchases")
    .select("id, amount_pence, platform_fee_pence, creator_earning_pence, is_free, created_at, prompt:prompts(title)")
    .order("created_at", { ascending: false })
    .limit(300);
  if (error) throw error;
  return data ?? [];
}

/* ---------------- Reviews ---------------- */
export async function fetchAdminReviews() {
  const { data } = await supabase
    .from("reviews")
    .select("id, rating, body, created_at, prompt:prompts(title, slug), buyer:profiles(handle)")
    .order("created_at", { ascending: false })
    .limit(200);
  return data ?? [];
}
export async function deleteReviewAdmin(id: string) {
  const { error } = await supabase.from("reviews").delete().eq("id", id);
  if (error) throw error;
  await logAdminAction("review.delete", "review", id);
}

/* ---------------- Categories ---------------- */
export async function fetchAdminCategories() {
  const { data } = await supabase.from("categories").select("*").order("sort_order");
  return data ?? [];
}
export async function upsertCategory(cat: { id?: string; name: string; slug: string; icon?: string; sort_order?: number }) {
  const { error } = await supabase.from("categories").upsert(cat as never);
  if (error) throw error;
  await logAdminAction(cat.id ? "category.edit" : "category.create", "category", cat.id ?? cat.slug);
}
export async function deleteCategory(id: string) {
  const { error } = await supabase.from("categories").delete().eq("id", id);
  if (error) throw error;
  await logAdminAction("category.delete", "category", id);
}

/* ---------------- Error logs ---------------- */
export async function fetchErrorLogs(level?: string) {
  let q = supabase.from("error_logs").select("*").order("created_at", { ascending: false }).limit(300);
  if (level && level !== "all") q = q.eq("level", level);
  const { data } = await q;
  const dbLogs = data ?? [];

  // Merge with client local logs
  const localLogs = getStoredLocalLogs();
  const map = new Map<string, Record<string, unknown>>();

  for (const item of [...dbLogs, ...localLogs]) {
    if (!item) continue;
    const id = (item.id as string) || `log-${Math.random()}`;
    if (!map.has(id)) {
      map.set(id, item as unknown as Record<string, unknown>);
    }
  }

  let merged = Array.from(map.values()).sort(
    (a, b) => new Date(b.created_at as string).getTime() - new Date(a.created_at as string).getTime()
  );

  if (level && level !== "all") {
    merged = merged.filter((item) => (item.level as string) === level);
  }

  return merged;
}

export async function clearErrorLogs() {
  clearLocalLogs();
  const { error } = await supabase.from("error_logs").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  if (error) {
    console.warn("Supabase clearErrorLogs notice:", error.message);
  }
  await logAdminAction("errors.clear");
}

/* ---------------- Reports ---------------- */
export async function fetchReports(status?: string) {
  let q = supabase.from("reports").select("*").order("created_at", { ascending: false }).limit(200);
  if (status && status !== "all") q = q.eq("status", status);
  const { data } = await q;
  return data ?? [];
}
export async function resolveReport(id: string, status: string) {
  const { error } = await supabase.from("reports").update({ status }).eq("id", id);
  if (error) throw error;
  await logAdminAction("report.resolve", "report", id, { status });
}

/* ---------------- Announcements ---------------- */
export async function fetchAnnouncements() {
  const { data } = await supabase.from("announcements").select("*").order("created_at", { ascending: false });
  return data ?? [];
}
export async function createAnnouncement(a: { title: string; body?: string; level?: string; active?: boolean }) {
  const { error } = await supabase.from("announcements").insert(a);
  if (error) throw error;
  await logAdminAction("announcement.create");
}
export async function updateAnnouncement(id: string, patch: { active?: boolean; title?: string; body?: string; level?: string }) {
  const { error } = await supabase.from("announcements").update(patch).eq("id", id);
  if (error) throw error;
  await logAdminAction("announcement.update", "announcement", id);
}
export async function deleteAnnouncement(id: string) {
  const { error } = await supabase.from("announcements").delete().eq("id", id);
  if (error) throw error;
  await logAdminAction("announcement.delete", "announcement", id);
}

/* ---------------- Feature flags ---------------- */
export async function fetchFeatureFlags() {
  const { data } = await supabase.from("feature_flags").select("*").order("key");
  return data ?? [];
}
export async function upsertFeatureFlag(key: string, enabled: boolean, description?: string) {
  const { error } = await supabase.from("feature_flags").upsert({ key, enabled, description, updated_at: new Date().toISOString() });
  if (error) throw error;
  await logAdminAction("flag.set", "flag", key, { enabled });
}

/* ---------------- Subscriptions ---------------- */
export async function fetchAdminSubscriptions() {
  const { data } = await supabase
    .from("subscriptions")
    .select("id, user_id, price_id, status, current_period_end, cancel_at_period_end, environment, created_at")
    .order("created_at", { ascending: false })
    .limit(200);
  return data ?? [];
}

/* ---------------- Referrals ---------------- */
export async function fetchAdminReferrals() {
  const { data } = await supabase.from("referrals").select("id, status, reward_pence, created_at").order("created_at", { ascending: false }).limit(200);
  return data ?? [];
}

/* ---------------- Quota monitor ---------------- */
export async function fetchQuotaMonitor() {
  // Reads membership_tier via the admin-only RPC (protected column).
  const all = await fetchAdminUsers();
  const profiles = all.filter((u) => u.is_creator);
  const start = new Date(); start.setDate(1); start.setHours(0, 0, 0, 0);
  const { data: counts } = await supabase.from("prompts").select("creator_id").gte("created_at", start.toISOString()).limit(5000);
  const map: Record<string, number> = {};
  for (const r of counts ?? []) { const id = (r as { creator_id: string }).creator_id; map[id] = (map[id] ?? 0) + 1; }
  const quota: Record<string, number> = { free: 15, pro: 50, platinum: 200 };
  return (profiles ?? []).map((p) => ({
    handle: p.handle as string,
    tier: (p.membership_tier as string) ?? "free",
    used: map[p.id as string] ?? 0,
    quota: quota[(p.membership_tier as string) ?? "free"] ?? 15,
  })).sort((a, b) => (b.used / b.quota) - (a.used / a.quota));
}

/* ---------------- Trending ---------------- */
export async function recomputeTrending() {
  const { error } = await supabase.rpc("recompute_trending");
  if (error) throw error;
  await logAdminAction("trending.recompute");
}

/* ---------------- AI / automation controls ---------------- */
export async function runMaintenance() {
  const { data, error } = await supabase.functions.invoke("site-maintenance", { body: {} });
  if (error) throw error;
  await logAdminAction("maintenance.run");
  return data;
}

export async function processScheduledPosts() {
  const { data, error } = await supabase.functions.invoke("process-scheduled-posts", { body: {} });
  if (error) throw error;
  await logAdminAction("social.process");
  return data;
}

/* ---------------- Social scheduler ---------------- */
export async function fetchScheduledPosts() {
  const { data } = await supabase.from("scheduled_posts").select("*").order("scheduled_at", { ascending: false }).limit(200);
  return data ?? [];
}
export async function createScheduledPost(p: { platform: string; caption: string; topic?: string; prompt_id?: string; media_url?: string; scheduled_at: string; status?: string }) {
  const { data: auth } = await supabase.auth.getUser();
  const { error } = await supabase.from("scheduled_posts").insert({ ...p, created_by: auth.user?.id ?? null });
  if (error) throw error;
  await logAdminAction("social.schedule", "post", undefined, { platform: p.platform });
}
export async function deleteScheduledPost(id: string) {
  const { error } = await supabase.from("scheduled_posts").delete().eq("id", id);
  if (error) throw error;
  await logAdminAction("social.delete", "post", id);
}
export async function generateSocialCaption(platform: string, topic: string, promptTitle?: string) {
  const { data, error } = await supabase.functions.invoke("generate-social-post", {
    body: { platform, topic, promptTitle },
  });
  if (error) throw error;
  return (data as { caption?: string })?.caption ?? "";
}

/* ---------------- TikTok automation ---------------- */
export interface TikTokSettings {
  id: string;
  enabled: boolean;
  schedule_mode: "interval" | "slots" | "both";
  interval_hours: number;
  time_slots: { day: string | number; time: string }[];
  content_source: "random" | "prompts" | "tips";
  posts_per_run: number;
  slide_count: number;
  caption_instructions: string | null;
  image_style: string;
  timezone: string;
  auto_post: boolean;
  last_run_at: string | null;
  next_run_at: string | null;
  updated_at: string;
}

export interface TikTokVideo {
  id: string;
  status: string;
  source_type: string;
  prompt_id: string | null;
  topic: string | null;
  caption: string | null;
  slides: { text: string; image_url: string }[];
  video_url: string | null;
  tiktok_post_id: string | null;
  error: string | null;
  scheduled_for: string;
  posted_at: string | null;
  created_at: string;
}

// Explicit column list: never fetch secret columns (tt_access_token,
// tt_refresh_token, tt_oauth_state, cron_secret) to the admin browser.
const TIKTOK_SETTINGS_COLUMNS =
  "id, enabled, schedule_mode, interval_hours, time_slots, content_source, posts_per_run, slide_count, caption_instructions, image_style, timezone, auto_post, last_run_at, next_run_at, updated_at";

export async function fetchTikTokSettings(): Promise<TikTokSettings> {
  const { data, error } = await supabase
    .from("tiktok_automation_settings")
    .select(TIKTOK_SETTINGS_COLUMNS)
    .eq("id", "default")
    .maybeSingle();
  if (error) throw error;
  return data as unknown as TikTokSettings;
}

export async function updateTikTokSettings(patch: Partial<TikTokSettings>) {
  const { error } = await supabase.from("tiktok_automation_settings").update(patch as never).eq("id", "default");
  if (error) throw error;
  await logAdminAction("tiktok.settings.update", "tiktok", "default", patch);
}

export async function fetchTikTokVideos(): Promise<TikTokVideo[]> {
  const { data, error } = await supabase.from("tiktok_videos").select("*").order("created_at", { ascending: false }).limit(100);
  if (error) throw error;
  return (data ?? []) as unknown as TikTokVideo[];
}

export async function runTikTokNow(opts?: { source_type?: "prompt" | "tip"; post?: boolean }) {
  const { data, error } = await supabase.functions.invoke("tiktok-automation", {
    body: { action: "run-now", ...opts },
  });
  if (error) throw error;
  await logAdminAction("tiktok.run_now", "tiktok", undefined, opts);
  return data;
}

export async function regenerateTikTokVideo(id: string) {
  const { data, error } = await supabase.functions.invoke("tiktok-automation", { body: { action: "generate", id } });
  if (error) throw error;
  await logAdminAction("tiktok.regenerate", "tiktok", id);
  return data;
}

export async function postTikTokVideo(id: string) {
  const { data, error } = await supabase.functions.invoke("tiktok-automation", { body: { action: "post", id } });
  if (error) throw error;
  await logAdminAction("tiktok.post", "tiktok", id);
  return data;
}

export async function deleteTikTokVideo(id: string) {
  const { error } = await supabase.from("tiktok_videos").delete().eq("id", id);
  if (error) throw error;
  await logAdminAction("tiktok.delete", "tiktok", id);
}

/* ---------------- TikTok account connection (OAuth) ---------------- */
export interface TikTokConnection {
  connected: boolean;
  username: string | null;
  scope: string | null;
  expires_at: string | null;
  configured: boolean;
  redirect_uri: string;
}

export async function fetchTikTokConnection(): Promise<TikTokConnection> {
  const { data, error } = await supabase.functions.invoke("tiktok-oauth", { body: { action: "status" } });
  if (error) throw error;
  return data as TikTokConnection;
}

export async function getTikTokAuthUrl(): Promise<{ url: string; redirect_uri: string }> {
  const { data, error } = await supabase.functions.invoke("tiktok-oauth", { body: { action: "auth-url" } });
  if (error) throw error;
  await logAdminAction("tiktok.connect", "tiktok");
  return data as { url: string; redirect_uri: string };
}

export async function disconnectTikTok() {
  const { error } = await supabase.functions.invoke("tiktok-oauth", { body: { action: "disconnect" } });
  if (error) throw error;
  await logAdminAction("tiktok.disconnect", "tiktok");
}

/* ---------------- Feedback inbox ---------------- */
export interface FeedbackMessage {
  id: string;
  user_id: string | null;
  name: string;
  email: string;
  category: string;
  subject: string | null;
  message: string;
  status: string;
  admin_note: string | null;
  created_at: string;
  updated_at: string;
}

export async function fetchFeedback(status?: string): Promise<FeedbackMessage[]> {
  let query = supabase.from("feedback").select("*").order("created_at", { ascending: false }).limit(300);
  if (status && status !== "all") query = query.eq("status", status);
  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as FeedbackMessage[];
}

export async function fetchFeedbackUnreadCount(): Promise<number> {
  const { count } = await supabase.from("feedback").select("id", { count: "exact", head: true }).eq("status", "new");
  return count ?? 0;
}

export async function setFeedbackStatus(id: string, status: string) {
  const { error } = await supabase.from("feedback").update({ status }).eq("id", id);
  if (error) throw error;
  await logAdminAction("feedback.status", "feedback", id, { status });
}

export async function setFeedbackNote(id: string, admin_note: string) {
  const { error } = await supabase.from("feedback").update({ admin_note }).eq("id", id);
  if (error) throw error;
}

export async function deleteFeedback(id: string) {
  const { error } = await supabase.from("feedback").delete().eq("id", id);
  if (error) throw error;
  await logAdminAction("feedback.delete", "feedback", id);
}

/* ---------------- Admin notifications centre ---------------- */
export interface AdminNotification {
  id: string;
  kind: "prompt" | "report" | "feedback" | "error" | "user" | "sale";
  title: string;
  detail: string;
  link?: string;
  tab?: string;
  created_at: string;
  severity: "info" | "warning" | "critical";
}

/** Aggregates actionable signals across the platform into a single feed. */
export async function fetchAdminNotifications(): Promise<AdminNotification[]> {
  const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const [pending, reports, feedback, errors, users, sales] = await Promise.all([
    supabase.from("prompts").select("id, title, created_at").eq("status", "pending").order("created_at", { ascending: false }).limit(20),
    supabase.from("reports").select("id, reason, created_at").eq("status", "open").order("created_at", { ascending: false }).limit(20),
    supabase.from("feedback").select("id, subject, category, name, created_at").eq("status", "new").order("created_at", { ascending: false }).limit(20),
    supabase.from("error_logs").select("id, level, message, created_at").in("level", ["fatal", "error"]).gte("created_at", since).order("created_at", { ascending: false }).limit(20),
    supabase.from("profiles").select("id, display_name, handle, created_at").gte("created_at", since).order("created_at", { ascending: false }).limit(20),
    supabase.from("purchases").select("id, created_at, is_free").eq("is_free", false).gte("created_at", since).order("created_at", { ascending: false }).limit(20),
  ]);

  const out: AdminNotification[] = [];
  for (const p of pending.data ?? [])
    out.push({ id: `prompt-${p.id}`, kind: "prompt", title: "Prompt awaiting review", detail: (p.title as string) ?? "Untitled", tab: "prompts", created_at: p.created_at as string, severity: "warning" });
  for (const r of reports.data ?? [])
    out.push({ id: `report-${r.id}`, kind: "report", title: "Open content report", detail: (r.reason as string) ?? "No reason given", tab: "reports", created_at: r.created_at as string, severity: "critical" });
  for (const f of feedback.data ?? [])
    out.push({ id: `feedback-${f.id}`, kind: "feedback", title: "New feedback message", detail: [(f.category as string), (f.subject as string) || (f.name as string)].filter(Boolean).join(" · "), tab: "feedback", created_at: f.created_at as string, severity: "info" });
  for (const e of errors.data ?? [])
    out.push({ id: `error-${e.id}`, kind: "error", title: `Runtime ${e.level as string}`, detail: (e.message as string) ?? "", tab: "errors", created_at: e.created_at as string, severity: "critical" });
  for (const u of users.data ?? [])
    out.push({ id: `user-${u.id}`, kind: "user", title: "New member joined", detail: (u.display_name as string) || (u.handle as string) || "Member", tab: "members", created_at: u.created_at as string, severity: "info" });
  for (const s of sales.data ?? [])
    out.push({ id: `sale-${s.id}`, kind: "sale", title: "New sale", detail: "A prompt was purchased", tab: "sales", created_at: s.created_at as string, severity: "info" });

  out.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  return out;
}

const NOTIF_SEEN_KEY = "admin_notifs_seen_at";
export function getNotifSeenAt(): number {
  const v = localStorage.getItem(NOTIF_SEEN_KEY);
  return v ? Number(v) : 0;
}
export function markNotifsSeen() {
  localStorage.setItem(NOTIF_SEEN_KEY, String(Date.now()));
}

/* ---------------- Facebook autopilot pool + groups ---------------- */
export interface FbPoolPost {
  id: string;
  content: string;
  image_url: string | null;
  has_media: boolean;
  cycle_id: number;
  posted_at: string | null;
}

/** Posts generated on the Facebook autopilot page, newest cycle first. */
export async function fetchFbPoolPosts(): Promise<FbPoolPost[]> {
  const { data, error } = await supabase
    .from("fb_post_pool" as never)
    .select("id, content, image_url, has_media, cycle_id, posted_at")
    .order("cycle_id", { ascending: false })
    .order("generated_at", { ascending: true })
    .limit(300);
  if (error) throw error;
  return (data ?? []) as unknown as FbPoolPost[];
}

export interface FbGroup {
  id: string;
  group_id: string;
  name: string;
  active: boolean;
  last_posted_at: string | null;
  last_error: string | null;
}

export async function fetchFbGroups(): Promise<FbGroup[]> {
  try {
    const { data, error } = await supabase.functions.invoke("facebook-token", {
      body: { action: "get_groups" },
    });
    if (!error && Array.isArray(data?.groups)) {
      return data.groups as FbGroup[];
    }
  } catch (_) {
    // fallback to direct query
  }

  const { data, error } = await supabase
    .from("fb_groups" as never)
    .select("id, group_id, name, active, last_posted_at, last_error")
    .order("name", { ascending: true });
  if (error) throw error;
  return (data ?? []) as unknown as FbGroup[];
}

export async function addFbGroup(group_id: string, name: string) {
  let invokedOk = false;
  try {
    const { data, error } = await supabase.functions.invoke("facebook-token", {
      body: { action: "add_group", group_id, name },
    });
    if (!error && data?.ok) {
      invokedOk = true;
    }
  } catch (_) {
    // fallback
  }

  if (!invokedOk) {
    const { error } = await supabase.from("fb_groups" as never).insert({ group_id, name } as never);
    if (error) throw error;
  }
  await logAdminAction("fb.group.add", "group", group_id);
}

export async function setFbGroupActive(id: string, active: boolean) {
  let invokedOk = false;
  try {
    const { data, error } = await supabase.functions.invoke("facebook-token", {
      body: { action: "toggle_group", id, active },
    });
    if (!error && data?.ok) {
      invokedOk = true;
    }
  } catch (_) {
    // fallback
  }

  if (!invokedOk) {
    const { error } = await supabase.from("fb_groups" as never).update({ active } as never).eq("id", id);
    if (error) throw error;
  }
}

export async function deleteFbGroup(id: string) {
  let invokedOk = false;
  try {
    const { data, error } = await supabase.functions.invoke("facebook-token", {
      body: { action: "delete_group", id },
    });
    if (!error && data?.ok) {
      invokedOk = true;
    }
  } catch (_) {
    // fallback
  }

  if (!invokedOk) {
    const { error } = await supabase.from("fb_groups" as never).delete().eq("id", id);
    if (error) throw error;
  }
  await logAdminAction("fb.group.delete", "group", id);
}

/** Gift a user a Platinum membership (admin only). */
export async function adminGiftPlatinum(userId: string) {
  const { error } = await db.rpc("admin_set_user_tier", { _user_id: userId, _tier: "platinum" });
  if (error) throw error;
  await logAdminAction("user.gift.platinum", "user", userId);
}
