import { useEffect, useState } from "react";
import { Link } from "@/lib/router-compat";
import { Button } from "@/components/ui/button";
import {
  type ConsentChoice,
  getConsent,
  loadAnalyticsIfAllowed,
  onConsentChange,
  onConsentOpen,
  setConsent,
  wereTagsLoaded,
} from "@/lib/consent";

/**
 * Cookie banner. Analytics and advertising load only after "Accept all".
 * "Essential only" (or no choice yet) keeps them off. Reopen via the footer.
 */
export function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!getConsent()) setVisible(true);
    loadAnalyticsIfAllowed();
    const offChange = onConsentChange(() => {
      if (getConsent() === "accepted") loadAnalyticsIfAllowed();
      else if (wereTagsLoaded()) window.location.reload();
    });
    const offOpen = onConsentOpen(() => setVisible(true));
    return () => {
      offChange();
      offOpen();
    };
  }, []);

  const decide = (value: ConsentChoice) => {
    setConsent(value);
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div role="dialog" aria-label="Cookie consent" className="fixed inset-x-0 bottom-0 z-[90] p-3 sm:p-4">
      <div className="mx-auto flex max-w-4xl flex-col gap-3 rounded-2xl glass-strong p-4 shadow-lg sm:flex-row sm:items-center sm:gap-4">
        <p className="flex-1 text-xs leading-relaxed text-muted-foreground sm:text-sm">
          We use essential cookies to run the site. With your permission we also use Google
          Analytics to measure visits and Google AdSense to show ads on guide pages. You can
          change this any time from “Cookie settings” in the footer. See our{" "}
          <Link to="/privacy" className="underline hover:text-foreground">
            Privacy&nbsp;Policy
          </Link>
          .
        </p>
        <div className="flex shrink-0 gap-2">
          <Button size="sm" variant="outline" onClick={() => decide("essential")}>
            Essential only
          </Button>
          <Button size="sm" variant="outline" onClick={() => decide("accepted")}>
            Accept all
          </Button>
        </div>
      </div>
    </div>
  );
}

export default CookieConsent;
