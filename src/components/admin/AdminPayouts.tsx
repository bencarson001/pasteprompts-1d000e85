import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Search, Copy, Wallet, CheckCircle2, AlertCircle, History } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { fetchCreatorBalances, fetchPayouts, recordPayout, type CreatorBalance } from "@/lib/payouts";
import { formatPrice, timeAgo } from "@/lib/format";
import { SectionHeader, TableShell } from "./shared";

const gbp = (p: number) => formatPrice(p, false);
const methodLabel: Record<string, string> = { paypal: "PayPal", bank: "Bank transfer", other: "Other" };

export function AdminPayouts() {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [filter, setFilter] = useState<"owed" | "all" | "paid">("owed");
  const [q, setQ] = useState("");
  const [paying, setPaying] = useState<CreatorBalance | null>(null);
  const [history, setHistory] = useState<CreatorBalance | null>(null);

  const { data, isLoading, isError, error } = useQuery({ queryKey: ["admin-balances"], queryFn: fetchCreatorBalances });
  const { data: payouts } = useQuery({ queryKey: ["admin-payouts"], queryFn: () => fetchPayouts() });

  const rows = useMemo(() => {
    const term = q.trim().toLowerCase();
    return (data ?? []).filter((r) => {
      if (filter === "owed" && r.owed_pence <= 0) return false;
      if (filter === "paid" && r.owed_pence > 0) return false;
      if (!term) return true;
      return [r.handle, r.display_name, r.email].some((v) => v?.toLowerCase().includes(term));
    });
  }, [data, filter, q]);

  const totals = useMemo(() => {
    const all = data ?? [];
    return {
      owed: all.reduce((s, r) => s + r.owed_pence, 0),
      paid: all.reduce((s, r) => s + r.paid_pence, 0),
      earned: all.reduce((s, r) => s + r.earned_pence, 0),
      needPaying: all.filter((r) => r.owed_pence > 0).length,
      missingDetails: all.filter((r) => r.owed_pence > 0 && !r.payout_details).length,
    };
  }, [data]);

  const copy = (t: string) => { navigator.clipboard.writeText(t); toast({ title: "Copied" }); };

  if (isLoading) return <div className="grid place-items-center py-20"><Loader2 className="h-7 w-7 animate-spin text-primary" /></div>;
  if (isError) return <p className="rounded-2xl glass p-10 text-center text-destructive">Couldn't load payouts: {(error as Error).message}</p>;

  return (
    <div>
      <SectionHeader title="Creator payouts" desc="Who is owed money from real (live) sales. Send the money yourself (bank or PayPal), then record it here." />

      <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Owed to creators now" value={gbp(totals.owed)} cls="text-warning" />
        <Stat label="Creators to pay" value={String(totals.needPaying)} cls="text-warning" />
        <Stat label="Paid out (all time)" value={gbp(totals.paid)} cls="text-success" />
        <Stat label="Earned by creators (all time)" value={gbp(totals.earned)} />
      </div>
      {totals.missingDetails > 0 && (
        <p className="mb-4 flex items-center gap-2 rounded-xl border border-warning/30 bg-warning/10 p-3 text-sm text-warning">
          <AlertCircle className="h-4 w-4 shrink-0" /> {totals.missingDetails} creator{totals.missingDetails === 1 ? " is" : "s are"} owed money but hasn't added payout details yet. You can still email them.
        </p>
      )}

      <div className="mb-4 flex flex-wrap items-center gap-2">
        {(["owed", "paid", "all"] as const).map((f) => (
          <Button key={f} size="sm" variant={filter === f ? "default" : "outline"} onClick={() => setFilter(f)}>
            {f === "owed" ? `Needs paying (${totals.needPaying})` : f === "paid" ? "Nothing owed" : "All creators"}
          </Button>
        ))}
        <div className="relative ml-auto w-full sm:w-64">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search creator or email…" className="pl-9" aria-label="Search creators" />
        </div>
      </div>

      {!rows.length ? (
        <p className="rounded-2xl glass p-10 text-center text-muted-foreground">
          {filter === "owed" ? "No creators need paying right now. 🎉" : "No creators match."}
        </p>
      ) : (
        <TableShell head={<>
          <th className="px-4 py-3">Creator</th>
          <th className="px-4 py-3">Owed</th>
          <th className="hidden px-4 py-3 md:table-cell">Earned / Paid</th>
          <th className="hidden px-4 py-3 lg:table-cell">Pay to</th>
          <th className="px-4 py-3 text-right">Action</th>
        </>}>
          {rows.map((r) => (
            <tr key={r.creator_id} className="border-b border-white/5 last:border-0 hover:bg-card/40">
              <td className="px-4 py-3">
                <div className="font-medium">@{r.handle} <Badge className="ml-1 capitalize">{r.membership_tier}</Badge></div>
                <div className="text-xs text-muted-foreground">{r.email ?? "no email"} · {r.paid_sales} paid sale{r.paid_sales === 1 ? "" : "s"}</div>
              </td>
              <td className="px-4 py-3">
                {r.owed_pence > 0
                  ? <span className="font-display text-lg font-bold text-warning">{gbp(r.owed_pence)}</span>
                  : <span className="inline-flex items-center gap-1 text-sm text-success"><CheckCircle2 className="h-4 w-4" />Nothing owed</span>}
              </td>
              <td className="hidden px-4 py-3 text-sm text-muted-foreground md:table-cell">
                {gbp(r.earned_pence)} earned<br />{gbp(r.paid_pence)} paid{r.last_paid_at ? ` · last ${timeAgo(r.last_paid_at)}` : ""}
              </td>
              <td className="hidden max-w-[220px] px-4 py-3 text-sm lg:table-cell">
                {r.payout_details ? (
                  <button onClick={() => copy(r.payout_details!)} className="group text-left" title="Copy">
                    <span className="text-xs text-muted-foreground">{methodLabel[r.payout_method ?? "other"]}</span>
                    <span className="flex items-center gap-1 break-all">{r.payout_details}<Copy className="h-3 w-3 shrink-0 opacity-50 group-hover:opacity-100" /></span>
                  </button>
                ) : <span className="text-xs text-muted-foreground">Not added yet</span>}
              </td>
              <td className="px-4 py-3">
                <div className="flex justify-end gap-1.5">
                  <Button size="sm" variant="outline" className="h-8" onClick={() => setHistory(r)} aria-label="Payout history"><History className="h-4 w-4" /></Button>
                  <Button size="sm" className="h-8" disabled={r.owed_pence <= 0} onClick={() => setPaying(r)}><Wallet className="mr-1 h-4 w-4" />Pay</Button>
                </div>
              </td>
            </tr>
          ))}
        </TableShell>
      )}

      <h3 className="mb-3 mt-8 font-display text-lg font-bold">Recent payouts</h3>
      {!payouts?.length ? <p className="rounded-2xl glass p-6 text-center text-sm text-muted-foreground">No payouts recorded yet.</p> : (
        <TableShell head={<><th className="px-4 py-3">Creator</th><th className="px-4 py-3">Amount</th><th className="hidden px-4 py-3 sm:table-cell">Method / ref</th><th className="px-4 py-3 text-right">When</th></>}>
          {payouts.slice(0, 50).map((p) => (
            <tr key={p.id} className="border-b border-white/5 last:border-0">
              <td className="px-4 py-3">@{data?.find((d) => d.creator_id === p.creator_id)?.handle ?? "—"}</td>
              <td className="px-4 py-3 text-success">{gbp(p.amount_pence)}</td>
              <td className="hidden px-4 py-3 text-muted-foreground sm:table-cell">{methodLabel[p.method] ?? p.method}{p.reference ? ` · ${p.reference}` : ""}</td>
              <td className="px-4 py-3 text-right text-muted-foreground">{new Date(p.paid_at).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" })}</td>
            </tr>
          ))}
        </TableShell>
      )}

      <PayDialog creator={paying} onClose={() => setPaying(null)} onDone={() => {
        qc.invalidateQueries({ queryKey: ["admin-balances"] });
        qc.invalidateQueries({ queryKey: ["admin-payouts"] });
      }} />

      <Dialog open={!!history} onOpenChange={(o) => !o && setHistory(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Payouts to @{history?.handle}</DialogTitle></DialogHeader>
          {(() => {
            const list = (payouts ?? []).filter((p) => p.creator_id === history?.creator_id);
            return list.length ? (
              <ul className="space-y-2 text-sm">
                {list.map((p) => (
                  <li key={p.id} className="rounded-lg border border-white/10 p-3">
                    <div className="flex justify-between"><b className="text-success">{gbp(p.amount_pence)}</b><span className="text-muted-foreground">{new Date(p.paid_at).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" })}</span></div>
                    <div className="text-xs text-muted-foreground">{methodLabel[p.method] ?? p.method}{p.reference ? ` · ref ${p.reference}` : ""}{p.note ? ` · ${p.note}` : ""}</div>
                  </li>
                ))}
              </ul>
            ) : <p className="text-sm text-muted-foreground">No payouts yet.</p>;
          })()}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Stat({ label, value, cls = "" }: { label: string; value: string; cls?: string }) {
  return (
    <div className="rounded-2xl glass p-4">
      <div className={`font-display text-2xl font-bold ${cls}`}>{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  );
}

function PayDialog({ creator, onClose, onDone }: { creator: CreatorBalance | null; onClose: () => void; onDone: () => void }) {
  const { toast } = useToast();
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("bank");
  const [reference, setReference] = useState("");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [lastId, setLastId] = useState<string | null>(null);

  if (creator && lastId !== creator.creator_id) {
    setLastId(creator.creator_id);
    setAmount((creator.owed_pence / 100).toFixed(2));
    setMethod(creator.payout_method ?? "bank");
    setReference(""); setNote("");
  }

  const submit = async () => {
    if (!creator) return;
    const pence = Math.round(parseFloat(amount) * 100);
    if (!Number.isFinite(pence) || pence <= 0) { toast({ title: "Enter an amount", variant: "destructive" }); return; }
    if (pence > creator.owed_pence) { toast({ title: `Max is ${gbp(creator.owed_pence)}`, variant: "destructive" }); return; }
    setSaving(true);
    try {
      await recordPayout({ creatorId: creator.creator_id, amountPence: pence, method, reference, note });
      toast({ title: `Recorded ${gbp(pence)} paid to @${creator.handle}` });
      onDone(); onClose(); setLastId(null);
    } catch (e) {
      toast({ title: "Couldn't record payout", description: (e as Error).message, variant: "destructive" });
    } finally { setSaving(false); }
  };

  return (
    <Dialog open={!!creator} onOpenChange={(o) => { if (!o) { onClose(); setLastId(null); } }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Pay @{creator?.handle}</DialogTitle>
          <DialogDescription>
            1. Send the money yourself using their details below. 2. Then press "Mark as paid" so it's recorded and they're notified.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="rounded-xl border border-white/10 bg-card/40 p-3 text-sm">
            <div className="text-xs text-muted-foreground">Owed</div>
            <div className="font-display text-xl font-bold text-warning">{gbp(creator?.owed_pence ?? 0)}</div>
            <div className="mt-2 text-xs text-muted-foreground">Pay to ({methodLabel[creator?.payout_method ?? ""] ?? "not set"})</div>
            <div className="break-all">{creator?.payout_details ?? `No details added — contact ${creator?.email ?? "them"}`}</div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label htmlFor="po-amt">Amount (£)</Label><Input id="po-amt" inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value)} /></div>
            <div><Label>Method</Label>
              <Select value={method} onValueChange={setMethod}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="bank">Bank transfer</SelectItem><SelectItem value="paypal">PayPal</SelectItem><SelectItem value="other">Other</SelectItem></SelectContent>
              </Select>
            </div>
          </div>
          <div><Label htmlFor="po-ref">Payment reference (optional)</Label><Input id="po-ref" value={reference} onChange={(e) => setReference(e.target.value)} placeholder="e.g. PayPal transaction ID" /></div>
          <div><Label htmlFor="po-note">Note (optional)</Label><Textarea id="po-note" rows={2} value={note} onChange={(e) => setNote(e.target.value)} /></div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => { onClose(); setLastId(null); }}>Cancel</Button>
          <Button onClick={submit} disabled={saving}>{saving && <Loader2 className="mr-1 h-4 w-4 animate-spin" />}Mark as paid</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
