import { useEffect, useState } from "react";
import { Link, useSearchParams } from "@/lib/router-compat";
import { CheckCircle2, Clock, Loader2 } from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

type State = "checking" | "confirmed" | "pending" | "missing";

// Access is only ever granted by the verified Stripe webhook. This page just
// checks whether that purchase record exists yet for the signed-in buyer.
export default function CheckoutReturn() {
  const [params] = useSearchParams();
  const sessionId = params.get("session_id");
  const { user, loading } = useAuth();
  const [state, setState] = useState<State>(sessionId ? "checking" : "missing");
  const [title, setTitle] = useState<string | null>(null);
  const [slug, setSlug] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionId || loading) return;
    if (!user) { setState("pending"); return; }
    let cancelled = false;
    let tries = 0;
    const check = async () => {
      tries++;
      const { data } = await supabase.rpc("get_my_purchase_by_session", { _session_id: sessionId });
      if (cancelled) return;
      const row = (data as { title: string | null; slug: string | null }[] | null)?.[0];
      if (row) {
        setTitle(row.title ?? null);
        setSlug(row.slug ?? null);
        setState("confirmed");
      } else if (tries < 10) {
        setTimeout(check, 2000);
      } else {
        setState("pending");
      }
    };
    check();
    return () => { cancelled = true; };
  }, [sessionId, user, loading]);

  return (
    <Layout>
      <SEO title="Order status" description="Your prompt purchase status." canonical="/checkout/return" noindex />
      <div className="container-tight grid min-h-[60vh] place-items-center py-12 text-center">
        <div className="max-w-md rounded-3xl glass-strong p-10" role="status" aria-live="polite">
          {state === "checking" && (
            <>
              <Loader2 className="mx-auto mb-4 h-14 w-14 animate-spin text-primary" />
              <h1 className="font-display text-2xl font-bold">Confirming your payment…</h1>
              <p className="mt-2 text-muted-foreground">This usually takes a few seconds. Please don't close this page.</p>
            </>
          )}
          {state === "confirmed" && (
            <>
              <CheckCircle2 className="mx-auto mb-4 h-14 w-14 text-success" />
              <h1 className="font-display text-2xl font-bold">Payment confirmed</h1>
              <p className="mt-2 text-muted-foreground">
                {title ? <>“{title}” is now unlocked in your library.</> : "Your prompt is now unlocked in your library."}
                {" "}Stripe will email your receipt.
              </p>
            </>
          )}
          {state === "pending" && (
            <>
              <Clock className="mx-auto mb-4 h-14 w-14 text-muted-foreground" />
              <h1 className="font-display text-2xl font-bold">Payment still processing</h1>
              <p className="mt-2 text-muted-foreground">
                We haven't received confirmation from Stripe yet. Some payment methods take longer. Your prompt will appear in your library as soon as it's confirmed — you won't be charged twice. If it doesn't appear, contact us.
              </p>
            </>
          )}
          {state === "missing" && (
            <>
              <Clock className="mx-auto mb-4 h-14 w-14 text-muted-foreground" />
              <h1 className="font-display text-2xl font-bold">No order found</h1>
              <p className="mt-2 text-muted-foreground">We couldn't find checkout details on this link. Check your library for prompts you've bought.</p>
            </>
          )}
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            {state === "confirmed" && slug ? (
              <Button asChild className="bg-gradient-primary btn-glow"><Link to={`/prompt/${slug}`}>Open prompt</Link></Button>
            ) : null}
            <Button asChild variant={state === "confirmed" && slug ? "outline" : "default"} className={state === "confirmed" && slug ? "border-white/15" : "bg-gradient-primary btn-glow"}>
              <Link to="/library">Go to my library</Link>
            </Button>
            <Button asChild variant="outline" className="border-white/15"><Link to="/browse">Keep browsing</Link></Button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
