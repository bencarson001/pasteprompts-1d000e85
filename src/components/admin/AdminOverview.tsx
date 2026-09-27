import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  FileText, Clock, CheckCircle2, XCircle, Users, UserCheck, Gift, Tag,
  ShoppingBag, Coins, HandCoins, CreditCard, Loader2, AlertTriangle,
} from "lucide-react";
import { fetchAdminOverview, type AdminOverviewData } from "@/lib/admin";
import { formatPrice, formatCount, timeAgo } from "@/lib/format";
import { cn } from "@/lib/utils";
import { SectionHeader } from "./shared";

const PERIODS = [7, 30, 90];

function Bars({ data, label }: { data: { date: string; value: number; value2?: number }[]; label: string }) {
  const max = Math.max(1, ...data.map((d) => d.value + (d.value2 ?? 0)));
  const total = data.reduce((s, d) => s + d.value + (d.value2 ?? 0), 0);
  if (total === 0) return <p className="py-10 text-center text-sm text-muted-foreground">No {label} in this period.</p>;
  return (
    <div className="flex h-32 items-end gap-[2px]" role="img" aria-label={`${label}: ${total} in total`}>
      {data.map((d) => (
        <div key={d.date} className="flex h-full flex-1 flex-col justify-end" title={`${d.date}: ${d.value}${d.value2 !== undefined ? ` paid, ${d.value2} free` : ""}`}>
          {d.value2 !== undefined && d.value2 > 0 && <div className="rounded-t-sm bg-muted-foreground/40" style={{ height: `${(d.value2 / max) * 100}%` }} />}
          {d.value > 0 && <div className="rounded-t-sm bg-primary" style={{ height: `${(d.value / max) * 100}%` }} />}
        </div>
      ))}
    </div>
  );
}

function Panel({ title, sub, children }: { title: string; sub?: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl glass p-5">
      <h3 className="font-display text-sm font-semibold">{title}</h3>
      {sub && <p className="mb-3 text-xs text-muted-foreground">{sub}</p>}
      {children}
    </div>
  );
}

function RankList({ items, empty }: { items: { name: string; count: number }[]; empty: string }) {
  if (!items.length) return <p className="py-4 text-sm text-muted-foreground">{empty}</p>;
  const max = Math.max(...items.map((i) => i.count));
  return (
    <ul className="space-y-2">
      {items.map((i) => (
        <li key={i.name} className="text-sm">
          <div className="flex justify-between gap-2"><span className="truncate">{i.name}</span><span className="text-muted-foreground">{i.count}</span></div>
          <div className="mt-1 h-1.5 rounded-full bg-secondary"><div className="h-full rounded-full bg-primary" style={{ width: `${(i.count / max) * 100}%` }} /></div>
        </li>
      ))}
    </ul>
  );
}

export function AdminOverview() {
  const [days, setDays] = useState(30);
  const { data, isLoading, isError, error } = useQuery<AdminOverviewData>({
    queryKey: ["admin-overview", days],
    queryFn: () => fetchAdminOverview(days),
  });

  if (isLoading) return <div className="grid place-items-center py-20"><Loader2 className="h-7 w-7 animate-spin text-primary" /></div>;
  if (isError || !data) return <p className="rounded-2xl glass p-10 text-center text-destructive">Couldn't load the overview: {(error as Error)?.message ?? "unknown error"}</p>;

  const allTime = [
    { label: "Registered members", value: formatCount(data.users), icon: Users },
    { label: "Creators", value: formatCount(data.creators), icon: UserCheck },
    { label: "Approved prompts (live)", value: formatCount(data.approved), icon: CheckCircle2, tone: "text-success" },
    { label: "Pending review", value: formatCount(data.pending), icon: Clock, tone: "text-warning" },
    { label: "Rejected", value: formatCount(data.rejected), icon: XCircle, tone: "text-destructive" },
    { label: "Live free prompts", value: formatCount(data.approvedFree), icon: Gift },
    { label: "Live paid prompts (£0.25)", value: formatCount(data.approvedPaid), icon: Tag },
    { label: "All prompts (any status)", value: formatCount(data.prompts), icon: FileText },
  ];
  const money = [
    { label: "Completed paid sales", value: formatCount(data.paidSales), icon: ShoppingBag },
    { label: "Free claims", value: formatCount(data.freeClaims), icon: Gift },
    { label: "Gross sales (buyers paid)", value: formatPrice(data.grossPence, false), icon: Coins, tone: "text-success" },
    { label: "Platform fees", value: formatPrice(data.feesPence, false), icon: Coins },
    { label: "Creator earnings (not paid out)", value: formatPrice(data.creatorEarnedPence, false), icon: HandCoins },
    { label: "Active subscriptions", value: formatCount(data.activeSubs), icon: CreditCard },
  ];
  const Card = ({ c }: { c: { label: string; value: string; icon: typeof Users; tone?: string } }) => (
    <div className="rounded-2xl glass p-4">
      <c.icon className={cn("mb-2 h-5 w-5 text-primary-glow", c.tone)} />
      <div className="font-display text-2xl font-bold">{c.value}</div>
      <div className="text-xs text-muted-foreground">{c.label}</div>
    </div>
  );

  return (
    <div className="space-y-6">
      <SectionHeader title="Overview" desc="Real figures from your database. Totals below are all-time unless a period is shown." />

      {data.partial.length > 0 && (
        <p className="flex items-center gap-2 rounded-xl border border-warning/30 bg-warning/10 p-3 text-sm text-warning">
          <AlertTriangle className="h-4 w-4" /> Some figures couldn't be loaded ({data.partial.join(", ")}) and show as 0.
        </p>
      )}

      <section>
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Members & prompts — all time</h3>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">{allTime.map((c) => <Card key={c.label} c={c} />)}</div>
      </section>

      <section>
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Sales — all time</h3>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">{money.map((c) => <Card key={c.label} c={c} />)}</div>
        <p className="mt-2 text-xs text-muted-foreground">Sales are only recorded after Stripe confirms payment. Creator earnings are owed, not paid — payouts aren't built yet.</p>
      </section>

      <section className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Activity — last {days} days</h3>
          <div className="flex gap-1" role="group" aria-label="Time period">
            {PERIODS.map((p) => (
              <button key={p} onClick={() => setDays(p)} aria-pressed={days === p}
                className={cn("rounded-lg px-3 py-1 text-xs font-medium", days === p ? "bg-primary text-primary-foreground" : "glass text-muted-foreground hover:text-foreground")}>
                {p}d
              </button>
            ))}
          </div>
        </div>
        <div className="grid gap-3 lg:grid-cols-2">
          <Panel title="Prompt submissions" sub={`${data.submissionsByDay.reduce((s, d) => s + d.count, 0)} submitted, any status`}>
            <Bars label="submissions" data={data.submissionsByDay.map((d) => ({ date: d.date, value: d.count }))} />
          </Panel>
          <Panel title="Purchases" sub="Blue = paid sales, grey = free claims">
            <Bars label="purchases" data={data.purchasesByDay.map((d) => ({ date: d.date, value: d.paid, value2: d.free }))} />
          </Panel>
          <Panel title="Categories of new prompts" sub="Prompts submitted in this period">
            <RankList items={data.topCategories} empty="No prompts submitted in this period." />
          </Panel>
          <Panel title="Most active creators" sub="Prompts submitted in this period">
            <RankList items={data.topCreators.map((c) => ({ name: `@${c.handle}`, count: c.count }))} empty="No creator activity in this period." />
          </Panel>
        </div>
      </section>

      <Panel title="Recent activity" sub="Latest prompts, purchases and sign-ups">
        {!data.recent.length ? <p className="text-sm text-muted-foreground">No recent activity.</p> : (
          <ul className="divide-y divide-border/40">
            {data.recent.map((r, i) => (
              <li key={i} className="flex justify-between gap-3 py-2 text-sm">
                <span className="min-w-0 truncate">{r.label}</span>
                <span className="shrink-0 text-xs text-muted-foreground">{timeAgo(r.at)}</span>
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </div>
  );
}
