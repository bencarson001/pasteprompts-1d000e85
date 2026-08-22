import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { type StripeEnv, createStripeClient } from "../_shared/stripe.ts";
import { safeReturnUrl } from "../_shared/url.ts";

// Resolve or create a Stripe Customer carrying metadata.userId so later read
// paths (portal, subscriptions.search, dashboards) can find the user.
async function resolveOrCreateCustomer(
  stripe: ReturnType<typeof createStripeClient>,
  options: { email?: string; userId?: string },
): Promise<string | undefined> {
  if (options.userId && !/^[a-zA-Z0-9_-]+$/.test(options.userId)) {
    throw new Error("Invalid userId");
  }
  if (!options.userId && !options.email) return undefined;
  if (options.userId) {
    const found = await stripe.customers.search({
      query: `metadata['userId']:'${options.userId}'`,
      limit: 1,
    });
    if (found.data.length) return found.data[0].id;
  }
  if (options.email) {
    const existing = await stripe.customers.list({ email: options.email, limit: 1 });
    if (existing.data.length) {
      const customer = existing.data[0];
      if (options.userId && customer.metadata?.userId !== options.userId) {
        await stripe.customers.update(customer.id, {
          metadata: { ...customer.metadata, userId: options.userId },
        });
      }
      return customer.id;
    }
  }
  const created = await stripe.customers.create({
    ...(options.email && { email: options.email }),
    ...(options.userId && { metadata: { userId: options.userId } }),
  });
  return created.id;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    // Note: any client-supplied customerEmail is intentionally ignored. The
    // buyer's email is derived server-side from the verified session below to
    // prevent linking purchases to (or hijacking) another user's Stripe customer.
    const { promptId, priceId, returnUrl, environment } = await req.json();
    const env = (environment === "live" ? "live" : "sandbox") as StripeEnv;
    const stripe = createStripeClient(env);

    // Validate the client-supplied returnUrl against an allowlist to prevent
    // open redirects to attacker-controlled phishing domains after checkout.
    const validReturnUrl = safeReturnUrl(returnUrl);
    if (!validReturnUrl) {
      return new Response(JSON.stringify({ error: "Invalid returnUrl" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Derive userId from the verified JWT — never trust a client-supplied userId.
    // This prevents attributing purchases / subscriptions to arbitrary users.
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const authClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );
    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await authClient.auth.getClaims(token);
    if (claimsError || !claimsData?.claims?.sub) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const userId = claimsData.claims.sub as string;

    // Derive the buyer's email from the authenticated user (service role lookup),
    // never from client input — prevents Stripe customer hijack / mis-attribution.
    const adminClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );
    let customerEmail: string | undefined;
    try {
      const { data: userRes } = await adminClient.auth.admin.getUserById(userId);
      customerEmail = userRes?.user?.email ?? undefined;
    } catch {
      customerEmail = undefined;
    }

    // ----- Subscription / fixed-price checkout (e.g. Pro plan) -----
    if (priceId) {
      if (!/^[a-zA-Z0-9_-]+$/.test(priceId)) {
        return new Response(JSON.stringify({ error: "Invalid priceId" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const prices = await stripe.prices.list({ lookup_keys: [priceId] });
      if (!prices.data.length) {
        return new Response(JSON.stringify({ error: "Price not found" }), {
          status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const stripePrice = prices.data[0];
      const isRecurring = stripePrice.type === "recurring";
      const customerId = await resolveOrCreateCustomer(stripe, { email: customerEmail, userId });

      let productDescription: string | undefined;
      if (!isRecurring) {
        const productId = typeof stripePrice.product === "string"
          ? stripePrice.product : stripePrice.product.id;
        const product = await stripe.products.retrieve(productId);
        productDescription = product.name;
      }

      const session = await stripe.checkout.sessions.create({
        line_items: [{ price: stripePrice.id, quantity: 1 }],
        mode: isRecurring ? "subscription" : "payment",
        ui_mode: "embedded_page",
        return_url: validReturnUrl,
        ...(customerId && { customer: customerId }),
        ...(!isRecurring && { payment_intent_data: { description: productDescription } }),
        ...(userId && {
          metadata: { userId },
          ...(isRecurring && { subscription_data: { metadata: { userId } } }),
        }),
      });

      return new Response(JSON.stringify({ clientSecret: session.client_secret }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ----- One-time prompt purchase (marketplace dynamic pricing) -----
    if (!promptId || typeof promptId !== "string") {
      return new Response(JSON.stringify({ error: "promptId or priceId is required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data: prompt, error } = await supabase
      .from("prompts")
      .select("id, title, price_pence, is_free, status")
      .eq("id", promptId)
      .maybeSingle();

    if (error || !prompt) {
      return new Response(JSON.stringify({ error: "Prompt not found" }), {
        status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (prompt.is_free || prompt.price_pence <= 0) {
      return new Response(JSON.stringify({ error: "This prompt is free" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const customerId = await resolveOrCreateCustomer(stripe, { email: customerEmail, userId });

    const session = await stripe.checkout.sessions.create({
      line_items: [{
        price_data: {
          currency: "gbp",
          product_data: { name: prompt.title },
          unit_amount: prompt.price_pence,
        },
        quantity: 1,
      }],
      mode: "payment",
      ui_mode: "embedded_page",
      return_url: validReturnUrl,
      ...(customerId && { customer: customerId }),
      payment_intent_data: {
        description: prompt.title,
        // Stripe emails the buyer a receipt automatically when set.
        ...(customerEmail && { receipt_email: customerEmail }),
      },
      metadata: { promptId: prompt.id, ...(userId && { userId }) },
    });

    return new Response(JSON.stringify({ clientSecret: session.client_secret }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("create-checkout error:", (e as Error).message);
    return new Response(JSON.stringify({ error: "An unexpected error occurred." }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
