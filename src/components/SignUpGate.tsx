import { Link } from "react-router-dom";
import { Sparkles, Check, Gift, Bookmark, Zap } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Where to send the user back after they authenticate. */
  redirect?: string;
}

const perks = [
  { icon: Gift, label: "Unlimited copies — free forever" },
  { icon: Bookmark, label: "Save prompts to your own library" },
  { icon: Zap, label: "New drops before anyone else" },
];

/**
 * Soft-wall shown after a logged-out visitor hits their free copy limit.
 *
 * Psychology: it appears only *after* the visitor has felt the value (they've
 * copied real prompts), frames sign-up as unlocking more of something they
 * already like (loss aversion + endowment), leads with Google one-tap to kill
 * friction, and keeps a low-key "maybe later" so it never feels like a hard wall.
 */
export function SignUpGate({ open, onOpenChange, redirect = "/" }: Props) {
  const { signInWithGoogle } = useAuth();
  const { toast } = useToast();

  const handleGoogle = async () => {
    try {
      await signInWithGoogle();
    } catch (err) {
      toast({ title: "Google sign-in failed", description: (err as Error).message, variant: "destructive" });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md overflow-hidden border-primary/25 p-0">
        <div className="bg-gradient-primary/10 p-6">
          <div className="mb-4 flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-primary shadow-glow">
              <Sparkles className="h-5 w-5 text-primary-foreground" />
            </span>
            <div>
              <h2 className="font-display text-xl font-bold leading-tight">You're on a roll 🔥</h2>
              <p className="text-sm text-muted-foreground">Create a free account to keep copying.</p>
            </div>
          </div>

          <p className="mb-4 text-sm text-muted-foreground">
            Unlock the full library of ready-to-use prompts. A free account is free forever and takes
            10 seconds — no card needed.
          </p>

          <ul className="mb-5 space-y-2">
            {perks.map((p) => (
              <li key={p.label} className="flex items-center gap-2 text-sm">
                <span className="grid h-6 w-6 place-items-center rounded-md bg-primary/15 text-primary-glow">
                  <p.icon className="h-3.5 w-3.5" />
                </span>
                <span>{p.label}</span>
              </li>
            ))}
          </ul>

          <Button onClick={handleGoogle} variant="outline" className="mb-2 w-full border-white/15">
            Continue with Google
          </Button>
          <Button asChild className="w-full bg-gradient-primary btn-glow">
            <Link to={`/auth?mode=signup&redirect=${encodeURIComponent(redirect)}`}>
              Create free account
            </Link>
          </Button>

          <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Check className="h-3 w-3 text-primary-glow" /> Free forever
            </span>
            <button onClick={() => onOpenChange(false)} className="hover:text-foreground hover:underline">
              Maybe later
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default SignUpGate;
