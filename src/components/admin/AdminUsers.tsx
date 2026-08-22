import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Search, ShieldCheck } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  fetchAdminUsers, setUserTier, setUserCreator, fetchAdminRoles, setAdminRole,
} from "@/lib/admin";
import { formatPrice, formatCount, timeAgo } from "@/lib/format";
import { TableShell, SectionHeader } from "./shared";

const tierStyles: Record<string, string> = {
  free: "bg-secondary/70 text-muted-foreground",
  pro: "bg-primary/15 text-primary-glow",
  platinum: "bg-warning/15 text-warning",
};

export function AdminUsers() {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [q, setQ] = useState("");
  const [search, setSearch] = useState("");

  const { data: users, isLoading } = useQuery({ queryKey: ["admin-users", search], queryFn: () => fetchAdminUsers(search) });
  const { data: roles } = useQuery({ queryKey: ["admin-roles"], queryFn: fetchAdminRoles });
  const adminIds = new Set((roles ?? []).filter((r) => r.role === "admin").map((r) => r.user_id));

  const act = async (fn: () => Promise<void>, msg: string) => {
    try {
      await fn();
      qc.invalidateQueries({ queryKey: ["admin-users"] });
      qc.invalidateQueries({ queryKey: ["admin-roles"] });
      toast({ title: msg });
    } catch (e) {
      toast({ title: "Action failed", description: (e as Error).message, variant: "destructive" });
    }
  };

  return (
    <div>
      <SectionHeader title="Members" desc="Change membership tiers, creator status and admin access." />
      <form
        onSubmit={(e) => { e.preventDefault(); setSearch(q); }}
        className="mb-4 flex max-w-md items-center gap-2"
      >
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search handle or name…" className="pl-9" />
        </div>
        <Button type="submit" variant="secondary">Search</Button>
      </form>

      {isLoading ? (
        <div className="grid place-items-center py-20"><Loader2 className="h-7 w-7 animate-spin text-primary" /></div>
      ) : !users?.length ? (
        <p className="rounded-2xl glass p-10 text-center text-muted-foreground">No members found.</p>
      ) : (
        <TableShell
          head={<>
            <th className="px-4 py-3">Member</th>
            <th className="hidden px-4 py-3 sm:table-cell">Tier</th>
            <th className="hidden px-4 py-3 md:table-cell">Sales</th>
            <th className="hidden px-4 py-3 lg:table-cell">Earnings</th>
            <th className="px-4 py-3 text-right">Manage</th>
          </>}
        >
          {users.map((u) => {
            const isAdmin = adminIds.has(u.id as string);
            return (
              <tr key={u.id as string} className="border-b border-white/5 last:border-0 hover:bg-card/40">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1.5 font-medium">
                    @{u.handle as string}
                    {isAdmin && <ShieldCheck className="h-3.5 w-3.5 text-primary-glow" />}
                  </div>
                  <div className="text-xs text-muted-foreground">{u.display_name as string} · {timeAgo(u.created_at as string)}</div>
                </td>
                <td className="hidden px-4 py-3 sm:table-cell">
                  <Badge className={`${tierStyles[(u.membership_tier as string) ?? "free"]} capitalize`}>
                    {(u.membership_tier as string) ?? "free"}
                  </Badge>
                </td>
                <td className="hidden px-4 py-3 text-muted-foreground md:table-cell">{formatCount((u.total_sales as number) ?? 0)}</td>
                <td className="hidden px-4 py-3 text-muted-foreground lg:table-cell">{formatPrice((u.total_earnings_pence as number) ?? 0, false)}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap items-center justify-end gap-1.5">
                    <Select
                      value={(u.membership_tier as string) ?? "free"}
                      onValueChange={(v) => act(() => setUserTier(u.id as string, v as "free" | "pro" | "platinum"), `Set @${u.handle} to ${v}`)}
                    >
                      <SelectTrigger className="h-8 w-[110px]"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="free">Free</SelectItem>
                        <SelectItem value="pro">Pro</SelectItem>
                        <SelectItem value="platinum">Platinum</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      size="sm" variant="outline" className="h-8 border-white/15"
                      onClick={() => act(() => setUserCreator(u.id as string, !(u.is_creator as boolean)), (u.is_creator ? "Removed creator" : "Made creator"))}
                    >
                      {u.is_creator ? "Creator ✓" : "Make creator"}
                    </Button>
                    <Button
                      size="sm" variant="outline"
                      className={`h-8 ${isAdmin ? "border-destructive/30 text-destructive" : "border-primary/30 text-primary-glow"}`}
                      onClick={() => act(() => setAdminRole(u.id as string, !isAdmin), isAdmin ? "Revoked admin" : "Granted admin")}
                    >
                      {isAdmin ? "Revoke admin" : "Make admin"}
                    </Button>
                  </div>
                </td>
              </tr>
            );
          })}
        </TableShell>
      )}
    </div>
  );
}
