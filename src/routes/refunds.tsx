import { createFileRoute } from "@tanstack/react-router";
import { staticHead } from "@/lib/route-head";
import Legal from "@/pages/Legal";

export const Route = createFileRoute("/refunds")({
  head: () => staticHead("/legal/refunds"),
  component: () => <Legal docType="refunds" />,
});
