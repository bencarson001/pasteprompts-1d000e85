import { Fragment, useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Loader2, Sparkles, Send, Facebook, RefreshCw, Image as ImageIcon,
  Smile, CheckCircle2, Circle, AlertCircle, History, Pencil, Check, X, Users,
  CalendarClock, ChevronDown, ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { SectionHeader, TableShell, Empty } from "./shared";
import { timeAgo } from "@/lib/format";
import { FacebookGroups } from "./FacebookGroups";
import { FacebookConnection } from "./FacebookConnection";


interface PoolRow {
  id: string;
  content: string;
  has_media: boolean;
  emoji_only: boolean;
  cycle_id: number;
  posted_at: string | null;
  fb_post_id: string | null;
  last_error: string | null;
  generated_at: string;
  image_url: string | null;
}

interface CycleRow {
  cycle_id: number;
  attach_media: boolean;
  notes: string | null;
}

async function fetchPool(): Promise<PoolRow[]> {
  const { data, error } = await supabase
    .from("fb_post_pool" as never)
    .select("*")
    .order("cycle_id", { ascending: false })
    .order("posted_at", { ascending: false, nullsFirst: true })
    .limit(500);
  if (error) throw error;
  return (data ?? []) as unknown as PoolRow[];
}

async function fetchCycles(): Promise<CycleRow[]> {
  const { data, error } = await supabase
    .from("fb_autopilot_cycles" as never)
    .select("cycle_id, attach_media, notes")
    .order("cycle_id", { ascending: false });
  if (error) throw error;
  return (data ?? []) as unknown as CycleRow[];
}

interface ScheduleRow {
  id: number;
  enabled: boolean;
  days_of_week: number[];
  post_hour: number;
  start_date: string;
  weeks: number;
}

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

async function fetchSchedule(): Promise<ScheduleRow | null> {
  const { data, error } = await supabase
    .from("fb_autopilot_schedule" as never)
    .select("id, enabled, days_of_week, post_hour, start_date, weeks")
    .eq("id", 1)
    .maybeSingle();
  if (error) throw error;
  return (data ?? null) as unknown as ScheduleRow | null;
}

function ScheduleCard() {
  const { toast } = useToast();
  const qc = useQueryClient();
  const { data } = useQuery({ queryKey: ["admin-fb-schedule"], queryFn: fetchSchedule });
  const [form, setForm] = useState<ScheduleRow | null>(null);
  const [timeStr, setTimeStr] = useState<string>(() => {
    const saved = typeof window !== "undefined" ? localStorage.getItem("fb_autopilot_post_time") : null;
    return saved || "18:00";
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (data) {
      setForm(data);
      const saved = typeof window !== "undefined" ? localStorage.getItem("fb_autopilot_post_time") : null;
      if (saved && saved.startsWith(`${String(data.post_hour).padStart(2, "0")}:`)) {
        setTimeStr(saved);
      } else {
        const fallbackMin = (saved && saved.split(":")[1]) || "00";
        setTimeStr(`${String(data.post_hour).padStart(2, "0")}:${fallbackMin}`);
      }
    }
  }, [data]);

  if (!form) return null;

  const handleTimeChange = (newVal: string) => {
    setTimeStr(newVal);
    if (typeof window !== "undefined") {
      localStorage.setItem("fb_autopilot_post_time", newVal);
    }
    const [h] = newVal.split(":");
    const hourNum = parseInt(h, 10);
    if (!isNaN(hourNum)) {
      setForm((prev) => (prev ? { ...prev, post_hour: Math.min(23, Math.max(0, hourNum)) } : null));
    }
  };

  const toggleDay = (d: number) =>
    setForm({
      ...form,
      days_of_week: form.days_of_week.includes(d)
        ? form.days_of_week.filter((x) => x !== d)
        : [...form.days_of_week, d].sort((a, b) => a - b),
    });

  const save = async () => {
    if (!form) return;
    setSaving(true);
    if (typeof window !== "undefined") {
      localStorage.setItem("fb_autopilot_post_time", timeStr);
    }
    const [h] = timeStr.split(":");
    const hourNum = parseInt(h, 10);
    const validHour = !isNaN(hourNum) ? Math.min(23, Math.max(0, hourNum)) : form.post_hour;

    const { error } = await (supabase as unknown as { from: (t: string) => { upsert: (r: unknown, o: { onConflict: string }) => Promise<{ error: { message: string } | null }> } })
      .from("fb_autopilot_schedule")
      .upsert({
        id: 1,
        enabled: form.enabled,
        days_of_week: form.days_of_week.length ? form.days_of_week : [0, 1, 2, 3, 4, 5, 6],
        post_hour: validHour,
        start_date: form.start_date,
        weeks: Math.min(260, Math.max(1, form.weeks || 1)),
      }, { onConflict: "id" });
    setSaving(false);
    if (error) { toast({ title: "Save failed", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Schedule saved", description: `Autopilot scheduled for ${timeStr} (Europe/London).` });
    qc.invalidateQueries({ queryKey: ["admin-fb-schedule"] });
  };

  const endDate = new Date(new Date(form.start_date).getTime() + form.weeks * 7 * 86400000);

  return (
    <div className="mb-5 rounded-2xl glass p-4">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <CalendarClock className="h-4 w-4 text-primary" />
          <div>
            <p className="text-sm font-semibold">Automatic posting schedule</p>
            <p className="text-xs text-muted-foreground">
              A random unposted item is published on each selected day, then ticked off. When all 30 are used, the AI generates 30 brand-new posts.
            </p>
          </div>
        </div>
        <label className="flex items-center gap-2 text-xs text-muted-foreground">
          {form.enabled ? "Enabled" : "Paused"}
          <Switch checked={form.enabled} onCheckedChange={(v) => setForm({ ...form, enabled: v })} />
        </label>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        {DAY_LABELS.map((label, i) => {
          const on = form.days_of_week.includes(i);
          return (
            <Button
              key={label}
              type="button"
              size="sm"
              variant={on ? "default" : "secondary"}
              className="min-w-[3.25rem]"
              onClick={() => toggleDay(i)}
              aria-pressed={on}
            >
              {label}
            </Button>
          );
        })}
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <label className="text-xs text-muted-foreground">
          Post time (Europe/London)
          <Input
            type="time"
            value={timeStr}
            onChange={(e) => handleTimeChange(e.target.value)}
            className="mt-1 h-9 bg-card/60"
          />
        </label>
        <label className="text-xs text-muted-foreground">
          Start date
          <Input
            type="date" value={form.start_date}
            onChange={(e) => setForm({ ...form, start_date: e.target.value })}
            className="mt-1 h-9"
          />
        </label>
        <label className="text-xs text-muted-foreground">
          Number of weeks
          <Input
            type="number" min={1} max={260} value={form.weeks}
            onChange={(e) => setForm({ ...form, weeks: Number(e.target.value) })}
            className="mt-1 h-9"
          />
        </label>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-muted-foreground">
          Runs until <strong className="text-foreground">{endDate.toLocaleDateString()}</strong> ·{" "}
          {form.days_of_week.length || 7} day{(form.days_of_week.length || 7) === 1 ? "" : "s"}/week at <strong className="text-foreground">{timeStr}</strong> (Europe/London)
        </p>
        <Button onClick={save} disabled={saving} size="sm">
          {saving ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <Check className="mr-1 h-4 w-4" />}Save schedule
        </Button>
      </div>
    </div>
  );
}


export function AdminFacebookAutopilot() {
  const { toast } = useToast();
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ["admin-fb-pool"], queryFn: fetchPool });
  const { data: cycles } = useQuery({ queryKey: ["admin-fb-cycles"], queryFn: fetchCycles });
  const [genLoading, setGenLoading] = useState(false);
  const [postLoading, setPostLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingUrl, setEditingUrl] = useState("");
  const [postingId, setPostingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [imagingId, setImagingId] = useState<string | null>(null);
  const [imagingAll, setImagingAll] = useState(false);


  const currentCycle = useMemo(() => {
    const rows = data ?? [];
    return rows.length ? Math.max(...rows.map((r) => r.cycle_id)) : null;
  }, [data]);

  const stats = useMemo(() => {
    if (!data || !currentCycle) return null;
    const current = data.filter((r) => r.cycle_id === currentCycle);
    const posted = current.filter((r) => r.posted_at).length;
    const withMedia = current.filter((r) => r.has_media).length;
    const withImage = current.filter((r) => r.image_url).length;
    return {
      currentCycle,
      total: current.length,
      posted,
      remaining: current.length - posted,
      withMedia,
      withImage,
      generatedAt: current[0]?.generated_at,
    };
  }, [data, currentCycle]);

  const currentCycleRow = cycles?.find((c) => c.cycle_id === currentCycle) ?? null;

  const refresh = () => {
    qc.invalidateQueries({ queryKey: ["admin-fb-pool"] });
    qc.invalidateQueries({ queryKey: ["admin-fb-cycles"] });
  };

  const regenerate = async () => {
    if (!confirm("Regenerate the 30-post pool now? This uses AI credits (once per quarter is enough).")) return;
    setGenLoading(true);
    try {
      const { data: res, error } = await supabase.functions.invoke("generate-fb-post-pool", { body: {} });
      if (error) throw error;
      if ((res as { error?: string })?.error) throw new Error((res as { error: string }).error);
      toast({ title: "New pool generated", description: `Cycle ${(res as { cycle_id: number }).cycle_id} — ${(res as { generated: number }).generated} posts.` });
      refresh();
    } catch (e) {
      toast({ title: "Generation failed", description: (e as Error).message, variant: "destructive" });
    } finally {
      setGenLoading(false);
    }
  };

  const postOne = async (id: string) => {
    if (!confirm("Publish this post to your Facebook Page and 9 random groups now?")) return;
    setPostingId(id);
    try {
      const { data: res, error } = await supabase.functions.invoke("post-daily-fb", { body: { post_id: id } });
      if (error) throw error;
      const r = res as { ok: boolean; error?: string; fb_post_id?: string; with_image?: boolean; groups_posted?: number };
      if (!r.ok) throw new Error(r.error ?? "Post failed");
      toast({
        title: "Posted to Facebook",
        description: `${r.with_image ? "Photo post" : "Text post"} · ${r.groups_posted ?? 0} group${r.groups_posted === 1 ? "" : "s"}`,
      });
      refresh();
    } catch (e) {
      toast({ title: "Post failed", description: (e as Error).message, variant: "destructive" });
    } finally {
      setPostingId(null);
    }
  };

  const generateImage = async (id: string) => {
    setImagingId(id);
    try {
      const { data: res, error } = await supabase.functions.invoke("generate-fb-image", { body: { post_id: id, force: true } });
      if (error) throw error;
      const r = res as { ok: boolean; results?: Array<{ ok: boolean; error?: string }> };
      const first = r.results?.[0];
      if (!first?.ok) throw new Error(first?.error ?? "Image generation failed");
      toast({ title: "Image generated", description: "Saved to this post's image URL, ready to publish." });
      refresh();
    } catch (e) {
      toast({ title: "Image generation failed", description: (e as Error).message, variant: "destructive" });
    } finally {
      setImagingId(null);
    }
  };

  const generateAllImages = async () => {
    if (!confirm("Generate images for every post in this cycle that asks for one? This is free (no AI credits used).")) return;
    setImagingAll(true);
    try {
      const { data: res, error } = await supabase.functions.invoke("generate-fb-image", { body: { all: true } });
      if (error) throw error;
      const r = res as { error?: string; generated?: number; total?: number };
      if (r.error) throw new Error(r.error);
      toast({ title: "Images generated", description: `${r.generated ?? 0} of ${r.total ?? 0} posts now have an image.` });
      refresh();
    } catch (e) {
      toast({ title: "Image generation failed", description: (e as Error).message, variant: "destructive" });
    } finally {
      setImagingAll(false);
    }
  };



  const postNow = async () => {

    setPostLoading(true);
    try {
      const { data: res, error } = await supabase.functions.invoke("post-daily-fb", { body: {} });
      if (error) throw error;
      const r = res as { ok: boolean; error?: string; fb_post_id?: string; with_image?: boolean };
      if (!r.ok) throw new Error(r.error ?? "Post failed");
      toast({
        title: "Posted to Facebook",
        description: `${r.with_image ? "Photo post" : "Text post"} — ${r.fb_post_id ?? r.error ?? "Done."}`,
      });
      refresh();
    } catch (e) {
      toast({ title: "Post failed", description: (e as Error).message, variant: "destructive" });
    } finally {
      setPostLoading(false);
    }
  };

  const toggleAttach = async (cycleId: number, next: boolean) => {
    const { error } = await (supabase as unknown as { from: (t: string) => { upsert: (row: unknown, opts: { onConflict: string }) => Promise<{ error: { message: string } | null }> } })
      .from("fb_autopilot_cycles")
      .upsert({ cycle_id: cycleId, attach_media: next }, { onConflict: "cycle_id" });
    if (error) {
      toast({ title: "Toggle failed", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: next ? "Media attaching enabled" : "Media attaching disabled", description: `Cycle #${cycleId}` });
    refresh();
  };

  const saveImageUrl = async (id: string) => {
    const url = editingUrl.trim();
    const { error } = await (supabase as unknown as { from: (t: string) => { update: (row: unknown) => { eq: (c: string, v: string) => Promise<{ error: { message: string } | null }> } } })
      .from("fb_post_pool")
      .update({ image_url: url === "" ? null : url })
      .eq("id", id);
    if (error) {
      toast({ title: "Save failed", description: error.message, variant: "destructive" });
      return;
    }
    setEditingId(null);
    setEditingUrl("");
    refresh();
  };

  return (
    <div>
      <SectionHeader
        title="Facebook autopilot"
        desc="A pool of 30 posts. One random unposted item publishes on each scheduled day and is ticked off; when the pool runs out the AI writes 30 brand-new posts. Click any post to expand it or publish it immediately."
        action={
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" onClick={postNow} disabled={postLoading || !stats}>
              {postLoading ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <Send className="mr-1 h-4 w-4" />}Post one now
            </Button>
            <Button variant="secondary" onClick={generateAllImages} disabled={imagingAll || !stats}>
              {imagingAll ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <ImageIcon className="mr-1 h-4 w-4" />}Generate all images
            </Button>
            <Button onClick={regenerate} disabled={genLoading}>
              {genLoading ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <Sparkles className="mr-1 h-4 w-4" />}
              {stats ? "Regenerate pool" : "Generate pool"}
            </Button>
            <Button variant="ghost" size="icon" onClick={refresh} title="Refresh"><RefreshCw className="h-4 w-4" /></Button>
          </div>
        }
      />

      <div className="mb-5">
        <FacebookConnection />
      </div>

      <ScheduleCard />

      {stats && (
        <div className="mb-5 grid gap-3 sm:grid-cols-4">
          <StatCard label="Cycle" value={`#${stats.currentCycle}`} />
          <StatCard label="Posted this cycle" value={`${stats.posted} / ${stats.total}`} />
          <StatCard label="Image attached" value={`${stats.withImage} / ${stats.total}`} />
          <StatCard label="Pool generated" value={stats.generatedAt ? timeAgo(stats.generatedAt) : "—"} />
        </div>
      )}

      {currentCycleRow && (
        <div className="mb-5 flex items-center justify-between rounded-2xl glass p-4">
          <div>
            <p className="text-sm font-semibold">Attach media on cycle #{currentCycleRow.cycle_id}</p>
            <p className="text-xs text-muted-foreground">
              When on, any post with an image URL below will be published as a photo. When off, every post goes out as plain text.
            </p>
          </div>
          <Switch
            checked={currentCycleRow.attach_media}
            onCheckedChange={(v) => toggleAttach(currentCycleRow.cycle_id, v)}
          />
        </div>
      )}

      <Tabs defaultValue="current">
        <TabsList className="mb-4">
          <TabsTrigger value="current">Current cycle</TabsTrigger>
          <TabsTrigger value="history"><History className="mr-1 h-4 w-4" />Posting history</TabsTrigger>
          <TabsTrigger value="groups"><Users className="mr-1 h-4 w-4" />Groups</TabsTrigger>
        </TabsList>

        <TabsContent value="current">
          {isLoading ? (
            <Loader />
          ) : !data?.length ? (
            <Empty>No posts yet. Click <strong className="text-foreground">Generate pool</strong> to create the first 30.</Empty>
          ) : (
            <PoolTable
              rows={data.filter((r) => r.cycle_id === currentCycle)}
              editingId={editingId}
              editingUrl={editingUrl}
              onStartEdit={(r) => { setEditingId(r.id); setEditingUrl(r.image_url ?? ""); }}
              onChangeUrl={setEditingUrl}
              onSave={saveImageUrl}
              onCancel={() => { setEditingId(null); setEditingUrl(""); }}
              showCycle={false}
              expandedId={expandedId}
              onToggleExpand={(id) => setExpandedId((cur) => (cur === id ? null : id))}
              postingId={postingId}
              onPostOne={postOne}
              imagingId={imagingId}
              onGenerateImage={generateImage}
            />
          )}
        </TabsContent>

        <TabsContent value="history">
          {isLoading ? (
            <Loader />
          ) : !data?.length ? (
            <Empty>Nothing published yet.</Empty>
          ) : (
            <HistoryView rows={data} cycles={cycles ?? []} onToggle={toggleAttach} />
          )}
        </TabsContent>

        <TabsContent value="groups">
          <FacebookGroups />
        </TabsContent>
      </Tabs>

      <p className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
        <Facebook className="h-3.5 w-3.5" />
        Add <code className="rounded bg-secondary/50 px-1">FACEBOOK_PAGE_ID</code> and <code className="rounded bg-secondary/50 px-1">FACEBOOK_PAGE_ACCESS_TOKEN</code> secrets to publish live. Without them, the daily job runs as a dry-run and still rotates the pool.
      </p>
    </div>
  );
}

function Loader() {
  return <div className="grid place-items-center py-20"><Loader2 className="h-7 w-7 animate-spin text-primary" /></div>;
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl glass p-4">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-1 font-display text-2xl font-bold">{value}</p>
    </div>
  );
}

function StatusIcon({ row }: { row: PoolRow }) {
  if (!row.posted_at) return <Circle className="h-4 w-4 text-muted-foreground" aria-label="Pending" />;
  const isDryRun = row.last_error?.startsWith("dry-run");
  const failed = row.last_error && !isDryRun;
  if (failed) return <AlertCircle className="h-4 w-4 text-destructive" aria-label="Failed" />;
  return <CheckCircle2 className="h-4 w-4 text-success" aria-label={isDryRun ? "Dry-run posted" : "Posted"} />;
}

function fbPostUrl(id: string | null, pageId?: string) {
  if (!id) return null;
  // Facebook post_id form: <page>_<post>. Deep link works with either half.
  return `https://www.facebook.com/${pageId ?? ""}${pageId ? "/posts/" : ""}${id.includes("_") ? id.split("_")[1] : id}`;
}

interface PoolTableProps {
  rows: PoolRow[];
  editingId: string | null;
  editingUrl: string;
  onStartEdit: (r: PoolRow) => void;
  onChangeUrl: (v: string) => void;
  onSave: (id: string) => void;
  onCancel: () => void;
  showCycle: boolean;
  expandedId?: string | null;
  onToggleExpand?: (id: string) => void;
  postingId?: string | null;
  onPostOne?: (id: string) => void;
  imagingId?: string | null;
  onGenerateImage?: (id: string) => void;
}

/** True when the post copy contains an "[Image: ...]" brief. */
function hasImageBrief(content: string): boolean {
  return /\[\s*image\s*:\s*[^\]]{3,}\]/i.test(content);
}

function PoolTable({
  rows, editingId, editingUrl, onStartEdit, onChangeUrl, onSave, onCancel, showCycle,
  expandedId, onToggleExpand, postingId, onPostOne, imagingId, onGenerateImage,
}: PoolTableProps) {
  if (!rows.length) return <Empty>No posts in this cycle.</Empty>;
  const colSpan = 6 + (showCycle ? 1 : 0) + (onPostOne ? 1 : 0);
  return (
    <TableShell head={<>
      <th className="w-12 px-4 py-3"></th>
      <th className="px-4 py-3">Content</th>
      <th className="px-4 py-3">Image URL</th>
      <th className="px-4 py-3">Media</th>
      {showCycle && <th className="px-4 py-3">Cycle</th>}
      <th className="px-4 py-3">Posted</th>
      <th className="px-4 py-3">FB ID / Error</th>
      {onPostOne && <th className="px-4 py-3">Action</th>}
    </>}>
      {rows.map((p) => {
        const isEditing = editingId === p.id;
        const isOpen = expandedId === p.id;
        return (
          <Fragment key={p.id}>
          <tr className="border-b border-white/5 last:border-0 align-top hover:bg-card/40">
            <td className="px-4 py-3"><StatusIcon row={p} /></td>
            <td className="max-w-sm px-4 py-3">
              {onToggleExpand ? (
                <button
                  type="button"
                  onClick={() => onToggleExpand(p.id)}
                  aria-expanded={isOpen}
                  className="flex w-full items-start gap-2 text-left"
                >
                  {isOpen ? <ChevronDown className="mt-0.5 h-4 w-4 shrink-0 text-primary" /> : <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />}
                  <span className={`text-sm text-foreground/90 ${isOpen ? "whitespace-pre-wrap" : "line-clamp-2"}`}>{p.content}</span>
                </button>
              ) : (
                <p className="whitespace-pre-wrap text-sm text-foreground/90">{p.content}</p>
              )}
            </td>

            <td className="max-w-xs px-4 py-3">
              {isEditing ? (
                <div className="flex items-center gap-1">
                  <Input
                    autoFocus
                    value={editingUrl}
                    onChange={(e) => onChangeUrl(e.target.value)}
                    placeholder="https://…/image.jpg"
                    className="h-8 text-xs"
                  />
                  <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => onSave(p.id)}>
                    <Check className="h-4 w-4 text-success" />
                  </Button>
                  <Button size="icon" variant="ghost" className="h-8 w-8" onClick={onCancel}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  {p.image_url ? (
                    <a href={p.image_url} target="_blank" rel="noreferrer" className="truncate text-xs text-primary underline max-w-[180px]">
                      {p.image_url}
                    </a>
                  ) : (
                    <span className="text-xs text-muted-foreground">No image</span>
                  )}
                  <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => onStartEdit(p)}>
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                </div>
              )}
            </td>
            <td className="px-4 py-3">
              {p.emoji_only ? <Badge className="bg-secondary/70"><Smile className="mr-1 h-3 w-3" />Emoji</Badge>
               : p.has_media ? <Badge className="bg-secondary/70"><ImageIcon className="mr-1 h-3 w-3" />Image</Badge>
               : <span className="text-xs text-muted-foreground">Text</span>}
            </td>
            {showCycle && <td className="px-4 py-3 text-xs text-muted-foreground">#{p.cycle_id}</td>}
            <td className="px-4 py-3 text-xs text-muted-foreground">
              {p.posted_at ? timeAgo(p.posted_at) : "—"}
              {p.posted_at && <div className="text-[10px] opacity-70">{new Date(p.posted_at).toLocaleString()}</div>}
            </td>
            <td className="max-w-xs px-4 py-3">
              {p.fb_post_id ? (
                <a
                  href={fbPostUrl(p.fb_post_id) ?? "#"}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-primary underline break-all"
                >
                  {p.fb_post_id}
                </a>
              ) : p.last_error ? (
                <span className={`text-xs break-words ${p.last_error.startsWith("dry-run") ? "text-muted-foreground" : "text-destructive"}`}>
                  {p.last_error}
                </span>
              ) : (
                <span className="text-xs text-muted-foreground">—</span>
              )}
            </td>
            {onPostOne && (
              <td className="px-4 py-3">
                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant={p.posted_at ? "secondary" : "default"}
                    disabled={postingId === p.id}
                    onClick={() => onPostOne(p.id)}
                  >
                    {postingId === p.id ? <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" /> : <Send className="mr-1 h-3.5 w-3.5" />}
                    {p.posted_at ? "Post again" : "Post this one now"}
                  </Button>
                  {onGenerateImage && hasImageBrief(p.content) && (
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={imagingId === p.id}
                      onClick={() => onGenerateImage(p.id)}
                      title="Creates an image from this post's [Image: …] brief (free, no AI credits)"
                    >
                      {imagingId === p.id ? <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" /> : <ImageIcon className="mr-1 h-3.5 w-3.5" />}
                      {p.image_url ? "Regenerate image" : "Generate image"}
                    </Button>
                  )}
                </div>
              </td>
            )}
          </tr>
          {isOpen && (
            <tr className="border-b border-white/5 bg-card/30">
              <td />
              <td colSpan={colSpan - 1} className="px-4 py-4">
                <p className="whitespace-pre-wrap text-sm text-foreground/90">{p.content}</p>
                {p.image_url && (
                  <img src={p.image_url} alt="Attached Facebook post media" className="mt-3 max-h-48 rounded-lg" loading="lazy" />
                )}
                <div className="mt-3 flex flex-wrap gap-2">
                  {onPostOne && (
                    <Button size="sm" disabled={postingId === p.id} onClick={() => onPostOne(p.id)}>
                      {postingId === p.id ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <Send className="mr-1 h-4 w-4" />}
                      Post this one now
                    </Button>
                  )}
                  {onGenerateImage && hasImageBrief(p.content) && (
                    <Button size="sm" variant="outline" disabled={imagingId === p.id} onClick={() => onGenerateImage(p.id)}>
                      {imagingId === p.id ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <ImageIcon className="mr-1 h-4 w-4" />}
                      {p.image_url ? "Regenerate image" : "Generate image"}
                    </Button>
                  )}
                </div>
              </td>
            </tr>
          )}
          </Fragment>
        );

      })}
    </TableShell>
  );
}

function HistoryView({
  rows, cycles, onToggle,
}: { rows: PoolRow[]; cycles: CycleRow[]; onToggle: (cycleId: number, next: boolean) => void }) {
  const grouped = useMemo(() => {
    const m = new Map<number, PoolRow[]>();
    for (const r of rows) {
      const list = m.get(r.cycle_id) ?? [];
      list.push(r);
      m.set(r.cycle_id, list);
    }
    return Array.from(m.entries()).sort((a, b) => b[0] - a[0]);
  }, [rows]);

  return (
    <div className="space-y-6">
      {grouped.map(([cid, list]) => {
        const cycle = cycles.find((c) => c.cycle_id === cid);
        const posted = list.filter((r) => r.posted_at).length;
        const errored = list.filter((r) => r.posted_at && r.last_error && !r.last_error.startsWith("dry-run")).length;
        return (
          <section key={cid} className="rounded-2xl glass p-4">
            <header className="mb-3 flex items-center justify-between gap-3">
              <div>
                <h3 className="font-display text-lg font-bold">Cycle #{cid}</h3>
                <p className="text-xs text-muted-foreground">
                  {posted}/{list.length} published{errored > 0 ? ` · ${errored} failed` : ""}
                </p>
              </div>
              <label className="flex items-center gap-2 text-xs text-muted-foreground">
                Attach media
                <Switch
                  checked={cycle ? cycle.attach_media : true}
                  onCheckedChange={(v) => onToggle(cid, v)}
                />
              </label>
            </header>
            <PoolTable
              rows={list}
              editingId={null}
              editingUrl=""
              onStartEdit={() => {}}
              onChangeUrl={() => {}}
              onSave={() => {}}
              onCancel={() => {}}
              showCycle={false}
            />
          </section>
        );
      })}
    </div>
  );
}
