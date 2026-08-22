import { supabase } from "@/integrations/supabase/client";
import { db } from "@/lib/db";
import { toValidUuid } from "@/lib/uuid";
import { checkReservedName, isPlatformAdmin } from "@/lib/reservedNames";

// Shared select shape used across the marketplace for prompt cards.
export const PROMPT_CARD_SELECT =
  "id, slug, title, description, image_url, model, price_pence, is_free, rating_avg, rating_count, sales_count, copies_count, featured, category:categories(slug, name), creator:profiles!prompts_creator_id_fkey(handle, display_name)";

export interface BrowseFilters {
  q?: string;
  categorySlug?: string;
  model?: string;
  price?: "free" | "paid" | "under5" | "5to15" | "over15";
  sort?: "trending" | "newest" | "rated" | "popular";
  limit?: number;
  offset?: number;
}

/**
 * Strip characters that PostgREST treats as filter syntax so user search text
 * can never inject extra predicates into an `.or()` string.
 */
export function sanitizeSearchTerm(raw: string): string {
  return raw
    .replace(/[,.()%*\\"'`:]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 100);
}

export async function fetchPrompts(filters: BrowseFilters = {}) {
  let query = supabase
    .from("prompts")
    .select(PROMPT_CARD_SELECT)
    .eq("status", "approved");

  if (filters.q) {
    const term = sanitizeSearchTerm(filters.q);
    if (term) query = query.or(`title.ilike.%${term}%,description.ilike.%${term}%`);
  }
  if (filters.model && filters.model !== "all") {
    query = query.eq("model", filters.model as never);
  }
  if (filters.price === "free") query = query.eq("is_free", true);
  if (filters.price === "paid") query = query.eq("is_free", false);
  if (filters.price === "under5") query = query.lt("price_pence", 500).eq("is_free", false);
  if (filters.price === "5to15") query = query.gte("price_pence", 500).lte("price_pence", 1500);
  if (filters.price === "over15") query = query.gt("price_pence", 1500);

  if (filters.categorySlug) {
    const { data: cat } = await supabase
      .from("categories")
      .select("id")
      .eq("slug", filters.categorySlug)
      .maybeSingle();
    if (cat) query = query.eq("category_id", cat.id);
  }

  switch (filters.sort) {
    case "newest":
      query = query.order("created_at", { ascending: false });
      break;
    case "rated":
      query = query.order("rating_avg", { ascending: false }).order("rating_count", { ascending: false });
      break;
    case "popular":
      query = query.order("sales_count", { ascending: false });
      break;
    default:
      query = query.order("trending_score", { ascending: false }).order("sales_count", { ascending: false });
  }

  const limit = filters.limit ?? 24;
  const offset = filters.offset ?? 0;
  query = query.range(offset, offset + limit - 1);

  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

export async function fetchCategories() {
  const { data, error } = await supabase.from("categories").select("*").order("sort_order");
  if (error) throw error;
  return data ?? [];
}

export async function fetchCategoryBySlug(slug: string) {
  const { data, error } = await supabase.from("categories").select("*").eq("slug", slug).maybeSingle();
  if (error) throw error;
  return data;
}

// Count of approved prompts per AI model, optionally scoped to a price band.
export async function fetchModelCounts(price?: BrowseFilters["price"]) {
  let query = supabase.from("prompts").select("model").eq("status", "approved");
  if (price === "free") query = query.eq("is_free", true);
  if (price === "paid") query = query.eq("is_free", false);
  const { data, error } = await query.limit(3000);
  if (error) throw error;
  const counts: Record<string, number> = {};
  for (const row of data ?? []) {
    const m = (row as { model: string | null }).model;
    if (m) counts[m] = (counts[m] ?? 0) + 1;
  }
  return counts;
}

// Count of approved prompts per category, scoped to a price band and/or model.
export async function fetchCategoryCounts(price?: BrowseFilters["price"], model?: string) {
  let query = supabase.from("prompts").select("category_id").eq("status", "approved");
  if (price === "free") query = query.eq("is_free", true);
  if (price === "paid") query = query.eq("is_free", false);
  if (model && model !== "all") query = query.eq("model", model as never);
  const { data, error } = await query.limit(3000);
  if (error) throw error;
  const counts: Record<string, number> = {};
  for (const row of data ?? []) {
    const id = (row as { category_id: string | null }).category_id;
    if (id) counts[id] = (counts[id] ?? 0) + 1;
  }
  return counts;
}

const PROMPT_DETAIL_SELECT =
  "id, slug, title, description, example_output, image_url, model, price_pence, is_free, rating_avg, rating_count, sales_count, copies_count, views, featured, tags, created_at, creator_id, category_id, category:categories(slug, name), creator:profiles!prompts_creator_id_fkey(id, handle, display_name, avatar_url, bio, total_sales)";

export async function fetchPromptBySlug(slug: string) {
  const { data, error } = await supabase
    .from("prompts")
    .select(PROMPT_DETAIL_SELECT)
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw error;
  return data;
}

// Free sample prompts, grouped by category. Visible to everyone (including
// signed-out visitors) because they are approved + free.
export async function fetchFreePromptsByCategory(perCategory = 4) {
  const { data, error } = await supabase
    .from("prompts")
    .select(PROMPT_CARD_SELECT)
    .eq("status", "approved")
    .eq("is_free", true)
    .order("trending_score", { ascending: false })
    .order("copies_count", { ascending: false })
    .limit(400);
  if (error) throw error;

  type FreePrompt = NonNullable<typeof data>[number];
  const groups: { name: string; slug: string; prompts: FreePrompt[] }[] = [];
  const index: Record<string, number> = {};
  for (const p of data ?? []) {
    const cat = (p as { category?: { slug: string; name: string } | null }).category;
    if (!cat) continue;
    if (index[cat.slug] === undefined) {
      index[cat.slug] = groups.length;
      groups.push({ name: cat.name, slug: cat.slug, prompts: [] });
    }
    const group = groups[index[cat.slug]];
    if (group.prompts.length < perCategory) group.prompts.push(p);
  }
  return groups;
}

export async function fetchRelatedPrompts(categoryId: string, excludeId: string) {
  const { data, error } = await supabase
    .from("prompts")
    .select(PROMPT_CARD_SELECT)
    .eq("status", "approved")
    .eq("category_id", categoryId)
    .neq("id", excludeId)
    .order("trending_score", { ascending: false })
    .limit(4);
  if (error) throw error;
  return data ?? [];
}

export async function fetchReviews(promptId: string) {
  const { data, error } = await supabase
    .from("reviews")
    .select("id, rating, body, created_at, buyer_id, buyer:profiles(handle, display_name, avatar_url)")
    .eq("prompt_id", promptId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function fetchCreatorByHandle(handle: string) {
  const { data, error } = await db
    .from("profiles")
    .select("id, handle, display_name, bio, avatar_url, total_sales, is_creator, created_at, website_url, twitter_handle, membership_tier")
    .eq("handle", handle)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function fetchCreatorPrompts(creatorId: string) {
  const { data, error } = await supabase
    .from("prompts")
    .select(PROMPT_CARD_SELECT)
    .eq("status", "approved")
    .eq("creator_id", creatorId)
    .order("trending_score", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

/** Follower count for a creator + whether the given viewer already follows them. */
export async function fetchFollowState(creatorId: string, viewerId?: string) {
  const targetCreatorId = toValidUuid(creatorId);
  const { data: count } = await supabase.rpc("creator_follower_count", { _creator_id: targetCreatorId });
  let isFollowing = false;
  if (viewerId) {
    const targetViewerId = toValidUuid(viewerId);
    const { data } = await supabase
      .from("follows")
      .select("id")
      .eq("creator_id", targetCreatorId)
      .eq("follower_id", targetViewerId)
      .maybeSingle();
    isFollowing = !!data;
  }
  return { followers: count ?? 0, isFollowing };
}

export async function toggleFollow(creatorId: string, viewerId: string, following: boolean) {
  if (following) {
    const { error } = await supabase
      .from("follows")
      .delete()
      .eq("creator_id", creatorId)
      .eq("follower_id", viewerId);
    if (error) throw error;
    return false;
  }
  const { error } = await supabase
    .from("follows")
    .insert({ creator_id: creatorId, follower_id: viewerId });
  if (error) throw error;
  return true;
}

/* ------------------------------------------------------------------ */
/* Account: library, saved, profile                                    */
/* ------------------------------------------------------------------ */

export async function fetchMyLibrary(userId: string) {
  const { data, error } = await supabase
    .from("purchases")
    .select(
      `id, created_at, amount_pence, is_free, prompt:prompts(${PROMPT_CARD_SELECT})`,
    )
    .eq("buyer_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).filter((row) => row.prompt);
}

export async function fetchMySaved(userId: string) {
  const { data, error } = await supabase
    .from("saved_prompts")
    .select(`created_at, prompt:prompts(${PROMPT_CARD_SELECT})`)
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).filter((row) => row.prompt);
}

export async function fetchMyProfile(userId: string) {
  const targetId = toValidUuid(userId);
  const { data, error } = await db
    .from("profiles")
    .select("id, handle, display_name, bio, avatar_url, is_creator, total_sales, created_at, updated_at, banner_url, website_url, twitter_handle, membership_tier")
    .eq("id", targetId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

// Sensitive financial fields are not exposed via the public profiles read path;
// the owner reads their own earnings / referral code through a secure function.
export async function fetchMyBilling() {
  const { data, error } = await supabase.rpc("get_my_billing");
  if (error) throw error;
  const row = Array.isArray(data) ? data[0] : data;
  return (row as { total_earnings_pence: number; total_sales: number; stripe_account_id: string | null; referral_code: string | null } | undefined) ?? null;
}

export async function updateMyProfile(
  userId: string,
  patch: Partial<{
    display_name: string;
    handle: string;
    bio: string;
    avatar_url: string;
    is_creator: boolean;
    banner_url: string | null;
    website_url: string | null;
    twitter_handle: string | null;
  }>,
) {
  const targetId = toValidUuid(userId);
  const { error } = await supabase.from("profiles").update(patch).eq("id", targetId);
  if (error) throw error;
}

export async function checkHandleAvailability(
  handle: string,
  currentUserId?: string,
  userEmail?: string | null,
  isAdmin?: boolean,
): Promise<{ available: boolean; error?: string }> {
  const clean = handle.trim().toLowerCase();
  if (!clean) {
    return { available: false, error: "Username is required." };
  }

  const isAdminUser = isPlatformAdmin(userEmail, isAdmin);
  const minLength = isAdminUser ? 3 : 8;

  if (clean.length < minLength) {
    return { available: false, error: `Username must be at least ${minLength} characters long.` };
  }
  if (!/^[a-z0-9]+$/.test(clean)) {
    return {
      available: false,
      error: "Username must contain only lowercase letters and numbers (no uppercase, spaces, or special characters).",
    };
  }

  // Security check: Reserved words (admin, mod, moderator)
  const reservedCheck = checkReservedName(clean, userEmail, isAdmin);
  if (reservedCheck.isReserved) {
    return { available: false, error: reservedCheck.reason };
  }

  let q = supabase.from("profiles").select("id").eq("handle", clean);
  if (currentUserId) {
    const validId = toValidUuid(currentUserId);
    q = q.neq("id", validId);
  }
  const { data, error } = await q.limit(1);
  if (error) {
    console.error("Handle availability query error:", error);
    return { available: true };
  }
  if (data && data.length > 0) {
    return { available: false, error: `Username "${clean}" is already taken by another member.` };
  }
  return { available: true };
}

export async function checkDisplayNameAvailability(
  displayName: string,
  currentUserId?: string,
  userEmail?: string | null,
  isAdmin?: boolean,
): Promise<{ available: boolean; error?: string }> {
  const clean = displayName.trim();
  if (!clean) {
    return { available: false, error: "Display name is required." };
  }

  const isAdminUser = isPlatformAdmin(userEmail, isAdmin);
  const minLength = isAdminUser ? 3 : 8;

  if (clean.length < minLength) {
    return { available: false, error: `Display name must be at least ${minLength} characters long.` };
  }

  // Security check: Reserved words (admin, mod, moderator)
  const reservedCheck = checkReservedName(clean, userEmail, isAdmin);
  if (reservedCheck.isReserved) {
    return { available: false, error: reservedCheck.reason };
  }

  let q = supabase.from("profiles").select("id").ilike("display_name", clean);
  if (currentUserId) {
    const validId = toValidUuid(currentUserId);
    q = q.neq("id", validId);
  }
  const { data, error } = await q.limit(1);
  if (error) {
    console.error("Display name availability query error:", error);
    return { available: true };
  }
  if (data && data.length > 0) {
    return { available: false, error: `Display name "${clean}" is already taken by another member.` };
  }
  return { available: true };
}

/* ------------------------------------------------------------------ */
/* Creator dashboard                                                   */
/* ------------------------------------------------------------------ */

export async function fetchMyTierInfo(userId: string): Promise<{ tier: "free" | "pro" | "platinum"; uploadsThisMonth: number; uploadCredits: number; isAdmin: boolean }> {
  const targetId = toValidUuid(userId);
  const [{ data: tierRow }, { data: uploads }, { data: isAdmin }] = await Promise.all([
    supabase.rpc("get_my_tier_info").maybeSingle(),
    supabase.rpc("prompt_uploads_this_month", { _user_id: targetId }),
    supabase.rpc("has_role", { _user_id: targetId, _role: "admin" }),
  ]);
  const row = tierRow as { membership_tier?: string; upload_credits?: number } | null;
  return {
    tier: ((row?.membership_tier ?? "free") as "free" | "pro" | "platinum"),
    uploadsThisMonth: (uploads as number | null) ?? 0,
    uploadCredits: row?.upload_credits ?? 0,
    isAdmin: (isAdmin as boolean | null) ?? false,
  };
}


export async function fetchMyPrompts(creatorId: string) {
  const targetId = toValidUuid(creatorId);
  const { data, error } = await supabase
    .from("prompts")
    .select(
      "id, slug, title, status, price_pence, is_free, views, sales_count, copies_count, rating_avg, rating_count, created_at, featured, category:categories(slug, name)",
    )
    .eq("creator_id", targetId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function fetchMySales(_creatorId?: string) {
  // Buyer identity and Stripe session IDs are never exposed to creators.
  // The secure get_my_sales() function returns only safe sales-reporting fields
  // scoped to the authenticated creator's own prompts.
  const { data, error } = await supabase.rpc("get_my_sales");
  if (error) throw error;
  return (data ?? []).map((row) => ({
    id: row.id,
    amount_pence: row.amount_pence,
    creator_earning_pence: row.creator_earning_pence,
    created_at: row.created_at,
    is_free: row.is_free,
    prompt: { title: row.prompt_title },
  }));
}

export interface NewPromptInput {
  title: string;
  description: string;
  body: string;
  example_output: string;
  model: string;
  category_id: string;
  tags: string[];
  price_pence: number;
  is_free: boolean;
  image_url: string;
}

export interface VetResult {
  approved: boolean;
  reason: string;
}

// Submits a prompt: runs AI auto-vetting first, then inserts with the
// resulting status (approved or rejected). All paid singles are locked to 25p
// by a database trigger regardless of the value sent.
export async function createPrompt(
  creatorId: string,
  slug: string,
  input: NewPromptInput,
): Promise<{ id: string; slug: string; vetting: VetResult } | null> {
  let vetting: VetResult = { approved: true, reason: "Submitted." };
  try {
    const { data: vet } = await supabase.functions.invoke("vet-prompt", {
      body: {
        title: input.title,
        description: input.description,
        body: input.body,
        example_output: input.example_output,
      },
    });
    if (vet) vetting = vet as VetResult;
  } catch {
    // If vetting is unavailable, fall back to pending manual review.
    vetting = { approved: false, reason: "Queued for manual review." };
  }

  const status = vetting.approved ? "approved" : "rejected";
  const { data, error } = await supabase
    .from("prompts")
    .insert({
      creator_id: creatorId,
      slug,
      status: status as never,
      ...input,
      price_pence: input.is_free ? 0 : 25,
      model: input.model as never,
    })
    .select("id, slug")
    .maybeSingle();
  if (error) throw error;
  return data ? { ...data, vetting } : null;
}

/* ------------------------------------------------------------------ */
/* Admin                                                               */
/* ------------------------------------------------------------------ */

export async function fetchAdminStats() {
  const [{ count: prompts }, { count: pending }, { count: users }, purchases] = await Promise.all([
    supabase.from("prompts").select("id", { count: "exact", head: true }),
    supabase.from("prompts").select("id", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("profiles").select("id", { count: "exact", head: true }),
    supabase.from("purchases").select("amount_pence, platform_fee_pence"),
  ]);
  const gross = (purchases.data ?? []).reduce((s, p) => s + (p.amount_pence ?? 0), 0);
  const fees = (purchases.data ?? []).reduce((s, p) => s + (p.platform_fee_pence ?? 0), 0);
  return {
    prompts: prompts ?? 0,
    pending: pending ?? 0,
    users: users ?? 0,
    sales: purchases.data?.length ?? 0,
    grossPence: gross,
    feesPence: fees,
  };
}

export async function fetchAdminPrompts(status?: string) {
  let q = supabase
    .from("prompts")
    .select("id, slug, title, status, price_pence, is_free, featured, created_at, creator:profiles!prompts_creator_id_fkey(handle, display_name), category:categories(name)")
    .order("created_at", { ascending: false })
    .limit(200);
  if (status && status !== "all") q = q.eq("status", status as never);
  const { data, error } = await q;
  if (error) throw error;
  return data ?? [];
}

export async function setPromptStatus(id: string, status: "approved" | "rejected" | "pending") {
  const { error } = await supabase.from("prompts").update({ status: status as never }).eq("id", id);
  if (error) throw error;
}

export async function setPromptFeatured(id: string, featured: boolean) {
  const { error } = await supabase.from("prompts").update({ featured }).eq("id", id);
  if (error) throw error;
}
