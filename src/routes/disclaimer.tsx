import { createFileRoute } from "@tanstack/react-router";
import { staticHead } from "@/lib/route-head";
import Legal from "@/pages/Legal";

export const Route = createFileRoute("/disclaimer")({
  head: () => staticHead("/legal/disclaimer"),
  component: () => <Legal docType="disclaimer" />,
});
