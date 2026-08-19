import { Link } from "react-router-dom";
import { Lock, Sparkles, TrendingUp, DollarSign, Users, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ProfileStatsLockedProps {
  creatorName?: string;
  isOwner?: boolean;
}

export function ProfileStatsLocked({ creatorName = "this creator", isOwner = false }: ProfileStatsLockedProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-primary/30 bg-card/40 p-6 sm:p-8 text-center backdrop-blur-md">
      {/* Blurred mock background items */}
      <div className="grid grid-cols-3 gap-4 blur-sm opacity-30 pointer-events-none mb-4">
        <div className="h-20 rounded-xl bg-primary/20 p-4" />
        <div className="h-20 rounded-xl bg-accent/20 p-4" />
        <div className="h-20 rounded-xl bg-primary/20 p-4" />
      </div>

      <div className="relative z-10 mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-primary text-primary-foreground shadow-glow mb-3">
        <Lock className="h-5 w-5" />
      </div>

      <h3 className="text-base sm:text-lg font-bold text-foreground mb-1.5">
        🔒 Advanced Creator Analytics
      </h3>
      <p className="mx-auto max-w-md text-xs sm:text-sm text-muted-foreground mb-5">
        {isOwner
          ? "Upgrade to PastePrompts Pro to unlock detailed revenue breakdowns, buyer retention cohorts, prompt conversion metrics, and profile viewer traffic."
          : `Advanced sales metrics and detailed performance analytics are reserved for verified Pro and Platinum creators.`}
      </p>

      <Button
        asChild
        size="sm"
        className="bg-gradient-primary font-semibold shadow-glow text-xs sm:text-sm"
      >
        <Link to="/pro">
          <Sparkles className="mr-1.5 h-4 w-4" /> Upgrade to Pro
        </Link>
      </Button>
    </div>
  );
}
