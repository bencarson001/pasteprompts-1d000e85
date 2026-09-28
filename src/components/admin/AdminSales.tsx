import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Ban } from "lucide-react";
import { fetchAdminSales, voidSaleAdmin } from "@/lib/admin";
import { formatPrice, timeAgo } from "@/lib/format";
import { TableShell, SectionHeader } from "./shared";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

export function AdminSales() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [voidingId, setVoidingId] = useState<string | null>(null);

  const { data, isLoading, isError } = useQuery({ queryKey: ["admin-sales"], queryFn: fetchAdminSales });

  const handleVoid = async (id: string, title: string) => {
    if (!confirm(`Void sale for "${title}"? This zeroes out fees/earnings and marks the record as voided without deleting it.`)) return;
    setVoidingId(id);
    try {
      await voidSaleAdmin(id);
      qc.invalidateQueries({ queryKey: ["admin-sales"] });
      qc.invalidateQueries({ queryKey: ["admin-balances"] });
      toast({ title: "Sale voided", description: `Record for "${title}" marked as voided.` });
    } catch (e) {
      toast({ title: "Failed to void sale", description: (e as Error).message, variant: "destructive" });
    } finally {
      setVoidingId(null);
    }
  };

  if (isLoading) return <div className="grid place-items-center py-20"><Loader2 className="h-7 w-7 animate-spin text-primary" /></div>;

  return (
    <div>
      <SectionHeader title="Sales" desc="Completed purchases (recorded only after Stripe confirms payment), newest 300. Creator share is owed, not yet paid out." />
      {isError ? (
        <p className="rounded-2xl glass p-10 text-center text-destructive">Couldn't load sales.</p>
      ) : !data?.length ? (
        <p className="rounded-2xl glass p-10 text-center text-muted-foreground">No sales yet.</p>
      ) : (
        <TableShell
          head={<>
            <th className="px-4 py-3">Prompt</th>
            <th className="px-4 py-3">Sale</th>
            <th className="hidden px-4 py-3 sm:table-cell">Platform fee</th>
            <th className="hidden px-4 py-3 sm:table-cell">Creator share (unpaid)</th>
            <th className="px-4 py-3">When</th>
            <th className="px-4 py-3 text-right">Action</th>
          </>}
        >
          {data.map((s) => {
            const prompt = s.prompt as unknown as { title?: string } | null;
            const sessionStr = (s as { stripe_session_id?: string | null }).stripe_session_id ?? "";
            const isVoided = (s.amount_pence === 0 && !s.is_free) || sessionStr.includes("[VOIDED]");

            return (
              <tr key={s.id as string} className="border-b border-white/5 last:border-0 hover:bg-card/40">
                <td className="px-4 py-3 font-medium flex items-center gap-2">
                  <span>{prompt?.title ?? "—"}</span>
                  {isVoided && <Badge variant="destructive" className="text-[10px] uppercase font-bold">Voided</Badge>}
                </td>
                <td className="px-4 py-3">{formatPrice((s.amount_pence as number) ?? 0, s.is_free as boolean)}</td>
                <td className="hidden px-4 py-3 text-warning sm:table-cell">{formatPrice((s.platform_fee_pence as number) ?? 0, false)}</td>
                <td className="hidden px-4 py-3 text-success sm:table-cell">{formatPrice((s.creator_earning_pence as number) ?? 0, false)}</td>
                <td className="px-4 py-3 text-muted-foreground">{timeAgo(s.created_at as string)}</td>
                <td className="px-4 py-3 text-right">
                  {!s.is_free && !isVoided && (
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={voidingId === s.id}
                      onClick={() => handleVoid(s.id as string, prompt?.title ?? "Prompt")}
                      className="h-8 border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive"
                    >
                      {voidingId === s.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <><Ban className="mr-1 h-3.5 w-3.5" /> Void sale</>}
                    </Button>
                  )}
                </td>
              </tr>
            );
          })}
        </TableShell>
      )}
    </div>
  );
}
