import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const KEY = "pp_cookie_consent";

/**
 * Lightweight cookie / ads consent banner.
 * Required for AdSense compliance (and good practice for GA4 + advertising
 * cookies). Stores the choice locally so it is only shown once.
 */
export function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem(KEY)) setVisible(true);
    } catch {
      /* storage blocked — don't nag */
    }
  }, []);

  const decide = (value: "accepted" | "essential") => {
    try {
      localStorage.setItem(KEY, value);
    } catch {
      /* no-op */
    }
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-label="Cookie consent"
      className="fixed inset-x-0 bottom-0 z-[90] p-3 sm:p-4"
    >
      <div className="mx-auto flex max-w-4xl flex-col gap-3 rounded-2xl glass-strong p-4 shadow-lg sm:flex-row sm:items-center sm:gap-4">
        <p className="flex-1 text-xs leading-relaxed text-muted-foreground sm:text-sm">
          We use cookies for essential site functions, anonymous analytics and — on our
          guide pages — advertising. Read our{" "}
          <Link to="/legal/privacy" className="underline hover:text-foreground">
            Privacy&nbsp;Policy
          </Link>{" "}
          for details.
        </p>
        <div className="flex shrink-0 gap-2">
          <Button size="sm" variant="outline" onClick={() => decide("essential")}>
            Essential only
          </Button>
          <Button size="sm" className="bg-gradient-primary btn-glow" onClick={() => decide("accepted")}>
            Accept all
          </Button>
        </div>
      </div>
    </div>
  );
}

export default CookieConsent;
