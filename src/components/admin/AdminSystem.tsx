import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Trash2, AlertTriangle, Flag, ToggleLeft, ScrollText, Sparkles, Bot, Play, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import {
  fetchErrorLogs, clearErrorLogs,
  fetchReports, resolveReport,
  fetchFeatureFlags, upsertFeatureFlag,
  fetchAuditLog,
  runMaintenance, processScheduledPosts,
} from "@/lib/admin";
import { timeAgo } from "@/lib/format";
import { TableShell, SectionHeader } from "./shared";

const levelStyles: Record<string, string> = {
  fatal: "bg-destructive/20 text-destructive",
  error: "bg-destructive/15 text-destructive",
  warn: "bg-warning/15 text-warning",
  info: "bg-primary/10 text-primary-glow",
  debug: "bg-secondary/70 text-muted-foreground",
};

export function AdminErrorLogs() {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [level, setLevel] = useState("all");
  const { data, isLoading } = useQuery({ queryKey: ["admin-errors", level], queryFn: () => fetchErrorLogs(level) });
  const clear = async () => {
    if (!confirm("Clear all error logs?")) return;
    try { await clearErrorLogs(); qc.invalidateQueries({ queryKey: ["admin-errors"] }); toast({ title: "Logs cleared" }); }
    catch (e) { toast({ title: "Failed", description: (e as Error).message, variant: "destructive" }); }
  };
  return (
    <div>
      <SectionHeader title="Error logs" desc="Runtime errors captured across the app."
        action={<Button variant="outline" className="border-destructive/30 text-destructive" onClick={clear}><Trash2 className="mr-1 h-4 w-4" />Clear</Button>} />
      <Tabs value={level} onValueChange={setLevel} className="mb-4">
        <TabsList className="bg-card/60">
          {["all", "fatal", "error", "warn", "info"].map((l) => <TabsTrigger key={l} value={l} className="capitalize">{l}</TabsTrigger>)}
        </TabsList>
      </Tabs>
      {isLoading ? <div className="grid place-items-center py-20"><Loader2 className="h-7 w-7 animate-spin text-primary" /></div>
      : !data?.length ? <p className="rounded-2xl glass p-10 text-center text-muted-foreground">No errors logged. 🎉</p> : (
        <TableShell head={<>
          <th className="px-4 py-3">Level</th><th className="px-4 py-3">Message</th><th className="px-4 py-3 text-right">When</th>
        </>}>
          {data.map((e) => (
            <tr key={e.id as string} className="border-b border-white/5 last:border-0 hover:bg-card/40">
              <td className="px-4 py-3"><Badge className={`${levelStyles[(e.level as string)] ?? ""} capitalize`}>{e.level as string}</Badge></td>
              <td className="px-4 py-3"><AlertTriangle className="mr-1 inline h-3.5 w-3.5 text-muted-foreground" />{e.message as string}</td>
              <td className="px-4 py-3 text-right text-muted-foreground">{timeAgo(e.created_at as string)}</td>
            </tr>
          ))}
        </TableShell>
      )}
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
