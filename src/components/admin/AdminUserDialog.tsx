import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { 
  Loader2, Mail, ShieldCheck, User, Star, Share2, Award, 
  MessageSquare, ExternalLink, Calendar
} from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { adminGiftPlatinum } from "@/lib/admin";
import { timeAgo, formatPrice, formatCount } from "@/lib/format";

interface AdminUserDialogProps {
  user: {
    id: string;
    handle: string;
    display_name: string;
    avatar_url: string | null;
    is_creator: boolean;
    membership_tier: string;
    total_sales: number;
    total_earnings_pence: number;
    created_at: string;
  } | null;
  onClose: () => void;
}

export function AdminUserDialog({ user, onClose }: AdminUserDialogProps) {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [isGifting, setIsGifting] = useState(false);

  if (!user) return null;

  const handleGiftPlatinum = async () => {
    setIsGifting(true);
    try {
      await adminGiftPlatinum(user.id);
      qc.invalidateQueries({ queryKey: ["admin-users"] });
      toast({
        title: "Platinum Gifted!",
        description: `Awarded 1 month of Platinum to @${user.handle}. Private message and email sent.`,
      });
      onClose();
    } catch (e) {
      toast({
        title: "Gifting failed",
        description: (e as Error).message,
        variant: "destructive",
      });
    } finally {
      setIsGifting(false);
    }
  };

  return (
    <Dialog open={!!user} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl gap-0 p-0 overflow-hidden glass border-white/10">
        <div className="relative h-32 bg-gradient-to-r from-primary/20 to-warning/20">
          <div className="absolute -bottom-12 left-8">
            <div className="h-24 w-24 rounded-2xl border-4 border-background glass overflow-hidden bg-card">
              {user.avatar_url ? (
                <img src={user.avatar_url} alt={user.handle} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-secondary">
                  <User className="h-10 w-10 text-muted-foreground" />
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="px-8 pb-8 pt-16">
          <DialogHeader className="mb-6">
            <div className="flex items-start justify-between">
              <div>
                <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                  {user.display_name}
                  <Badge variant="outline" className="text-xs border-primary/20 text-primary-glow font-normal">
                    @{user.handle}
                  </Badge>
                </DialogTitle>
                <DialogDescription className="mt-1 flex items-center gap-2 text-sm">
                  Joined {timeAgo(user.created_at)}
                </DialogDescription>
              </div>
              <div className="flex gap-2">
                <Badge className={user.membership_tier === 'platinum' ? "bg-warning/20 text-warning border-warning/20" : "bg-secondary/50 text-muted-foreground"}>
                  {user.membership_tier.toUpperCase()}
                </Badge>
                {user.is_creator && (
                  <Badge variant="outline" className="border-primary/30 text-primary-glow">
                    CREATOR
                  </Badge>
                )}
              </div>
            </div>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Account Stats</h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-white/5 bg-white/5 p-3">
                  <div className="text-xs text-muted-foreground mb-1">Total Sales</div>
                  <div className="text-lg font-bold">{formatCount(user.total_sales)}</div>
                </div>
                <div className="rounded-xl border border-white/5 bg-white/5 p-3">
                  <div className="text-xs text-muted-foreground mb-1">Earnings</div>
                  <div className="text-lg font-bold">{formatPrice(user.total_earnings_pence, false)}</div>
                </div>
              </div>
              
              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start gap-2 border-white/10" asChild>
                  <a href={`/u/${user.handle}`} target="_blank" rel="noreferrer">
                    <ExternalLink className="h-4 w-4" />
                    View Public Profile
                  </a>
                </Button>
                <Button variant="outline" className="w-full justify-start gap-2 border-white/10">
                  <MessageSquare className="h-4 w-4" />
                  View Chat History
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Membership Actions</h4>
              <div className="rounded-2xl border border-warning/20 bg-warning/5 p-4 space-y-4">
                <div className="flex items-start gap-3">
                  <div className="mt-1 h-8 w-8 rounded-full bg-warning/20 flex items-center justify-center text-warning">
                    <Award className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">Gift Platinum Status</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Give 1 month of free Platinum membership. This sends an automated PM and email from Benjamin.
                    </p>
                  </div>
                </div>
                <Button 
                  className="w-full bg-warning hover:bg-warning/90 text-warning-foreground gap-2 font-bold"
                  onClick={handleGiftPlatinum}
                  disabled={isGifting || user.membership_tier === 'platinum'}
                >
                  {isGifting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Star className="h-4 w-4 fill-current" />
                  )}
                  {user.membership_tier === 'platinum' ? "Already Platinum" : "Give 1 Month Free Platinum"}
                </Button>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="bg-white/5 border-t border-white/5 p-4 px-8">
          <Button variant="ghost" onClick={onClose}>Close Profile</Button>
          <div className="flex-1" />
          <Button variant="outline" className="border-destructive/30 text-destructive hover:bg-destructive/10">
            Suspend Account
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
