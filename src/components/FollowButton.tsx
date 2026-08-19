import { useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { UserPlus, UserCheck, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { fetchFollowState, toggleFollow } from "@/lib/queries";
import { formatCount } from "@/lib/format";

interface FollowButtonProps {
  creatorId: string;
  creatorName?: string;
  className?: string;
}

/** Follow / unfollow a creator with an optimistic live follower count. */
export function FollowButton({ creatorId, creatorName, className }: FollowButtonProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const isSelf = user?.id === creatorId;
  const queryKey = ["follow-state", creatorId, user?.id ?? "anon"];

  const { data } = useQuery({
    queryKey,
    queryFn: () => fetchFollowState(creatorId, user?.id),
    enabled: !!creatorId,
  });

  const mutation = useMutation({
    mutationFn: () => toggleFollow(creatorId, user!.id, !!data?.isFollowing),
    onSuccess: (nowFollowing) => {
      qc.setQueryData(queryKey, (prev: { followers: number; isFollowing: boolean } | undefined) => ({
        followers: Math.max(0, (prev?.followers ?? 0) + (nowFollowing ? 1 : -1)),
        isFollowing: nowFollowing,
      }));
      if (nowFollowing) {
        toast({ title: `Following ${creatorName ?? "creator"}`, description: "You'll be notified about their new prompts." });
      }
    },
    onError: (e: unknown) =>
      toast({ title: "Something went wrong", description: e instanceof Error ? e.message : "Try again.", variant: "destructive" }),
  });

  const handleClick = () => {
    if (!user) {
      navigate("/auth");
      return;
    }
    mutation.mutate();
  };

  const followers = data?.followers ?? 0;
  const following = !!data?.isFollowing;

  return (
    <div className={`flex items-center gap-3 ${className ?? ""}`}>
      {!isSelf && (
        <Button
          onClick={handleClick}
          disabled={mutation.isPending}
          size="sm"
          variant={following ? "outline" : "default"}
          className={following ? "border-white/15" : "bg-gradient-primary btn-glow"}
          aria-pressed={following}
        >
          {mutation.isPending ? (
            <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
          ) : following ? (
            <UserCheck className="mr-1.5 h-4 w-4" />
          ) : (
            <UserPlus className="mr-1.5 h-4 w-4" />
          )}
          {following ? "Following" : "Follow"}
        </Button>
      )}
      <span className="text-sm text-muted-foreground">
        <strong className="text-foreground">{formatCount(followers)}</strong> {followers === 1 ? "follower" : "followers"}
      </span>
    </div>
  );
}

export default FollowButton;
