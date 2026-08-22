import { useQuery } from "@tanstack/react-query";
import {
  FileText, Clock, CheckCircle2, XCircle, Users, UserCheck,
  ShoppingBag, Coins, HandCoins, CreditCard, TrendingUp, Loader2,
} from "lucide-react";
import { fetchAdminOverview } from "@/lib/admin";
import { formatPrice, formatCount } from "@/lib/format";
import { SectionHeader } from "./shared";

export function AdminOverview() {
  const { data, isLoading } = useQuery({ queryKey: ["admin-overview"], queryFn: fetchAdminOverview });

  if (isLoading) return <div className="grid place-items-center py-20"><Loader2 className="h-7 w-7 animate-spin text-primary" /></div>;

  const cards = [
    { label: "Total prompts", value: formatCount(data?.prompts ?? 0), icon: FileText, tone: "text-primary-glow" },
    { label: "Pending review", value: formatCount(data?.pending ?? 0), icon: Clock, tone: "text-warning" },
    { label: "Approved", value: formatCount(data?.approved ?? 0), icon: CheckCircle2, tone: "text-success" },
    { label: "Rejected", value: formatCount(data?.rejected ?? 0), icon: XCircle, tone: "text-destructive" },
    { label: "Members", value: formatCount(data?.users ?? 0), icon: Users, tone: "text-primary-glow" },
    { label: "Creators", value: formatCount(data?.creators ?? 0), icon: UserCheck, tone: "text-primary-glow" },
    { label: "Sales", value: formatCount(data?.sales ?? 0), icon: ShoppingBag, tone: "text-primary-glow" },
    { label: "Gross revenue", value: formatPrice(data?.grossPence ?? 0, false), icon: Coins, tone: "text-success" },
    { label: "Platform fees", value: formatPrice(data?.feesPence ?? 0, false), icon: Coins, tone: "text-warning" },
    { label: "Creator payouts", value: formatPrice(data?.payoutsPence ?? 0, false), icon: HandCoins, tone: "text-success" },
    { label: "Active subs", value: formatCount(data?.activeSubs ?? 0), icon: CreditCard, tone: "text-primary-glow" },
    { label: "Est. MRR", value: formatPrice(data?.mrrPence ?? 0, false), icon: TrendingUp, tone: "text-success" },
  ];

  return (
    <div>
      <SectionHeader title="Overview" desc="Live marketplace pulse — revenue, members and moderation." />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} className="rounded-2xl glass p-5">
            <c.icon className={`mb-2 h-5 w-5 ${c.tone}`} />
            <div className="font-display text-2xl font-bold">{c.value}</div>
            <div className="text-xs text-muted-foreground">{c.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
