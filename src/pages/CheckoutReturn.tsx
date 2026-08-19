import { Link, useSearchParams } from "react-router-dom";
import { CheckCircle2 } from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";

export default function CheckoutReturn() {
  const [params] = useSearchParams();
  const sessionId = params.get("session_id");

  return (
    <Layout>
      <SEO title="Order complete" description="Your prompt purchase is complete." canonical="/checkout/return" noindex />
      <div className="container-tight grid min-h-[60vh] place-items-center py-12 text-center">
        <div className="max-w-md rounded-3xl glass-strong p-10">
          <CheckCircle2 className="mx-auto mb-4 h-14 w-14 text-success" />
          <h1 className="font-display text-2xl font-bold">Payment complete</h1>
          <p className="mt-2 text-muted-foreground">
            {sessionId
              ? "Thanks for your purchase! Your prompt is now unlocked in your library."
              : "Your order is being processed."}
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Button asChild className="bg-gradient-primary btn-glow"><Link to="/library">Go to my library</Link></Button>
            <Button asChild variant="outline" className="border-white/15"><Link to="/browse">Keep browsing</Link></Button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
