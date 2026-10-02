import { supabase } from "@/integrations/supabase/client";

export type CreatorBalance = {
  creator_id: string; handle: string; display_name: string; avatar_url: string | null; email: string | null;
  membership_tier: string; paid_sales: number; earned_pence: number; paid_pence: number; owed_pence: number;
  last_paid_at: string | null; payout_method: string | null; payout_details: string | null;
};
export type Payout = { id: string; creator_id: string; amount_pence: number; method: string; reference: string | null; note: string | null; paid_at: string };
export type PayoutSummary = { earned_pence: number; paid_pence: number; owed_pence: number; paid_sales: number; last_paid_at: string | null };
export type PayoutDetails = { method: "paypal" | "bank" | "other"; details: string };

// Supabase client typed loosely for newly-added RPCs/tables.
const sb = supabase as unknown as {
  rpc: (fn: string, args?: Record<string, unknown>) => Promise<{ data: unknown; error: { message: string } | null }>;
  from: typeof supabase.from;
};

export async function fetchCreatorBalances(): Promise<CreatorBalance[]> {
  const { data, error } = await sb.rpc("admin_creator_balances");
  if (error) throw new Error(error.message);
  return (data as CreatorBalance[]) ?? [];
}

export async function recordPayout(input: { creatorId: string; amountPence: number; method: string; reference: string; note: string }) {
  const { error } = await sb.rpc("admin_record_payout", {
    _creator_id: input.creatorId, _amount_pence: input.amountPence, _method: input.method,
    _reference: input.reference, _note: input.note,
  });
  if (error) throw new Error(error.message);
}

export async function fetchPayouts(creatorId?: string): Promise<Payout[]> {
  let q = (supabase.from as unknown as (t: string) => ReturnType<typeof supabase.from>)("creator_payouts")
    .select("id, creator_id, amount_pence, method, reference, note, paid_at")
    .order("paid_at", { ascending: false }).limit(200);
  if (creatorId) q = q.eq("creator_id", creatorId);
  const { data, error } = await q;
  if (error) throw new Error(error.message);
  return (data as unknown as Payout[]) ?? [];
}

export async function fetchMyPayoutSummary(): Promise<PayoutSummary | null> {
  const { data, error } = await sb.rpc("get_my_payout_summary");
  if (error) throw new Error(error.message);
  return ((data as PayoutSummary[]) ?? [])[0] ?? null;
}

export async function fetchMyPayoutDetails(userId: string): Promise<PayoutDetails | null> {
  const { data, error } = await (supabase.from as unknown as (t: string) => ReturnType<typeof supabase.from>)("payout_details")
    .select("method, details").eq("user_id", userId).maybeSingle();
  if (error) throw new Error(error.message);
  return (data as unknown as PayoutDetails) ?? null;
}

export async function saveMyPayoutDetails(userId: string, d: PayoutDetails) {
  const { error } = await (supabase.from as unknown as (t: string) => ReturnType<typeof supabase.from>)("payout_details")
    .upsert({ user_id: userId, method: d.method, details: d.details.trim(), updated_at: new Date().toISOString() } as never);
  if (error) throw new Error(error.message);
}

export type CreatorSale = {
  id: string; created_at: string; amount_pence: number; platform_fee_pence: number; creator_earning_pence: number;
  is_test: boolean; prompt_id: string; prompt_title: string; creator_id: string;
};

// All paid sales (live + test flagged), paginated past the 1000-row API cap.
export async function fetchAllPaidSales(): Promise<CreatorSale[]> {
  const out: CreatorSale[] = [];
  const { data: testIds, error: tErr } = await sb.rpc("admin_test_purchase_ids");
  if (tErr) throw new Error(tErr.message);
  const testSet = new Set((testIds as string[] | null) ?? []);
  for (let from = 0; ; from += 1000) {
    const { data, error } = await supabase
      .from("purchases")
      .select("id, created_at, amount_pence, platform_fee_pence, creator_earning_pence, prompt_id, prompt:prompts(title, creator_id)")
      .eq("is_free", false)
      .order("created_at", { ascending: false })
      .range(from, from + 999);
    if (error) throw new Error(error.message);
    for (const r of (data ?? []) as unknown as Array<Record<string, unknown> & { prompt: { title: string; creator_id: string } | null }>) {
      out.push({
        id: r["id"] as string, created_at: r["created_at"] as string,
        amount_pence: (r["amount_pence"] as number) ?? 0, platform_fee_pence: (r["platform_fee_pence"] as number) ?? 0,
        creator_earning_pence: (r["creator_earning_pence"] as number) ?? 0,
        is_test: testSet.has(r["id"] as string),
        prompt_id: r["prompt_id"] as string, prompt_title: r.prompt?.title ?? "Deleted prompt", creator_id: r.prompt?.creator_id ?? "",
      });
    }
    if ((data ?? []).length < 1000) break;
  }
  return out;
}
