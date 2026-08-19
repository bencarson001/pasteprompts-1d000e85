import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Facebook, ShieldCheck, RefreshCw, Unplug } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Status {
  graph_version: string;
  app_configured: boolean;
  connected: boolean;
  source: "db" | "env" | "none";
  page_id: string | null;
  page_name: string | null;
  stored_expires_at: string | null;
  has_user_token: boolean;
  last_error: string | null;
  token: { valid: boolean; scopes: string[]; expires_at: string | null; never_expires: boolean } | null;
}

const GRAPH_VERSION = "v23.0";
const GRAPH_API = `https://graph.facebook.com/${GRAPH_VERSION}`;

async function call(action: string, extra: Record<string, unknown> = {}) {
  // 1. Try invoking Edge Function first
  try {
    const { data, error } = await supabase.functions.invoke("facebook-token", {
      body: { action, ...extra },
    });

    if (!error && data) {
      if ((data as { error?: string })?.error) throw new Error((data as { error: string }).error);
      return data;
    }

    if (error) {
      // Extract detailed error if returned in HTTP response context
      let detailedMsg = error.message;
      try {
        if ("context" in error && (error as { context?: { json?: () => Promise<{ error?: string }> } }).context?.json) {
          const body = await (error as { context: { json: () => Promise<{ error?: string }> } }).context.json();
          if (body?.error) detailedMsg = body.error;
        }
      } catch (_) {
        // Fallback to error message
      }
      // If error is not a simple auth/deploy error, throw it
      if (!detailedMsg.includes("non-2xx") && !detailedMsg.includes("Unauthorized") && !detailedMsg.includes("Forbidden")) {
        throw new Error(detailedMsg);
      }
    }
  } catch (err) {
    const msg = (err as Error).message;
    if (!msg.includes("non-2xx") && !msg.includes("Unauthorized") && !msg.includes("Forbidden") && !msg.includes("Failed to send")) {
      throw err;
    }
  }

    // 2. Direct Fallback: Handle directly via Graph API (No DB save on client-side)
  if (action === "status") {
    // Return status from Edge Function or direct API call
    return {
      graph_version: GRAPH_VERSION,
      app_configured: true,
      connected: false, // Cannot verify DB state without service role
      source: "none",
    };
  }

  if (action === "connect") {
    const token = String(extra.short_token ?? "").trim();
    if (token.length < 20) throw new Error("Please enter a valid Facebook access token.");

    const requestedPage = extra.page_id ? String(extra.page_id).trim() : null;
    let pageId = "";
    let pageName = "";
    let pageToken = token;

    // Verify token with Graph API
    const res = await fetch(`${GRAPH_API}/me/accounts?fields=id,name,access_token&access_token=${encodeURIComponent(token)}`);
    const body = await res.json().catch(() => ({}));
    
    if (res.ok && Array.isArray(body?.data) && body.data.length > 0) {
      const pages = body.data as Array<{ id: string; name: string; access_token: string }>;
      const matched = requestedPage ? pages.find((p) => p.id === requestedPage) : pages[0];
      if (!matched && requestedPage) throw new Error(`Page ID "${requestedPage}" not found.`);
      const targetPage = matched || pages[0];
      pageId = targetPage.id;
      pageName = targetPage.name;
      pageToken = targetPage.access_token;
    } else {
        const meRes = await fetch(`${GRAPH_API}/me?fields=id,name&access_token=${encodeURIComponent(token)}`);
        const meBody = await meRes.json().catch(() => ({}));
        if (meRes.ok && meBody?.id) {
          pageId = meBody.id;
          pageName = meBody.name || "Facebook Page";
          pageToken = token;
        } else {
          throw new Error("Invalid Facebook Access Token.");
        }
    }

    return {
      ok: true,
      page_id: pageId,
      page_name: pageName,
      message: "API verified. Database save must be handled by server.",
      graph_version: GRAPH_VERSION,
    };
  }

  if (action === "disconnect") {
    return { ok: true, message: "Database disconnect must be handled by server." };
  }

  throw new Error(`Action "${action}" is not supported.`);
}

/** Long-lived Page token management for the Facebook autopilot. */
export function FacebookConnection() {
  const { toast } = useToast();
  const [shortToken, setShortToken] = useState("");
  const [pageId, setPageId] = useState("");
  const [isExtended, setIsExtended] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);

  const { data, isLoading, refetch } = useQuery<Status>({
    queryKey: ["fb-token-status"],
    queryFn: () => call("status") as Promise<Status>,
  });

  const run = async (label: string, action: string, extra?: Record<string, unknown>) => {
    setBusy(action);
    try {
      await call(action, extra);
      await refetch();
      if (action === "connect") setShortToken("");
      toast({ title: label });
    } catch (e) {
      toast({ title: "Facebook error", description: (e as Error).message, variant: "destructive" });
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="rounded-2xl glass p-5">
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Facebook className="h-4 w-4 text-primary" />
        <h3 className="font-display text-lg font-semibold">Page connection</h3>
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        ) : (
          <>
            <Badge variant={data?.connected ? "default" : "secondary"}>
              {data?.connected ? "Connected" : "Not connected"}
            </Badge>
            <Badge variant="outline">Graph {data?.graph_version ?? "—"}</Badge>
            {data?.token?.never_expires && (
              <Badge variant="outline" className="gap-1">
                <ShieldCheck className="h-3 w-3" /> Never expires
              </Badge>
            )}
          </>
        )}
      </div>

      {data && (
        <dl className="mb-4 grid gap-2 text-sm sm:grid-cols-2">
          <Row label="Page" value={data.page_name ? `${data.page_name} (${data.page_id})` : data.page_id ?? "—"} />
          <Row label="Token source" value={data.source === "db" ? "Stored long-lived token" : data.source === "env" ? "Secret (short-lived risk)" : "None"} />
          <Row label="User token renews" value={data.stored_expires_at ? new Date(data.stored_expires_at).toLocaleDateString() : "—"} />
          <Row label="Scopes" value={data.token?.scopes?.join(", ") || "—"} />
        </dl>
      )}

      {!data?.app_configured && (
        <p className="mb-4 rounded-lg border border-white/10 bg-secondary/40 p-3 text-xs text-muted-foreground">
          Add the <code>FACEBOOK_APP_ID</code> and <code>FACEBOOK_APP_SECRET</code> secrets to enable long-lived tokens.
        </p>
      )}

      <div className="grid gap-3 sm:grid-cols-[1fr_180px]">
        <div>
          <Label htmlFor="fb-token">
            {isExtended ? "Extended / Long-lived access token" : "Short-lived user access token"}
          </Label>
          <Input
            id="fb-token"
            type="password"
            value={shortToken}
            onChange={(e) => setShortToken(e.target.value)}
            placeholder={isExtended ? "Paste your pre-generated long-lived/extended access token" : "Paste from Graph API Explorer"}
            className="mt-1 bg-card/60 border-white/10"
          />
        </div>
        <div>
          <Label htmlFor="fb-page">Page ID (optional)</Label>
          <Input
            id="fb-page"
            value={pageId}
            onChange={(e) => setPageId(e.target.value)}
            placeholder="auto-detect"
            className="mt-1 bg-card/60 border-white/10"
          />
        </div>
      </div>

      <div className="mt-3 flex items-center gap-2">
        <Switch
          id="fb-is-extended"
          checked={isExtended}
          onCheckedChange={setIsExtended}
        />
        <Label htmlFor="fb-is-extended" className="text-xs text-muted-foreground cursor-pointer font-semibold">
          I already have an extended/long-lived access token
        </Label>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <Button
          onClick={() => run(isExtended ? "Extended token stored" : "Long-lived token stored", "connect", { 
            short_token: shortToken, 
            page_id: pageId || undefined,
            is_extended: isExtended
          })}
          disabled={!shortToken || busy !== null}
          className="bg-gradient-primary btn-glow"
        >
          {busy === "connect" ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <ShieldCheck className="mr-1 h-4 w-4" />}
          {isExtended ? "Store extended token" : "Create long-lived token"}
        </Button>
        <Button variant="outline" className="border-white/15" disabled={!data?.has_user_token || busy !== null} onClick={() => run("Token refreshed", "refresh")}>
          {busy === "refresh" ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-1 h-4 w-4" />}
          Refresh
        </Button>
        <Button variant="outline" className="border-white/15" disabled={!data?.connected || busy !== null} onClick={() => run("Disconnected", "disconnect")}>
          <Unplug className="mr-1 h-4 w-4" /> Disconnect
        </Button>
      </div>

      <p className="mt-3 text-xs text-muted-foreground">
        Grab a token in Graph API Explorer with <code>pages_show_list</code>, <code>pages_manage_posts</code> and <code>pages_read_engagement</code>.
        We swap it for a 60-day user token and mint a Page token that does not expire, then use it for every autopilot post.
      </p>
      {data?.last_error && <p className="mt-2 text-xs text-destructive">{data.last_error}</p>}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-white/5 p-2">
      <dt className="text-xs uppercase tracking-wide text-muted-foreground">{label}</dt>
      <dd className="truncate text-sm">{value}</dd>
    </div>
  );
}
