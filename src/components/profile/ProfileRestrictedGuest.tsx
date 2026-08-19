import { Link } from "react-router-dom";
import { Lock, Sparkles, UserPlus, LogIn, Shield, CheckCircle2, TrendingUp, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ExtendedProfile } from "@/lib/social";

interface ProfileRestrictedGuestProps {
  profile: ExtendedProfile;
  promptsCount: number;
}

export function ProfileRestrictedGuest({ profile, promptsCount }: ProfileRestrictedGuestProps) {
  const tier = profile.membership_tier || "free";

  return (
    <div className="mx-auto max-w-4xl py-6">
      {/* Teaser Header Card */}
      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-card/70 p-6 sm:p-10 shadow-2xl backdrop-blur-2xl text-center">
        {/* Subtle background flare */}
        <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 h-64 w-96 rounded-full bg-primary/20 blur-3xl" />

        <div className="relative flex flex-col items-center">
          <Avatar className="h-24 w-24 sm:h-28 sm:w-28 rounded-2xl border-4 border-background shadow-xl ring-2 ring-primary/20 mb-4">
            <AvatarImage src={profile.avatar_url ?? undefined} alt={profile.display_name} />
            <AvatarFallback className="bg-gradient-primary font-display text-2xl font-bold text-primary-foreground">
              {(profile.display_name ?? profile.handle ?? "U").slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <div className="flex items-center gap-2 mb-1">
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground">
              {profile.display_name || `@${profile.handle}`}
            </h1>
            {tier === "platinum" ? (
              <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/40 text-xs">
                PLATINUM VIP
              </Badge>
            ) : tier === "pro" ? (
              <Badge className="bg-primary/20 text-primary-glow border-primary/40 text-xs">
                PRO CREATOR
              </Badge>
            ) : null}
          </div>
          <p className="text-sm font-medium text-muted-foreground mb-4">@{profile.handle}</p>

          {profile.bio && (
            <p className="max-w-lg text-sm text-foreground/80 leading-relaxed mb-6 italic">
              "{profile.bio}"
            </p>
          )}

          {/* Quick numbers teaser */}
          <div className="flex items-center justify-center gap-6 rounded-2xl border border-white/5 bg-background/50 px-6 py-3 text-sm mb-8">
            <div>
              <span className="font-bold text-foreground">{promptsCount}</span>{" "}
              <span className="text-muted-foreground">Prompts</span>
            </div>
            <div className="h-4 w-px bg-white/10" />
            <div>
              <span className="font-bold text-foreground">{profile.followers_count}</span>{" "}
              <span className="text-muted-foreground">Followers</span>
            </div>
            <div className="h-4 w-px bg-white/10" />
            <div className="flex items-center gap-1 text-muted-foreground">
              <Eye className="h-4 w-4 text-primary-glow" />
              <span className="font-bold text-foreground">{profile.profile_views_count}</span> views
            </div>
          </div>
        </div>

        {/* Lock Conversion Box */}
        <div className="relative overflow-hidden rounded-2xl border border-primary/30 bg-gradient-to-b from-card/90 to-background p-6 sm:p-8 shadow-xl">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-primary text-primary-foreground shadow-glow mb-4">
            <Lock className="h-6 w-6" />
          </div>

          <h2 className="font-display text-xl sm:text-2xl font-bold text-foreground mb-2">
            Sign in to view full creator profile
          </h2>
          <p className="mx-auto max-w-md text-sm text-muted-foreground mb-6">
            Unlock {profile.display_name || profile.handle}'s full prompt portfolio, copyable template chains, custom system instructions, and direct creator messaging.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-sm mx-auto">
            <Button
              asChild
              size="lg"
              className="w-full bg-gradient-primary font-semibold shadow-glow h-11"
            >
              <Link to="/auth?mode=signup">
                <UserPlus className="mr-2 h-4 w-4" /> Create Free Account
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="w-full border-white/15 bg-card/80 hover:bg-card h-11 font-medium"
            >
              <Link to="/auth">
                <LogIn className="mr-2 h-4 w-4" /> Sign In
              </Link>
            </Button>
          </div>

          {/* Social Proof Checklist */}
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3 border-t border-white/5 pt-6 text-left">
            <div className="flex items-start gap-2 text-xs text-muted-foreground">
              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>Instant access to 100+ free prompts</span>
            </div>
            <div className="flex items-start gap-2 text-xs text-muted-foreground">
              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>Follow creators &amp; get prompt updates</span>
            </div>
            <div className="flex items-start gap-2 text-xs text-muted-foreground">
              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>1-click copy &amp; direct AI export</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
