import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Wallet, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { fetchMyPayoutSummary, fetchMyPayoutDetails, saveMyPayoutDetails, fetchPayouts, type PayoutDetails } from "@/lib/payouts";
import { formatPrice } from "@/lib/format";

const gbp = (p: number) => formatPrice(p, false);

export function PayoutPanel({ userId }: { userId: string }) {
  const { toast } = useToast();
  const qc = useQueryClient();
  const { data: summary } = useQuery({ queryKey: ["my-payout-summary", userId], queryFn: fetchMyPayoutSummary });
  const { data: details } = useQuery({ queryKey: ["my-payout-details", userId], queryFn: () => fetchMyPayoutDetails(userId) });
  const { data: payouts } = useQuery({ queryKey: ["my-payouts", userId], queryFn: () => fetchPayouts(userId) });
  const [form, setForm] = useState<PayoutDetails>({ method: "paypal", details: "" });
  const [saving, setSaving] = useState(false);
  useEffect(() => { if (details) setForm(details); }, [details]);

  const save = async () => {
    if (form.details.trim().length < 3) { toast({ title: "Add your payout details", variant: "destructive" }); return; }
    setSaving(true);
    try {
      await saveMyPayoutDetails(userId, form);
      qc.invalidateQueries({ queryKey: ["my-payout-details"] });
      toast({ title: "Payout details saved" });
    } catch (e) { toast({ title: "Couldn't save", description: (e as Error).message, variant: "destructive" }); }
    finally { setSaving(false); }
  };

  const cards = [
    { label: "Total earned", value: gbp(summary?.earned_pence ?? 0), cls: "" },
    { label: "Paid to you", value: gbp(summary?.paid_pence ?? 0), cls: "text-success" },
    { label: "Owed to you", value: gbp(summary?.owed_pence ?? 0), cls: "text-warning" },
  ];

  return (
    <section className="mb-10 rounded-2xl glass p-5" aria-labelledby="payouts-h">
      <h2 id="payouts-h" className="mb-4 flex items-center gap-2 font-display text-xl font-bold"><Wallet className="h-5 w-5 text-primary-glow" />Earnings & payouts</h2>
      <div className="mb-4 grid grid-cols-3 gap-3">
        {cards.map((c) => (
          <div key={c.label} className="rounded-xl border border-white/5 bg-card/40 p-3">
            <div className={`font-display text-xl font-bold ${c.cls}`}>{c.value}</div>
            <div className="text-xs text-muted-foreground">{c.label}</div>
          </div>
        ))}
      </div>
      <p className="mb-4 text-xs text-muted-foreground">
        Earnings come from confirmed paid sales. Payouts are sent manually by the Paste Prompts team to the details below, and you'll get a notification when one is sent.
      </p>
      <div className="grid gap-3 sm:grid-cols-[160px_1fr_auto] sm:items-end">
        <div><Label>Pay me by</Label>
          <Select value={form.method} onValueChange={(v) => setForm((f) => ({ ...f, method: v as PayoutDetails["method"] }))}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent><SelectItem value="paypal">PayPal</SelectItem><SelectItem value="bank">UK bank transfer</SelectItem><SelectItem value="other">Other</SelectItem></SelectContent>
          </Select>
        </div>
        <div><Label htmlFor="pd">{form.method === "paypal" ? "PayPal email" : form.method === "bank" ? "Name, sort code, account number" : "Details"}</Label>
          <Input id="pd" maxLength={500} value={form.details} onChange={(e) => setForm((f) => ({ ...f, details: e.target.value }))} />
        </div>
        <Button onClick={save} disabled={saving}>{saving && <Loader2 className="mr-1 h-4 w-4 animate-spin" />}Save</Button>
      </div>
      <p className="mt-2 text-xs text-muted-foreground">Only you and Paste Prompts admins can see these details.</p>
      {!!payouts?.length && (
        <ul className="mt-4 space-y-1 text-sm">
          {payouts.map((p) => (
            <li key={p.id} className="flex justify-between border-t border-white/5 pt-1">
              <span className="text-success">{gbp(p.amount_pence)}</span>
              <span className="text-muted-foreground">{new Date(p.paid_at).toLocaleDateString("en-GB", { dateStyle: "medium" })}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
