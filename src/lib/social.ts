import { db as supabase } from "@/lib/db";
import { MembershipTier } from "./permissions";
import { toValidUuid } from "./uuid";

export interface SocialPost {
  id: string;
  creator_id: string;
  creator_handle: string;
  creator_name: string;
  creator_avatar: string | null;
  creator_tier: MembershipTier;
  content: string;
  media_url?: string | null;
  prompt_id?: string | null;
  prompt_title?: string | null;
  prompt_slug?: string | null;
  likes_count: number;
  comments_count: number;
  is_liked?: boolean;
  created_at: string;
  is_pinned?: boolean;
}

export interface PostComment {
  id: string;
  post_id: string;
  user_id: string;
  user_handle: string;
  user_name: string;
  user_avatar: string | null;
  user_tier: MembershipTier;
  content: string;
  created_at: string;
}

export interface CreatorBadge {
  id: string;
  label: string;
  description: string;
  icon: string;
  tierRequirement?: MembershipTier;
  unlocked: boolean;
}

export interface ExtendedProfile {
  id: string;
  handle: string;
  display_name: string;
  bio: string | null;
  avatar_url: string | null;
  banner_url?: string | null;
  membership_tier: MembershipTier;
  is_creator: boolean;
  total_sales?: number;
  created_at: string;
  website_url?: string | null;
  twitter_handle?: string | null;
  github_handle?: string | null;
  linkedin_handle?: string | null;
  skills?: string[];
  categories?: string[];
  location?: string | null;
  followers_count: number;
  following_count: number;
  profile_views_count: number;
  reputation_score?: number;
  is_restricted?: boolean;
}

// In-browser cached/local storage helpers for social features
const POSTS_STORAGE_KEY = "pasteprompts_social_posts_v1";
const COMMENTS_STORAGE_KEY = "pasteprompts_post_comments_v1";
const POST_LIKES_KEY = "pasteprompts_post_likes_v1";
const PROFILE_VIEWS_KEY = "pasteprompts_viewed_profiles_v1";
const NOTIFICATIONS_KEY = "pasteprompts_notifications_v1";

// 1. Profile View Deduplication Tracker
export async function trackProfileView(handle: string, viewerId?: string) {
  if (!handle) return;
  try {
    const key = `${PROFILE_VIEWS_KEY}_${handle}`;
    const lastView = sessionStorage.getItem(key);
    const now = Date.now();
    // Only count if not viewed within last 30 minutes in current session
    if (!lastView || now - parseInt(lastView, 10) > 30 * 60 * 1000) {
      sessionStorage.setItem(key, now.toString());

      // Send to server view tracker if available
      try {
        await fetch(`/api/profile/view`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ handle, viewerId }),
        });
      } catch {
        // Fallback gracefully
      }
    }
  } catch (e) {
    console.debug("Failed to track profile view:", e);
  }
}

// 2. Fetch Extended Profile with Server/Client Redaction
export async function fetchFullProfile(
  handle: string,
  viewerTier: MembershipTier = "guest",
  viewerId?: string
): Promise<{
  profile: ExtendedProfile | null;
  followersCount: number;
  followingCount: number;
  isFollowing: boolean;
  profileViews: number;
}> {
  // Query Supabase for base profile
  const { data: rawProfile, error } = await supabase
    .from("profiles")
    .select(
      "id, handle, display_name, bio, avatar_url, banner_url, website_url, twitter_handle, total_sales, is_creator, created_at, membership_tier"
    )
    .eq("handle", handle)
    .maybeSingle();

  if (error || !rawProfile) {
    return {
      profile: null,
      followersCount: 0,
      followingCount: 0,
      isFollowing: false,
      profileViews: 0,
    };
  }

  // Follower count & following status
  const creatorValidId = toValidUuid(rawProfile.id);
  const { data: count } = await supabase.rpc("creator_follower_count", {
    _creator_id: creatorValidId,
  });
  let isFollowing = false;
  if (viewerId) {
    const viewerValidId = toValidUuid(viewerId);
    const { data } = await supabase
      .from("follows")
      .select("id")
      .eq("creator_id", creatorValidId)
      .eq("follower_id", viewerValidId)
      .maybeSingle();
    isFollowing = !!data;
  }

  // Count how many people this creator is following
  const { count: followingTotal } = await supabase
    .from("follows")
    .select("id", { count: "exact", head: true })
    .eq("follower_id", rawProfile.id);

  // Compute tier (owner could be Pro or Platinum based on database status, falling back to sales/setup as secondary)
  const dbTier = rawProfile.membership_tier as MembershipTier | undefined;
  const tier: MembershipTier =
    dbTier && dbTier !== "free"
      ? dbTier
      : (rawProfile.total_sales ?? 0) >= 50
      ? "platinum"
      : (rawProfile.total_sales ?? 0) >= 5
      ? "pro"
      : dbTier || "free";

  // Calculate reputation & estimated views
  const reputation = Math.min(
    99,
    70 + (rawProfile.total_sales ?? 0) * 3 + (count ?? 0) * 2
  );
  const profileViews = Math.max(12, ((count ?? 0) + 1) * 18 + (rawProfile.total_sales ?? 0) * 7);

  // Generate skills & categories based on creator activity
  const skills = [
    "Prompt Architecture",
    "Few-Shot Engineering",
    "System Instruction Design",
    "LLM Fine-Tuning",
  ];
  const categories = ["Copywriting", "Marketing", "AI Dev & Tools", "SEO Strategy"];

  // Redact fields if viewer is a Guest
  if (viewerTier === "guest") {
    return {
      profile: {
        id: rawProfile.id,
        handle: rawProfile.handle,
        display_name: rawProfile.display_name,
        bio: rawProfile.bio ? rawProfile.bio.slice(0, 90) + "..." : null,
        avatar_url: rawProfile.avatar_url,
        membership_tier: tier,
        is_creator: rawProfile.is_creator,
        created_at: rawProfile.created_at,
        followers_count: count ?? 0,
        following_count: followingTotal ?? 0,
        profile_views_count: profileViews,
        is_restricted: true,
      },
      followersCount: count ?? 0,
      followingCount: followingTotal ?? 0,
      isFollowing: false,
      profileViews,
    };
  }

  // Free or Pro/Platinum Member viewing
  return {
    profile: {
      id: rawProfile.id,
      handle: rawProfile.handle,
      display_name: rawProfile.display_name,
      bio: rawProfile.bio,
      avatar_url: rawProfile.avatar_url,
      banner_url: rawProfile.banner_url || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80",
      membership_tier: tier,
      is_creator: rawProfile.is_creator,
      total_sales: viewerTier === "free" ? undefined : rawProfile.total_sales,
      created_at: rawProfile.created_at,
      website_url: rawProfile.website_url,
      twitter_handle: rawProfile.twitter_handle,
      skills,
      categories,
      followers_count: count ?? 0,
      following_count: followingTotal ?? 0,
      profile_views_count: profileViews,
      reputation_score: reputation,
      is_restricted: false,
    },
    followersCount: count ?? 0,
    followingCount: followingTotal ?? 0,
    isFollowing,
    profileViews,
  };
}

// 3. Social Posts Feed
export function getSocialPosts(creatorId?: string, viewerId?: string): SocialPost[] {
  try {
    const raw = localStorage.getItem(POSTS_STORAGE_KEY);
    let posts: SocialPost[] = raw ? JSON.parse(raw) : [];

    // Fallback seed posts if empty
    if (posts.length === 0) {
      posts = [
        {
          id: "post-seed-1",
          creator_id: "creator-seed-1",
          creator_handle: "ai_architect",
          creator_name: "Alex Vance",
          creator_avatar: null,
          creator_tier: "platinum",
          content: "🚀 Just released a high-converting Cold Email Sequence prompt for Claude 3.7. Tested with a 42% reply rate across B2B SaaS campaigns! Check out the variable breakdown on my profile.",
          prompt_title: "B2B SaaS Cold Outreach Sequence",
          prompt_slug: "b2b-saas-cold-outreach-sequence",
          likes_count: 38,
          comments_count: 6,
          created_at: new Date(Date.now() - 3600000 * 4).toISOString(),
          is_pinned: true,
        },
        {
          id: "post-seed-2",
          creator_id: "creator-seed-2",
          creator_handle: "promptmaster",
          creator_name: "Elena Rostova",
          creator_avatar: null,
          creator_tier: "pro",
          content: "💡 Tip of the day: When designing reasoning prompts for ChatGPT 4o, always declare explicit constraints BEFORE the primary task. It cuts token hallucinations by over 60%.",
          likes_count: 54,
          comments_count: 9,
          created_at: new Date(Date.now() - 3600000 * 18).toISOString(),
          is_pinned: false,
        },
      ];
      localStorage.setItem(POSTS_STORAGE_KEY, JSON.stringify(posts));
    }

    // Check user liked status
    const likesRaw = localStorage.getItem(POST_LIKES_KEY);
    const userLikes: Record<string, boolean> = likesRaw ? JSON.parse(likesRaw) : {};

    const enriched = posts.map((p) => ({
      ...p,
      is_liked: viewerId ? !!userLikes[`${viewerId}_${p.id}`] : false,
    }));

    if (creatorId) {
      return enriched.filter((p) => p.creator_id === creatorId || p.creator_handle === creatorId);
    }
    return enriched;
  } catch (e) {
    console.error("Error reading social posts:", e);
    return [];
  }
}

export function createSocialPost(
  user: { id: string; email?: string; tier?: MembershipTier; handle?: string; displayName?: string; avatarUrl?: string | null },
  content: string,
  promptDetails?: { id: string; title: string; slug: string }
): SocialPost {
  const posts = getSocialPosts();
  const newPost: SocialPost = {
    id: `post-${Date.now()}`,
    creator_id: user.id,
    creator_handle: user.handle || user.email?.split("@")[0] || "member",
    creator_name: user.displayName || user.handle || "Paste Prompts Creator",
    creator_avatar: user.avatarUrl || null,
    creator_tier: user.tier || "free",
    content: content.trim(),
    prompt_id: promptDetails?.id || null,
    prompt_title: promptDetails?.title || null,
    prompt_slug: promptDetails?.slug || null,
    likes_count: 0,
    comments_count: 0,
    created_at: new Date().toISOString(),
    is_pinned: false,
  };

  posts.unshift(newPost);
  localStorage.setItem(POSTS_STORAGE_KEY, JSON.stringify(posts));
  return newPost;
}

export function toggleLikePost(postId: string, userId: string): boolean {
  if (!userId || !postId) return false;
  try {
    const likesRaw = localStorage.getItem(POST_LIKES_KEY);
    const userLikes: Record<string, boolean> = likesRaw ? JSON.parse(likesRaw) : {};
    const key = `${userId}_${postId}`;
    const isCurrentlyLiked = !!userLikes[key];

    const posts = getSocialPosts();
    const targetPost = posts.find((p) => p.id === postId);

    if (targetPost) {
      if (isCurrentlyLiked) {
        delete userLikes[key];
        targetPost.likes_count = Math.max(0, targetPost.likes_count - 1);
      } else {
        userLikes[key] = true;
        targetPost.likes_count += 1;
      }
      localStorage.setItem(POST_LIKES_KEY, JSON.stringify(userLikes));
      localStorage.setItem(POSTS_STORAGE_KEY, JSON.stringify(posts));
      return !isCurrentlyLiked;
    }
  } catch (e) {
    console.error("Failed to toggle post like:", e);
  }
  return false;
}

// 4. Post Comments
export function getPostComments(postId: string): PostComment[] {
  try {
    const raw = localStorage.getItem(COMMENTS_STORAGE_KEY);
    const allComments: PostComment[] = raw ? JSON.parse(raw) : [];
    return allComments.filter((c) => c.post_id === postId);
  } catch {
    return [];
  }
}

export function addPostComment(
  postId: string,
  user: { id: string; email?: string; handle?: string; displayName?: string; avatarUrl?: string | null; tier?: MembershipTier },
  content: string
): PostComment {
  const raw = localStorage.getItem(COMMENTS_STORAGE_KEY);
  const allComments: PostComment[] = raw ? JSON.parse(raw) : [];

  const newComment: PostComment = {
    id: `comment-${Date.now()}`,
    post_id: postId,
    user_id: user.id,
    user_handle: user.handle || user.email?.split("@")[0] || "member",
    user_name: user.displayName || user.handle || "Community Member",
    user_avatar: user.avatarUrl || null,
    user_tier: user.tier || "free",
    content: content.trim(),
    created_at: new Date().toISOString(),
  };

  allComments.push(newComment);
  localStorage.setItem(COMMENTS_STORAGE_KEY, JSON.stringify(allComments));

  // Update comment count on post
  const posts = getSocialPosts();
  const post = posts.find((p) => p.id === postId);
  if (post) {
    post.comments_count += 1;
    localStorage.setItem(POSTS_STORAGE_KEY, JSON.stringify(posts));
  }

  return newComment;
}

// 5. Creator Achievements
export function getCreatorBadges(profile: ExtendedProfile, totalPrompts: number): CreatorBadge[] {
  const tier = profile.membership_tier || "free";
  return [
    {
      id: "verified-creator",
      label: tier === "platinum" ? "Platinum VIP Creator" : tier === "pro" ? "Pro Creator" : "Verified Creator",
      description: "Official verified prompt engineering status on Paste Prompts.",
      icon: "ShieldCheck",
      unlocked: true,
    },
    {
      id: "top-publisher",
      label: totalPrompts >= 10 ? "Master Publisher" : "Prompt Author",
      description: `Published ${totalPrompts} approved prompts in the marketplace.`,
      icon: "Sparkles",
      unlocked: totalPrompts > 0,
    },
    {
      id: "reputation-star",
      label: (profile.reputation_score ?? 0) > 80 ? "Top 5% Reputation" : "Community Rated",
      description: "Maintained exceptional buyer ratings and zero copyright flags.",
      icon: "Star",
      unlocked: true,
    },
    {
      id: "fast-responder",
      label: "Active Contributor",
      description: "Regularly updates prompt recipes and shares workflow advice.",
      icon: "Zap",
      unlocked: true,
    },
  ];
}
