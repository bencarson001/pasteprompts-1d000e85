import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ShieldCheck,
  Crown,
  Sparkles,
  UserPlus,
  UserCheck,
  Share2,
  ExternalLink,
  Twitter,
  Globe,
  MapPin,
  Calendar,
  Eye,
  Star,
  Award,
  Edit3,
  MessageSquare,
  Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { ExtendedProfile } from "@/lib/social";
import { MembershipTier } from "@/lib/permissions";

interface ProfileHeaderProps {
  profile: ExtendedProfile;
  isOwner: boolean;
  isFollowing: boolean;
  followersCount: number;
  followingCount: number;
  promptsCount: number;
  viewerTier: MembershipTier;
  onToggleFollow: () => void;
  isFollowLoading?: boolean;
}

export function ProfileHeader({
  profile,
  isOwner,
  isFollowing,
  followersCount,
  followingCount,
  promptsCount,
  viewerTier,
  onToggleFollow,
  isFollowLoading,
}: ProfileHeaderProps) {
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleShare = () => {
    const url = window.location.href;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
      toast({
        title: "Profile link copied!",
        description: "Share this link with anyone to view this creator's portfolio.",
      });
    }
  };

  const formattedDate = profile.created_at
    ? new Date(profile.created_at).toLocaleDateString("en-GB", {
        month: "short",
        year: "numeric",
      })
    : "Member";

  const tier = profile.membership_tier || "free";

  return (
    <div className="relative mb-8 overflow-hidden rounded-3xl border border-white/10 bg-card/60 shadow-2xl backdrop-blur-xl">
      {/* Banner */}
      <div className="relative h-48 sm:h-64 w-full overflow-hidden bg-gradient-to-r from-primary/30 via-accent/20 to-primary/40">
        {profile.banner_url ? (
          <img
            src={profile.banner_url}
            alt="Profile cover banner"
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="h-full w-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/30 via-card to-background" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/30 to-transparent" />
      </div>

      {/* Profile Details Container */}
      <div className="relative px-6 pb-6 pt-0 sm:px-8 sm:pb-8">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 -mt-16 sm:-mt-20">
          {/* Avatar & Badges */}
          <div className="relative flex items-end gap-4">
            <div className="relative">
              <Avatar className="h-28 w-28 sm:h-36 sm:w-36 rounded-2xl border-4 border-background shadow-2xl ring-2 ring-primary/20">
                <AvatarImage src={profile.avatar_url ?? undefined} alt={profile.display_name} />
                <AvatarFallback className="bg-gradient-primary font-display text-2xl sm:text-3xl font-bold text-primary-foreground">
                  {(profile.display_name ?? profile.handle ?? "U").slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>

              {/* VIP / Pro Badges */}
              {tier === "platinum" && (
                <div
                  title="Platinum VIP Creator"
                  className="absolute -bottom-2 -right-2 flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-300 text-slate-950 shadow-lg ring-2 ring-background"
                >
                  <Crown className="h-4 w-4 fill-current" />
                </div>
              )}
              {tier === "pro" && (
                <div
                  title="Pro Verified Creator"
                  className="absolute -bottom-2 -right-2 flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-primary text-primary-foreground shadow-lg ring-2 ring-background"
                >
                  <ShieldCheck className="h-4 w-4" />
                </div>
              )}
            </div>

            <div className="hidden sm:block pb-2">
              <div className="flex items-center gap-2">
                <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                  {profile.display_name || `@${profile.handle}`}
                </h1>
                {tier === "platinum" ? (
                  <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/40 text-xs font-semibold">
                    PLATINUM VIP
                  </Badge>
                ) : tier === "pro" ? (
                  <Badge className="bg-primary/20 text-primary-glow border-primary/40 text-xs font-semibold">
                    PRO CREATOR
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-xs text-muted-foreground border-white/10">
                    CREATOR
                  </Badge>
                )}
              </div>
              <p className="text-sm font-medium text-muted-foreground">@{profile.handle}</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2 pt-2 sm:pt-0">
            {isOwner ? (
              <>
                <Button
                  size="sm"
                  asChild
                  className="bg-gradient-primary font-semibold shadow-glow text-xs sm:text-sm"
                >
                  <Link to="/profile/edit">
                    <Edit3 className="mr-1.5 h-4 w-4" /> Edit Profile
                  </Link>
                </Button>
                {tier === "free" && (
                  <Button
                    size="sm"
                    variant="outline"
                    asChild
                    className="border-amber-500/40 text-amber-300 hover:bg-amber-500/10 text-xs"
                  >
                    <Link to="/pro">
                      <Sparkles className="mr-1.5 h-3.5 w-3.5" /> Upgrade to Pro
                    </Link>
                  </Button>
                )}
              </>
            ) : (
              <>
                <Button
                  size="sm"
                  onClick={onToggleFollow}
                  disabled={isFollowLoading}
                  className={
                    isFollowing
                      ? "border border-white/15 bg-card/80 text-foreground hover:bg-destructive/20 hover:text-destructive hover:border-destructive/30"
                      : "bg-gradient-primary text-primary-foreground shadow-glow"
                  }
                >
                  {isFollowing ? (
                    <>
                      <UserCheck className="mr-1.5 h-4 w-4" /> Following
                    </>
                  ) : (
                    <>
                      <UserPlus className="mr-1.5 h-4 w-4" /> Follow Creator
                    </>
                  )}
                </Button>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => navigate(`/messages?to=${profile.id}`)}
                  className="border-white/10 bg-card/40 hover:bg-card text-foreground"
                >
                  <MessageSquare className="h-4 w-4" />
                </Button>
              </>
            )}

            <Button
              size="sm"
              variant="outline"
              onClick={handleShare}
              className="border-white/10 bg-card/40 hover:bg-card text-muted-foreground hover:text-foreground"
              title="Share profile"
            >
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Mobile Name Display */}
        <div className="mt-4 sm:hidden">
          <div className="flex items-center gap-2">
            <h1 className="font-display text-xl font-bold tracking-tight text-foreground">
              {profile.display_name || `@${profile.handle}`}
            </h1>
            {tier === "platinum" ? (
              <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/40 text-[10px] font-semibold">
                PLATINUM
              </Badge>
            ) : tier === "pro" ? (
              <Badge className="bg-primary/20 text-primary-glow border-primary/40 text-[10px] font-semibold">
                PRO
              </Badge>
            ) : null}
          </div>
          <p className="text-xs font-medium text-muted-foreground">@{profile.handle}</p>
        </div>

        {/* Bio */}
        {profile.bio && (
          <p className="mt-4 max-w-3xl text-sm sm:text-base leading-relaxed text-foreground/90 font-normal">
            {profile.bio}
          </p>
        )}

        {/* Meta Stats & Socials Bar */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-white/5 pt-5">
          {/* Numerical Counters */}
          <div className="flex flex-wrap items-center gap-6 text-sm">
            <div>
              <span className="font-bold text-foreground">{promptsCount}</span>{" "}
              <span className="text-muted-foreground">Prompts</span>
            </div>
            <div>
              <span className="font-bold text-foreground">{followersCount}</span>{" "}
              <span className="text-muted-foreground">Followers</span>
            </div>
            <div>
              <span className="font-bold text-foreground">{followingCount}</span>{" "}
              <span className="text-muted-foreground">Following</span>
            </div>
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Eye className="h-4 w-4 text-primary-glow" />
              <span className="font-bold text-foreground">{profile.profile_views_count}</span> views
            </div>
            {profile.reputation_score && (
              <div className="flex items-center gap-1.5 text-amber-400">
                <Star className="h-4 w-4 fill-current" />
                <span className="font-bold">{profile.reputation_score}</span>
                <span className="text-xs text-muted-foreground">Rep</span>
              </div>
            )}
          </div>

          {/* Social Links & Location */}
          <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            {profile.location && (
              <span className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" /> {profile.location}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" /> Joined {formattedDate}
            </span>

            {profile.website_url && (
              <a
                href={
                  profile.website_url.startsWith("http")
                    ? profile.website_url
                    : `https://${profile.website_url}`
                }
                target="_blank"
                rel="noreferrer noopener"
                className="flex items-center gap-1 text-primary-glow hover:underline"
              >
                <Globe className="h-3.5 w-3.5" /> Website
              </a>
            )}

            {profile.twitter_handle && (
              <a
                href={`https://twitter.com/${profile.twitter_handle.replace("@", "")}`}
                target="_blank"
                rel="noreferrer noopener"
                className="flex items-center gap-1 text-sky-400 hover:underline"
              >
                <Twitter className="h-3.5 w-3.5 fill-current" /> @{profile.twitter_handle.replace("@", "")}
              </a>
            )}
          </div>
        </div>

        {/* Skill Tags */}
        {profile.skills && profile.skills.length > 0 && (
          <div className="mt-4 flex flex-wrap items-center gap-1.5 pt-2">
            <span className="text-xs font-semibold text-muted-foreground mr-1">Skills:</span>
            {profile.skills.map((skill) => (
              <span
                key={skill}
                className="rounded-lg border border-white/5 bg-card/60 px-2.5 py-1 text-xs font-medium text-foreground/80"
              >
                {skill}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
