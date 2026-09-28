import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { fetchAllPaidSales, type CreatorBalance, type CreatorSale } from "@/lib/payouts";
import { formatPrice } from "@/lib/format";
import { TableShell } from "./shared";

export type Period = "7" | "30" | "all";
const gbp = (p: number) => formatPrice(p, false);
const periodLabel: Record<Period, string> = { "7": "Last 7 days", "30": "Last 30 days", all: "All time" };

export function inPeriod(iso: string, p: Period) {
  if (p === "all") return true;
  return Date.now() - new Date(iso).getTime() <= Number(p) * 86400000;
}

export function sumSales(list: CreatorSale[]) {
  return {
    count: list.length,
    gross: list.reduce((s, r) => s + r.amount_pence, 0),
    fees: list.reduce((s, r) => s + r.platform_fee_pence, 0),
    earned: list.reduce((s, r) => s + r.creator_earning_pence, 0),
    buyers: list.length,
  };
}

export function useLiveSales() {
  return useQuery({ queryKey: ["admin-all-paid-sales"], queryFn: fetchAllPaidSales });
}

export function PeriodPicker({ value, onChange }: { value: Period; onChange: (p: Period) => void }) {
  return (
    <div className="flex gap-1" role="group" aria-label="Time period">
      {(["7", "30", "all"] as Period[]).map((p) => (
        <Button key={p} size="sm" variant={value === p ? "default" : "outline"} onClick={() => onChange(p)} aria-pressed={value === p}>
          {p === "all" ? "All time" : `${p} days`}
        </Button>
      ))}
    </div>
  );
}

function Box({ label, value, cls = "" }: { label: string; value: string; cls?: string }) {
  return <div className="rounded-2xl glass p-4"><div className={`font-display text-xl font-bold ${cls}`}>{value}</div><div className="text-xs text-muted-foreground">{label}</div></div>;
}

export function SalesOverview({ sales, period, setPeriod, creators }: { sales: CreatorSale[]; period: Period; setPeriod: (p: Period) => void; creators: number }) {
  const live = sales.filter((s) => !s.is_test && inPeriod(s.created_at, period));
  const t = sumSales(live);
  const activeCreators = new Set(live.map((s) => s.creator_id)).size;
  const top = useMemo(() => {
    const m = new Map<string, { title: string; n: number; gross: number }>();
    live.forEach((s) => { const e = m.get(s.prompt_id) ?? { title: s.prompt_title, n: 0, gross: 0 }; e.n++; e.gross += s.amount_pence; m.set(s.prompt_id, e); });
    return [...m.values()].sort((a, b) => b.n - a.n).slice(0, 5);
  }, [live]);
  const testCount = sales.filter((s) => s.is_test && inPeriod(s.created_at, period)).length;
  return (
    <section className="mb-6 space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-display text-lg font-bold">Sales overview — {periodLabel[period]}</h3>
        <PeriodPicker value={period} onChange={setPeriod} />
      </div>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        <Box label="Paid sales" value={String(t.count)} />
        <Box label="Gross (buyers paid)" value={gbp(t.gross)} cls="text-success" />
        <Box label="Platform fees" value={gbp(t.fees)} />
        <Box label="Creator earnings" value={gbp(t.earned)} cls="text-warning" />
        <Box label="Creators with sales" value={`${activeCreators} / ${creators}`} />
      </div>
      {top.length > 0 && (
        <div className="rounded-2xl glass p-4 text-sm">
          <div className="mb-2 text-xs font-semibold uppercase text-muted-foreground">Best-selling prompts</div>
          <ul className="space-y-1">{top.map((p) => <li key={p.title} className="flex justify-between gap-2"><span className="truncate">{p.title}</span><span className="text-muted-foreground">{p.n} · {gbp(p.gross)}</span></li>)}</ul>
        </div>
      )}
      <p className="text-xs text-muted-foreground">Live sales only. {testCount > 0 ? `${testCount} test-card sale${testCount === 1 ? "" : "s"} in this period are excluded.` : "Test-card sales are excluded."}</p>
    </section>
  );
}

export function CreatorSalesDialog({ creator, sales, onClose }: { creator: CreatorBalance | null; sales: CreatorSale[]; onClose: () => void }) {
  const [period, setPeriod] = useState<Period>("30");
  const mine = sales.filter((s) => s.creator_id === creator?.creator_id && !s.is_test);
  const stats = (p: Period) => sumSales(mine.filter((s) => inPeriod(s.created_at, p)));
  const list = mine.filter((s) => inPeriod(s.created_at, period));
  return (
    <Dialog open={!!creator} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>@{creator?.handle} — sales & earnings</DialogTitle>
          <DialogDescription>Owed now: <b className="text-warning">{gbp(creator?.owed_pence ?? 0)}</b> · Paid so far: {gbp(creator?.paid_pence ?? 0)}</DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-3 gap-2 text-sm">
          {(["7", "30", "all"] as Period[]).map((p) => { const s = stats(p); return (
            <div key={p} className="rounded-xl border border-border p-3">
              <div className="text-xs text-muted-foreground">{periodLabel[p]}</div>
              <div className="font-display text-lg font-bold">{s.count} sale{s.count === 1 ? "" : "s"}</div>
              <div className="text-xs">{gbp(s.gross)} gross · <span className="text-warning">{gbp(s.earned)} earned</span></div>
            </div>
          ); })}
        </div>
        <div className="flex items-center justify-between gap-2 pt-2">
          <span className="text-sm font-semibold">Every sale</span>
          <PeriodPicker value={period} onChange={setPeriod} />
        </div>
        {!list.length ? <p className="py-6 text-center text-sm text-muted-foreground">No live sales in this period.</p> : (
          <TableShell head={<><th className="px-3 py-2">Prompt</th><th className="px-3 py-2">Paid</th><th className="hidden px-3 py-2 sm:table-cell">Fee</th><th className="px-3 py-2">Creator</th><th className="px-3 py-2 text-right">When</th></>}>
            {list.map((s) => (
              <tr key={s.id} className="border-b border-border/40 last:border-0">
                <td className="max-w-[200px] truncate px-3 py-2">{s.prompt_title}</td>
                <td className="px-3 py-2">{gbp(s.amount_pence)}</td>
                <td className="hidden px-3 py-2 sm:table-cell">{gbp(s.platform_fee_pence)}</td>
                <td className="px-3 py-2 text-warning">{gbp(s.creator_earning_pence)}</td>
                <td className="px-3 py-2 text-right text-xs text-muted-foreground">{new Date(s.created_at).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" })}</td>
              </tr>
            ))}
          </TableShell>
        )}
      </DialogContent>
    </Dialog>
  );
}

export function SalesLoading() { return <Loader2 className="h-4 w-4 animate-spin" />; }
