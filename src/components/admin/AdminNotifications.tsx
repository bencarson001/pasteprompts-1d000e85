import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Loader2, FileText, Flag, Inbox, AlertTriangle, UserPlus, ShoppingBag, CheckCheck, Bell,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { fetchAdminNotifications, markNotifsSeen, type AdminNotification } from "@/lib/admin";
import { timeAgo } from "@/lib/format";
import { SectionHeader, Empty } from "./shared";

const KIND_ICON: Record<AdminNotification["kind"], typeof FileText> = {
  prompt: FileText,
  report: Flag,
  feedback: Inbox,
  error: AlertTriangle,
  user: UserPlus,
  sale: ShoppingBag,
};

const SEV_STYLE: Record<AdminNotification["severity"], string> = {
  info: "bg-primary/10 text-primary-glow",
  warning: "bg-warning/15 text-warning",
  critical: "bg-destructive/15 text-destructive",
};

export function AdminNotifications({ onNavigate }: { onNavigate?: (tab: string) => void }) {
  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ["admin-notifications"],
    queryFn: fetchAdminNotifications,
    refetchInterval: 60000,
  });

  const grouped = useMemo(() => {
    const g: Record<string, number> = {};
    for (const n of data ?? []) g[n.kind] = (g[n.kind] ?? 0) + 1;
    return g;
  }, [data]);

  const markAll = () => {
    markNotifsSeen();
    refetch();
  };

  return (
    <div>
      <SectionHeader
        title="Notifications"
        desc="Everything that needs your attention, in one live feed."
        action={
          <Button variant="outline" className="border-white/15" onClick={markAll}>
            <CheckCheck className="mr-1 h-4 w-4" />
            Mark all seen
          </Button>
        }
      />

      <div className="mb-5 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
        {(
          [
            ["prompt", "Pending", FileText],
            ["report", "Reports", Flag],
            ["feedback", "Feedback", Inbox],
            ["error", "Errors", AlertTriangle],
            ["user", "New users", UserPlus],
            ["sale", "Sales", ShoppingBag],
          ] as const
        ).map(([kind, label, Icon]) => (
          <div key={kind} className="rounded-xl glass p-3">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Icon className="h-3.5 w-3.5" />
              {label}
            </div>
            <div className="mt-1 font-display text-2xl font-bold">{grouped[kind] ?? 0}</div>
          </div>
        ))}
      </div>

      {isLoading ? (
        <div className="grid place-items-center py-20">
          <Loader2 className="h-7 w-7 animate-spin text-primary" />
        </div>
      ) : !data?.length ? (
        <Empty>
          <Bell className="mx-auto mb-2 h-6 w-6 opacity-50" />
          You're all caught up. 🎉
        </Empty>
      ) : (
        <div className="space-y-2">
          {data.map((n) => {
            const Icon = KIND_ICON[n.kind];
            return (
              <button
                key={n.id}
                onClick={() => n.tab && onNavigate?.(n.tab)}
                className="flex w-full items-center gap-3 rounded-xl glass p-3.5 text-left transition-colors hover:bg-card/60"
              >
                <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg ${SEV_STYLE[n.severity]}`}>
                  <Icon className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{n.title}</span>
                    {n.severity === "critical" && <Badge className="bg-destructive/15 text-destructive">urgent</Badge>}
                  </div>
                  <div className="truncate text-sm text-muted-foreground">{n.detail}</div>
                </div>
                <span className="shrink-0 text-xs text-muted-foreground">{timeAgo(n.created_at)}</span>
              </button>
            );
          })}
        </div>
      )}
      {isRefetching && <p className="mt-3 text-center text-xs text-muted-foreground">Refreshing…</p>}
    </div>
  );
}
