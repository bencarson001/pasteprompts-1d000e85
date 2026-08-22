import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Trash2, AlertTriangle, Flag, ToggleLeft, ScrollText, Sparkles, Bot, Play, Send, CreditCard, Shield, Bug, Eye, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import {
  fetchErrorLogs, clearErrorLogs,
  fetchReports, resolveReport,
  fetchFeatureFlags, upsertFeatureFlag,
  fetchAuditLog,
  runMaintenance, processScheduledPosts,
} from "@/lib/admin";
import { logPaymentError, logAdminError } from "@/lib/logger";
import { timeAgo } from "@/lib/format";
import { TableShell, SectionHeader } from "./shared";

const levelStyles: Record<string, string> = {
  fatal: "bg-destructive/20 text-destructive border-destructive/40",
  error: "bg-destructive/15 text-destructive border-destructive/30",
  warn: "bg-warning/15 text-warning border-warning/30",
  info: "bg-primary/10 text-primary-glow border-primary/20",
  debug: "bg-secondary/70 text-muted-foreground border-white/10",
};

const scopeStyles: Record<string, string> = {
  payment: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  admin: "bg-amber-500/15 text-amber-300 border-amber-500/30",
  social: "bg-blue-500/15 text-blue-300 border-blue-500/30",
  ai: "bg-purple-500/15 text-purple-300 border-purple-500/30",
  client: "bg-indigo-500/15 text-indigo-300 border-indigo-500/30",
  system: "bg-slate-500/15 text-slate-300 border-slate-500/30",
};

export function AdminErrorLogs() {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [level, setLevel] = useState("all");
  const [selectedScope, setSelectedScope] = useState<string>("all");
  const [inspectItem, setInspectItem] = useState<Record<string, unknown> | null>(null);

  const { data, isLoading } = useQuery({ queryKey: ["admin-errors", level], queryFn: () => fetchErrorLogs(level) });

  // Listen for real-time app errors
  useEffect(() => {
    const handleLogged = () => {
      qc.invalidateQueries({ queryKey: ["admin-errors"] });
      qc.invalidateQueries({ queryKey: ["admin-notifications"] });
    };
    window.addEventListener("app:error_logged", handleLogged);
    return () => window.removeEventListener("app:error_logged", handleLogged);
  }, [qc]);

  const clear = async () => {
    if (!confirm("Clear all error logs?")) return;
    try {
      await clearErrorLogs();
      qc.invalidateQueries({ queryKey: ["admin-errors"] });
      qc.invalidateQueries({ queryKey: ["admin-notifications"] });
      toast({ title: "Error logs cleared" });
    } catch (e) {
      toast({ title: "Failed", description: (e as Error).message, variant: "destructive" });
    }
  };

  const triggerTestPaymentError = async () => {
    await logPaymentError("Test Payment Diagnostic: Stripe webhook signature mismatch or invalid checkout key", {
      amount_pence: 999,
      currency: "GBP",
      env: "test_mode",
    });
    qc.invalidateQueries({ queryKey: ["admin-errors"] });
    qc.invalidateQueries({ queryKey: ["admin-notifications"] });
    toast({ title: "Logged payment error test", description: "Payment error registered and sent to admin notifications." });
  };

  const triggerTestAdminError = async () => {
    await logAdminError("Test Admin Diagnostic: Unauthorized permission attempt or scheduled job failure", {
      action: "facebook.autopilot.post",
      reason: "Page access token expired",
    });
    qc.invalidateQueries({ queryKey: ["admin-errors"] });
    qc.invalidateQueries({ queryKey: ["admin-notifications"] });
    toast({ title: "Logged admin error test", description: "Admin error registered and sent to admin notifications." });
  };

  const filteredLogs = (data ?? []).filter((e) => {
    if (selectedScope === "all") return true;
    const msg = String(e.message || "").toLowerCase();
    const detailsObj = e.details as { scope?: string } | undefined;
    const scopeVal = detailsObj?.scope?.toLowerCase() || "";
    return scopeVal === selectedScope || msg.includes(`[${selectedScope}]`);
  });

  return (
    <div>
      <SectionHeader
        title="Error logs & system alerts"
        desc="Real-time error tracking for payments, admin features, and client runtime."
        action={
          <div className="flex flex-wrap items-center gap-2">
            <Button size="sm" variant="outline" className="border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/10" onClick={triggerTestPaymentError}>
              <CreditCard className="mr-1 h-3.5 w-3.5" /> Test Payment Error
            </Button>
            <Button size="sm" variant="outline" className="border-amber-500/30 text-amber-300 hover:bg-amber-500/10" onClick={triggerTestAdminError}>
              <Shield className="mr-1 h-3.5 w-3.5" /> Test Admin Error
            </Button>
            <Button size="sm" variant="outline" className="border-destructive/30 text-destructive hover:bg-destructive/10" onClick={clear}>
              <Trash2 className="mr-1 h-3.5 w-3.5" /> Clear Logs
            </Button>
          </div>
        }
      />

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Scope Filter Buttons */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="mr-1 text-xs font-medium text-muted-foreground">Scope:</span>
          {[
            { id: "all", label: "All Scopes" },
            { id: "payment", label: "Payments", icon: CreditCard, color: "text-emerald-400" },
            { id: "admin", label: "Admin Hub", icon: Shield, color: "text-amber-400" },
            { id: "social", label: "Social", icon: Send, color: "text-blue-400" },
            { id: "ai", label: "AI", icon: Sparkles, color: "text-purple-400" },
            { id: "client", label: "Client", icon: Bug, color: "text-indigo-400" },
          ].map((s) => (
            <button
              key={s.id}
              onClick={() => setSelectedScope(s.id)}
              className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
                selectedScope === s.id
                  ? "bg-primary text-primary-foreground shadow-glow"
                  : "bg-card/60 text-muted-foreground hover:bg-card hover:text-foreground border border-white/10"
              }`}
            >
              {s.icon && <s.icon className={`h-3 w-3 ${s.color ?? ""}`} />}
              {s.label}
            </button>
          ))}
        </div>

        {/* Severity Tabs */}
        <Tabs value={level} onValueChange={setLevel}>
          <TabsList className="bg-card/60 border border-white/10">
            {["all", "fatal", "error", "warn", "info"].map((l) => (
              <TabsTrigger key={l} value={l} className="capitalize text-xs">
                {l}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      {isLoading ? (
        <div className="grid place-items-center py-20">
          <Loader2 className="h-7 w-7 animate-spin text-primary" />
        </div>
      ) : !filteredLogs.length ? (
        <div className="rounded-2xl glass p-10 text-center text-muted-foreground">
          <Bug className="mx-auto mb-2 h-8 w-8 text-primary-glow/60" />
          <p className="font-medium text-foreground">No error logs for this filter.</p>
          <p className="mt-1 text-xs">When errors occur in payments or admin, they will appear here instantly.</p>
        </div>
      ) : (
        <TableShell
          head={
            <>
              <th className="px-4 py-3">Severity</th>
              <th className="px-4 py-3">Scope</th>
              <th className="px-4 py-3">Error Message</th>
              <th className="px-4 py-3 text-right">When</th>
              <th className="px-4 py-3 text-center">Inspect</th>
            </>
          }
        >
          {filteredLogs.map((e) => {
            const rawMsg = (e.message as string) || "";
            const detailsObj = (e.details as { scope?: string; path?: string; details?: unknown; stack?: string }) || {};
            const parsedScope = detailsObj.scope || (rawMsg.match(/^\[(.*?)\]/)?.[1]?.toLowerCase() ?? "system");
            const cleanMsg = rawMsg.replace(/^\[.*?\]\s*/, "");

            return (
              <tr key={e.id as string} className="border-b border-white/5 last:border-0 hover:bg-card/40 transition-colors">
                <td className="px-4 py-3">
                  <Badge variant="outline" className={`${levelStyles[(e.level as string)] ?? ""} capitalize font-semibold`}>
                    {e.level as string}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  <Badge variant="outline" className={`${scopeStyles[parsedScope] ?? scopeStyles.system} uppercase text-[10px] tracking-wider font-bold`}>
                    {parsedScope}
                  </Badge>
                </td>
                <td className="px-4 py-3 max-w-md truncate font-mono text-xs">
                  <AlertTriangle className="mr-1.5 inline h-3.5 w-3.5 text-warning shrink-0" />
                  <span className="text-foreground font-medium">{cleanMsg}</span>
                </td>
                <td className="px-4 py-3 text-right text-xs text-muted-foreground whitespace-nowrap">
                  {timeAgo(e.created_at as string)}
                </td>
                <td className="px-4 py-3 text-center">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground hover:bg-white/10"
                    onClick={() => setInspectItem(e as Record<string, unknown>)}
                  >
                    <Eye className="h-3.5 w-3.5" />
                  </Button>
                </td>
              </tr>
            );
          })}
        </TableShell>
      )}

      {/* Inspect Error Modal */}
      <Dialog open={!!inspectItem} onOpenChange={(o) => !o && setInspectItem(null)}>
        <DialogContent className="max-w-2xl border-white/15 bg-card/95 backdrop-blur-xl text-foreground">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 font-display text-lg">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Error Details & Stack Trace
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Captured at {inspectItem?.created_at ? new Date(inspectItem.created_at as string).toLocaleString() : "—"}
            </DialogDescription>
          </DialogHeader>

          {inspectItem && (
            <div className="mt-3 space-y-4 text-xs">
              <div className="flex gap-2">
                <Badge variant="outline" className={`${levelStyles[(inspectItem.level as string)] ?? ""} capitalize font-bold`}>
                  {inspectItem.level as string}
                </Badge>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-muted-foreground uppercase">Message</label>
                <div className="mt-1 rounded-xl border border-white/10 bg-black/50 p-3 font-mono text-xs text-destructive-foreground font-medium leading-relaxed">
                  {inspectItem.message as string}
                </div>
              </div>

              {inspectItem.details && (
                <div>
                  <label className="text-[11px] font-semibold text-muted-foreground uppercase">Details & Context</label>
                  <pre className="mt-1 max-h-60 overflow-auto rounded-xl border border-white/10 bg-black/60 p-3 font-mono text-[11px] text-amber-200/90 whitespace-pre-wrap">
                    {JSON.stringify(inspectItem.details, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export function AdminReports() {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [status, setStatus] = useState("open");
  const { data, isLoading } = useQuery({ queryKey: ["admin-reports", status], queryFn: () => fetchReports(status) });
  const resolve = async (id: string, s: string) => {
    try { await resolveReport(id, s); qc.invalidateQueries({ queryKey: ["admin-reports"] }); toast({ title: `Marked ${s}` }); }
    catch (e) { toast({ title: "Failed", description: (e as Error).message, variant: "destructive" }); }
  };
  return (
    <div>
      <SectionHeader title="Reports" desc="User-submitted content reports." />
      <Tabs value={status} onValueChange={setStatus} className="mb-4">
        <TabsList className="bg-card/60">
          {["open", "resolved", "dismissed", "all"].map((s) => <TabsTrigger key={s} value={s} className="capitalize">{s}</TabsTrigger>)}
        </TabsList>
      </Tabs>
      {isLoading ? <div className="grid place-items-center py-20"><Loader2 className="h-7 w-7 animate-spin text-primary" /></div>
      : !data?.length ? <p className="rounded-2xl glass p-10 text-center text-muted-foreground">No reports.</p> : (
        <TableShell head={<>
          <th className="px-4 py-3">Reason</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">When</th><th className="px-4 py-3 text-right">Action</th>
        </>}>
          {data.map((r) => (
            <tr key={r.id as string} className="border-b border-white/5 last:border-0 hover:bg-card/40">
              <td className="px-4 py-3"><Flag className="mr-1 inline h-3.5 w-3.5 text-warning" />{(r.reason as string) ?? "—"}</td>
              <td className="px-4 py-3 capitalize">{r.status as string}</td>
              <td className="px-4 py-3 text-muted-foreground">{timeAgo(r.created_at as string)}</td>
              <td className="px-4 py-3">
                <div className="flex justify-end gap-1.5">
                  <Button size="sm" variant="outline" className="h-8 border-success/30 text-success" onClick={() => resolve(r.id as string, "resolved")}>Resolve</Button>
                  <Button size="sm" variant="outline" className="h-8 border-white/15" onClick={() => resolve(r.id as string, "dismissed")}>Dismiss</Button>
                </div>
              </td>
            </tr>
          ))}
        </TableShell>
      )}
    </div>
  );
}

const DEFAULT_FLAGS = [
  { key: "social_posting", description: "AI scheduled social posting" },
  { key: "free_uploads", description: "Allow free prompt uploads" },
  { key: "showcases", description: "Output showcases gallery" },
  { key: "referrals", description: "Referral rewards programme" },
];

export function AdminFeatureFlags() {
  const { toast } = useToast();
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ["admin-flags"], queryFn: fetchFeatureFlags });
  const map = new Map((data ?? []).map((f) => [f.key as string, f]));
  const merged = [
    ...DEFAULT_FLAGS.map((d) => ({ key: d.key, description: d.description, enabled: (map.get(d.key)?.enabled as boolean) ?? false })),
    ...(data ?? []).filter((f) => !DEFAULT_FLAGS.some((d) => d.key === f.key)).map((f) => ({ key: f.key as string, description: (f.description as string) ?? "", enabled: f.enabled as boolean })),
  ];
  const toggle = async (key: string, enabled: boolean, description?: string) => {
    try { await upsertFeatureFlag(key, enabled, description); qc.invalidateQueries({ queryKey: ["admin-flags"] }); toast({ title: `${key} ${enabled ? "on" : "off"}` }); }
    catch (e) { toast({ title: "Failed", description: (e as Error).message, variant: "destructive" }); }
  };
  if (isLoading) return <div className="grid place-items-center py-20"><Loader2 className="h-7 w-7 animate-spin text-primary" /></div>;
  return (
    <div>
      <SectionHeader title="Feature flags" desc="Toggle features across the platform instantly." />
      <div className="space-y-2">
        {merged.map((f) => (
          <div key={f.key} className="flex items-center justify-between rounded-xl glass p-4">
            <div>
              <div className="flex items-center gap-2 font-medium"><ToggleLeft className="h-4 w-4 text-primary-glow" />{f.key}</div>
              <div className="text-xs text-muted-foreground">{f.description}</div>
            </div>
            <Switch checked={f.enabled} onCheckedChange={(v) => toggle(f.key, v, f.description)} />
          </div>
        ))}
      </div>
    </div>
  );
}

export function AdminAudit() {
  const { data, isLoading } = useQuery({ queryKey: ["admin-audit"], queryFn: fetchAuditLog });
  if (isLoading) return <div className="grid place-items-center py-20"><Loader2 className="h-7 w-7 animate-spin text-primary" /></div>;
  return (
    <div>
      <SectionHeader title="Audit log" desc="Every admin action, timestamped." />
      {!data?.length ? <p className="rounded-2xl glass p-10 text-center text-muted-foreground">No actions yet.</p> : (
        <TableShell head={<>
          <th className="px-4 py-3">Action</th><th className="px-4 py-3">Target</th><th className="px-4 py-3 text-right">When</th>
        </>}>
          {data.map((a) => (
            <tr key={a.id as string} className="border-b border-white/5 last:border-0 hover:bg-card/40">
              <td className="px-4 py-3"><ScrollText className="mr-1 inline h-3.5 w-3.5 text-muted-foreground" />{a.action as string}</td>
              <td className="px-4 py-3 text-muted-foreground">{(a.target_type as string) ?? "—"}</td>
              <td className="px-4 py-3 text-right text-muted-foreground">{timeAgo(a.created_at as string)}</td>
            </tr>
          ))}
        </TableShell>
      )}
    </div>
  );
}

const AI_PROCESSES = [
  { key: "ai_try_sandbox", label: "Try it live (prompt preview)", description: "Let visitors run prompts live with AI on the prompt page. Uses AI credits — keep off to save credits." },
  { key: "ai_moderation", label: "Auto-moderation", description: "AI reviews & approves/rejects pending prompts during maintenance. Uses AI credits." },
  { key: "ai_vetting", label: "Upload vetting", description: "AI quality check when creators submit a prompt to sell. Uses AI credits. (When off, a 200-character length check is still enforced.)" },
  { key: "ai_social_captions", label: "Social caption AI", description: "Generate social captions in the AI scheduler. Uses AI credits." },
  { key: "social_posting", label: "Scheduled auto-posting", description: "Publish due scheduled posts to connected platforms." },
];

export function AdminAI() {
  const { toast } = useToast();
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ["admin-flags"], queryFn: fetchFeatureFlags });
  const [running, setRunning] = useState<string | null>(null);
  const map = new Map((data ?? []).map((f) => [f.key as string, f]));

  // Missing flag = enabled by default (matches the edge-function behaviour).
  const enabledOf = (key: string) => {
    const f = map.get(key);
    return f ? (f.enabled as boolean) : true;
  };

  const toggle = async (key: string, enabled: boolean, description?: string) => {
    try {
      await upsertFeatureFlag(key, enabled, description);
      qc.invalidateQueries({ queryKey: ["admin-flags"] });
      toast({ title: `${key} ${enabled ? "on" : "off"}` });
    } catch (e) { toast({ title: "Failed", description: (e as Error).message, variant: "destructive" }); }
  };

  const run = async (which: "maintenance" | "posts") => {
    setRunning(which);
    try {
      const res = which === "maintenance" ? await runMaintenance() : await processScheduledPosts();
      toast({ title: which === "maintenance" ? "Maintenance ran" : "Scheduled posts processed", description: JSON.stringify(res).slice(0, 140) });
    } catch (e) { toast({ title: "Failed", description: (e as Error).message, variant: "destructive" }); }
    finally { setRunning(null); }
  };

  if (isLoading) return <div className="grid place-items-center py-20"><Loader2 className="h-7 w-7 animate-spin text-primary" /></div>;

  return (
    <div>
      <SectionHeader title="AI controls" desc="Turn AI processes on or off, and run automation on demand." />
      <div className="mb-6 space-y-2">
        {AI_PROCESSES.map((p) => (
          <div key={p.key} className="flex items-center justify-between rounded-xl glass p-4">
            <div>
              <div className="flex items-center gap-2 font-medium"><Sparkles className="h-4 w-4 text-primary-glow" />{p.label}</div>
              <div className="text-xs text-muted-foreground">{p.description}</div>
            </div>
            <Switch checked={enabledOf(p.key)} onCheckedChange={(v) => toggle(p.key, v, p.label)} />
          </div>
        ))}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl glass p-5">
          <div className="mb-1 flex items-center gap-2 font-medium"><Bot className="h-4 w-4 text-primary-glow" />Site maintenance</div>
          <p className="mb-3 text-xs text-muted-foreground">Recompute trending, refresh featured, AI-moderate the queue and prune stale listings.</p>
          <Button onClick={() => run("maintenance")} disabled={running !== null}>
            {running === "maintenance" ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <Play className="mr-1 h-4 w-4" />}Run now
          </Button>
        </div>
        <div className="rounded-2xl glass p-5">
          <div className="mb-1 flex items-center gap-2 font-medium"><Send className="h-4 w-4 text-primary-glow" />Scheduled posts</div>
          <p className="mb-3 text-xs text-muted-foreground">Publish any social posts that are due to their connected platforms.</p>
          <Button onClick={() => run("posts")} disabled={running !== null}>
            {running === "posts" ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <Play className="mr-1 h-4 w-4" />}Process now
          </Button>
        </div>
      </div>
    </div>
  );
}
