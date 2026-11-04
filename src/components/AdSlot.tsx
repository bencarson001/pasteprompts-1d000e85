import { useEffect, useRef, useState } from "react";
import { ADSENSE_CLIENT, adsEnabled, isRealAdSlot } from "@/lib/ads";
import { hasMarketingConsent, onConsentChange } from "@/lib/consent";

interface AdSlotProps {
  slot: string;
  format?: string;
  layout?: string;
  className?: string;
  /** Optional label shown above the ad for transparency / policy compliance. */
  label?: boolean;
}

/**
 * Renders a Google AdSense unit only when a real ad unit ID is configured
 * (src/lib/ads.ts / VITE_ADSENSE_* env) AND the visitor clicked "Accept all".
 * Otherwise renders nothing, so there is no empty space or request.
 */
export function AdSlot({ slot, format = "auto", layout, className, label = true }: AdSlotProps) {
  const ref = useRef<HTMLModElement>(null);
  const [consented, setConsented] = useState(false);

  useEffect(() => {
    setConsented(hasMarketingConsent());
    return onConsentChange(() => setConsented(hasMarketingConsent()));
  }, []);

  const shouldRender = consented && adsEnabled() && isRealAdSlot(slot);

  useEffect(() => {
    if (!shouldRender || !ref.current || ref.current.dataset["adsbygoogleStatus"]) return;
    try {
      const w = window as unknown as { adsbygoogle?: unknown[] };
      (w.adsbygoogle = w.adsbygoogle || []).push({});
    } catch {
      /* no-op: ad blocker or script not yet loaded */
    }
  }, [shouldRender]);

  if (!shouldRender) return null;

  return (
    <div className={`min-h-[90px] w-full ${className ?? ""}`} aria-label="Advertisement">
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
