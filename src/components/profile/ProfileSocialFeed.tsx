import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Heart,
  MessageCircle,
  Share2,
  Send,
  Pin,
  Sparkles,
  ExternalLink,
  Crown,
  ShieldCheck,
  MoreVertical,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  SocialPost,
  getSocialPosts,
  createSocialPost,
  toggleLikePost,
  getPostComments,
  addPostComment,
} from "@/lib/social";
import { MembershipTier } from "@/lib/permissions";

interface ProfileSocialFeedProps {
  creatorId: string;
  creatorHandle: string;
  isOwner: boolean;
  currentUser?: {
    id: string;
    email?: string;
    handle?: string;
    displayName?: string;
    avatarUrl?: string | null;
    tier?: MembershipTier;
  } | null;
}

export function ProfileSocialFeed({
  creatorId,
  creatorHandle,
  isOwner,
  currentUser,
}: ProfileSocialFeedProps) {
  const { toast } = useToast();
  const [posts, setPosts] = useState<SocialPost[]>(() =>
    getSocialPosts(creatorHandle, currentUser?.id)
  );
  const [newContent, setNewContent] = useState("");
  const [activeCommentPostId, setActiveCommentPostId] = useState<string | null>(null);
  const [commentText, setCommentText] = useState("");

  const refreshPosts = () => {
    setPosts(getSocialPosts(creatorHandle, currentUser?.id));
  };

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContent.trim()) return;
    if (!currentUser) {
      toast({ title: "Please sign in", description: "You must be signed in to post updates." });
      return;
    }

    createSocialPost(currentUser, newContent);
    setNewContent("");
    refreshPosts();
    toast({ title: "Post published!", description: "Your update is now live on your profile." });
  };

  const handleLike = (postId: string) => {
    if (!currentUser) {
      toast({ title: "Please sign in", description: "Sign in to like creator updates." });
      return;
    }
    toggleLikePost(postId, currentUser.id);
    refreshPosts();
  };

  const handleAddComment = (postId: string) => {
    if (!commentText.trim()) return;
    if (!currentUser) {
      toast({ title: "Please sign in", description: "Sign in to join the conversation." });
      return;
    }

    addPostComment(postId, currentUser, commentText);
    setCommentText("");
    refreshPosts();
    toast({ title: "Comment added!" });
  };

  return (
    <div className="space-y-6">
      {/* Post Composer (For Profile Owner) */}
      {isOwner && (
        <form
          onSubmit={handleCreatePost}
          className="rounded-2xl border border-white/10 bg-card/60 p-5 shadow-md backdrop-blur-md"
        >
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="h-4 w-4 text-primary-glow" />
            <h3 className="text-sm font-semibold text-foreground">Share an update with your followers</h3>
          </div>
          <Textarea
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
            placeholder="Share a prompt engineering tip, workflow update, or prompt announcement..."
            className="mb-3 bg-card/80 border-white/10 text-sm min-h-[90px]"
          />
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              Posts appear in the public feed and on your profile
            </span>
            <Button
              type="submit"
              size="sm"
              disabled={!newContent.trim()}
              className="bg-gradient-primary font-semibold shadow-glow"
            >
              <Send className="mr-1.5 h-3.5 w-3.5" /> Post Update
            </Button>
          </div>
        </form>
      )}

      {/* Feed List */}
      {posts.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/10 p-10 text-center text-muted-foreground">
          <MessageCircle className="mx-auto h-8 w-8 text-muted-foreground/60 mb-2" />
          <p className="text-sm">No updates posted yet by this creator.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => {
            const comments = getPostComments(post.id);
            const isCommentsOpen = activeCommentPostId === post.id;

            return (
              <div
                key={post.id}
                className="rounded-2xl border border-white/10 bg-card/50 p-5 shadow-sm transition-all hover:border-white/20"
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10 border border-white/10">
                      <AvatarImage src={post.creator_avatar ?? undefined} />
                      <AvatarFallback className="bg-gradient-primary text-xs font-bold text-primary-foreground">
                        {post.creator_name.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-bold text-foreground">
                          {post.creator_name}
                        </span>
                        {post.creator_tier === "platinum" ? (
                          <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/40 text-[9px] py-0">
                            VIP
                          </Badge>
                        ) : post.creator_tier === "pro" ? (
                          <Badge className="bg-primary/20 text-primary-glow border-primary/40 text-[9px] py-0">
                            PRO
                          </Badge>
                        ) : null}
                      </div>
                      <span className="text-xs text-muted-foreground">
                        @{post.creator_handle} •{" "}
                        {new Date(post.created_at).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "short",
                        })}
                      </span>
                    </div>
                  </div>

                  {post.is_pinned && (
                    <Badge variant="outline" className="text-[10px] text-amber-400 border-amber-500/30">
                      <Pin className="mr-1 h-3 w-3" /> Pinned
                    </Badge>
                  )}
                </div>

                {/* Body Content */}
                <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap mb-4">
                  {post.content}
                </p>

                {/* Attached Prompt Reference Card */}
                {post.prompt_title && (
                  <Link
                    to={`/prompt/${post.prompt_slug || ""}`}
                    className="mb-4 flex items-center justify-between rounded-xl border border-primary/20 bg-primary/5 p-3 text-xs font-medium text-foreground hover:bg-primary/10 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-primary-glow" />
                      <span>{post.prompt_title}</span>
                    </div>
                    <ExternalLink className="h-3.5 w-3.5 text-primary-glow" />
                  </Link>
                )}

                {/* Footer Interactions */}
                <div className="flex items-center gap-4 border-t border-white/5 pt-3 text-xs text-muted-foreground">
                  <button
                    onClick={() => handleLike(post.id)}
                    className={`flex items-center gap-1.5 font-medium transition-colors ${
                      post.is_liked
                        ? "text-rose-500 font-semibold"
                        : "hover:text-rose-400"
                    }`}
                  >
                    <Heart
                      className={`h-4 w-4 ${post.is_liked ? "fill-current" : ""}`}
                    />
                    <span>{post.likes_count}</span>
                  </button>

                  <button
                    onClick={() =>
                      setActiveCommentPostId(isCommentsOpen ? null : post.id)
                    }
                    className="flex items-center gap-1.5 font-medium hover:text-foreground transition-colors"
                  >
                    <MessageCircle className="h-4 w-4" />
                    <span>{comments.length} Comments</span>
                  </button>
                </div>

                {/* Expandable Comments Drawer */}
                {isCommentsOpen && (
                  <div className="mt-4 border-t border-white/5 pt-4 space-y-3">
                    {/* Add Comment Input */}
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        placeholder="Write a thoughtful comment..."
                        className="flex-1 rounded-xl border border-white/10 bg-card px-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleAddComment(post.id);
                        }}
                      />
                      <Button
                        size="sm"
                        onClick={() => handleAddComment(post.id)}
                        disabled={!commentText.trim()}
                        className="h-8 bg-gradient-primary text-xs"
                      >
                        Reply
                      </Button>
                    </div>

                    {/* Existing Comments */}
                    {comments.map((comment) => (
                      <div
                        key={comment.id}
                        className="rounded-xl border border-white/5 bg-card/40 p-2.5 text-xs"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-semibold text-foreground">
                            {comment.user_name}
                          </span>
                          <span className="text-[10px] text-muted-foreground">
                            {new Date(comment.created_at).toLocaleDateString("en-GB", {
                              day: "numeric",
                              month: "short",
                            })}
                          </span>
                        </div>
                        <p className="text-foreground/80">{comment.content}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
