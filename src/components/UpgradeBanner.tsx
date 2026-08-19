import { Link } from "react-router-dom";
import { Crown, Sparkles, TrendingUp, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscription } from "@/hooks/useSubscription";
import { useQuery } from "@tanstack/react-query";
import { fetchMyTierInfo } from "@/lib/queries";
import { TIERS, formatPrice, type TierKey } from "@/lib/format";
import { Button } from "@/components/ui/button";

interface Props {
  /** Total sales the creator has made (paid only). Used to compute lost earnings. */
  totalSales?: number;
  variant?: "dashboard" | "post-sale" | "post-publish";
  className?: string;
}

/**
 * Converts free/Pro creators into higher tiers by showing the exact £ they'd
 * have earned on their real sales at the next tier. Post-sale/post-publish
 * variants use loss-aversion + scarcity.
 */
export function UpgradeBanner({ totalSales = 0, variant = "dashboard", className = "" }: Props) {
  const { user } = useAuth();
  const { isPro } = useSubscription();
  const [dismissed, setDismissed] = useState(false);

  const { data: tierInfo } = useQuery({
    queryKey: ["my-tier", user?.id],
    enabled: !!user?.id,
    queryFn: () => fetchMyTierInfo(user!.id),
  });

  const currentKey: TierKey = tierInfo?.tier ?? "free";
  const isAdmin = tierInfo?.isAdmin ?? false;

  useEffect(() => {
    if (variant !== "dashboard") return;
    setDismissed(sessionStorage.getItem("upgradeBannerDismissed") === "1");
  }, [variant]);

  if (!user || isAdmin || dismissed) return null;
  // Hide for Platinum — top tier already.
  if (currentKey === "platinum") return null;
  // Hide for Pro users who are already subscribed unless we want to upsell to Platinum.
  const targetKey: TierKey = currentKey === "free" ? "pro" : "platinum";
  if (currentKey === "pro" && !isPro) {
    // Free-tier user shown as pro somehow — bail.
    return null;
  }

  const current = TIERS[currentKey];
  const target = TIERS[targetKey];
  const perSaleDelta = target.earningPence - current.earningPence; // in pence
  const lostSoFar = perSaleDelta * totalSales;
  const monthlyBreakEven = Math.ceil((target.pricePounds * 100) / perSaleDelta);

  const dismiss = () => {
    if (variant === "dashboard") sessionStorage.setItem("upgradeBannerDismissed", "1");
    setDismissed(true);
  };

  const headline =
    variant === "post-sale"
      ? "You just made a sale — imagine keeping more of every one 💸"
      : variant === "post-publish"
        ? "Prompt published! Unlock higher earnings on every future sale"
        : totalSales > 0
          ? `You've left ${formatPrice(lostSoFar)} on the table so far`
          : `Earn ${formatPrice(perSaleDelta)} more on every sale`;

  const sub =
    totalSales > 0 && variant === "dashboard"
      ? `At ${target.name}, your ${totalSales} sale${totalSales === 1 ? "" : "s"} would have paid ${formatPrice(perSaleDelta * totalSales + current.earningPence * totalSales)} instead of ${formatPrice(current.earningPence * totalSales)}.`
      : `${target.name} creators keep ${formatPrice(target.earningPence)} per 25p sale (vs ${formatPrice(current.earningPence)} on ${current.name}) and can upload up to ${target.quota} prompts/month. Break-even at just ${monthlyBreakEven} extra sales.`;

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/15 via-primary/5 to-transparent p-5 shadow-glow ${className}`}
      role="region"
      aria-label="Upgrade offer"
    >
      <button
        onClick={dismiss}
        className="absolute right-3 top-3 rounded-full p-1 text-muted-foreground hover:bg-white/10 hover:text-foreground"
        aria-label="Dismiss upgrade banner"
      >
        <X className="h-4 w-4" />
      </button>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-gradient-primary shadow-glow">
          {variant === "post-sale" ? (
            <TrendingUp className="h-6 w-6 text-primary-foreground" />
          ) : variant === "post-publish" ? (
            <Sparkles className="h-6 w-6 text-primary-foreground" />
          ) : (
            <Crown className="h-6 w-6 text-primary-foreground" />
          )}
        </span>
        <div className="flex-1">
          <h3 className="font-display text-lg font-bold leading-tight">{headline}</h3>
          <p className="mt-1 text-sm text-muted-foreground">{sub}</p>
          <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
            <li>✓ {formatPrice(target.earningPence)}/sale (was {formatPrice(current.earningPence)})</li>
            <li>✓ {target.quota} uploads/month</li>
            <li>✓ Cancel anytime</li>
          </ul>
        </div>
        <Button asChild className="bg-gradient-primary btn-glow shrink-0">
          <Link to="/pro">Upgrade to {target.name} — £{target.pricePounds}/mo</Link>
        </Button>
      </div>
    </div>
  );
}

export default UpgradeBanner;
