import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Loader2, Play, Trash2, RefreshCw, Send, Plus, Save, Sparkles, Clock,
  Power, Image as ImageIcon, AlertTriangle, ExternalLink, Link2, Unlink, Copy, CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  fetchTikTokSettings, updateTikTokSettings, fetchTikTokVideos,
  runTikTokNow, regenerateTikTokVideo, postTikTokVideo, deleteTikTokVideo,
  fetchTikTokConnection, getTikTokAuthUrl, disconnectTikTok,
  type TikTokSettings, type TikTokVideo,
} from "@/lib/admin";
import { timeAgo } from "@/lib/format";
import { SectionHeader } from "./shared";


const DAYS = [
  { value: "daily", label: "Every day" },
  { value: "1", label: "Monday" }, { value: "2", label: "Tuesday" },
  { value: "3", label: "Wednesday" }, { value: "4", label: "Thursday" },
  { value: "5", label: "Friday" }, { value: "6", label: "Saturday" }, { value: "0", label: "Sunday" },
];

const statusStyles: Record<string, string> = {
  queued: "bg-secondary/70 text-muted-foreground",
  generating: "bg-primary/15 text-primary-glow",
  ready: "bg-warning/15 text-warning",
  posting: "bg-primary/15 text-primary-glow",
  posted: "bg-success/15 text-success",
  failed: "bg-destructive/15 text-destructive",
  cancelled: "bg-secondary/70 text-muted-foreground",
};

export function AdminTikTok() {
  const { toast } = useToast();
  const qc = useQueryClient();
  const { data: settings, isLoading } = useQuery({ queryKey: ["tiktok-settings"], queryFn: fetchTikTokSettings });
  const { data: videos } = useQuery({ queryKey: ["tiktok-videos"], queryFn: fetchTikTokVideos, refetchInterval: 8000 });

  const [draft, setDraft] = useState<TikTokSettings | null>(null);
  const [saving, setSaving] = useState(false);
  const [running, setRunning] = useState(false);

  useEffect(() => { if (settings) setDraft(settings); }, [settings]);

  const refresh = () => {
    qc.invalidateQueries({ queryKey: ["tiktok-settings"] });
    qc.invalidateQueries({ queryKey: ["tiktok-videos"] });
  };

  const patch = (p: Partial<TikTokSettings>) => setDraft((d) => (d ? { ...d, ...p } : d));

  const save = async () => {
    if (!draft) return;
    setSaving(true);
    try {
      await updateTikTokSettings({
        enabled: draft.enabled, schedule_mode: draft.schedule_mode, interval_hours: draft.interval_hours,
        time_slots: draft.time_slots, content_source: draft.content_source, posts_per_run: draft.posts_per_run,
        slide_count: draft.slide_count, caption_instructions: draft.caption_instructions,
        image_style: draft.image_style, timezone: draft.timezone, auto_post: draft.auto_post,
      });
      toast({ title: "Settings saved" });
      refresh();
    } catch (e) { toast({ title: "Save failed", description: (e as Error).message, variant: "destructive" }); }
    finally { setSaving(false); }
  };

  const run = async (source_type?: "prompt" | "tip") => {
    setRunning(true);
    try {
      await runTikTokNow(source_type ? { source_type } : undefined);
      toast({ title: "Generating video", description: "It will appear below shortly." });
      setTimeout(refresh, 1500);
    } catch (e) { toast({ title: "Failed", description: (e as Error).message, variant: "destructive" }); }
    finally { setRunning(false); }
  };

  if (isLoading || !draft) {
    return <div className="grid place-items-center py-20"><Loader2 className="h-7 w-7 animate-spin text-primary" /></div>;
  }

  const showInterval = draft.schedule_mode === "interval" || draft.schedule_mode === "both";
  const showSlots = draft.schedule_mode === "slots" || draft.schedule_mode === "both";

  return (
    <div className="space-y-8">
      <SectionHeader
        title="TikTok auto-pilot"
        desc="Automatically generate image+text slideshow videos and post them to TikTok on your schedule."
        action={
          <div className="flex items-center gap-2">
            <Badge className={draft.enabled ? "bg-success/15 text-success" : "bg-secondary/70 text-muted-foreground"}>
              <Power className="mr-1 h-3.5 w-3.5" />{draft.enabled ? "Running" : "Paused"}
            </Badge>
          </div>
        }
      />

      {/* Account connection */}
      <TikTokConnectionCard />



      {/* Master switch */}
      <div className="flex items-center justify-between rounded-2xl glass p-5">
        <div>
          <p className="font-medium">Automation</p>
          <p className="text-sm text-muted-foreground">
            {draft.enabled ? "The scheduler is active and will post on the cadence below." : "Turn on to let the scheduler run automatically."}
          </p>
        </div>
        <Switch checked={draft.enabled} onCheckedChange={(v) => patch({ enabled: v })} />
      </div>

      {/* Schedule */}
      <div className="grid gap-4 rounded-2xl glass p-5">
        <p className="flex items-center gap-2 font-medium"><Clock className="h-4 w-4 text-primary-glow" />Schedule</p>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <Label className="text-xs text-muted-foreground">Mode</Label>
            <Select value={draft.schedule_mode} onValueChange={(v) => patch({ schedule_mode: v as TikTokSettings["schedule_mode"] })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="interval">Interval (every X hours)</SelectItem>
                <SelectItem value="slots">Fixed time slots</SelectItem>
                <SelectItem value="both">Both</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Timezone</Label>
            <Input value={draft.timezone} onChange={(e) => patch({ timezone: e.target.value })} placeholder="Europe/London" />
          </div>
        </div>

        {showInterval && (
          <div className="grid gap-1">
            <Label className="text-xs text-muted-foreground">Post every (hours)</Label>
            <Input type="number" min={1} max={720} value={draft.interval_hours}
              onChange={(e) => patch({ interval_hours: Number(e.target.value) })} className="w-40" />
          </div>
        )}

        {showSlots && (
          <div className="grid gap-2">
            <Label className="text-xs text-muted-foreground">Time slots</Label>
            {draft.time_slots.map((slot, i) => (
              <div key={i} className="flex items-center gap-2">
                <Select value={String(slot.day)} onValueChange={(v) => {
                  const next = [...draft.time_slots]; next[i] = { ...slot, day: v }; patch({ time_slots: next });
                }}>
                  <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                  <SelectContent>{DAYS.map((d) => <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>)}</SelectContent>
                </Select>
                <Input type="time" value={slot.time} className="w-36" onChange={(e) => {
                  const next = [...draft.time_slots]; next[i] = { ...slot, time: e.target.value }; patch({ time_slots: next });
                }} />
                <Button size="sm" variant="ghost" className="h-9 text-destructive"
                  onClick={() => patch({ time_slots: draft.time_slots.filter((_, idx) => idx !== i) })}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button size="sm" variant="secondary" className="w-fit"
              onClick={() => patch({ time_slots: [...draft.time_slots, { day: "daily", time: "12:00" }] })}>
              <Plus className="mr-1 h-4 w-4" />Add slot
            </Button>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="grid gap-4 rounded-2xl glass p-5">
        <p className="flex items-center gap-2 font-medium"><Sparkles className="h-4 w-4 text-primary-glow" />Content</p>
        <div className="grid gap-3 sm:grid-cols-3">
          <div>
            <Label className="text-xs text-muted-foreground">Source</Label>
            <Select value={draft.content_source} onValueChange={(v) => patch({ content_source: v as TikTokSettings["content_source"] })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="random">Random mix</SelectItem>
                <SelectItem value="prompts">Trending prompts</SelectItem>
                <SelectItem value="tips">AI tips</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Videos per run</Label>
            <Input type="number" min={1} max={5} value={draft.posts_per_run}
              onChange={(e) => patch({ posts_per_run: Number(e.target.value) })} />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Slides per video</Label>
            <Input type="number" min={2} max={6} value={draft.slide_count}
              onChange={(e) => patch({ slide_count: Number(e.target.value) })} />
          </div>
        </div>
        <div>
          <Label className="text-xs text-muted-foreground">Caption / script direction (optional)</Label>
          <Textarea value={draft.caption_instructions ?? ""} rows={2}
            onChange={(e) => patch({ caption_instructions: e.target.value })}
            placeholder="e.g. Friendly tone, UK spelling, emphasise that prompts are free to claim." />
        </div>
        <div>
          <Label className="text-xs text-muted-foreground">Image style</Label>
          <Input value={draft.image_style} onChange={(e) => patch({ image_style: e.target.value })} />
        </div>
        <div className="flex items-center justify-between rounded-xl bg-card/40 p-3">
          <div>
            <p className="text-sm font-medium">Auto-post to TikTok</p>
            <p className="text-xs text-muted-foreground">Off = generate videos but hold them for manual review before posting.</p>
          </div>
          <Switch checked={draft.auto_post} onCheckedChange={(v) => patch({ auto_post: v })} />
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap items-center gap-2">
        <Button onClick={save} disabled={saving}>
          {saving ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <Save className="mr-1 h-4 w-4" />}Save settings
        </Button>
        <Button variant="secondary" onClick={() => run()} disabled={running}>
          {running ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <Play className="mr-1 h-4 w-4" />}Generate now
        </Button>
        <Button variant="ghost" onClick={() => run("prompt")} disabled={running}>From a prompt</Button>
        <Button variant="ghost" onClick={() => run("tip")} disabled={running}>From a tip</Button>
        {settings?.last_run_at && (
          <span className="ml-auto text-xs text-muted-foreground">Last run {timeAgo(settings.last_run_at)}</span>
        )}
      </div>

      {/* Library */}
      <div>
        <SectionHeader title="Generated videos" desc="Preview, post, regenerate or remove each video." />
        {!videos?.length ? (
          <p className="rounded-2xl glass p-10 text-center text-muted-foreground">No videos yet. Hit “Generate now” to create your first.</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {videos.map((v) => <VideoCard key={v.id} video={v} onChange={refresh} />)}
          </div>
        )}
      </div>
    </div>
  );
}

function TikTokConnectionCard() {
  const { toast } = useToast();
  const qc = useQueryClient();
  const { data: conn, isLoading } = useQuery({ queryKey: ["tiktok-connection"], queryFn: fetchTikTokConnection });
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);

  const connect = async () => {
    setBusy(true);
    try {
      const { url } = await getTikTokAuthUrl();
      window.open(url, "tiktok-oauth", "width=600,height=760");
      toast({ title: "Authorise in the new window", description: "Approve access, then refresh this card." });
    } catch (e) {
      toast({ title: "Could not start connection", description: (e as Error).message, variant: "destructive" });
    } finally { setBusy(false); }
  };

  const disconnect = async () => {
    setBusy(true);
    try {
      await disconnectTikTok();
      toast({ title: "TikTok disconnected" });
      qc.invalidateQueries({ queryKey: ["tiktok-connection"] });
    } catch (e) {
      toast({ title: "Failed", description: (e as Error).message, variant: "destructive" });
    } finally { setBusy(false); }
  };

  const copyRedirect = () => {
    if (!conn?.redirect_uri) return;
    navigator.clipboard.writeText(conn.redirect_uri);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  if (isLoading) {
    return <div className="grid place-items-center rounded-2xl glass py-8"><Loader2 className="h-5 w-5 animate-spin text-primary" /></div>;
  }

  return (
    <div className="grid gap-4 rounded-2xl glass p-5">
      <div className="flex items-center justify-between">
        <p className="flex items-center gap-2 font-medium"><Link2 className="h-4 w-4 text-primary-glow" />TikTok account</p>
        {conn?.connected ? (
          <Badge className="bg-success/15 text-success"><CheckCircle2 className="mr-1 h-3.5 w-3.5" />Connected{conn.username ? ` · ${conn.username}` : ""}</Badge>
        ) : (
          <Badge className="bg-secondary/70 text-muted-foreground">Not connected</Badge>
        )}
      </div>

      {!conn?.configured && (
        <p className="flex items-start gap-1.5 text-sm text-warning">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          TikTok app credentials are missing. Add your Client key and secret to enable posting.
        </p>
      )}

      <p className="text-sm text-muted-foreground">
        Connect the TikTok account you want videos posted to. This uses your own TikTok app and grants the
        publishing permission the auto-pilot needs. Until your app has <span className="font-medium">video.publish</span> approval,
        TikTok returns posts as private/draft for review.
      </p>

      {conn?.redirect_uri && (
        <div className="grid gap-1">
          <Label className="text-xs text-muted-foreground">Redirect URI (add this to your TikTok app)</Label>
          <div className="flex items-center gap-2">
            <Input readOnly value={conn.redirect_uri} className="font-mono text-xs" />
            <Button size="sm" variant="secondary" onClick={copyRedirect}>
              {copied ? <CheckCircle2 className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <Button onClick={connect} disabled={busy || !conn?.configured}>
          {busy ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <Link2 className="mr-1 h-4 w-4" />}
          {conn?.connected ? "Reconnect" : "Connect TikTok"}
        </Button>
        {conn?.connected && (
          <Button variant="ghost" className="text-destructive" onClick={disconnect} disabled={busy}>
            <Unlink className="mr-1 h-4 w-4" />Disconnect
          </Button>
        )}
        <Button variant="ghost" onClick={() => qc.invalidateQueries({ queryKey: ["tiktok-connection"] })} disabled={busy}>
          <RefreshCw className="mr-1 h-4 w-4" />Refresh
        </Button>
      </div>
    </div>
  );
}



function VideoCard({ video, onChange }: { video: TikTokVideo; onChange: () => void }) {
  const { toast } = useToast();
  const [busy, setBusy] = useState<string | null>(null);

  const act = async (key: string, fn: () => Promise<unknown>, okMsg: string) => {
    setBusy(key);
    try { await fn(); toast({ title: okMsg }); onChange(); }
    catch (e) { toast({ title: "Failed", description: (e as Error).message, variant: "destructive" }); }
    finally { setBusy(null); }
  };

  const cover = video.slides?.[0]?.image_url;

  return (
    <div className="flex flex-col overflow-hidden rounded-2xl glass">
      <div className="relative aspect-[9/16] bg-card/60">
        {video.video_url ? (
          <video src={video.video_url} controls className="h-full w-full object-cover" preload="metadata" />
        ) : cover ? (
          <img src={cover} alt={video.topic ? `${video.topic} video cover` : "TikTok video cover"} className="h-full w-full object-cover" />
        ) : (
          <div className="grid h-full w-full place-items-center text-muted-foreground"><ImageIcon className="h-8 w-8" /></div>
        )}
        <Badge className={`absolute left-2 top-2 capitalize ${statusStyles[video.status] ?? ""}`}>{video.status}</Badge>
        <Badge className="absolute right-2 top-2 capitalize bg-black/60 text-white">{video.source_type}</Badge>
      </div>
      <div className="flex flex-1 flex-col gap-2 p-3">
        <p className="line-clamp-2 text-sm font-medium">{video.topic ?? "Untitled"}</p>
        {video.caption && <p className="line-clamp-2 text-xs text-muted-foreground">{video.caption}</p>}
        {video.error && (
          <p className="flex items-start gap-1 text-xs text-destructive">
            <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />{video.error}
          </p>
        )}
        <span className="text-[11px] text-muted-foreground">{timeAgo(video.created_at)}</span>
        <div className="mt-auto flex flex-wrap gap-1.5 pt-1">
          {video.status === "ready" && (
            <Button size="sm" className="h-7" disabled={!!busy}
              onClick={() => act("post", () => postTikTokVideo(video.id), "Posting to TikTok")}>
              {busy === "post" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="mr-1 h-3.5 w-3.5" />}Post
            </Button>
          )}
          {video.tiktok_post_id && (
            <Badge className="h-7 bg-success/15 px-2 text-success"><ExternalLink className="mr-1 h-3 w-3" />Posted</Badge>
          )}
          <Button size="sm" variant="secondary" className="h-7" disabled={!!busy}
            onClick={() => act("regen", () => regenerateTikTokVideo(video.id), "Regenerating")}>
            {busy === "regen" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="mr-1 h-3.5 w-3.5" />}Regenerate
          </Button>
          <Button size="sm" variant="ghost" className="h-7 text-destructive" disabled={!!busy}
            onClick={() => act("del", () => deleteTikTokVideo(video.id), "Deleted")}>
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
