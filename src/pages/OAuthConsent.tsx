import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Loader2, ShieldCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { SEO } from "@/components/SEO";

// The `supabase.auth.oauth` namespace is beta; type a minimal local wrapper.
type OAuthResult = {
  data?: {
    client?: { name?: string } | null;
    redirect_url?: string | null;
    redirect_to?: string | null;
    scope?: string | null;
  } | null;
  error?: { message?: string } | null;
};
type OAuthApi = {
  getAuthorizationDetails: (id: string) => Promise<OAuthResult>;
  approveAuthorization: (id: string) => Promise<OAuthResult>;
  denyAuthorization: (id: string) => Promise<OAuthResult>;
};
const oauth = (supabase.auth as unknown as { oauth: OAuthApi }).oauth;

export default function OAuthConsent() {
  const [params] = useSearchParams();
  const authorizationId = params.get("authorization_id") ?? "";
  const [details, setDetails] = useState<OAuthResult["data"] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      if (!authorizationId) {
        setError("Missing authorization request.");
        return;
      }
      const { data: sess } = await supabase.auth.getSession();
      if (!sess.session) {
        // Preserve the FULL consent URL so auth returns the user right back here.
        const next = window.location.pathname + window.location.search;
        window.location.href = "/auth?redirect=" + encodeURIComponent(next);
        return;
      }
      const { data, error } = await oauth.getAuthorizationDetails(authorizationId);
      if (!active) return;
      if (error) {
        setError(error.message ?? "Could not load this authorization request.");
        return;
      }
      const immediate = data?.redirect_url ?? data?.redirect_to;
      if (immediate && !data?.client) {
        window.location.href = immediate;
        return;
      }
      setDetails(data ?? null);
    })();
    return () => {
      active = false;
    };
  }, [authorizationId]);

  async function decide(approve: boolean) {
    setBusy(true);
    const { data, error } = approve
      ? await oauth.approveAuthorization(authorizationId)
      : await oauth.denyAuthorization(authorizationId);
    if (error) {
      setBusy(false);
      setError(error.message ?? "Something went wrong. Please try again.");
      return;
    }
    const target = data?.redirect_url ?? data?.redirect_to;
    if (!target) {
      setBusy(false);
      setError("No redirect returned by the authorization server.");
      return;
    }
    window.location.href = target;
  }

  const clientName = details?.client?.name ?? "an application";

  return (
    <div className="min-h-screen grid place-items-center px-4 py-12">
      <SEO title="Authorize access" description="Approve or deny access to your Paste Prompts account." canonical="/.lovable/oauth/consent" noindex />
      <div className="w-full max-w-md rounded-3xl glass-strong p-8">
        <div className="mb-6 text-center">
          <span className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-xl bg-gradient-primary shadow-glow">
            <ShieldCheck className="h-6 w-6 text-primary-foreground" />
          </span>
          <h1 className="font-display text-2xl font-bold">
            Connect {clientName} to Paste Prompts
          </h1>
        </div>

        {error && (
          <p className="rounded-2xl bg-destructive/10 p-4 text-center text-sm text-destructive">{error}</p>
        )}

        {!error && !details && (
          <div className="flex items-center justify-center gap-2 py-8 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" /> Loading…
          </div>
        )}

        {!error && details && (
          <>
            <p className="mb-4 text-sm text-muted-foreground">
              This lets <span className="font-medium text-foreground">{clientName}</span> use Paste Prompts as you.
              It can call the app's enabled tools while you're signed in. This does not bypass Paste Prompts'
              permissions or backend policies.
            </p>
            <div className="flex gap-3">
              <Button onClick={() => decide(true)} disabled={busy} className="flex-1 bg-gradient-primary btn-glow">
                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Approve"}
              </Button>
              <Button onClick={() => decide(false)} disabled={busy} variant="outline" className="flex-1 border-white/15">
                Cancel connection
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
