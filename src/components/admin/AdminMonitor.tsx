import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, TrendingUp, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import {
  fetchQuotaMonitor, fetchAdminSubscriptions, fetchAdminReferrals, recomputeTrending,
} from "@/lib/admin";
import { formatPrice, timeAgo } from "@/lib/format";
import { TableShell, SectionHeader } from "./shared";

export function AdminQuota() {
  const { data, isLoading } = useQuery({ queryKey: ["admin-quota"], queryFn: fetchQuotaMonitor });
  if (isLoading) return <div className="grid place-items-center py-20"><Loader2 className="h-7 w-7 animate-spin text-primary" /></div>;
  return (
    <div>
      <SectionHeader title="Upload quotas" desc="Monthly upload usage per creator by tier." />
      {!data?.length ? <p className="rounded-2xl glass p-10 text-center text-muted-foreground">No creators yet.</p> : (
        <div className="space-y-2">
          {data.map((row) => (
            <div key={row.handle} className="rounded-xl glass p-4">
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="font-medium">@{row.handle} <Badge className="ml-1 capitalize">{row.tier}</Badge></span>
                <span className="text-muted-foreground">{row.used} / {row.quota}</span>
              </div>
              <Progress value={Math.min(100, (row.used / row.quota) * 100)} className="h-2" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function AdminSubscriptions() {
  const { data, isLoading } = useQuery({ queryKey: ["admin-subs"], queryFn: fetchAdminSubscriptions });
  if (isLoading) return <div className="grid place-items-center py-20"><Loader2 className="h-7 w-7 animate-spin text-primary" /></div>;
  return (
    <div>
      <SectionHeader title="Subscriptions" desc="Active and historical paid memberships." />
      {!data?.length ? <p className="rounded-2xl glass p-10 text-center text-muted-foreground">No subscriptions.</p> : (
        <TableShell head={<>
          <th className="px-4 py-3">Plan</th><th className="px-4 py-3">Status</th>
          <th className="hidden px-4 py-3 sm:table-cell">Renews</th><th className="px-4 py-3 text-right">Started</th>
        </>}>
          {data.map((s) => (
            <tr key={s.id as string} className="border-b border-white/5 last:border-0 hover:bg-card/40">
              <td className="px-4 py-3 font-medium">{(s.price_id as string) ?? "—"}</td>
              <td className="px-4 py-3 capitalize">{s.status as string}</td>
              <td className="hidden px-4 py-3 text-muted-foreground sm:table-cell">{s.current_period_end ? timeAgo(s.current_period_end as string) : "—"}</td>
              <td className="px-4 py-3 text-right text-muted-foreground">{timeAgo(s.created_at as string)}</td>
            </tr>
          ))}
        </TableShell>
      )}
    </div>
  );
}

export function AdminReferrals() {
  const { data, isLoading } = useQuery({ queryKey: ["admin-referrals"], queryFn: fetchAdminReferrals });
  if (isLoading) return <div className="grid place-items-center py-20"><Loader2 className="h-7 w-7 animate-spin text-primary" /></div>;
  return (
    <div>
      <SectionHeader title="Referrals" desc="Referral rewards and their status." />
      {!data?.length ? <p className="rounded-2xl glass p-10 text-center text-muted-foreground">No referrals.</p> : (
        <TableShell head={<>
          <th className="px-4 py-3">Status</th><th className="px-4 py-3">Reward</th><th className="px-4 py-3 text-right">When</th>
        </>}>
          {data.map((r) => (
            <tr key={r.id as string} className="border-b border-white/5 last:border-0 hover:bg-card/40">
              <td className="px-4 py-3 capitalize">{r.status as string}</td>
              <td className="px-4 py-3 text-success">{formatPrice((r.reward_pence as number) ?? 0, false)}</td>
              <td className="px-4 py-3 text-right text-muted-foreground">{timeAgo(r.created_at as string)}</td>
            </tr>
          ))}
        </TableShell>
      )}
    </div>
  );
}

export function AdminTrending() {
  const { toast } = useToast();
  const qc = useQueryClient();
  const run = async () => {
    try { await recomputeTrending(); qc.invalidateQueries(); toast({ title: "Trending recomputed" }); }
    catch (e) { toast({ title: "Failed", description: (e as Error).message, variant: "destructive" }); }
  };
  return (
    <div className="rounded-2xl glass p-6">
      <div className="mb-1 flex items-center gap-2 font-display text-lg font-bold"><TrendingUp className="h-5 w-5 text-primary-glow" />Trending engine</div>
      <p className="mb-4 text-sm text-muted-foreground">Recalculate trending scores from sales, views and ratings.</p>
      <Button onClick={run}><RefreshCw className="mr-1 h-4 w-4" />Recompute now</Button>
    </div>
  );
}
