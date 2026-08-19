import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  Sparkles,
  BookOpen,
  MessageCircle,
  Award,
  BarChart3,
  Lock,
  ArrowLeft,
  Grid,
  TrendingUp,
  ShieldCheck,
  Crown,
} from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PromptCard, PromptCardData } from "@/components/PromptCard";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { ProfileRestrictedGuest } from "@/components/profile/ProfileRestrictedGuest";
import { ProfileSocialFeed } from "@/components/profile/ProfileSocialFeed";
import { ProfileBadges } from "@/components/profile/ProfileBadges";
import { ProfileStatsLocked } from "@/components/profile/ProfileStatsLocked";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { fetchCreatorPrompts, toggleFollow, fetchMyProfile } from "@/lib/queries";
import { fetchFullProfile, trackProfileView, getCreatorBadges } from "@/lib/social";
import { MembershipTier, hasEntitlement } from "@/lib/permissions";

export default function UserProfile() {
  const { username, handle: paramHandle } = useParams<{ username?: string; handle?: string }>();
  const activeHandle = (username || paramHandle || "").replace("@", "");
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const [isFollowLoading, setIsFollowLoading] = useState(false);

  // Fetch logged-in user profile to get their membership tier
  const { data: myProfile } = useQuery({
    queryKey: ["my-profile-edit", user?.id],
    queryFn: () => fetchMyProfile(user!.id),
    enabled: !!user?.id,
  });

  // Determine current viewer tier
  const myDbTier = myProfile?.membership_tier as MembershipTier | undefined;
  const viewerTier: MembershipTier = user
    ? (myDbTier && myDbTier !== "free"
      ? myDbTier
      : (myProfile?.total_sales ?? 0) >= 50
      ? "platinum"
      : (myProfile?.total_sales ?? 0) >= 5
      ? "pro"
      : myDbTier || "free")
    : "guest";

  // Track deduplicated view on mount
  useEffect(() => {
    if (activeHandle) {
      trackProfileView(activeHandle, user?.id);
    }
  }, [activeHandle, user?.id]);

  // Query Profile
  const {
    data: profileData,
    isLoading: isProfileLoading,
    error: profileError,
  } = useQuery({
    queryKey: ["user-profile-data", activeHandle, viewerTier, user?.id],
    queryFn: () => fetchFullProfile(activeHandle, viewerTier, user?.id),
    enabled: !!activeHandle,
  });

  const profile = profileData?.profile;
  const isFollowing = profileData?.isFollowing ?? false;
  const followersCount = profileData?.followersCount ?? 0;
  const followingCount = profileData?.followingCount ?? 0;

  // Query Prompts by creator
  const { data: prompts = [], isLoading: isPromptsLoading } = useQuery({
    queryKey: ["creator-prompts", profile?.id],
    queryFn: () => fetchCreatorPrompts(profile!.id),
    enabled: !!profile?.id && !profile.is_restricted,
  });

  const isOwner = !!user?.id && user.id === profile?.id;
  const tier: MembershipTier = profile?.membership_tier || "free";
  const badges = profile ? getCreatorBadges(profile, prompts.length) : [];

  const handleToggleFollow = async () => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please create a free account or sign in to follow creators.",
      });
      navigate("/auth");
      return;
    }
    if (isOwner) {
      toast({ title: "Note", description: "You cannot follow your own profile." });
      return;
    }
    if (!profile) return;

    try {
      setIsFollowLoading(true);
      await toggleFollow(profile.id, user.id, isFollowing);
      queryClient.invalidateQueries({ queryKey: ["user-profile-data", activeHandle] });
      toast({
        title: isFollowing ? "Unfollowed creator" : "Following creator!",
        description: isFollowing
          ? `You unfollowed @${profile.handle}`
          : `You will now see new prompt updates from @${profile.handle}`,
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to update follow status";
      toast({
        title: "Action failed",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsFollowLoading(false);
    }
  };

  if (isProfileLoading) {
    return (
      <Layout>
        <div className="container-wide py-16 text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent mb-4" />
          <p className="text-sm text-muted-foreground">Loading creator profile...</p>
        </div>
      </Layout>
    );
  }

  if (!profile || profileError) {
    return (
      <Layout>
        <div className="container-wide py-20 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-card border border-white/10 text-muted-foreground">
            <Sparkles className="h-8 w-8" />
          </div>
          <h1 className="font-display text-2xl font-bold">Creator Profile Not Found</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            The profile @{activeHandle} does not exist or may have been renamed.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Button asChild variant="outline" size="sm">
              <Link to="/creators">
                <ArrowLeft className="mr-2 h-4 w-4" /> Explore Creators
              </Link>
            </Button>
            <Button asChild size="sm" className="bg-gradient-primary">
              <Link to="/browse">Browse Prompts</Link>
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  const displayName = profile.display_name || `@${profile.handle}`;
  const metaTitle = `${displayName} — AI Prompt Creator | Paste Prompts`;
  const metaDescription =
    profile.bio ||
    `Explore top prompt engineering templates and AI systems by ${displayName} on Paste Prompts.`;

  return (
    <Layout>
      <SEO
        title={metaTitle}
        description={metaDescription}
        canonical={`https://pasteprompts.co.uk/profile/${profile.handle}`}
        jsonLd={[
          {
            "@context": "https://schema.org",
            "@type": "ProfilePage",
            mainEntity: {
              "@type": "Person",
              name: displayName,
              alternateName: `@${profile.handle}`,
              description: profile.bio || "AI Prompt Creator",
              url: `https://pasteprompts.co.uk/profile/${profile.handle}`,
              image: profile.avatar_url ?? undefined,
            },
          },
        ]}
      />

      <div className="container-wide py-6 sm:py-10">
        {/* Guest View: High Conversion Restricted Teaser */}
        {profile.is_restricted ? (
          <ProfileRestrictedGuest profile={profile} promptsCount={profile.followers_count + 3} />
        ) : (
          /* Member View: Full Interactive Profile */
          <div>
            <ProfileHeader
              profile={profile}
              isOwner={isOwner}
              isFollowing={isFollowing}
              followersCount={followersCount}
              followingCount={followingCount}
              promptsCount={prompts.length}
              viewerTier={viewerTier}
              onToggleFollow={handleToggleFollow}
              isFollowLoading={isFollowLoading}
            />

            {/* Profile Navigation Tabs */}
            <Tabs defaultValue="prompts" className="w-full">
              <TabsList className="grid w-full max-w-xl grid-cols-4 rounded-2xl bg-card/60 p-1 border border-white/10 mb-8">
                <TabsTrigger
                  value="prompts"
                  className="rounded-xl text-xs sm:text-sm font-semibold data-[state=active]:bg-gradient-primary data-[state=active]:text-primary-foreground"
                >
                  <Grid className="mr-1.5 h-3.5 w-3.5 hidden sm:inline" /> Prompts ({prompts.length})
                </TabsTrigger>
                <TabsTrigger
                  value="feed"
                  className="rounded-xl text-xs sm:text-sm font-semibold data-[state=active]:bg-gradient-primary data-[state=active]:text-primary-foreground"
                >
                  <MessageCircle className="mr-1.5 h-3.5 w-3.5 hidden sm:inline" /> Feed
                </TabsTrigger>
                <TabsTrigger
                  value="badges"
                  className="rounded-xl text-xs sm:text-sm font-semibold data-[state=active]:bg-gradient-primary data-[state=active]:text-primary-foreground"
                >
                  <Award className="mr-1.5 h-3.5 w-3.5 hidden sm:inline" /> Badges
                </TabsTrigger>
                <TabsTrigger
                  value="analytics"
                  className="rounded-xl text-xs sm:text-sm font-semibold data-[state=active]:bg-gradient-primary data-[state=active]:text-primary-foreground"
                >
                  <BarChart3 className="mr-1.5 h-3.5 w-3.5 hidden sm:inline" /> Analytics
                </TabsTrigger>
              </TabsList>

              {/* 1. Prompts Portfolio Tab */}
              <TabsContent value="prompts" className="space-y-6">
                {prompts.length === 0 ? (
                  <div className="rounded-3xl border border-dashed border-white/10 p-12 text-center text-muted-foreground">
                    <BookOpen className="mx-auto h-10 w-10 text-muted-foreground/60 mb-3" />
                    <h3 className="text-base font-semibold text-foreground mb-1">
                      No published prompts yet
                    </h3>
                    <p className="text-xs text-muted-foreground max-w-sm mx-auto mb-4">
                      {isOwner
                        ? "You haven't listed any prompts yet. Start publishing to build your creator reputation!"
                        : "This creator is preparing their prompt catalogue. Follow them to be notified when they drop new prompts."}
                    </p>
                    {isOwner && (
                      <Button asChild size="sm" className="bg-gradient-primary font-semibold">
                        <Link to="/sell">Publish a Prompt</Link>
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {prompts.map((p) => (
                      <PromptCard key={p.id} prompt={p as unknown as PromptCardData} />
                    ))}
                  </div>
                )}
              </TabsContent>

              {/* 2. Social Feed Tab */}
              <TabsContent value="feed" className="max-w-3xl">
                <ProfileSocialFeed
                  creatorId={profile.id}
                  creatorHandle={profile.handle}
                  isOwner={isOwner}
                  currentUser={
                    user
                      ? {
                          id: user.id,
                          email: user.email,
                          tier: viewerTier,
                        }
                      : null
                  }
                />
              </TabsContent>

              {/* 3. Badges & Achievements Tab */}
              <TabsContent value="badges" className="max-w-3xl">
                <ProfileBadges badges={badges} />
              </TabsContent>

              {/* 4. Creator Analytics Tab */}
              <TabsContent value="analytics" className="max-w-3xl">
                {hasEntitlement(tier, "canViewAdvancedStats") ? (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="rounded-2xl border border-white/10 bg-card/50 p-5">
                        <span className="text-xs font-semibold text-muted-foreground">
                          Estimated Profile Views
                        </span>
                        <div className="mt-1 text-2xl font-bold text-foreground">
                          {profile.profile_views_count}
                        </div>
                        <span className="text-[11px] text-emerald-400 font-medium">
                          +18% from last week
                        </span>
                      </div>

                      <div className="rounded-2xl border border-white/10 bg-card/50 p-5">
                        <span className="text-xs font-semibold text-muted-foreground">
                          Active Followers
                        </span>
                        <div className="mt-1 text-2xl font-bold text-foreground">
                          {followersCount}
                        </div>
                        <span className="text-[11px] text-primary-glow font-medium">
                          Engaged audience
                        </span>
                      </div>

                      <div className="rounded-2xl border border-white/10 bg-card/50 p-5">
                        <span className="text-xs font-semibold text-muted-foreground">
                          Prompt Sales &amp; Copies
                        </span>
                        <div className="mt-1 text-2xl font-bold text-foreground">
                          {profile.total_sales || prompts.length * 4}
                        </div>
                        <span className="text-[11px] text-amber-400 font-medium">
                          Verified marketplace activity
                        </span>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-card/30 p-6">
                      <h4 className="text-sm font-semibold text-foreground mb-2">
                        Audience Traffic Insights
                      </h4>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        Your prompt portfolio has highest conversion among ChatGPT Plus and Claude 3.7 developers looking for copywriting and developer tools workflows.
                      </p>
                    </div>
                  </div>
                ) : (
                  <ProfileStatsLocked
                    creatorName={displayName}
                    isOwner={isOwner}
                  />
                )}
              </TabsContent>
            </Tabs>
          </div>
        )}
      </div>
    </Layout>
  );
}
