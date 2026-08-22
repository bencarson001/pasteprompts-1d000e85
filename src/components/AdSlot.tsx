import { useEffect, useRef } from "react";
import { ADSENSE_CLIENT, adsEnabled } from "@/lib/ads";

interface AdSlotProps {
  slot: string;
  format?: string;
  layout?: string;
  className?: string;
  /** Optional label shown above the ad for transparency / policy compliance. */
  label?: boolean;
}

/**
 * Renders a responsive Google AdSense unit. Renders nothing until a real
 * publisher ID is configured in src/lib/ads.ts, so there is zero impact on
 * the live site before AdSense approval.
 */
export function AdSlot({ slot, format = "auto", layout, className, label = true }: AdSlotProps) {
  const ref = useRef<HTMLModElement>(null);

  useEffect(() => {
    if (!adsEnabled()) return;
    try {
      // @ts-expect-error adsbygoogle is injected by the AdSense script
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {
      /* no-op: ad blocker or script not yet loaded */
    }
  }, []);

  if (!adsEnabled()) return null;

  return (
    <div className={className} aria-hidden="true">
      {label && (
        <p className="mb-1 text-center text-[10px] uppercase tracking-widest text-muted-foreground/60">
          Advertisement
        </p>
      )}
      <ins
        ref={ref}
        className="adsbygoogle block"
        style={{ display: "block" }}
        data-ad-client={ADSENSE_CLIENT}
        data-ad-slot={slot}
        data-ad-format={format}
        {...(layout ? { "data-ad-layout": layout } : {})}
        data-full-width-responsive="true"
      />
    </div>
  );
}

export default AdSlot;
