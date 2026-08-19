import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Shuffle, Trash2, CalendarClock, Send, Users, Facebook, Video, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  fetchScheduledPosts, createScheduledPost, deleteScheduledPost,
  fetchFbPoolPosts, fetchFbGroups,
} from "@/lib/admin";
import { timeAgo } from "@/lib/format";
import { TableShell, SectionHeader } from "./shared";
import { AdminFacebookAutopilot } from "./AdminFacebookAutopilot";
import { AdminTikTok } from "./AdminTikTok";

const PLATFORMS = [
  { value: "facebook", label: "Facebook" },
  { value: "instagram", label: "Instagram" },
  { value: "tiktok", label: "TikTok" },
  { value: "youtube", label: "YouTube" },
  { value: "x", label: "X / Twitter" },
];

const statusStyles: Record<string, string> = {
  scheduled: "bg-primary/15 text-primary-glow",
  posted: "bg-success/15 text-success",
  failed: "bg-destructive/15 text-destructive",
  draft: "bg-secondary/70 text-muted-foreground",
};

export function AdminSocial() {
  const [activeSubTab, setActiveSubTab] = useState("scheduler");

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Social Scheduler"
        desc="Schedule manual posts or configure AI-powered autopilot routines for Facebook and TikTok, completely automated."
      />

      <Tabs value={activeSubTab} onValueChange={setActiveSubTab} className="w-full">
        <TabsList className="mb-6 grid w-full max-w-md grid-cols-3 bg-secondary/20 p-1 rounded-2xl">
          <TabsTrigger value="scheduler" className="flex items-center gap-2 rounded-xl text-xs sm:text-sm">
            <CalendarClock className="h-4 w-4" />
            Scheduler
          </TabsTrigger>
          <TabsTrigger value="facebook" className="flex items-center gap-2 rounded-xl text-xs sm:text-sm">
            <Facebook className="h-4 w-4" />
            Facebook
          </TabsTrigger>
          <TabsTrigger value="tiktok" className="flex items-center gap-2 rounded-xl text-xs sm:text-sm">
            <Video className="h-4 w-4" />
            TikTok
          </TabsTrigger>
        </TabsList>

        <TabsContent value="scheduler" className="mt-0 focus-visible:outline-none">
          <ScheduledPostsTab />
        </TabsContent>

        <TabsContent value="facebook" className="mt-0 focus-visible:outline-none">
          <AdminFacebookAutopilot />
        </TabsContent>

        <TabsContent value="tiktok" className="mt-0 focus-visible:outline-none">
          <AdminTikTok />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function ScheduledPostsTab() {
  const { toast } = useToast();
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ["admin-social"], queryFn: fetchScheduledPosts });
  const { data: pool } = useQuery({ queryKey: ["admin-fb-pool-picker"], queryFn: fetchFbPoolPosts });
  const { data: groups } = useQuery({ queryKey: ["admin-fb-groups"], queryFn: fetchFbGroups });

  const [platform, setPlatform] = useState("facebook");
  const [poolId, setPoolId] = useState("");
  const [caption, setCaption] = useState("");
  const [when, setWhen] = useState("");
  const [saving, setSaving] = useState(false);

  const refresh = () => qc.invalidateQueries({ queryKey: ["admin-social"] });

  // Only offer posts from the newest autopilot cycle — those are the ones the
  // Facebook autopilot page generated most recently.
  const poolOptions = useMemo(() => {
    const rows = pool ?? [];
    if (!rows.length) return [];
    const latest = Math.max(...rows.map((r) => r.cycle_id));
    return rows.filter((r) => r.cycle_id === latest);
  }, [pool]);

  const activeGroups = (groups ?? []).filter((g) => g.active).length;

  const selectPoolPost = (id: string) => {
    setPoolId(id);
    const row = poolOptions.find((r) => r.id === id);
    if (row) setCaption(row.content);
  };

  const pickRandom = () => {
    const unposted = poolOptions.filter((r) => !r.posted_at);
    const source = unposted.length ? unposted : poolOptions;
    if (!source.length) {
      toast({
        title: "No generated posts yet",
        description: "Generate a post pool on the Facebook autopilot page first.",
        variant: "destructive",
      });
      return;
    }
    selectPoolPost(source[Math.floor(Math.random() * source.length)].id);
  };

  const schedule = async () => {
    if (!caption.trim() || !when) {
      toast({ title: "Caption and time required", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      const row = poolOptions.find((r) => r.id === poolId);
      await createScheduledPost({
        platform,
        caption: caption.trim(),
        topic: row ? `autopilot cycle ${row.cycle_id}` : "",
        media_url: row?.image_url ?? undefined,
        scheduled_at: new Date(when).toISOString(),
        status: "scheduled",
      });
      setCaption("");
      setPoolId("");
      setWhen("");
      refresh();
      toast({ title: "Post scheduled successfully" });
    } catch (e) {
      toast({ title: "Failed to schedule", description: (e as Error).message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl glass p-5 space-y-4">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <CalendarClock className="h-4 w-4 text-primary" />
          Schedule a manual post
        </h3>
        <div className="grid gap-3 sm:grid-cols-[160px_1fr]">
          <Select value={platform} onValueChange={setPlatform}>
            <SelectTrigger className="bg-card/45 border-white/10 rounded-xl h-10">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PLATFORMS.map((p) => (
                <SelectItem key={p.value} value={p.value}>
                  {p.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={poolId} onValueChange={selectPoolPost}>
            <SelectTrigger className="bg-card/45 border-white/10 rounded-xl h-10">
              <SelectValue placeholder={poolOptions.length ? "Choose a generated autopilot post…" : "No generated posts yet"} />
            </SelectTrigger>
            <SelectContent>
              {poolOptions.map((r) => (
                <SelectItem key={r.id} value={r.id}>
                  {(r.posted_at ? "✓ " : "") + r.content.slice(0, 70)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-start gap-2">
          <Textarea
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Pick a generated post above — or write your own custom post copy…"
            rows={4}
            className="flex-1 bg-card/45 border-white/10 rounded-xl text-sm"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button variant="secondary" onClick={pickRandom} className="h-10 rounded-xl text-xs sm:text-sm">
            <Shuffle className="mr-1.5 h-4 w-4" />
            Random generated post
          </Button>
          <Input
            type="datetime-local"
            value={when}
            onChange={(e) => setWhen(e.target.value)}
            className="w-auto bg-card/45 border-white/10 rounded-xl h-10 text-xs sm:text-sm"
          />
          <Button onClick={schedule} disabled={saving} className="bg-gradient-primary btn-glow h-10 rounded-xl text-xs sm:text-sm">
            {saving ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : <CalendarClock className="mr-1.5 h-4 w-4" />}
            Schedule
          </Button>
          <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground ml-auto">
            <Users className="h-3.5 w-3.5" />
            {activeGroups} active group{activeGroups === 1 ? "" : "s"} — 9 random ones get each Facebook post
          </span>
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <Send className="h-4 w-4 text-primary" />
          Scheduled Queue
        </h3>

        {isLoading ? (
          <div className="grid place-items-center py-20">
            <Loader2 className="h-7 w-7 animate-spin text-primary" />
          </div>
        ) : !data?.length ? (
          <p className="rounded-2xl glass p-10 text-center text-muted-foreground text-sm">
            No posts currently scheduled. Use the form above to schedule your first post.
          </p>
        ) : (
          <TableShell
            head={
              <>
                <th className="px-4 py-3 text-left">Platform</th>
                <th className="px-4 py-3 text-left">Caption</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Scheduled</th>
                <th className="px-4 py-3 text-right">Action</th>
              </>
            }
          >
            {data.map((p) => (
              <tr key={p.id as string} className="border-b border-white/5 last:border-0 hover:bg-card/40">
                <td className="px-4 py-3 capitalize text-sm font-medium">
                  <Send className="mr-1.5 inline h-3.5 w-3.5 text-primary-glow" />
                  {p.platform as string}
                </td>
                <td className="max-w-xs truncate px-4 py-3 text-muted-foreground text-sm">
                  {p.caption as string}
                </td>
                <td className="px-4 py-3 text-sm">
                  <Badge className={`${statusStyles[(p.status as string)] ?? ""} capitalize`}>
                    {p.status as string}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-muted-foreground text-xs sm:text-sm">
                  {p.scheduled_at ? timeAgo(p.scheduled_at as string) : "—"}
                </td>
                <td className="px-4 py-3 text-right">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 w-7 p-0 text-destructive hover:bg-destructive/10"
                    onClick={() => deleteScheduledPost(p.id as string).then(refresh)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </td>
              </tr>
            ))}
          </TableShell>
        )}
      </div>
    </div>
  );
}
