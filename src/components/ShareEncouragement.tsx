import { Share2, Sparkles } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ShareButtons } from "@/components/ShareButtons";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  url: string;
  title: string;
}

/**
 * Encouragement popup shown right after a visitor copies a prompt — the moment
 * they've felt the value. Asking to share at peak satisfaction is the highest-
 * converting time to earn word-of-mouth reach and new visitors.
 */
export function ShareEncouragement({ open, onOpenChange, url, title }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md overflow-hidden border-primary/25 p-6 text-center">
        <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-gradient-primary shadow-glow">
          <Share2 className="h-6 w-6 text-primary-foreground" />
        </div>
        <h2 className="font-display text-xl font-bold">Loved this prompt? Share it 🙌</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Someone in your network needs this too. Share it and help them skip the guesswork — it takes
          one tap.
        </p>

        <div className="mt-5 flex justify-center">
          <ShareButtons url={url} title={title} compact />
        </div>

        <Button variant="ghost" size="sm" className="mt-4 text-muted-foreground" onClick={() => onOpenChange(false)}>
          <Sparkles className="mr-1 h-3.5 w-3.5 text-primary-glow" /> Maybe later
        </Button>
      </DialogContent>
    </Dialog>
  );
}

export default ShareEncouragement;
