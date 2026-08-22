import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Sparkles, Loader2, Check } from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { CreatorOnboardingDialog } from "@/components/auth/CreatorOnboardingDialog";
import { updateMyProfile } from "@/lib/queries";

export default function Auth() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, signIn, signUp, signInWithGoogle } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup">(params.get("mode") === "signup" ? "signup" : "signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);
  const [showCreatorPrompt, setShowCreatorPrompt] = useState(false);
  const [newUserId, setNewUserId] = useState<string | null>(null);

  const redirect = params.get("redirect") ?? "/";

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    if (mode === "signup") {
      const res = await signUp(email, password, displayName || email.split("@")[0]);
      setLoading(false);
      if (res.error) {
        toast({ title: "Authentication failed", description: res.error, variant: "destructive" });
        return;
      }
      toast({ title: "Account created", description: "Welcome to Paste Prompts." });
      setNewUserId(res.user?.id || user?.id || null);
      setShowCreatorPrompt(true);
    } else {
      const res = await signIn(email, password);
      setLoading(false);
      if (res.error) {
        toast({ title: "Authentication failed", description: res.error, variant: "destructive" });
        return;
      }
      navigate(redirect);
    }
  };

  const handleGoogle = async () => {
    try {
      await signInWithGoogle(redirect);
      // On success without redirect, the session is set — go to destination.
      navigate(redirect);
    } catch (err) {
      toast({ title: "Google sign-in failed", description: (err as Error).message, variant: "destructive" });
    }
  };

  const handleEnableCreator = async () => {
    const targetId = newUserId || user?.id;
    if (targetId) {
      try {
        await updateMyProfile(targetId, { is_creator: true });
      } catch (e) {
        console.warn("Could not set is_creator flag:", e);
      }
    }
    setShowCreatorPrompt(false);
    toast({
      title: "Creator Mode Activated!",
      description: "Customize your public creator profile now.",
    });
    navigate("/profile/edit?first_time=true");
  };

  const handleDeclineCreator = async () => {
    const targetId = newUserId || user?.id;
    if (targetId) {
      try {
        await updateMyProfile(targetId, { is_creator: false });
      } catch (e) {
        console.warn("Could not set is_creator flag:", e);
      }
    }
    setShowCreatorPrompt(false);
    toast({
      title: "Welcome to Paste Prompts",
      description: "Your account is ready as a member. You can enable Creator Mode anytime from Settings.",
    });
    navigate(redirect);
  };

  return (
    <Layout>
      <SEO title={mode === "signup" ? "Create your free account" : "Sign in"} description="Create a free Paste Prompts account to save prompts, unlock free packs, follow creators, and sell your own AI prompts." canonical="/auth" noindex />
      <div className="container-tight grid min-h-[70vh] place-items-center py-12">
        <div className="w-full max-w-md rounded-3xl glass-strong p-8">
          <div className="mb-6 text-center">
            <span className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-xl bg-gradient-primary shadow-glow">
              <Sparkles className="h-6 w-6 text-primary-foreground" />
            </span>
            <h1 className="font-display text-2xl font-bold">{mode === "signup" ? "Create your free account" : "Welcome back"}</h1>
            <p className="mt-1 text-sm text-muted-foreground">{mode === "signup" ? "Free forever · no card required · takes 10 seconds." : "Sign in to your library."}</p>
          </div>

          {mode === "signup" && (
            <ul className="mb-5 space-y-2 rounded-2xl bg-card/40 p-4 text-sm">
              {["Save prompts to your personal library", "Unlock hundreds of free prompts instantly", "Follow creators & get new releases first"].map((b) => (
                <li key={b} className="flex items-start gap-2 text-muted-foreground">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary-glow" /> {b}
                </li>
              ))}
            </ul>
          )}


          <Button onClick={handleGoogle} variant="outline" className="mb-4 w-full border-white/15">Continue with Google</Button>
          <div className="mb-4 flex items-center gap-3 text-xs text-muted-foreground"><span className="h-px flex-1 bg-border" />OR<span className="h-px flex-1 bg-border" /></div>

          <form onSubmit={submit} className="space-y-4">
            {mode === "signup" && (
              <div>
                <Label htmlFor="name">Display name</Label>
                <Input id="name" value={displayName} onChange={(e) => setDisplayName(e.target.value)} className="mt-1 bg-card/60 border-white/10" placeholder="Your name" />
              </div>
            )}
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 bg-card/60 border-white/10" placeholder="you@example.com" />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1 bg-card/60 border-white/10" placeholder="••••••••" />
            </div>
            <Button type="submit" disabled={loading} className="w-full bg-gradient-primary btn-glow">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : mode === "signup" ? "Create account" : "Sign in"}
            </Button>
          </form>

          <p className="mt-5 text-center text-sm text-muted-foreground">
            {mode === "signup" ? "Already have an account? " : "New to Paste Prompts? "}
            <button onClick={() => setMode(mode === "signup" ? "signin" : "signup")} className="font-medium text-primary-glow hover:underline">
              {mode === "signup" ? "Sign in" : "Create one"}
            </button>
          </p>
          <p className="mt-4 text-center text-xs text-muted-foreground">By continuing you confirm you're 16+ and agree to our <Link to="/legal/terms" className="underline">Terms</Link> and <Link to="/legal/privacy" className="underline">Privacy Policy</Link>.</p>
        </div>
      </div>

      <CreatorOnboardingDialog
        open={showCreatorPrompt}
        onOpenChange={setShowCreatorPrompt}
        onConfirm={handleEnableCreator}
        onDecline={handleDeclineCreator}
      />
    </Layout>
  );
}
