import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { fetchCategories, fetchMyPromptBody, updateMyPrompt } from "@/lib/queries";
import { MODELS, MODEL_LABELS } from "@/lib/format";

export interface EditablePrompt {
  id: string;
  title: string;
  description: string;
  example_output: string;
  tags: string[] | null;
  model: string;
  category_id: string;
  is_free: boolean;
}

export function EditPromptDialog({ prompt, onClose }: { prompt: EditablePrompt | null; onClose: () => void }) {
  const { toast } = useToast();
  const qc = useQueryClient();
  const { data: categories } = useQuery({ queryKey: ["categories"], queryFn: fetchCategories });
  const [saving, setSaving] = useState(false);
  const [loadingBody, setLoadingBody] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", body: "", example_output: "", tags: "", model: "chatgpt", category_id: "", is_free: false });

  useEffect(() => {
    if (!prompt) return;
    setForm({
      title: prompt.title, description: prompt.description, body: "", example_output: prompt.example_output,
      tags: (prompt.tags ?? []).join(", "), model: prompt.model, category_id: prompt.category_id, is_free: prompt.is_free,
    });
    setLoadingBody(true);
    fetchMyPromptBody(prompt.id).then((b) => setForm((f) => ({ ...f, body: b }))).catch(() => undefined).finally(() => setLoadingBody(false));
  }, [prompt]);

  const errors: string[] = [];
  if (form.title.trim().length < 5 || form.title.trim().length > 100) errors.push("Title must be 5–100 characters.");
  if (form.description.trim().length < 11 || form.description.trim().length > 300) errors.push("Description must be 11–300 characters.");
  if (!loadingBody && form.body.trim().length < 200) errors.push("The prompt must be at least 200 characters.");
  if (form.example_output.trim().length < 11) errors.push("Example output must be at least 11 characters.");
  if (!form.category_id) errors.push("Choose a category.");

  const save = async () => {
    if (!prompt || errors.length || saving) return;
    setSaving(true);
    try {
      await updateMyPrompt(prompt.id, {
        title: form.title.trim(), description: form.description.trim(),
        ...(form.body.trim() ? { body: form.body.trim() } : {}),
        example_output: form.example_output.trim(), model: form.model, category_id: form.category_id, is_free: form.is_free,
        tags: form.tags.split(",").map((t) => t.trim().toLowerCase()).filter(Boolean).slice(0, 8),
      });
      toast({ title: "Changes saved" });
      qc.invalidateQueries({ queryKey: ["my-prompts"] });
      onClose();
    } catch (e) {
      toast({ title: "Could not save", description: (e as Error).message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const field = "mt-1 bg-card/60 border-white/10";
  return (
    <Dialog open={!!prompt} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit prompt</DialogTitle>
          <DialogDescription>Status, sales and views can't be changed here. Paid prompts are always £0.49.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div><Label htmlFor="e-t">Title</Label><Input id="e-t" maxLength={100} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className={field} /></div>
          <div><Label htmlFor="e-d">Short description</Label><Textarea id="e-d" maxLength={300} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className={field} /></div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>AI model</Label>
              <Select value={form.model} onValueChange={(v) => setForm({ ...form, model: v })}>
                <SelectTrigger className={field}><SelectValue /></SelectTrigger>
                <SelectContent>{MODELS.map((m) => <SelectItem key={m} value={m}>{MODEL_LABELS[m]}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label>Category</Label>
              <Select value={form.category_id} onValueChange={(v) => setForm({ ...form, category_id: v })}>
                <SelectTrigger className={field}><SelectValue placeholder="Choose…" /></SelectTrigger>
                <SelectContent>{(categories ?? []).map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label htmlFor="e-b">The prompt</Label>
            <Textarea id="e-b" rows={8} disabled={loadingBody} value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} className={`${field} font-mono text-sm`} placeholder={loadingBody ? "Loading…" : ""} />
            <p className="mt-1 text-xs text-muted-foreground">{form.body.trim().length} / 200 characters minimum</p>
          </div>
          <div><Label htmlFor="e-x">Example output</Label><Textarea id="e-x" rows={4} value={form.example_output} onChange={(e) => setForm({ ...form, example_output: e.target.value })} className={field} /></div>
          <div><Label htmlFor="e-g">Tags (comma separated)</Label><Input id="e-g" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} className={field} /></div>
          <div className="flex items-center justify-between rounded-xl border border-white/5 p-3">
            <div><p className="text-sm font-medium">Free (£0)</p><p className="text-xs text-muted-foreground">Off = sold at the fixed £0.49 price.</p></div>
            <Switch checked={form.is_free} onCheckedChange={(v) => setForm({ ...form, is_free: v })} />
          </div>
          {errors.length > 0 && (
            <ul role="alert" className="space-y-1 rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
              {errors.map((er) => <li key={er}>• {er}</li>)}
            </ul>
          )}
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={save} disabled={saving || errors.length > 0 || loadingBody} className="bg-gradient-primary">
            {saving && <Loader2 className="mr-1 h-4 w-4 animate-spin" />} Save changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
