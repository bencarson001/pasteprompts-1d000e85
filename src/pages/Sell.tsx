import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Sparkles, Loader2, ArrowRight, ArrowLeft, Check, Crown, ShieldCheck, Info } from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { fetchCategories, createPrompt, updateMyProfile, fetchMyTierInfo } from "@/lib/queries";
import { MODELS, MODEL_LABELS, slugify, formatPrice, TIERS } from "@/lib/format";

const STEPS = ["Basics", "Content", "Pricing", "Review"];

export default function Sell() {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { data: categories } = useQuery({ queryKey: ["categories"], queryFn: fetchCategories });
  const { data: tierInfo } = useQuery({
    queryKey: ["my-tier", user?.id],
    enabled: !!user?.id,
    queryFn: () => fetchMyTierInfo(user!.id),
  });

  const tier = TIERS[tierInfo?.tier ?? "free"];
  const isAdmin = tierInfo?.isAdmin ?? false;
  const used = tierInfo?.uploadsThisMonth ?? 0;
  const credits = tierInfo?.uploadCredits ?? 0;
  const remaining = Math.max(0, tier.quota + credits - used);
  const quotaReached = tierInfo && !isAdmin ? remaining <= 0 : false;

  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    title: "", description: "", model: "chatgpt", category_id: "",
    body: "", example_output: "", tags: "",
    is_free: false,
    image_file: null as File | null,
  });

  const set = (patch: Partial<typeof form>) => setForm({ ...form, ...patch });

  const canNext = () => {
    if (step === 0) return form.title.trim().length > 4 && form.description.trim().length > 10 && !!form.category_id && !!form.image_file;
    if (step === 1) return form.body.trim().length >= 200 && form.example_output.trim().length > 10;
    return true;
  };

  const submit = async () => {
    if (!user || !form.image_file) return;
    if (quotaReached) {
      toast({ title: "Monthly limit reached", description: `You've used all ${tier.quota} uploads for ${tier.name}. Upgrade for more.`, variant: "destructive" });
      return;
    }
    setSubmitting(true);
    try {
      const fileExt = form.image_file.name.split('.').pop();
      const filePath = `${user.id}/${Math.random()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage
        .from("prompts")
        .upload(filePath, form.image_file);
      if (uploadError) throw uploadError;
      
      const { data: { publicUrl } } = supabase.storage
        .from("prompts")
        .getPublicUrl(filePath);

      const slug = `${slugify(form.title)}-${Math.random().toString(36).slice(2, 7)}`;
      const tags = form.tags.split(",").map((t) => t.trim().toLowerCase()).filter(Boolean).slice(0, 8);
      await updateMyProfile(user.id, { is_creator: true });
      const created = await createPrompt(user.id, slug, {
        title: form.title.trim(),
        description: form.description.trim(),
        body: form.body.trim(),
        example_output: form.example_output.trim(),
        model: form.model,
        category_id: form.category_id,
        tags,
        price_pence: form.is_free ? 0 : 25,
        is_free: form.is_free,
        image_url: publicUrl,
      });
      if (created?.vetting?.approved) {
        toast({ title: "Approved & live! 🎉", description: created.vetting.reason });
      } else {
        toast({
          title: "Not approved",
          description: created?.vetting?.reason ?? "Your prompt didn't pass the quality review.",
          variant: "destructive",
        });
      }
      navigate("/dashboard?published=1");
    } catch (e) {
      toast({ title: "Could not submit", description: (e as Error).message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Layout>
      <SEO title="Sell a prompt" description="Publish your AI prompt on Paste Prompts and earn every time it sells." canonical="/sell" noindex />
      <div className="container-tight py-10">
        <div className="mb-6 flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-primary shadow-glow">
            <Sparkles className="h-5 w-5 text-primary-foreground" />
          </span>
          <div>
            <h1 className="font-display text-3xl font-bold">Sell a prompt</h1>
            <p className="text-sm text-muted-foreground">Every prompt is AI-reviewed for quality the moment you submit it.</p>
          </div>
        </div>

        {/* Tier + earnings banner */}
        <div className="mb-6 flex flex-wrap items-center gap-3 rounded-2xl glass p-4 text-sm">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
            <Crown className="h-3.5 w-3.5" /> {isAdmin ? "Admin" : `${tier.name} member`}
          </span>
          <span className="text-muted-foreground">
            {isAdmin ? (
              <span className="font-medium text-foreground">Unlimited uploads</span>
            ) : (
              <>
                {used} of {tier.quota} uploads used this month · <span className="font-medium text-foreground">{remaining} left</span>
                {credits > 0 && <span className="ml-1 text-success">(+{credits} replacement {credits === 1 ? "credit" : "credits"})</span>}
              </>
            )}
          </span>
          <span className="ml-auto inline-flex items-center gap-1.5 text-muted-foreground">
            <Info className="h-3.5 w-3.5 text-primary-glow" />
            Singles sell at <b className="text-foreground">£0.25</b> — you keep <b className="text-success">{formatPrice(tier.earningPence)}</b>, platform fee {formatPrice(tier.feePence)}
          </span>
        </div>

        {quotaReached && (
          <div className="mb-6 rounded-2xl border border-warning/30 bg-warning/10 p-4 text-sm text-warning">
            You've reached your {tier.name} monthly upload limit. <a href="/pro" className="underline font-medium">Upgrade your membership</a> to upload more.
          </div>
        )}

        {/* Stepper */}
        <div className="mb-8 flex items-center gap-2">
          {STEPS.map((s, i) => (
            <div key={s} className="flex flex-1 items-center gap-2">
              <div className={`grid h-7 w-7 shrink-0 place-items-center rounded-full text-xs font-bold ${i <= step ? "bg-gradient-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                {i < step ? <Check className="h-4 w-4" /> : i + 1}
              </div>
              <span className={`hidden text-sm sm:inline ${i === step ? "font-medium" : "text-muted-foreground"}`}>{s}</span>
              {i < STEPS.length - 1 && <div className="h-px flex-1 bg-border" />}
            </div>
          ))}
        </div>

        <div className="space-y-5 rounded-3xl glass-strong p-7">
          {step === 0 && (
            <>
              <div>
                <Label htmlFor="t">Title</Label>
                <Input id="t" value={form.title} onChange={(e) => set({ title: e.target.value })} placeholder="e.g. Viral Twitter Thread Engine" className="mt-1 bg-card/60 border-white/10" />
              </div>
              <div>
                <Label htmlFor="d">Short description</Label>
                <Textarea id="d" value={form.description} onChange={(e) => set({ description: e.target.value })} placeholder="One or two sentences on what this prompt does for the buyer." className="mt-1 bg-card/60 border-white/10" />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label>AI model</Label>
                  <Select value={form.model} onValueChange={(v) => set({ model: v })}>
                    <SelectTrigger className="mt-1 bg-card/60 border-white/10"><SelectValue /></SelectTrigger>
                    <SelectContent>{MODELS.map((m) => <SelectItem key={m} value={m}>{MODEL_LABELS[m]}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Category</Label>
                  <Select value={form.category_id} onValueChange={(v) => set({ category_id: v })}>
                    <SelectTrigger className="mt-1 bg-card/60 border-white/10"><SelectValue placeholder="Choose…" /></SelectTrigger>
                    <SelectContent>{(categories ?? []).map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="tags">Tags (comma separated)</Label>
                <Input id="tags" value={form.tags} onChange={(e) => set({ tags: e.target.value })} placeholder="marketing, twitter, growth" className="mt-1 bg-card/60 border-white/10" />
              </div>
              <div>
                <Label>Prompt image (Required)</Label>
                <div className="mt-1 rounded-xl border border-dashed border-white/20 p-6 text-center hover:border-primary transition-colors cursor-pointer">
                  <Input type="file" onChange={(e) => set({ image_file: e.target.files?.[0] ?? null })} className="hidden" id="img" accept="image/*" />
                  <Label htmlFor="img" className="cursor-pointer">
                    {form.image_file ? (
                      <span className="text-sm font-medium text-primary-glow">{form.image_file.name}</span>
                    ) : (
                      <span className="text-sm text-muted-foreground">Click to upload or drag and drop</span>
                    )}
                  </Label>
                </div>
              </div>
            </>
          )}

          {step === 1 && (
            <>
              <div>
                <Label htmlFor="body">The prompt</Label>
                <Textarea id="body" value={form.body} onChange={(e) => set({ body: e.target.value })} rows={10} placeholder="Paste the full prompt buyers will receive. Use [PLACEHOLDERS] for inputs." className="mt-1 bg-card/60 border-white/10 font-mono text-sm" />
                <p className={`mt-1 text-xs ${form.body.trim().length >= 200 ? "text-success" : "text-muted-foreground"}`}>
                  {form.body.trim().length} / 200 characters minimum · hidden behind a paywall until purchased.
                </p>
              </div>
              <div>
                <Label htmlFor="ex">Example output</Label>
                <Textarea id="ex" value={form.example_output} onChange={(e) => set({ example_output: e.target.value })} rows={6} placeholder="Show buyers a sample of what this prompt produces." className="mt-1 bg-card/60 border-white/10" />
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <div className="flex items-center justify-between rounded-xl border border-white/5 p-4">
                <div>
                  <p className="text-sm font-medium">Offer for free</p>
                  <p className="text-xs text-muted-foreground">Great for building a following and reviews.</p>
                </div>
                <Switch checked={form.is_free} onCheckedChange={(v) => set({ is_free: v })} />
              </div>
              {!form.is_free && (
                <div className="rounded-xl border border-white/5 bg-card/40 p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Selling price</span>
                    <span className="font-display text-2xl font-bold">£0.25</span>
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">
                    All single prompts sell at a fixed <b>£0.25</b> and the price can't be changed. As a <b>{tier.name}</b> member you earn{" "}
                    <b className="text-success">{formatPrice(tier.earningPence)}</b> per sale; the remaining {formatPrice(tier.feePence)} is the Paste Prompts platform fee.
                  </p>
                </div>
              )}
            </>
          )}

          {step === 3 && (
            <div className="space-y-3 text-sm">
              <Row label="Title" value={form.title} />
              <Row label="Category" value={(categories ?? []).find((c) => c.id === form.category_id)?.name ?? "—"} />
              <Row label="Model" value={MODEL_LABELS[form.model]} />
              <Row label="Price" value={form.is_free ? "Free" : "£0.25 (fixed)"} />
              <Row label="You earn / sale" value={form.is_free ? "—" : formatPrice(tier.earningPence)} />
              <Row label="Tags" value={form.tags || "—"} />
              <p className="flex items-start gap-2 rounded-xl border border-white/5 bg-card/40 p-4 text-xs text-muted-foreground">
                <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary-glow" />
                On submit, our AI reviews your prompt for quality and a 200-character minimum. Approved prompts go live instantly.
              </p>
              {!form.is_free && (
                <p className="flex items-start gap-2 rounded-xl border border-warning/20 bg-warning/10 p-4 text-xs text-warning">
                  <Info className="mt-0.5 h-4 w-4 shrink-0" />
                  Heads up: to keep the marketplace fresh, paid prompts that make <b>no sales for 2 months</b> are automatically removed from the marketplace. Don't worry — you'll get a <b>free replacement upload</b> to list something new in its place.
                </p>
              )}
            </div>
          )}

          <div className="flex items-center justify-between pt-2">
            <Button variant="ghost" disabled={step === 0} onClick={() => setStep((s) => s - 1)}>
              <ArrowLeft className="mr-1 h-4 w-4" /> Back
            </Button>
            {step < STEPS.length - 1 ? (
              <Button disabled={!canNext()} onClick={() => setStep((s) => s + 1)} className="bg-gradient-primary btn-glow">
                Next <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            ) : (
              <Button disabled={submitting || quotaReached} onClick={submit} className="bg-gradient-primary btn-glow">
                {submitting ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <ShieldCheck className="mr-1 h-4 w-4" />} Submit for AI review
              </Button>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-white/5 pb-2">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
