import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Trash2, Plus, Megaphone, Tag, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  fetchAdminReviews, deleteReviewAdmin,
  fetchAdminCategories, upsertCategory, deleteCategory,
  fetchAnnouncements, createAnnouncement, updateAnnouncement, deleteAnnouncement,
} from "@/lib/admin";
import { slugify, timeAgo } from "@/lib/format";
import { TableShell, SectionHeader } from "./shared";

export function AdminReviews() {
  const { toast } = useToast();
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ["admin-reviews"], queryFn: fetchAdminReviews });
  const del = async (id: string) => {
    try { await deleteReviewAdmin(id); qc.invalidateQueries({ queryKey: ["admin-reviews"] }); toast({ title: "Review deleted" }); }
    catch (e) { toast({ title: "Failed", description: (e as Error).message, variant: "destructive" }); }
  };
  if (isLoading) return <div className="grid place-items-center py-20"><Loader2 className="h-7 w-7 animate-spin text-primary" /></div>;
  return (
    <div>
      <SectionHeader title="Reviews" desc="Moderate buyer reviews across the marketplace." />
      {!data?.length ? <p className="rounded-2xl glass p-10 text-center text-muted-foreground">No reviews.</p> : (
        <TableShell head={<>
          <th className="px-4 py-3">Prompt</th><th className="px-4 py-3">Rating</th>
          <th className="px-4 py-3">Review</th><th className="px-4 py-3 text-right">Action</th>
        </>}>
          {data.map((r) => {
            const p = r.prompt as unknown as { title?: string } | null;
            return (
              <tr key={r.id as string} className="border-b border-white/5 last:border-0 hover:bg-card/40">
                <td className="px-4 py-3 font-medium">{p?.title ?? "—"}</td>
                <td className="px-4 py-3"><span className="flex items-center gap-1"><Star className="h-3.5 w-3.5 fill-warning text-warning" />{r.rating as number}</span></td>
                <td className="px-4 py-3 text-muted-foreground">{(r.body as string) || "—"}</td>
                <td className="px-4 py-3 text-right">
                  <Button size="sm" variant="outline" className="h-8 border-destructive/30 text-destructive" onClick={() => del(r.id as string)}><Trash2 className="h-4 w-4" /></Button>
                </td>
              </tr>
            );
          })}
        </TableShell>
      )}
    </div>
  );
}

export function AdminCategories() {
  const { toast } = useToast();
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ["admin-categories"], queryFn: fetchAdminCategories });
  const [name, setName] = useState("");
  const refresh = () => qc.invalidateQueries({ queryKey: ["admin-categories"] });
  const add = async () => {
    if (!name.trim()) return;
    try { await upsertCategory({ name: name.trim(), slug: slugify(name), sort_order: (data?.length ?? 0) }); setName(""); refresh(); toast({ title: "Category added" }); }
    catch (e) { toast({ title: "Failed", description: (e as Error).message, variant: "destructive" }); }
  };
  const del = async (id: string) => {
    try { await deleteCategory(id); refresh(); toast({ title: "Deleted" }); }
    catch (e) { toast({ title: "Failed", description: (e as Error).message, variant: "destructive" }); }
  };
  if (isLoading) return <div className="grid place-items-center py-20"><Loader2 className="h-7 w-7 animate-spin text-primary" /></div>;
  return (
    <div>
      <SectionHeader title="Categories" desc="Organise how prompts are browsed." />
      <div className="mb-4 flex max-w-md items-center gap-2">
        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="New category name…" />
        <Button onClick={add}><Plus className="mr-1 h-4 w-4" />Add</Button>
      </div>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {(data ?? []).map((c) => (
          <div key={c.id as string} className="flex items-center justify-between rounded-xl glass p-3">
            <span className="flex items-center gap-2"><Tag className="h-4 w-4 text-primary-glow" />{c.name as string}</span>
            <Button size="sm" variant="ghost" className="h-7 text-destructive" onClick={() => del(c.id as string)}><Trash2 className="h-4 w-4" /></Button>
          </div>
        ))}
      </div>
    </div>
  );
}

export function AdminAnnouncements() {
  const { toast } = useToast();
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ["admin-announcements"], queryFn: fetchAnnouncements });
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const refresh = () => qc.invalidateQueries({ queryKey: ["admin-announcements"] });
  const create = async () => {
    if (!title.trim()) return;
    try { await createAnnouncement({ title: title.trim(), body: body.trim(), active: true }); setTitle(""); setBody(""); refresh(); toast({ title: "Announcement posted" }); }
    catch (e) { toast({ title: "Failed", description: (e as Error).message, variant: "destructive" }); }
  };
  if (isLoading) return <div className="grid place-items-center py-20"><Loader2 className="h-7 w-7 animate-spin text-primary" /></div>;
  return (
    <div>
      <SectionHeader title="Announcements" desc="Broadcast banners to your users." />
      <div className="mb-5 space-y-2 rounded-2xl glass p-4">
        <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Announcement title…" />
        <Textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder="Message…" rows={2} />
        <Button onClick={create}><Megaphone className="mr-1 h-4 w-4" />Post announcement</Button>
      </div>
      <div className="space-y-2">
        {(data ?? []).map((a) => (
          <div key={a.id as string} className="flex items-center justify-between gap-3 rounded-xl glass p-3">
            <div>
              <div className="flex items-center gap-2 font-medium">{a.title as string} {(a.active as boolean) && <Badge className="bg-success/15 text-success">Live</Badge>}</div>
              <div className="text-xs text-muted-foreground">{(a.body as string) || ""} · {timeAgo(a.created_at as string)}</div>
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={a.active as boolean} onCheckedChange={(v) => updateAnnouncement(a.id as string, { active: v }).then(refresh)} />
              <Button size="sm" variant="ghost" className="h-7 text-destructive" onClick={() => deleteAnnouncement(a.id as string).then(refresh)}><Trash2 className="h-4 w-4" /></Button>
            </div>
          </div>
        ))}
        {!data?.length && <p className="rounded-2xl glass p-10 text-center text-muted-foreground">No announcements.</p>}
      </div>
    </div>
  );
}
