import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Save,
  ArrowLeft,
  Sparkles,
  Crown,
  ShieldCheck,
  Globe,
  Twitter,
  AlertTriangle,
  ShieldAlert,
  AlertCircle,
  CheckCircle2,
  Loader2,
  AtSign,
  Upload,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Layout } from "@/components/layout/Layout";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import {
  fetchMyProfile,
  updateMyProfile,
  checkHandleAvailability,
  checkDisplayNameAvailability,
} from "@/lib/queries";
import { MembershipTier, canEditProfileField } from "@/lib/permissions";
import { checkReservedName, isPlatformAdmin } from "@/lib/reservedNames";

export default function EditProfile() {
  const { user, loading, isAdmin } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isFirstTime = searchParams.get("first_time") === "true";
  const queryClient = useQueryClient();

  const isUserAdmin = isPlatformAdmin(user?.email, isAdmin);
  const minLength = isUserAdmin ? 3 : 8;

  const { data: profile, isLoading } = useQuery({
    queryKey: ["my-profile-edit", user?.id],
    queryFn: () => fetchMyProfile(user!.id),
    enabled: !!user?.id,
  });

  const dbTier = profile?.membership_tier as MembershipTier | undefined;
  const tier: MembershipTier =
    dbTier && dbTier !== "free"
      ? dbTier
      : (profile?.total_sales ?? 0) >= 50
      ? "platinum"
      : (profile?.total_sales ?? 0) >= 5
      ? "pro"
      : dbTier || "free";

  // Initial values are blank
  const [displayName, setDisplayName] = useState("");
  const [handle, setHandle] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [bannerUrl, setBannerUrl] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [twitterHandle, setTwitterHandle] = useState("");

  // Validation and uniqueness states
  const [isCheckingHandle, setIsCheckingHandle] = useState(false);
  const [handleError, setHandleError] = useState<string | null>(null);
  const [isHandleAvailable, setIsHandleAvailable] = useState<boolean | null>(null);

  const [isCheckingDisplayName, setIsCheckingDisplayName] = useState(false);
  const [displayNameError, setDisplayNameError] = useState<string | null>(null);
  const [isDisplayNameAvailable, setIsDisplayNameAvailable] = useState<boolean | null>(null);

  const [hasAttemptedSave, setHasAttemptedSave] = useState(false);
  const [showBanWarningDialog, setShowBanWarningDialog] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Profile picture must be less than 5MB.",
        variant: "destructive",
      });
      return;
    }

    // Validate type
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file (PNG, JPEG, WEBP, or GIF).",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${user!.id}/${fileName}`;

      // Upload file to Supabase storage 'avatars' bucket
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      setAvatarUrl(publicUrl);
      toast({
        title: "Profile picture uploaded",
        description: "Your new profile picture has been uploaded and set. Remember to save changes below.",
      });
    } catch (error: unknown) {
      console.error("Error uploading avatar:", error);
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Failed to upload profile picture. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  // Populate data when fetched
  useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name || "");
      setHandle(profile.handle || "");
      setBio(profile.bio || "");
      setAvatarUrl(profile.avatar_url || "");
      const raw = profile as unknown as Record<string, string | null>;
      setBannerUrl(raw.banner_url || "");
      setWebsiteUrl(raw.website_url || "");
      setTwitterHandle(raw.twitter_handle || "");
    }
  }, [profile]);

  // Debounced check for Username / Handle
  useEffect(() => {
    const clean = handle.trim().toLowerCase();

    if (!clean) {
      setHandleError(`Username is required (${minLength}+ lowercase characters, numbers only).`);
      setIsHandleAvailable(false);
      setIsCheckingHandle(false);
      return;
    }

    if (clean.length < minLength) {
      setHandleError(`Username must be at least ${minLength} characters (currently ${clean.length}/${minLength}).`);
      setIsHandleAvailable(false);
      setIsCheckingHandle(false);
      return;
    }

    if (!/^[a-z0-9]+$/.test(clean)) {
      setHandleError("Username must only contain lowercase letters (a-z) and numbers (0-9) with no spaces or symbols.");
      setIsHandleAvailable(false);
      setIsCheckingHandle(false);
      return;
    }

    // Security check: Reserved administrative/moderator terms
    const reserved = checkReservedName(clean, user?.email, isAdmin);
    if (reserved.isReserved) {
      setHandleError(reserved.reason || "This username is reserved.");
      setIsHandleAvailable(false);
      setIsCheckingHandle(false);
      return;
    }

    // If matches user's current loaded handle, mark valid immediately
    if (profile?.handle && clean === profile.handle.toLowerCase()) {
      setHandleError(null);
      setIsHandleAvailable(true);
      setIsCheckingHandle(false);
      return;
    }

    setIsCheckingHandle(true);
    setHandleError(null);

    const timer = setTimeout(async () => {
      try {
        const res = await checkHandleAvailability(clean, user?.id, user?.email, isAdmin);
        if (res.available) {
          setHandleError(null);
          setIsHandleAvailable(true);
        } else {
          setHandleError(res.error || `Username "${clean}" is already taken by another member.`);
          setIsHandleAvailable(false);
        }
      } catch {
        setHandleError(null);
        setIsHandleAvailable(true);
      } finally {
        setIsCheckingHandle(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [handle, user?.id, user?.email, profile?.handle, isAdmin, minLength]);

  // Debounced check for Display Name
  useEffect(() => {
    const clean = displayName.trim();

    if (!clean) {
      setDisplayNameError(`Display name is required (${minLength}+ characters).`);
      setIsDisplayNameAvailable(false);
      setIsCheckingDisplayName(false);
      return;
    }

    if (clean.length < minLength) {
      setDisplayNameError(`Display name must be at least ${minLength} characters (currently ${clean.length}/${minLength}).`);
      setIsDisplayNameAvailable(false);
      setIsCheckingDisplayName(false);
      return;
    }

    // Security check: Reserved administrative/moderator terms
    const reserved = checkReservedName(clean, user?.email, isAdmin);
    if (reserved.isReserved) {
      setDisplayNameError(reserved.reason || "This display name is reserved.");
      setIsDisplayNameAvailable(false);
      setIsCheckingDisplayName(false);
      return;
    }

    // If matches user's current loaded display name, mark valid immediately
    if (profile?.display_name && clean.toLowerCase() === profile.display_name.toLowerCase()) {
      setDisplayNameError(null);
      setIsDisplayNameAvailable(true);
      setIsCheckingDisplayName(false);
      return;
    }

    setIsCheckingDisplayName(true);
    setDisplayNameError(null);

    const timer = setTimeout(async () => {
      try {
        const res = await checkDisplayNameAvailability(clean, user?.id, user?.email, isAdmin);
        if (res.available) {
          setDisplayNameError(null);
          setIsDisplayNameAvailable(true);
        } else {
          setDisplayNameError(res.error || `Display name "${clean}" is already taken by another member.`);
          setIsDisplayNameAvailable(false);
        }
      } catch {
        setDisplayNameError(null);
        setIsDisplayNameAvailable(true);
      } finally {
        setIsCheckingDisplayName(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [displayName, user?.id, user?.email, profile?.display_name, isAdmin, minLength]);

  // Form validity computations
  const isHandleValid =
    handle.trim().length >= minLength &&
    /^[a-z0-9]+$/.test(handle.trim().toLowerCase()) &&
    !handleError &&
    isHandleAvailable === true &&
    !isCheckingHandle;

  const isDisplayNameValid =
    displayName.trim().length >= minLength &&
    !displayNameError &&
    isDisplayNameAvailable === true &&
    !isCheckingDisplayName;

  // URL format validations
  const isWebsiteUrlValid = !websiteUrl.trim() || /^https?:\/\/.+/i.test(websiteUrl.trim());
  const isBannerUrlValid = !bannerUrl.trim() || /^https?:\/\/.+/i.test(bannerUrl.trim());
  const isAvatarUrlValid = !avatarUrl.trim() || /^(https?:\/\/|data:image\/).+/i.test(avatarUrl.trim());

  const isFormValid =
    isHandleValid &&
    isDisplayNameValid &&
    isWebsiteUrlValid &&
    isBannerUrlValid &&
    isAvatarUrlValid;

  // Build list of active errors to show when user attempts to save
  const missingErrorsList: string[] = [];
  if (!isDisplayNameValid) {
    if (isCheckingDisplayName) {
      missingErrorsList.push("Display Name: Checking availability...");
    } else if (displayNameError) {
      missingErrorsList.push(`Display Name: ${displayNameError}`);
    } else {
      missingErrorsList.push(`Display Name: Must be at least ${minLength} characters and unique.`);
    }
  }
  if (!isHandleValid) {
    if (isCheckingHandle) {
      missingErrorsList.push("Username: Checking availability...");
    } else if (handleError) {
      missingErrorsList.push(`Username: ${handleError}`);
    } else {
      missingErrorsList.push(`Username: Must be at least ${minLength} lowercase alphanumeric characters and unique.`);
    }
  }
  if (!isWebsiteUrlValid) {
    missingErrorsList.push("Website / Portfolio: Invalid URL (must include http:// or https://)");
  }
  if (!isBannerUrlValid) {
    missingErrorsList.push("Cover Banner URL: Invalid URL (must include http:// or https://)");
  }
  if (!isAvatarUrlValid) {
    missingErrorsList.push("Avatar Image URL: Invalid URL (must include http:// or https://)");
  }

  const updateMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Not authenticated");

      const cleanHandle = handle.trim().toLowerCase();
      const cleanDisplayName = displayName.trim();

      // Enforce reserved words before saving
      const handleReserved = checkReservedName(cleanHandle, user.email, isAdmin);
      if (handleReserved.isReserved) {
        throw new Error(handleReserved.reason);
      }
      const displayReserved = checkReservedName(cleanDisplayName, user.email, isAdmin);
      if (displayReserved.isReserved) {
        throw new Error(displayReserved.reason);
      }

      if (!isWebsiteUrlValid) {
        throw new Error("Invalid website URL: must include http:// or https://");
      }
      if (!isBannerUrlValid) {
        throw new Error("Invalid banner URL: must include http:// or https://");
      }
      if (!isAvatarUrlValid) {
        throw new Error("Invalid avatar image URL: must include http:// or https://");
      }

      const payload: Record<string, string | null | undefined | boolean> = {
        display_name: cleanDisplayName,
        handle: cleanHandle,
        bio: bio.trim(),
        avatar_url: avatarUrl.trim() || null,
        is_creator: true,
      };

      if (canEditProfileField(tier, "banner_url")) {
        payload.banner_url = bannerUrl.trim() || null;
      }
      if (canEditProfileField(tier, "website_url")) {
        payload.website_url = websiteUrl.trim() || null;
      }
      if (canEditProfileField(tier, "twitter_handle")) {
        payload.twitter_handle = twitterHandle.trim().replace("@", "") || null;
      }

      await updateMyProfile(user.id, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-profile-edit", user?.id] });
      queryClient.invalidateQueries({ queryKey: ["user-profile-data"] });
      toast({
        title: "Profile saved & active!",
        description: "Your public creator profile is now live and up to date.",
      });
      navigate(`/profile/${handle.trim().toLowerCase() || profile?.handle || ""}`);
    },
    onError: (err: Error) => {
      toast({
        title: "Save failed",
        description: err.message || "Failed to update profile.",
        variant: "destructive",
      });
    },
  });

  const handleSaveClick = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) {
      setHasAttemptedSave(true);
      return;
    }
    setShowBanWarningDialog(true);
  };

  const handleConfirmSave = () => {
    setShowBanWarningDialog(false);
    updateMutation.mutate();
  };

  if (loading || isLoading) {
    return (
      <Layout>
        <div className="container-wide py-16 text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent mb-4" />
          <p className="text-sm text-muted-foreground">Loading profile editor...</p>
        </div>
      </Layout>
    );
  }

  if (!user) {
    navigate("/auth");
    return null;
  }

  const maxBio = tier === "platinum" ? 2500 : tier === "pro" ? 1000 : 280;

  return (
    <Layout>
      <SEO
        title="Edit Profile | Paste Prompts"
        description="Customise your Paste Prompts creator profile and portfolio."
      />

      <div className="container-wide max-w-3xl py-8 sm:py-12">
        {/* Top Breadcrumb */}
        <div className="mb-6 flex items-center justify-between">
          <Button asChild variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
            <Link to={`/profile/${profile?.handle || ""}`}>
              <ArrowLeft className="mr-1.5 h-4 w-4" /> Back to Profile
            </Link>
          </Button>

          <div className="flex items-center gap-2">
            {tier === "platinum" ? (
              <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/40 font-bold">
                <Crown className="mr-1 h-3.5 w-3.5" /> PLATINUM VIP
              </Badge>
            ) : tier === "pro" ? (
              <Badge className="bg-primary/20 text-primary-glow border-primary/40 font-bold">
                <ShieldCheck className="mr-1 h-3.5 w-3.5" /> PRO CREATOR
              </Badge>
            ) : (
              <Badge variant="outline" className="text-muted-foreground border-white/10">
                FREE MEMBER
              </Badge>
            )}
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-card/60 p-6 sm:p-10 shadow-2xl backdrop-blur-xl">
          <div className="mb-8">
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground">
              {isFirstTime ? "Build Your Public Creator Profile" : "Edit Your Profile"}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {isFirstTime
                ? "Welcome to Creator Mode! Customise how your portfolio appears in discovery and build your creator presence."
                : "Customise how you appear across Paste Prompts and in creator discovery."}
            </p>

            {isFirstTime && (
              <div className="mt-4 flex items-start gap-3 rounded-2xl border border-primary/30 bg-primary/10 p-4 text-xs text-primary-glow">
                <Sparkles className="h-5 w-5 shrink-0 text-primary-glow mt-0.5" />
                <div className="space-y-1">
                  <p className="font-semibold text-foreground">Creator Mode is Enabled on your account</p>
                  <p className="text-muted-foreground">
                    Your public creator profile is being set up. Complete the required fields below to publish your profile.
                  </p>
                </div>
              </div>
            )}
          </div>

          <form onSubmit={handleSaveClick} className="space-y-6">
            {/* 1. Avatar Preview & Upload */}
            <div className="flex flex-col sm:flex-row items-start gap-6 border-b border-white/5 pb-6">
              <div className="flex flex-col items-center gap-2">
                <Avatar className="h-20 w-20 rounded-2xl border-2 border-primary/30 shadow-glow relative group overflow-hidden">
                  <AvatarImage src={avatarUrl || undefined} className="object-cover" />
                  <AvatarFallback className="bg-gradient-primary text-xl font-bold text-primary-foreground">
                    {(displayName || handle || "U").slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                  {isUploading && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                      <Loader2 className="h-6 w-6 animate-spin text-primary-glow" />
                    </div>
                  )}
                </Avatar>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Preview</span>
              </div>

              <div className="flex-1 w-full space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-semibold text-foreground">Profile Picture</label>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20">
                    Recommended
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Upload Dropzone / Button */}
                  <div className="flex flex-col justify-center">
                    <label className="relative flex flex-col items-center justify-center h-24 border border-dashed border-white/15 rounded-2xl hover:border-primary/50 hover:bg-white/5 transition-all cursor-pointer group">
                      <input
                        type="file"
                        accept="image/png, image/jpeg, image/gif, image/webp"
                        onChange={handleAvatarUpload}
                        disabled={isUploading}
                        className="sr-only"
                      />
                      <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center px-4">
                        <Upload className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors mb-1.5" />
                        <p className="text-xs font-medium text-foreground">
                          {isUploading ? "Uploading..." : "Upload local image"}
                        </p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">
                          PNG, JPG, WEBP, GIF up to 5MB
                        </p>
                      </div>
                    </label>
                  </div>

                  {/* External URL option */}
                  <div className="flex flex-col justify-center space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-semibold text-muted-foreground">Or link external image URL</span>
                    </div>
                    <div className="relative">
                      <Input
                        value={avatarUrl}
                        onChange={(e) => setAvatarUrl(e.target.value)}
                        placeholder="e.g. https://images.unsplash.com/..."
                        className={`bg-card/85 transition-colors text-xs sm:text-sm h-10 rounded-xl pr-8 ${
                          !isAvatarUrlValid
                            ? "border-red-500/60 focus-visible:ring-red-500 text-red-200"
                            : "border-white/10 focus-visible:ring-primary"
                        }`}
                      />
                      {!isAvatarUrlValid && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center">
                          <AlertCircle className="h-4 w-4 text-red-400" />
                        </div>
                      )}
                    </div>
                    {!isAvatarUrlValid ? (
                      <p className="text-[11px] text-red-400 font-medium flex items-center gap-1">
                        <AlertCircle className="h-3 w-3 shrink-0" /> Invalid URL: must include http:// or https://
                      </p>
                    ) : (
                      <p className="text-[10px] text-muted-foreground leading-normal">
                        Useful if you host your avatar elsewhere or use Gravatar.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Display Name & Username / Handle (Both REQUIRED) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Display Name (Required) */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-foreground">Display Name</label>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-amber-400 bg-amber-500/15 px-2 py-0.5 rounded-full border border-amber-500/30">
                    Required
                  </span>
                </div>
                <div className="relative">
                  <Input
                    value={displayName}
                    onChange={(e) => {
                      setDisplayName(e.target.value);
                      if (hasAttemptedSave) setHasAttemptedSave(false);
                    }}
                    placeholder={isUserAdmin ? "e.g. ADMIN" : "e.g. Alex Vance (8+ chars)"}
                    className={`bg-card/80 pr-9 transition-colors ${
                      (hasAttemptedSave || displayName.length > 0) && !isDisplayNameValid && !isCheckingDisplayName
                        ? "border-red-500/60 focus-visible:ring-red-500"
                        : isDisplayNameValid
                        ? "border-emerald-500/40 focus-visible:ring-emerald-500"
                        : "border-white/10"
                    }`}
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center">
                    {isCheckingDisplayName && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
                    {!isCheckingDisplayName && isDisplayNameValid && (
                      <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    )}
                    {!isCheckingDisplayName && (hasAttemptedSave || displayName.length > 0) && !isDisplayNameValid && (
                      <AlertCircle className="h-4 w-4 text-red-400" />
                    )}
                  </div>
                </div>

                {/* Display Name Helper / Error */}
                {isCheckingDisplayName ? (
                  <p className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                    <Loader2 className="h-3 w-3 animate-spin" /> Checking display name availability...
                  </p>
                ) : displayNameError && (hasAttemptedSave || displayName.length > 0) ? (
                  <p className="text-[11px] text-red-400 font-medium flex items-center gap-1">
                    <AlertCircle className="h-3 w-3 shrink-0" /> {displayNameError}
                  </p>
                ) : isDisplayNameValid ? (
                  <p className="text-[11px] text-emerald-400 font-medium flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3 shrink-0" /> Display name is available
                  </p>
                ) : (
                  <p className="text-[11px] text-muted-foreground">
                    {minLength}+ characters, not case sensitive. Must be unique among members.
                  </p>
                )}
              </div>

              {/* Username / Handle (Required) */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-foreground">Username / Handle</label>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-amber-400 bg-amber-500/15 px-2 py-0.5 rounded-full border border-amber-500/30">
                    Required
                  </span>
                </div>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    <AtSign className="h-3.5 w-3.5" />
                  </div>
                  <Input
                    value={handle}
                    onChange={(e) => {
                      // Enforce lowercase letters and numbers
                      const sanitized = e.target.value.toLowerCase().replace(/[^a-z0-9]/g, "");
                      setHandle(sanitized);
                      if (hasAttemptedSave) setHasAttemptedSave(false);
                    }}
                    placeholder={isUserAdmin ? "admin" : "username (8+ chars)"}
                    className={`pl-8 pr-9 bg-card/80 font-mono text-xs sm:text-sm transition-colors ${
                      (hasAttemptedSave || handle.length > 0) && !isHandleValid && !isCheckingHandle
                        ? "border-red-500/60 focus-visible:ring-red-500"
                        : isHandleValid
                        ? "border-emerald-500/40 focus-visible:ring-emerald-500"
                        : "border-white/10"
                    }`}
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center">
                    {isCheckingHandle && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
                    {!isCheckingHandle && isHandleValid && (
                      <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    )}
                    {!isCheckingHandle && (hasAttemptedSave || handle.length > 0) && !isHandleValid && (
                      <AlertCircle className="h-4 w-4 text-red-400" />
                    )}
                  </div>
                </div>

                {/* Username Helper / Error */}
                {isCheckingHandle ? (
                  <p className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                    <Loader2 className="h-3 w-3 animate-spin" /> Checking username availability...
                  </p>
                ) : handleError && (hasAttemptedSave || handle.length > 0) ? (
                  <p className="text-[11px] text-red-400 font-medium flex items-center gap-1">
                    <AlertCircle className="h-3 w-3 shrink-0" /> {handleError}
                  </p>
                ) : isHandleValid ? (
                  <p className="text-[11px] text-emerald-400 font-medium flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3 shrink-0" /> Username is available
                  </p>
                ) : (
                  <p className="text-[11px] text-muted-foreground">
                    {minLength}+ characters, lowercase letters and numbers only.
                  </p>
                )}
              </div>
            </div>

            {/* Note that Display Name & Username can match */}
            <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3 text-[11px] text-muted-foreground flex items-center gap-2">
              <Sparkles className="h-3.5 w-3.5 text-primary-glow shrink-0" />
              <span>
                Tip: Your <strong>Username</strong> and <strong>Display Name</strong> can be the same value if you prefer.
              </span>
            </div>

            {/* 3. Bio (Optional) */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <label className="text-xs font-semibold text-foreground">Short Bio</label>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground bg-white/5 px-2 py-0.5 rounded-full border border-white/10">
                    Optional
                  </span>
                </div>
                <span className="text-[10px] text-muted-foreground">
                  {bio.length} / {maxBio} chars
                </span>
              </div>
              <Textarea
                value={bio}
                onChange={(e) => setBio(e.target.value.slice(0, maxBio))}
                placeholder="Introduce your prompt engineering style, target AI models, and domains of expertise..."
                className="bg-card/80 border-white/10 min-h-[100px] text-sm"
              />
            </div>

            {/* 4. Pro & Platinum Exclusive Fields (Optional) */}
            {canEditProfileField(tier, "banner_url") && (
              <div className="space-y-1.5 border-t border-white/5 pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <label className="text-xs font-semibold text-foreground">
                      Cover Banner Image URL
                    </label>
                    <Badge className="bg-primary/20 text-primary-glow text-[10px] py-0">PRO</Badge>
                  </div>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground bg-white/5 px-2 py-0.5 rounded-full border border-white/10">
                    Optional
                  </span>
                </div>
                <div className="relative">
                  <Input
                    value={bannerUrl}
                    onChange={(e) => setBannerUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/... or banner link"
                    className={`bg-card/80 transition-colors text-xs sm:text-sm ${
                      !isBannerUrlValid
                        ? "border-red-500/60 focus-visible:ring-red-500 text-red-200 pr-9"
                        : "border-white/10"
                    }`}
                  />
                  {!isBannerUrlValid && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center">
                      <AlertCircle className="h-4 w-4 text-red-400" />
                    </div>
                  )}
                </div>
                {!isBannerUrlValid ? (
                  <p className="text-[11px] text-red-400 font-medium flex items-center gap-1">
                    <AlertCircle className="h-3 w-3 shrink-0" /> Invalid URL: must include http:// or https://
                  </p>
                ) : (
                  <p className="text-[10px] text-muted-foreground">
                    Direct image link for your wide profile banner header. Must begin with http:// or https://
                  </p>
                )}
              </div>
            )}

            {canEditProfileField(tier, "website_url") && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-white/5 pt-6">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <label className="text-xs font-semibold text-foreground">Website / Portfolio</label>
                      <Badge className="bg-primary/20 text-primary-glow text-[10px] py-0">PRO</Badge>
                    </div>
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground bg-white/5 px-2 py-0.5 rounded-full border border-white/10">
                      Optional
                    </span>
                  </div>
                  <div className="relative">
                    <Globe className={`absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 ${!isWebsiteUrlValid ? "text-red-400" : "text-muted-foreground"}`} />
                    <Input
                      value={websiteUrl}
                      onChange={(e) => setWebsiteUrl(e.target.value)}
                      placeholder="https://yourportfolio.com"
                      className={`pl-9 bg-card/80 transition-colors text-xs sm:text-sm ${
                        !isWebsiteUrlValid
                          ? "border-red-500/60 focus-visible:ring-red-500 text-red-200 pr-9"
                          : "border-white/10"
                      }`}
                    />
                    {!isWebsiteUrlValid && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center">
                        <AlertCircle className="h-4 w-4 text-red-400" />
                      </div>
                    )}
                  </div>
                  {!isWebsiteUrlValid ? (
                    <div className="flex items-center justify-between text-[11px] text-red-400 font-medium">
                      <span className="flex items-center gap-1">
                        <AlertCircle className="h-3 w-3 shrink-0" /> Invalid URL: must include http:// or https://
                      </span>
                      {websiteUrl.trim() && !/^https?:\/\//i.test(websiteUrl.trim()) && (
                        <button
                          type="button"
                          onClick={() => setWebsiteUrl(`https://${websiteUrl.trim()}`)}
                          className="text-[10px] text-primary-glow hover:underline ml-2 cursor-pointer font-semibold"
                        >
                          Auto-fix (+https://)
                        </button>
                      )}
                    </div>
                  ) : (
                    <p className="text-[10px] text-muted-foreground">
                      Direct link to your website or portfolio. Must begin with http:// or https://
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <label className="text-xs font-semibold text-foreground">Twitter / X Handle</label>
                      <Badge className="bg-primary/20 text-primary-glow text-[10px] py-0">PRO</Badge>
                    </div>
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground bg-white/5 px-2 py-0.5 rounded-full border border-white/10">
                      Optional
                    </span>
                  </div>
                  <div className="relative">
                    <Twitter className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                    <Input
                      value={twitterHandle}
                      onChange={(e) => setTwitterHandle(e.target.value)}
                      placeholder="username (without @)"
                      className="pl-9 bg-card/80 border-white/10 text-xs sm:text-sm"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Upgrade Teaser Card for Free Members */}
            {tier === "free" && (
              <div className="rounded-2xl border border-primary/20 bg-gradient-to-r from-primary/10 via-card to-background p-5">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="h-4 w-4 text-primary-glow" />
                  <h4 className="text-sm font-bold text-foreground">
                    Unlock Custom Banners &amp; Social Links with Pro
                  </h4>
                </div>
                <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
                  Pro members can add high-resolution profile cover banners, external portfolios, verified Twitter/X links, and 1,000-character expanded biographies.
                </p>
                <Button
                  asChild
                  size="sm"
                  variant="outline"
                  className="border-primary/40 text-primary-glow hover:bg-primary/10 text-xs"
                >
                  <Link to="/pro">Learn About Pro</Link>
                </Button>
              </div>
            )}

            {/* Community Standards & Safety Callout */}
            <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4 flex items-start gap-3 text-xs text-amber-300/90 leading-relaxed">
              <ShieldAlert className="h-5 w-5 shrink-0 text-amber-400 mt-0.5" />
              <div>
                <p className="font-semibold text-amber-300 mb-0.5">Public Creator Safety &amp; Policy Notice</p>
                <p className="text-muted-foreground text-[11px]">
                  All public information (display name, bio, avatars, links) must comply with our community guidelines. Offensive language, spam, impersonation, or unacceptable content can result in an immediate account ban.
                </p>
              </div>
            </div>

            {/* Red Validation Warning when user clicks save or tries to submit without fulfilling required fields */}
            {hasAttemptedSave && !isFormValid && (
              <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4 sm:p-5 text-red-300 space-y-2.5 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="flex items-center gap-2 font-bold text-red-400 text-sm">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>Cannot Save Profile — Please complete all required fields:</span>
                </div>
                <ul className="list-disc list-inside space-y-1.5 text-xs text-red-200/95 pl-1 leading-relaxed">
                  {missingErrorsList.map((err, idx) => (
                    <li key={idx} className="font-semibold">
                      {err}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Save Button */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4 border-t border-white/5">
              <div className="text-xs text-muted-foreground">
                {!isFormValid ? (
                  <span className="text-amber-400/90 flex items-center gap-1.5 font-medium">
                    <AlertCircle className="h-3.5 w-3.5 shrink-0 text-amber-400" />
                    Complete all required fields to enable saving.
                  </span>
                ) : (
                  <span className="text-emerald-400 flex items-center gap-1.5 font-medium">
                    <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-400" />
                    All required fields valid and ready to publish.
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => navigate(`/profile/${profile?.handle || ""}`)}
                >
                  Cancel
                </Button>

                {/* Save button: Greyed out if not all required fields are filled and valid, but clickable so it triggers red error guidance */}
                <Button
                  type="submit"
                  disabled={updateMutation.isPending}
                  className={`font-semibold transition-all ${
                    !isFormValid
                      ? "bg-white/10 text-muted-foreground hover:bg-white/15 opacity-50 cursor-not-allowed border border-white/10 shadow-none"
                      : "bg-gradient-primary btn-glow text-white shadow-glow"
                  }`}
                >
                  <Save className="mr-1.5 h-4 w-4" />
                  {updateMutation.isPending ? "Saving..." : isFirstTime ? "Save & Activate Profile" : "Save Changes"}
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Confirmation & Ban Reminder Dialog on Save */}
      <Dialog open={showBanWarningDialog} onOpenChange={setShowBanWarningDialog}>
        <DialogContent className="border-white/10 glass-strong shadow-2xl p-6 sm:p-7 rounded-3xl sm:max-w-md">
          <DialogHeader className="text-left space-y-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/20 border border-amber-500/30 text-amber-400">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <div>
              <DialogTitle className="font-display text-xl font-bold text-foreground">
                Confirm Profile Update
              </DialogTitle>
              <DialogDescription className="text-xs sm:text-sm text-muted-foreground mt-2 leading-relaxed">
                Please make sure all information you have entered is accurate and appropriate.
              </DialogDescription>
            </div>
          </DialogHeader>

          <div className="my-2 rounded-2xl border border-red-500/25 bg-red-500/10 p-4 text-xs text-red-200/90 leading-relaxed space-y-1.5">
            <p className="font-semibold text-red-300 flex items-center gap-1.5">
              <ShieldAlert className="h-4 w-4 text-red-400 shrink-0" /> Important Community Policy Reminder
            </p>
            <p>
              Any <strong className="text-white font-bold">unacceptable, offensive, or malicious information</strong> you add to your public profile could result in an <strong className="text-white font-bold underline decoration-red-400">instant ban</strong> of your account.
            </p>
          </div>

          <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowBanWarningDialog(false)}
              className="border-white/10 text-muted-foreground hover:text-foreground"
            >
              Review Information
            </Button>
            <Button
              type="button"
              onClick={handleConfirmSave}
              className="bg-gradient-primary btn-glow font-semibold"
            >
              I Understand, Publish Profile
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
