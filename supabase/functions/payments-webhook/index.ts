import { createClient } from "npm:@supabase/supabase-js@2";
import { type StripeEnv, verifyWebhook } from "../_shared/stripe.ts";

// Lovable's seamless Stripe integration registers the webhook endpoint at
// `payments-webhook?env=sandbox|live`. This handler records marketplace
// purchases and keeps Pro subscriptions in sync, idempotently.

let _supabase: ReturnType<typeof createClient> | null = null;
function getSupabase() {
  if (!_supabase) {
    _supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );
  }
  return _supabase;
}

async function recordPurchase(session: {
  id: string;
  amount_total: number | null;
  customer_details?: { email?: string } | null;
  metadata: Record<string, string> | null;
}) {
  const supabase = getSupabase();
  const promptId = session.metadata?.promptId;
  const userId = session.metadata?.userId;
  const amount = session.amount_total ?? 0;
  // Subscription checkouts have no promptId — they are handled by the
  // customer.subscription.* events, so skip them here.
  if (!promptId || !userId) {
    console.log("payments-webhook: session has no promptId/userId (likely a subscription)", session.id);
    return;
  }

  const { data: existing } = await supabase
    .from("purchases")
    .select("id")
    .eq("stripe_session_id", session.id)
    .maybeSingle();
  if (existing) return;

  // Resolve the prompt + creator so earnings can be based on the creator's tier.
  const { data: prompt } = await supabase
    .from("prompts")
    .select("title, sales_count, creator_id")
    .eq("id", promptId)
    .maybeSingle();

  // Tier-based economics: every single prompt sells for 25p. The creator's
  // membership tier decides their cut (free 15p / pro 18p / platinum 22p);
  // the remainder is the platform fee.
  const TIER_EARNING: Record<string, number> = { free: 15, pro: 18, platinum: 22 };
  let creatorEarning = 15;
  if (prompt?.creator_id) {
    const { data: creator } = await supabase
      .from("profiles")
      .select("membership_tier")
      .eq("id", prompt.creator_id as string)
      .maybeSingle();
    const tier = (creator?.membership_tier as string | undefined) ?? "free";
    creatorEarning = TIER_EARNING[tier] ?? 15;
  }
  const platformFee = Math.max(0, amount - creatorEarning);

  await supabase.from("purchases").insert({
    buyer_id: userId,
    prompt_id: promptId,
    amount_pence: amount,
    platform_fee_pence: platformFee,
    creator_earning_pence: creatorEarning,
    is_free: false,
    stripe_session_id: session.id,
  });

  if (prompt) {
    await supabase
      .from("prompts")
      .update({ sales_count: ((prompt.sales_count as number) ?? 0) + 1 })
      .eq("id", promptId);

    const { data: profile } = await supabase
      .from("profiles")
      .select("total_sales, total_earnings_pence")
      .eq("id", prompt.creator_id as string)
      .maybeSingle();
    if (profile) {
      await supabase
        .from("profiles")
        .update({
          total_sales: ((profile.total_sales as number) ?? 0) + 1,
          total_earnings_pence: ((profile.total_earnings_pence as number) ?? 0) + creatorEarning,
        })
        .eq("id", prompt.creator_id as string);
    }

    // Notify the creator of the sale (best-effort).
    await supabase.from("notifications").insert({
      user_id: prompt.creator_id,
      type: "sale",
      title: "You made a sale! 🎉",
      body: `Someone just bought "${prompt.title}". You earned £${(creatorEarning / 100).toFixed(2)}.`,
      link: "/dashboard",
    }).then(() => {}, () => {});

    // Notify the buyer that the prompt is unlocked in their library.
    await supabase.from("notifications").insert({
      user_id: userId,
      type: "purchase",
      title: "Purchase complete ✅",
      body: `"${prompt.title}" has been added to your library. A receipt is on its way to your email.`,
      link: "/library",
    }).then(() => {}, () => {});
  }
}

// Map a Stripe price lookup key to a membership tier.
function tierForPrice(priceId: string | undefined): "free" | "pro" | "platinum" {
  if (!priceId) return "free";
  if (priceId.startsWith("platinum")) return "platinum";
  if (priceId.startsWith("pro")) return "pro";
  return "free";
}

const ACTIVE_SUB = ["active", "trialing", "past_due"];

async function syncMembershipTier(userId: string, priceId: string | undefined, status: string) {
  const tier = ACTIVE_SUB.includes(status) ? tierForPrice(priceId) : "free";
  await getSupabase().from("profiles").update({ membership_tier: tier }).eq("id", userId)
    .then(() => {}, () => {});
}

interface StripeSubscriptionObject {
  id: string;
  customer?: string;
  status: string;
  cancel_at_period_end?: boolean;
  current_period_start?: number;
  current_period_end?: number;
  metadata?: Record<string, string>;
  items?: {
    data?: Array<{
      current_period_start?: number;
      current_period_end?: number;
      price?: {
        id?: string;
        product?: string;
        lookup_key?: string;
        metadata?: Record<string, string>;
      };
    }>;
  };
}

async function upsertSubscription(subscription: StripeSubscriptionObject, env: StripeEnv) {
  const userId = subscription.metadata?.userId;
  if (!userId) {
    console.error("payments-webhook: subscription missing userId metadata", subscription.id);
    return;
  }
  const item = subscription.items?.data?.[0];
  const priceId = item?.price?.lookup_key
    || item?.price?.metadata?.lovable_external_id
    || item?.price?.id;
  const productId = item?.price?.product;
  const periodStart = item?.current_period_start ?? subscription.current_period_start;
  const periodEnd = item?.current_period_end ?? subscription.current_period_end;

  await getSupabase().from("subscriptions").upsert(
    {
      user_id: userId,
      stripe_subscription_id: subscription.id,
      stripe_customer_id: subscription.customer,
      product_id: productId,
      price_id: priceId,
      status: subscription.status,
      current_period_start: periodStart ? new Date(periodStart * 1000).toISOString() : null,
      current_period_end: periodEnd ? new Date(periodEnd * 1000).toISOString() : null,
      cancel_at_period_end: subscription.cancel_at_period_end || false,
      environment: env,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "stripe_subscription_id" },
  );

  // Keep the creator's membership tier in sync with their live subscription.
  if (env === "live") await syncMembershipTier(userId, priceId, subscription.status);
}

async function handleSubscriptionCreated(subscription: StripeSubscriptionObject, env: StripeEnv) {
  await upsertSubscription(subscription, env);
  const userId = subscription.metadata?.userId;
  if (userId) {
    const item = subscription.items?.data?.[0];
    const tier = tierForPrice(item?.price?.lookup_key || item?.price?.metadata?.lovable_external_id);
    await getSupabase().from("notifications").insert({
      user_id: userId,
      type: "subscription",
      title: tier === "platinum" ? "Welcome to Platinum 💎" : "Welcome to Pro 🚀",
      body: "Your membership is active. You can now upload more prompts each month and earn more per sale.",
      link: "/dashboard",
    }).then(() => {}, () => {});
  }
}

async function handleSubscriptionDeleted(subscription: StripeSubscriptionObject, env: StripeEnv) {
  await getSupabase()
    .from("subscriptions")
    .update({ status: "canceled", updated_at: new Date().toISOString() })
    .eq("stripe_subscription_id", subscription.id)
    .eq("environment", env);
  const userId = subscription.metadata?.userId;
  if (userId && env === "live") await syncMembershipTier(userId, undefined, "canceled");
}

Deno.serve(async (req) => {
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });

  const rawEnv = new URL(req.url).searchParams.get("env");
  if (rawEnv !== "sandbox" && rawEnv !== "live") {
    console.error("payments-webhook: invalid env query param:", rawEnv);
    return new Response(JSON.stringify({ received: true, ignored: "invalid env" }), {
      status: 200, headers: { "Content-Type": "application/json" },
    });
  }
  const env: StripeEnv = rawEnv;

  try {
    const event = await verifyWebhook(req, env);
    switch (event.type) {
      case "checkout.session.completed":
        await recordPurchase(event.data.object);
        break;
      case "customer.subscription.created":
        await handleSubscriptionCreated(event.data.object, env);
        break;
      case "customer.subscription.updated":
        await upsertSubscription(event.data.object, env);
        break;
      case "customer.subscription.deleted":
        await handleSubscriptionDeleted(event.data.object, env);
        break;
      default:
        console.log("payments-webhook: unhandled event", event.type);
    }
    return new Response(JSON.stringify({ received: true }), {
      status: 200, headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("payments-webhook error:", (e as Error).message);
    return new Response("Webhook error", { status: 400 });
  }
});
