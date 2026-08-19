import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Layout } from "@/components/layout/Layout";
import { SEO } from "@/components/SEO";
import { PromptGrid } from "@/components/PromptGrid";
import { FollowButton } from "@/components/FollowButton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ShoppingBag, FileText, Globe, Twitter, MessageSquare } from "lucide-react";
import { fetchCreatorByHandle, fetchCreatorPrompts, fetchFollowState } from "@/lib/queries";
import { formatCount } from "@/lib/format";
import { safeExternalUrl } from "@/lib/utils";


const SITE_URL = "https://pasteprompts.co.uk";

export default function Creator() {
  const navigate = useNavigate();
  const { handle = "" } = useParams();
  const { data: creator, isLoading } = useQuery({
    queryKey: ["creator", handle],
    queryFn: () => fetchCreatorByHandle(handle),
  });
  const { data: prompts } = useQuery({
    queryKey: ["creator-prompts", creator?.id],
    queryFn: () => fetchCreatorPrompts(creator!.id),
    enabled: !!creator?.id,
  });
  const { data: followState } = useQuery({
    queryKey: ["follow-state", creator?.id, "seo"],
    queryFn: () => fetchFollowState(creator!.id),
    enabled: !!creator?.id,
  });


  if (!isLoading && !creator) {
    return (
      <Layout>
        <div className="container-wide py-24 text-center text-muted-foreground">Creator not found.</div>
      </Layout>
    );
  }

  return (
    <Layout>
      {creator && (
        <SEO
          title={`${creator.display_name} (@${creator.handle})`}
          description={creator.bio ?? `Browse AI prompts from ${creator.display_name} on Paste Prompts.`}
          canonical={`/creators/${creator.handle}`}
          type="profile"
          image={creator.avatar_url ?? undefined}
          jsonLd={{
            "@context": "https://schema.org",
            "@type": "Person",
            name: creator.display_name,
            alternateName: `@${creator.handle}`,
            description: creator.bio ?? undefined,
            image: creator.avatar_url ?? undefined,
            url: `${SITE_URL}/creators/${creator.handle}`,
            interactionStatistic: {
              "@type": "InteractionCounter",
              interactionType: "https://schema.org/FollowAction",
              userInteractionCount: followState?.followers ?? 0,
            },
          }}

        />
      )}
      <div className="container-wide py-10">
        <div className="mb-10 flex flex-col items-center gap-5 rounded-3xl glass-strong p-10 text-center sm:flex-row sm:text-left">
          <Avatar className="h-24 w-24 border-2 border-white/10">
            <AvatarImage src={creator?.avatar_url ?? undefined} alt={creator?.display_name ? `${creator.display_name} profile picture` : "Creator profile picture"} />
            <AvatarFallback className="bg-gradient-primary text-2xl text-primary-foreground">
              {(creator?.display_name ?? "?").slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h1 className="font-display text-3xl font-bold">{creator?.display_name}</h1>
            <p className="text-primary-glow">@{creator?.handle}</p>
            {creator?.bio && <p className="mt-3 max-w-xl text-muted-foreground">{creator.bio}</p>}
            <div className="mt-4 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground sm:justify-start">
              <span className="flex items-center gap-1.5"><FileText className="h-4 w-4" /> {prompts?.length ?? 0} prompts</span>
              <span className="flex items-center gap-1.5"><ShoppingBag className="h-4 w-4" /> {formatCount(creator?.total_sales ?? 0)} sales</span>
            </div>
            {creator?.id && (
              <div className="mt-4 flex flex-wrap items-center justify-center gap-3 sm:justify-start">
                <FollowButton creatorId={creator.id} creatorName={creator.display_name} />
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => navigate(`/messages?recipient=${creator.id}`)}
                  className="gap-2 border-white/10"
                >
                  <MessageSquare className="h-4 w-4" /> Message
                </Button>
              </div>
            )}

            {(safeExternalUrl(creator?.website_url) || creator?.twitter_handle) && (
              <div className="mt-3 flex justify-center gap-4 text-sm sm:justify-start">
                {safeExternalUrl(creator?.website_url) && (
                  <a href={safeExternalUrl(creator?.website_url)} target="_blank" rel="noopener noreferrer nofollow" className="flex items-center gap-1.5 text-primary hover:underline">
                    <Globe className="h-4 w-4" /> Website
                  </a>
                )}
                {creator?.twitter_handle && (
                  <a href={`https://twitter.com/${creator.twitter_handle}`} target="_blank" rel="noopener noreferrer nofollow" className="flex items-center gap-1.5 text-primary hover:underline">
                    <Twitter className="h-4 w-4" /> @{creator.twitter_handle}
                  </a>
                )}
              </div>
            )}
          </div>
        </div>

        <h2 className="mb-6 font-display text-2xl font-bold">Prompts by {creator?.display_name}</h2>
        <PromptGrid prompts={(prompts ?? []) as never} loading={isLoading} emptyMessage="No published prompts yet." />
      </div>
    </Layout>
  );
}
