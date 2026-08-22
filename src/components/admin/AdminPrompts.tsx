import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Check, X, Star, Trash2, Search, Loader2, Pencil } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  fetchAdminPrompts, setPromptStatus, setPromptFeatured, deletePromptAdmin,
  updatePromptAdmin, bulkPromptStatus,
} from "@/lib/admin";
import { formatPrice, timeAgo } from "@/lib/format";
import { TableShell, SectionHeader } from "./shared";

const statusStyles: Record<string, string> = {
  approved: "bg-success/15 text-success",
  pending: "bg-warning/15 text-warning",
  rejected: "bg-destructive/15 text-destructive",
};

type Row = Awaited<ReturnType<typeof fetchAdminPrompts>>[number];

export function AdminPrompts() {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [filter, setFilter] = useState("pending");
  const [q, setQ] = useState("");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [editing, setEditing] = useState<Row | null>(null);

  const { data: prompts, isLoading } = useQuery({
    queryKey: ["admin-prompts2", filter, search],
    queryFn: () => fetchAdminPrompts(filter, search),
  });

  const refresh = () => {
    qc.invalidateQueries({ queryKey: ["admin-prompts2"] });
    qc.invalidateQueries({ queryKey: ["admin-overview"] });
  };
  const act = async (fn: () => Promise<void>, msg: string) => {
    try { await fn(); refresh(); toast({ title: msg }); }
    catch (e) { toast({ title: "Action failed", description: (e as Error).message, variant: "destructive" }); }
  };

  const toggle = (id: string) => setSelected((s) => {
    const n = new Set(s);
    if (n.has(id)) {
      n.delete(id);
    } else {
      n.add(id);
    }
    return n;
  });

  return (
    <div>
      <SectionHeader title="Prompts" desc="Moderate, edit, feature and remove listings." />

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <Tabs value={filter} onValueChange={(v) => { setFilter(v); setSelected(new Set()); }}>
          <TabsList className="bg-card/60">
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="approved">Approved</TabsTrigger>
            <TabsTrigger value="rejected">Rejected</TabsTrigger>
            <TabsTrigger value="all">All</TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            className="h-9 border-primary/40 bg-primary/10 text-primary-glow hover:bg-primary/20"
            onClick={async () => {
              const missingImgPrompts = prompts?.filter(p => !p.image_url) ?? [];
              if (missingImgPrompts.length === 0) {
                toast({ title: "All visible prompts already have images!" });
                return;
              }
              if (!confirm(`Generate AI images for ${missingImgPrompts.length} prompt(s) in this list?`)) return;
              
              toast({ title: `Starting image generation for ${missingImgPrompts.length} prompts...` });
              for (const p of missingImgPrompts) {
                const encoded = encodeURIComponent(`${p.title}, high resolution, ultra detailed, photorealistic`);
                const generatedUrl = `https://image.pollinations.ai/prompt/${encoded}?width=800&height=533&nologo=true&seed=${Math.floor(Math.random() * 1000000)}`;
                await updatePromptAdmin(p.id, { image_url: generatedUrl });
              }
              refresh();
              toast({ title: "✨ Bulk Image Generation Complete!" });
            }}
          >
            ⚡ Auto-Generate Missing Images
          </Button>
          <form onSubmit={(e) => { e.preventDefault(); setSearch(q); }} className="relative w-full max-w-xs">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search title…" className="pl-9" />
          </form>
        </div>
      </div>

      {selected.size > 0 && (
        <div className="mb-3 flex items-center gap-2 rounded-xl glass p-3 text-sm">
          <span className="text-muted-foreground">{selected.size} selected</span>
          <Button size="sm" variant="outline" className="h-8 border-success/30 text-success"
            onClick={() => act(async () => { await bulkPromptStatus([...selected], "approved"); setSelected(new Set()); }, "Approved")}>
            Approve all
          </Button>
          <Button size="sm" variant="outline" className="h-8 border-destructive/30 text-destructive"
            onClick={() => act(async () => { await bulkPromptStatus([...selected], "rejected"); setSelected(new Set()); }, "Rejected")}>
            Reject all
          </Button>
        </div>
      )}

      {isLoading ? (
        <div className="grid place-items-center py-20"><Loader2 className="h-7 w-7 animate-spin text-primary" /></div>
      ) : !prompts?.length ? (
        <p className="rounded-2xl glass p-10 text-center text-muted-foreground">Nothing here.</p>
      ) : (
        <TableShell
          head={<>
            <th className="w-10 px-4 py-3"></th>
            <th className="px-4 py-3">Prompt</th>
            <th className="hidden px-4 py-3 md:table-cell">Creator</th>
            <th className="hidden px-4 py-3 sm:table-cell">Price</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3 text-right">Actions</th>
          </>}
        >
          {prompts.map((p) => {
            const creator = p.creator as unknown as { handle: string } | null;
            return (
              <tr key={p.id} className="border-b border-white/5 last:border-0 hover:bg-card/40">
                <td className="px-4 py-3"><Checkbox checked={selected.has(p.id)} onCheckedChange={() => toggle(p.id)} /></td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    {p.image_url ? (
                      <div className="h-10 w-14 shrink-0 overflow-hidden rounded-md border border-white/10 bg-black/40">
                        <img src={p.image_url} alt="" className="h-full w-full object-cover" />
                      </div>
                    ) : (
                      <div className="flex h-10 w-14 shrink-0 items-center justify-center rounded-md border border-dashed border-white/15 bg-card/40 text-[10px] text-muted-foreground">
                        No img
                      </div>
                    )}
                    <div>
                      <Link to={`/prompt/${p.slug}`} className="font-medium hover:text-primary-glow line-clamp-1">{p.title}</Link>
                      <div className="text-xs text-muted-foreground">{timeAgo(p.created_at)}</div>
                    </div>
                  </div>
                </td>
                <td className="hidden px-4 py-3 text-muted-foreground md:table-cell">@{creator?.handle ?? "—"}</td>
                <td className="hidden px-4 py-3 sm:table-cell">{formatPrice(p.price_pence, p.is_free)}</td>
                <td className="px-4 py-3"><Badge className={`${statusStyles[p.status] ?? ""} capitalize`}>{p.status}</Badge></td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-1.5">
                    {!p.image_url && (
                      <Button
                        size="sm"
                        variant="outline"
                        title="Generate 1 AI image for this prompt"
                        className="h-8 border-primary/30 text-primary-glow hover:bg-primary/10 text-xs px-2"
                        onClick={() => act(async () => {
                          const encoded = encodeURIComponent(`${p.title}, high resolution, ultra detailed, photorealistic`);
                          const generatedUrl = `https://image.pollinations.ai/prompt/${encoded}?width=800&height=533&nologo=true&seed=${Math.floor(Math.random() * 1000000)}`;
                          await updatePromptAdmin(p.id, { image_url: generatedUrl });
                        }, "Generated 1 AI Image")}
                      >
                        ⚡ Gen Image
                      </Button>
                    )}
                    {p.status !== "approved" && (
                      <Button size="sm" variant="outline" className="h-8 border-success/30 text-success hover:bg-success/10" onClick={() => act(() => setPromptStatus(p.id, "approved"), "Approved")}>
                        <Check className="h-4 w-4" />
                      </Button>
                    )}
                    {p.status !== "rejected" && (
                      <Button size="sm" variant="outline" className="h-8 border-destructive/30 text-destructive hover:bg-destructive/10" onClick={() => act(() => setPromptStatus(p.id, "rejected"), "Rejected")}>
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                    <Button size="sm" variant="outline" className={`h-8 border-white/15 ${p.featured ? "text-warning" : ""}`} onClick={() => act(() => setPromptFeatured(p.id, !p.featured), p.featured ? "Unfeatured" : "Featured")}>
                      <Star className={`h-4 w-4 ${p.featured ? "fill-warning text-warning" : ""}`} />
                    </Button>
                    <Button size="sm" variant="outline" className="h-8 border-white/15" onClick={() => setEditing(p)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="outline" className="h-8 border-destructive/30 text-destructive hover:bg-destructive/10"
                      onClick={() => { if (confirm("Delete this prompt permanently?")) act(() => deletePromptAdmin(p.id), "Deleted"); }}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            );
          })}
        </TableShell>
      )}

      <EditDialog
        row={editing}
        onClose={() => setEditing(null)}
        onSaved={() => { setEditing(null); refresh(); toast({ title: "Saved" }); }}
      />
    </div>
  );
}

function EditDialog({ row, onClose, onSaved }: { row: Row | null; onClose: () => void; onSaved: () => void }) {
  const { toast } = useToast();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [body, setBody] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [generatingImg, setGeneratingImg] = useState(false);

  useEffect(() => {
    if (row) {
      setTitle(row.title ?? "");
      setDescription(row.description ?? "");
      setImageUrl((row as unknown as { image_url?: string }).image_url ?? "");
      setBody("");
      // Body is gated behind a SECURITY DEFINER RPC (admins permitted); never read off the table directly.
      supabase.rpc("get_prompt_body", { _prompt_id: row.id }).then(({ data }) => setBody(data ?? ""));
    }
  }, [row]);

  const generateSingleAIImage = () => {
    if (!title.trim()) {
      toast({ title: "Please provide a title first", variant: "destructive" });
      return;
    }
    setGeneratingImg(true);
    const encoded = encodeURIComponent(`${title}, high resolution, ultra detailed, photorealistic`);
    const generatedUrl = `https://image.pollinations.ai/prompt/${encoded}?width=800&height=533&nologo=true&seed=${Math.floor(Math.random() * 1000000)}`;
    setImageUrl(generatedUrl);
    setGeneratingImg(false);
    toast({ title: "Generated preview image!", description: "Click Save to persist it to the prompt." });
  };

  const save = async () => {
    if (!row) return;
    setSaving(true);
    try {
      await updatePromptAdmin(row.id, { title, description, body, image_url: imageUrl.trim() || null });
      setTitle(""); setDescription(""); setBody(""); setImageUrl("");
      onSaved();
    } catch (e) {
      toast({ title: "Save failed", description: (e as Error).message, variant: "destructive" });
    } finally { setSaving(false); }
  };

  return (
    <Dialog open={!!row} onOpenChange={(o) => { if (!o) { setTitle(""); setDescription(""); setBody(""); setImageUrl(""); onClose(); } }}>
      <DialogContent className="max-w-lg">
        <DialogHeader><DialogTitle>Edit prompt</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div><Label className="mb-1 block text-xs">Title</Label><Input value={title} onChange={(e) => setTitle(e.target.value)} /></div>
          <div><Label className="mb-1 block text-xs">Description</Label><Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} /></div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <Label className="text-xs">Image URL (Visual Cover)</Label>
              <Button type="button" size="sm" variant="ghost" className="h-6 text-[10px] text-primary-glow hover:text-white" onClick={generateSingleAIImage} disabled={generatingImg}>
                {generatingImg ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : "⚡ Generate 1 AI Image"}
              </Button>
            </div>
            <Input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://..." />
            {imageUrl && (
              <div className="mt-2 rounded-lg overflow-hidden border border-white/10 aspect-[16/10] max-h-36 bg-black/40">
                <img src={imageUrl} alt="Prompt Preview" className="w-full h-full object-cover" />
              </div>
            )}
          </div>
          <div><Label className="mb-1 block text-xs">Body</Label><Textarea value={body} onChange={(e) => setBody(e.target.value)} rows={5} /></div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={save} disabled={saving}>{saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
