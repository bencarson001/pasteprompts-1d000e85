import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Check, Crown, Loader2, Sparkles, Gem, Info } from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscription } from "@/hooks/useSubscription";
import { useStripeCheckout } from "@/hooks/useStripeCheckout";
import { getStripeEnvironment } from "@/lib/stripe";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { fetchMyTierInfo } from "@/lib/queries";
import { TIERS, formatPrice, type TierKey } from "@/lib/format";
import { logPaymentError } from "@/lib/logger";

const ORDER: TierKey[] = ["free", "pro", "platinum"];

export default function Pro() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isPro } = useSubscription();
  const { openCheckout, checkoutElement, isOpen } = useStripeCheckout();
  const [billing, setBilling] = useState<"monthly" | "yearly">("monthly");
  const [portalLoading, setPortalLoading] = useState(false);

  const { data: tierInfo } = useQuery({
    queryKey: ["my-tier", user?.id],
    enabled: !!user?.id,
    queryFn: () => fetchMyTierInfo(user!.id),
  });
  const currentTier: TierKey = tierInfo?.tier ?? "free";

  const subscribe = (tier: TierKey) => {
    if (!user) { navigate("/auth?redirect=/pro"); return; }
    const priceId = billing === "monthly" ? TIERS[tier].monthlyPriceId : TIERS[tier].yearlyPriceId;
    if (!priceId) return;
    openCheckout({
      priceId,
      customerEmail: user.email ?? undefined,
      userId: user.id,
      returnUrl: `${window.location.origin}/dashboard?subscribed=1&session_id={CHECKOUT_SESSION_ID}`,
    });
  };

  const manage = async () => {
    setPortalLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("create-portal-session", {
        body: { returnUrl: `${window.location.origin}/pro`, environment: getStripeEnvironment() },
      });
      if (error || !data?.url) throw new Error(error?.message || "Could not open billing portal");
      window.open(data.url, "_blank");
    } catch (e) {
      const err = e as Error;
      await logPaymentError("Stripe Billing Portal Error", err, { userId: user?.id });
      toast({ title: "Could not open billing", description: err.message, variant: "destructive" });
    } finally {
      setPortalLoading(false);
    }
  };

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: "Paste Prompts Membership",
    description: "Creator memberships to upload and sell AI prompts on Paste Prompts.",
    offers: ORDER.filter((t) => t !== "free").map((t) => ({
      "@type": "Offer", price: TIERS[t].pricePounds.toFixed(2), priceCurrency: "GBP", name: TIERS[t].name,
    })),
  };

  return (
    <Layout>
      <SEO
        title="Memberships — Upload & Sell AI Prompts"
        description="Choose a Paste Prompts creator membership. Free, Pro (£9.99/mo) and Platinum (£15.99/mo). Every prompt sells for £0.25 — your tier sets how much you keep."
        canonical="/pro"
        type="product"
        jsonLd={jsonLd}
      />
      <div className="container-wide py-12">
        <div className="mx-auto mb-8 max-w-2xl text-center">
          <Badge className="mb-4 bg-gradient-primary text-primary-foreground"><Crown className="mr-1 h-3.5 w-3.5" /> Memberships</Badge>
          <h1 className="font-display text-4xl font-bold sm:text-5xl">Upload more. Earn more.</h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Every single prompt sells for a fixed <b className="text-foreground">£0.25</b>. Your membership decides how many you can upload each month and how much you keep per sale.
          </p>
        </div>

        <div className="mb-8 flex items-center justify-center gap-2">
          <span className="inline-flex rounded-full border border-white/10 bg-card/60 p-1">
            <button onClick={() => setBilling("monthly")} className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${billing === "monthly" ? "bg-gradient-primary text-primary-foreground" : "text-muted-foreground"}`}>Monthly</button>
            <button onClick={() => setBilling("yearly")} className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${billing === "yearly" ? "bg-gradient-primary text-primary-foreground" : "text-muted-foreground"}`}>Yearly <span className="ml-1 text-xs opacity-80">save ~34%</span></button>
          </span>
        </div>

        <div className="mx-auto grid max-w-5xl gap-5 lg:grid-cols-3">
          {ORDER.map((key) => {
            const t = TIERS[key];
            const isCurrent = currentTier === key;
            const featured = key === "pro";
            const yearly = billing === "yearly";
            const price = key === "free" ? 0 : yearly ? (key === "pro" ? 79 : 159) : t.pricePounds;
            return (
              <div key={key} className={`relative rounded-3xl p-7 ${featured ? "glass-strong shadow-glow ring-1 ring-primary/40" : "glass"}`}>
                {featured && <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-primary px-3 py-1 text-xs font-semibold text-primary-foreground">Most popular</span>}
                <div className="flex items-center gap-2">
                  {key === "platinum" ? <Gem className="h-5 w-5 text-primary-glow" /> : key === "pro" ? <Crown className="h-5 w-5 text-primary-glow" /> : <Sparkles className="h-5 w-5 text-primary-glow" />}
                  <h2 className="font-display text-xl font-bold">{t.name}</h2>
                </div>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="font-display text-4xl font-bold">£{price}</span>
                  {key !== "free" && <span className="text-muted-foreground">/{yearly ? "year" : "month"}</span>}
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{t.blurb}</p>

                <div className="mt-5 rounded-xl border border-white/5 bg-card/40 p-3 text-xs">
                  <div className="flex items-start gap-1.5 text-muted-foreground">
                    <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary-glow" />
                    <span>Prompts sell at <b className="text-foreground">£0.25</b> — you keep <b className="text-success">{formatPrice(t.earningPence)}</b>, platform fee {formatPrice(t.feePence)}.</span>
                  </div>
                </div>

                <ul className="mt-5 space-y-2 text-sm">
                  <Li>{t.quota} prompt uploads / month</Li>
                  <Li>Keep {formatPrice(t.earningPence)} of every £0.25 sale</Li>
                  <Li>AI quality review on every upload</Li>
                  {key !== "free" && <Li>Advertise your links on your profile</Li>}
                  {key !== "free" && <Li>Featured placement & Pro badge</Li>}
                  {key === "platinum" && <Li>Top priority support</Li>}
                </ul>

                <div className="mt-6">
                  {key === "free" ? (
                    <Button asChild variant="outline" className="w-full border-white/15">
                      <Link to="/sell">{isCurrent ? "Your current plan" : "Start free"}</Link>
                    </Button>
                  ) : isCurrent ? (
                    <Button onClick={manage} disabled={portalLoading} variant="outline" className="w-full border-white/15">
                      {portalLoading ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : null} Manage subscription
                    </Button>
                  ) : (
                    <Button onClick={() => subscribe(key)} className="w-full bg-gradient-primary btn-glow">
                      <Crown className="mr-1 h-4 w-4" /> {user ? `Choose ${t.name}` : "Sign in to upgrade"}
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {isPro && (
          <p className="mt-8 text-center text-sm text-muted-foreground">
            Manage or cancel anytime — you keep access until the end of your billing period.
          </p>
        )}
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-[100] overflow-y-auto bg-background/90 p-4 backdrop-blur">
          <div className="mx-auto max-w-xl py-8">{checkoutElement}</div>
        </div>
      )}
    </Layout>
  );
}

function Li({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2">
      <Check className="mt-0.5 h-4 w-4 shrink-0 text-success" />
      <span>{children}</span>
    </li>
  );
}
