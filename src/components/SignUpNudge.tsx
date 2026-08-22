import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, X, Gift, Bookmark, BellRing } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

const DISMISS_KEY = "pp_signup_nudge_dismissed_at";
// Re-show after 3 days so we keep nudging without nagging within a session.
const REAPPEAR_MS = 3 * 24 * 60 * 60 * 1000;

// Routes where a sign-up nudge would be redundant or annoying.
const HIDE_PREFIXES = ["/auth", "/checkout", "/settings", "/dashboard", "/admin", "/sell"];

function recentlyDismissed() {
  try {
    const raw = localStorage.getItem(DISMISS_KEY);
    if (!raw) return false;
    return Date.now() - Number(raw) < REAPPEAR_MS;
  } catch {
    return false;
  }
}

const perks = [
  { icon: Gift, label: "Hundreds of free prompts" },
  { icon: Bookmark, label: "Your own saved library" },
  { icon: BellRing, label: "New drops before anyone else" },
];

/**
 * Conversion nudge shown to logged-out visitors.
 *
 * Psychology at work: it waits until the visitor has shown intent (scrolled into
 * the content), leads with a free value stack rather than "sign up", uses light
 * social proof, and is easily dismissible so it never feels like a wall. The
 * dismissal is remembered for a few days to avoid nag-fatigue.
 */
export function SignUpNudge() {
  const { user, loading } = useAuth();
  const { pathname } = useLocation();
  const [visible, setVisible] = useState(false);

  const hidden = HIDE_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));

  useEffect(() => {
    if (loading || user || hidden || recentlyDismissed()) {
      setVisible(false);
      return;
    }

    let shown = false;
    const reveal = () => {
      if (shown) return;
      shown = true;
      setVisible(true);
    };

    const onScroll = () => {
      if (window.scrollY > 500) reveal();
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    const timer = window.setTimeout(reveal, 15000);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.clearTimeout(timer);
    };
  }, [loading, user, hidden, pathname]);

  const dismiss = () => {
    try {
      localStorage.setItem(DISMISS_KEY, String(Date.now()));
    } catch {
      /* ignore */
    }
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 40 }}
          transition={{ type: "spring", stiffness: 260, damping: 24 }}
          className="fixed inset-x-3 bottom-16 z-50 mx-auto max-w-2xl rounded-2xl border border-primary/25 bg-card/95 p-4 shadow-2xl backdrop-blur-xl sm:inset-x-auto sm:right-5 sm:bottom-5 sm:w-[26rem] sm:p-5"
          role="dialog"
          aria-label="Create a free account"
        >
          <button
            onClick={dismiss}
            aria-label="Dismiss"
            className="absolute right-2.5 top-2.5 rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-secondary/70 hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>

          <div className="mb-2 flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary/15 text-primary-glow">
              <Sparkles className="h-4 w-4" />
            </span>
            <h3 className="text-base font-semibold leading-tight">Join free — keep the good prompts</h3>
          </div>

          <p className="mb-3 text-sm text-muted-foreground">
            Unlock the full library of prompts that actually work. Create a free account in seconds —
            no card needed.
          </p>

          <ul className="mb-4 space-y-1.5">
            {perks.map((p) => (
              <li key={p.label} className="flex items-center gap-2 text-sm">
                <p.icon className="h-4 w-4 shrink-0 text-primary-glow" />
                <span>{p.label}</span>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-2">
            <Button asChild className="flex-1">
              <Link to="/auth" onClick={dismiss}>
                Create free account
              </Link>
            </Button>
            <Button asChild variant="ghost" onClick={dismiss}>
              <Link to="/auth">Log in</Link>
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default SignUpNudge;
