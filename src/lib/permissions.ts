export type MembershipTier = "guest" | "free" | "pro" | "platinum";

export interface ProfilePermissions {
  canCustomBanner: boolean;
  canAddSocialLinks: boolean;
  canAddSkills: boolean;
  canAddCategories: boolean;
  canFeaturePrompts: boolean;
  canViewAdvancedStats: boolean;
  canViewSalesMetrics: boolean;
  canCreateSocialPosts: boolean;
  canHaveVerifiedBadge: boolean;
  canHavePlatinumBadge: boolean;
  maxBioLength: number;
  maxFeaturedPrompts: number;
  canCustomHighlightColor: boolean;
  canPinPosts: boolean;
}

export const TIER_PERMISSIONS: Record<MembershipTier, ProfilePermissions> = {
  guest: {
    canCustomBanner: false,
    canAddSocialLinks: false,
    canAddSkills: false,
    canAddCategories: false,
    canFeaturePrompts: false,
    canViewAdvancedStats: false,
    canViewSalesMetrics: false,
    canCreateSocialPosts: false,
    canHaveVerifiedBadge: false,
    canHavePlatinumBadge: false,
    maxBioLength: 160,
    maxFeaturedPrompts: 0,
    canCustomHighlightColor: false,
    canPinPosts: false,
  },
  free: {
    canCustomBanner: false,
    canAddSocialLinks: false,
    canAddSkills: true,
    canAddCategories: true,
    canFeaturePrompts: false,
    canViewAdvancedStats: false,
    canViewSalesMetrics: false,
    canCreateSocialPosts: true,
    canHaveVerifiedBadge: false,
    canHavePlatinumBadge: false,
    maxBioLength: 280,
    maxFeaturedPrompts: 0,
    canCustomHighlightColor: false,
    canPinPosts: false,
  },
  pro: {
    canCustomBanner: true,
    canAddSocialLinks: true,
    canAddSkills: true,
    canAddCategories: true,
    canFeaturePrompts: true,
    canViewAdvancedStats: true,
    canViewSalesMetrics: true,
    canCreateSocialPosts: true,
    canHaveVerifiedBadge: true,
    canHavePlatinumBadge: false,
    maxBioLength: 1000,
    maxFeaturedPrompts: 3,
    canCustomHighlightColor: true,
    canPinPosts: true,
  },
  platinum: {
    canCustomBanner: true,
    canAddSocialLinks: true,
    canAddSkills: true,
    canAddCategories: true,
    canFeaturePrompts: true,
    canViewAdvancedStats: true,
    canViewSalesMetrics: true,
    canCreateSocialPosts: true,
    canHaveVerifiedBadge: true,
    canHavePlatinumBadge: true,
    maxBioLength: 2500,
    maxFeaturedPrompts: 6,
    canCustomHighlightColor: true,
    canPinPosts: true,
  },
};

export function hasEntitlement(
  tier: MembershipTier | null | undefined,
  entitlement: keyof ProfilePermissions
): boolean {
  const currentTier: MembershipTier = tier || "guest";
  return !!TIER_PERMISSIONS[currentTier]?.[entitlement];
}

export function canEditProfileField(
  tier: MembershipTier | null | undefined,
  field: string
): boolean {
  const currentTier: MembershipTier = tier || "free";
  switch (field) {
    case "banner_url":
      return hasEntitlement(currentTier, "canCustomBanner");
    case "website_url":
    case "twitter_handle":
    case "social_links":
    case "github_handle":
    case "linkedin_handle":
      return hasEntitlement(currentTier, "canAddSocialLinks");
    case "skills":
      return hasEntitlement(currentTier, "canAddSkills");
    case "categories":
      return hasEntitlement(currentTier, "canAddCategories");
    case "featured_prompt_ids":
      return hasEntitlement(currentTier, "canFeaturePrompts");
    case "custom_color":
      return hasEntitlement(currentTier, "canCustomHighlightColor");
    case "display_name":
    case "avatar_url":
    case "bio":
    case "location":
      return true;
    default:
      return false;
  }
}

export function sanitizeProfileForViewer(
  profile: Record<string, unknown> | null,
  viewerTier: MembershipTier
): Record<string, unknown> | null {
  if (!profile) return null;

  const targetTier: MembershipTier = (profile.membership_tier as MembershipTier) || "free";

  if (viewerTier === "guest") {
    return {
      id: profile.id,
      handle: profile.handle,
      display_name: profile.display_name,
      avatar_url: profile.avatar_url,
      bio: typeof profile.bio === "string" ? profile.bio.slice(0, 100) + "..." : null,
      membership_tier: targetTier,
      is_creator: profile.is_creator,
      created_at: profile.created_at,
      prompts_count: profile.prompts_count || 0,
      followers_count: profile.followers_count || 0,
      is_restricted: true,
    };
  }

  // Free member viewing
  if (viewerTier === "free") {
    return {
      ...profile,
      banner_url: hasEntitlement(targetTier, "canCustomBanner") ? profile.banner_url : null,
      sales_metrics: null,
      detailed_analytics: null,
      is_restricted: false,
    };
  }

  // Pro or Platinum viewer
  return {
    ...profile,
    is_restricted: false,
  };
}
