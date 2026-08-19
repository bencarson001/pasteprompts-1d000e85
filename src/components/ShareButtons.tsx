import { useState } from "react";
import { Facebook, Twitter, Send, Share2, Link2, Check, Instagram, Youtube, Linkedin } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface ShareButtonsProps {
  url: string;
  title: string;
  className?: string;
  compact?: boolean;
}

/** Inline TikTok glyph — lucide has no TikTok icon. */
function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M16.5 3c.3 2.1 1.5 3.6 3.5 3.9v2.4c-1.3.1-2.5-.2-3.6-.8v5.6c0 3.2-2.3 5.6-5.4 5.6-3 0-5.3-2.2-5.3-5.2 0-3.1 2.5-5.3 5.6-5v2.5c-.3-.1-.6-.1-.9-.1-1.4 0-2.4 1-2.4 2.5 0 1.4 1 2.5 2.4 2.5 1.5 0 2.5-1 2.5-2.7V3h3.6Z" />
    </svg>
  );
}

/** Social sharing row. FB / X / WhatsApp / LinkedIn have web share URLs.
 *  Instagram, TikTok & YouTube have no web share intent, so tapping them
 *  copies the link + shows a tailored hint (works from their apps/mobile). */
export function ShareButtons({ url, title, className, compact }: ShareButtonsProps) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const enc = encodeURIComponent;
  const shareText = `${title} — via Paste Prompts`;

  const copyLink = async (hint?: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast({ title: "Link copied", description: hint ?? "Paste it anywhere to share this prompt." });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({ title: "Couldn't copy link", variant: "destructive" });
    }
  };

  const webLinks = [
    { label: "Share on Facebook", icon: Facebook, href: `https://www.facebook.com/sharer/sharer.php?u=${enc(url)}` },
    { label: "Share on X", icon: Twitter, href: `https://twitter.com/intent/tweet?url=${enc(url)}&text=${enc(shareText)}` },
    { label: "Share on WhatsApp", icon: Send, href: `https://wa.me/?text=${enc(`${shareText} ${url}`)}` },
    { label: "Share on LinkedIn", icon: Linkedin, href: `https://www.linkedin.com/sharing/share-offsite/?url=${enc(url)}` },
  ];

  const copyLinks = [
    { label: "Share on Instagram", icon: Instagram, hint: "Paste it into your Instagram story, bio or DM." },
    { label: "Share on TikTok", icon: TikTokIcon, hint: "Paste it into your TikTok bio or a video caption." },
    { label: "Share on YouTube", icon: Youtube, hint: "Paste it into your YouTube description or community post." },
  ];

  const nativeShare = async () => {
    if (navigator.share) {
      try { await navigator.share({ title, text: shareText, url }); } catch { /* cancelled */ }
    } else {
      copyLink();
    }
  };

  const base =
    "grid place-items-center rounded-xl border border-white/10 bg-card/60 text-muted-foreground transition-all hover:-translate-y-0.5 hover:text-foreground hover:border-primary/40 hover:shadow-glow";
  const size = compact ? "h-9 w-9" : "h-10 w-10";

  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      {!compact && <span className="mr-1 text-sm font-medium text-muted-foreground">Share:</span>}
      {webLinks.map((l) => (
        <a
          key={l.label}
          href={l.href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={l.label}
          title={l.label}
          className={cn(base, size)}
        >
          <l.icon className="h-4 w-4" />
        </a>
      ))}
      {copyLinks.map((l) => (
        <button
          key={l.label}
          type="button"
          onClick={() => copyLink(l.hint)}
          aria-label={l.label}
          title={l.label}
          className={cn(base, size)}
        >
          <l.icon className="h-4 w-4" />
        </button>
      ))}
      <button type="button" onClick={() => copyLink()} aria-label="Copy link" title="Copy link" className={cn(base, size)}>
        {copied ? <Check className="h-4 w-4 text-success" /> : <Link2 className="h-4 w-4" />}
      </button>
      <button type="button" onClick={nativeShare} aria-label="More sharing options" title="More sharing options" className={cn(base, size)}>
        <Share2 className="h-4 w-4" />
      </button>
    </div>
  );
}

export default ShareButtons;
