import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { fetchAdminSales } from "@/lib/admin";
import { formatPrice, timeAgo } from "@/lib/format";
import { TableShell, SectionHeader } from "./shared";

export function AdminSales() {
  const { data, isLoading } = useQuery({ queryKey: ["admin-sales"], queryFn: fetchAdminSales });

  if (isLoading) return <div className="grid place-items-center py-20"><Loader2 className="h-7 w-7 animate-spin text-primary" /></div>;

  return (
    <div>
      <SectionHeader title="Sales" desc="Every purchase with platform fee and creator payout split." />
      {!data?.length ? (
        <p className="rounded-2xl glass p-10 text-center text-muted-foreground">No sales yet.</p>
      ) : (
        <TableShell
          head={<>
            <th className="px-4 py-3">Prompt</th>
            <th className="px-4 py-3">Sale</th>
            <th className="hidden px-4 py-3 sm:table-cell">Platform fee</th>
            <th className="hidden px-4 py-3 sm:table-cell">Creator</th>
            <th className="px-4 py-3 text-right">When</th>
          </>}
        >
          {data.map((s) => {
            const prompt = s.prompt as unknown as { title?: string } | null;
            return (
              <tr key={s.id as string} className="border-b border-white/5 last:border-0 hover:bg-card/40">
                <td className="px-4 py-3 font-medium">{prompt?.title ?? "—"}</td>
                <td className="px-4 py-3">{formatPrice((s.amount_pence as number) ?? 0, s.is_free as boolean)}</td>
                <td className="hidden px-4 py-3 text-warning sm:table-cell">{formatPrice((s.platform_fee_pence as number) ?? 0, false)}</td>
                <td className="hidden px-4 py-3 text-success sm:table-cell">{formatPrice((s.creator_earning_pence as number) ?? 0, false)}</td>
                <td className="px-4 py-3 text-right text-muted-foreground">{timeAgo(s.created_at as string)}</td>
              </tr>
            );
          })}
        </TableShell>
      )}
    </div>
  );
}
