import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Save, UserCog, Crown, AlertCircle } from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscription } from "@/hooks/useSubscription";
import { fetchMyProfile, updateMyProfile } from "@/lib/queries";
import { slugify } from "@/lib/format";

export default function Settings() {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const { isPro } = useSubscription();
  const { data: profile, isLoading, refetch } = useQuery({
    queryKey: ["my-profile", user?.id],
    enabled: !!user?.id,
    queryFn: () => fetchMyProfile(user!.id),
  });

  const [form, setForm] = useState({ display_name: "", handle: "", bio: "", is_creator: false, website_url: "", twitter_handle: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      setForm({
        display_name: profile.display_name ?? "",
        handle: profile.handle ?? "",
        bio: profile.bio ?? "",
        is_creator: profile.is_creator ?? false,
        website_url: profile.website_url ?? "",
        twitter_handle: profile.twitter_handle ?? "",
      });
    }
  }, [profile]);

  const save = async () => {
    if (!user) return;
    const website = form.website_url.trim();
    if (isPro && website && !/^https?:\/\//i.test(website)) {
      toast({ title: "Invalid website URL", description: "Website must start with https://", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      await updateMyProfile(user.id, {
        display_name: form.display_name.trim(),
        handle: slugify(form.handle).replace(/-/g, ""),
        bio: form.bio.trim(),
        is_creator: form.is_creator,
        // "Advertise your services" links are a Pro perk.
        ...(isPro && {
          website_url: form.website_url.trim() || null,
          twitter_handle: form.twitter_handle.trim().replace(/^@/, "") || null,
        }),
      });
      await refetch();
      toast({ title: "Profile saved" });
    } catch (e) {
      toast({ title: "Could not save", description: (e as Error).message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Layout>
      <SEO title="Account settings" description="Manage your Paste Prompts profile and creator settings." canonical="/settings" noindex />
      <div className="container-tight py-10">
        <div className="mb-8 flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-primary shadow-glow">
            <UserCog className="h-5 w-5 text-primary-foreground" />
          </span>
          <h1 className="font-display text-3xl font-bold">Account settings</h1>
        </div>

        {isLoading ? (
          <div className="grid place-items-center py-20"><Loader2 className="h-7 w-7 animate-spin text-primary" /></div>
        ) : (
          <div className="space-y-6">
            <div className="space-y-5 rounded-3xl glass-strong p-7">
              <div>
                <Label htmlFor="dn">Display name</Label>
                <Input id="dn" value={form.display_name} onChange={(e) => setForm({ ...form, display_name: e.target.value })} className="mt-1 bg-card/60 border-white/10" />
              </div>
              <div>
                <Label htmlFor="handle">Handle</Label>
                <div className="mt-1 flex items-center">
                  <span className="rounded-l-lg border border-r-0 border-white/10 bg-card/60 px-3 py-2 text-sm text-muted-foreground">@</span>
                  <Input id="handle" value={form.handle} onChange={(e) => setForm({ ...form, handle: e.target.value })} className="rounded-l-none bg-card/60 border-white/10" />
                </div>
                <p className="mt-1 text-xs text-muted-foreground">Your public profile lives at /creators/{slugify(form.handle).replace(/-/g, "") || "handle"}</p>
              </div>
              <div>
                <Label htmlFor="bio">Bio</Label>
                <Textarea id="bio" value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} placeholder="Tell buyers what you specialise in…" className="mt-1 bg-card/60 border-white/10" />
              </div>
              <div className="flex items-center justify-between rounded-xl border border-white/5 p-4">
                <div>
                  <p className="text-sm font-medium">Creator mode</p>
                  <p className="text-xs text-muted-foreground">Enable to publish and sell your own prompts.</p>
                </div>
                <Switch checked={form.is_creator} onCheckedChange={(v) => setForm({ ...form, is_creator: v })} />
              </div>

              <div className="rounded-xl border border-white/5 p-4">
                <div className="mb-3 flex items-center gap-2">
                  <Crown className="h-4 w-4 text-primary" />
                  <p className="text-sm font-medium">Advertise your services</p>
                  {!isPro && <span className="ml-auto text-xs text-muted-foreground">Pro only</span>}
                </div>
                {isPro ? (
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="web">Website</Label>
                      {(() => {
                        const isWebValid = !form.website_url.trim() || /^https?:\/\/.+/i.test(form.website_url.trim());
                        return (
                          <div className="space-y-1 mt-1">
                            <Input
                              id="web"
                              value={form.website_url}
                              onChange={(e) => setForm({ ...form, website_url: e.target.value })}
                              placeholder="https://yourservice.com"
                              className={`bg-card/60 transition-colors ${
                                !isWebValid
                                  ? "border-red-500/60 focus-visible:ring-red-500 text-red-200"
                                  : "border-white/10"
                              }`}
                            />
                            {!isWebValid && (
                              <p className="text-[11px] text-red-400 font-medium flex items-center gap-1">
                                <AlertCircle className="h-3 w-3 shrink-0" /> Invalid URL: must include http:// or https://
                              </p>
                            )}
                          </div>
                        );
                      })()}
                    </div>
                    <div>
                      <Label htmlFor="tw">X / Twitter handle</Label>
                      <div className="mt-1 flex items-center">
                        <span className="rounded-l-lg border border-r-0 border-white/10 bg-card/60 px-3 py-2 text-sm text-muted-foreground">@</span>
                        <Input id="tw" value={form.twitter_handle} onChange={(e) => setForm({ ...form, twitter_handle: e.target.value })} placeholder="yourhandle" className="rounded-l-none bg-card/60 border-white/10" />
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    <Link to="/pro" className="text-primary underline">Upgrade to Pro</Link> to show your website and social links on your creator profile.
                  </p>
                )}
              </div>

              <Button onClick={save} disabled={saving} className="bg-gradient-primary btn-glow">
                {saving ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <Save className="mr-1 h-4 w-4" />} Save changes
              </Button>
            </div>

            <div className="flex items-center justify-between rounded-3xl glass p-6">
              <div>
                <p className="text-sm font-medium">Signed in as</p>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
              </div>
              <Button variant="outline" className="border-white/15" onClick={() => signOut()}>Sign out</Button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
