import { createFileRoute } from "@tanstack/react-router";
import { staticHead } from "@/lib/route-head";
import OAuthConsent from "@/pages/OAuthConsent";

export const Route = createFileRoute("/.lovable/oauth/consent")({
  head: () => staticHead("/.lovable/oauth/consent"),
  component: OAuthConsent,
});
