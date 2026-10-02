import { createFileRoute } from "@tanstack/react-router";
import { staticHead } from "@/lib/route-head";
import Legal from "@/pages/Legal";

export const Route = createFileRoute("/privacy-policy")({
  head: () => staticHead("/legal/privacy"),
  component: () => <Legal docType="privacy" />,
});
