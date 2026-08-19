import { useState } from "react";
import { Sparkles, Shield, User, ArrowRight, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface CreatorOnboardingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => Promise<void> | void;
  onDecline: () => Promise<void> | void;
}

export function CreatorOnboardingDialog({
  open,
  onOpenChange,
  onConfirm,
  onDecline,
}: CreatorOnboardingDialogProps) {
  const [loading, setLoading] = useState(false);

  const handleYes = async () => {
    setLoading(true);
    try {
      await onConfirm();
    } finally {
      setLoading(false);
    }
  };

  const handleNo = async () => {
    setLoading(true);
    try {
      await onDecline();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md border-white/10 glass-strong shadow-2xl p-6 sm:p-7 rounded-3xl">
        <DialogHeader className="text-left space-y-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-primary shadow-glow">
            <Sparkles className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <DialogTitle className="font-display text-xl sm:text-2xl font-bold">
              Build your public creator profile?
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground mt-1.5 leading-relaxed">
              Would you like to enable creator mode and build your public profile?
            </DialogDescription>
          </div>
        </DialogHeader>

        <div className="my-2 space-y-2.5 rounded-2xl bg-card/60 border border-white/5 p-4 text-xs text-muted-foreground leading-relaxed">
          <div className="flex items-start gap-2.5 text-foreground font-medium">
            <User className="h-4 w-4 shrink-0 text-primary-glow mt-0.5" />
            <span>Showcase your prompt engineering portfolio, bio, and social updates.</span>
          </div>
          <div className="flex items-start gap-2.5 text-muted-foreground">
            <Shield className="h-4 w-4 shrink-0 text-primary-glow mt-0.5" />
            <span>Appear in the public Creator Discovery directory so other users can find and follow you.</span>
          </div>
        </div>

        <div className="flex flex-col gap-2.5 pt-2 sm:pt-4">
          <Button
            onClick={handleYes}
            disabled={loading}
            className="w-full bg-gradient-primary btn-glow h-11 text-sm font-semibold flex items-center justify-between px-4"
          >
            <span className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" /> Yes, build my public profile
            </span>
            <span className="rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
              Recommended
            </span>
          </Button>

          <Button
            onClick={handleNo}
            disabled={loading}
            variant="ghost"
            className="w-full text-muted-foreground hover:text-foreground hover:bg-card/50 text-sm h-10"
          >
            No, keep my profile private
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
