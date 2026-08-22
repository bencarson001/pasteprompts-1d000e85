import { ShieldCheck, Sparkles, Star, Zap, Award, Crown } from "lucide-react";
import { CreatorBadge } from "@/lib/social";

interface ProfileBadgesProps {
  badges: CreatorBadge[];
}

export function ProfileBadges({ badges }: ProfileBadgesProps) {
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case "ShieldCheck":
        return <ShieldCheck className="h-5 w-5 text-primary-glow" />;
      case "Sparkles":
        return <Sparkles className="h-5 w-5 text-amber-400" />;
      case "Star":
        return <Star className="h-5 w-5 text-yellow-300 fill-current" />;
      case "Zap":
        return <Zap className="h-5 w-5 text-sky-400" />;
      default:
        return <Award className="h-5 w-5 text-emerald-400" />;
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {badges.map((badge) => (
        <div
          key={badge.id}
          className="flex items-start gap-3.5 rounded-2xl border border-white/10 bg-card/40 p-4 transition-all hover:bg-card/70 hover:border-white/20"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-background/80 shadow-sm">
            {getIcon(badge.icon)}
          </div>
          <div>
            <h4 className="text-sm font-semibold text-foreground">{badge.label}</h4>
            <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
              {badge.description}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
