import { createFileRoute } from "@tanstack/react-router";
import { staticHead } from "@/lib/route-head";
import Legal from "@/pages/Legal";

export const Route = createFileRoute("/terms-of-service")({
  head: () => staticHead("/legal/terms"),
  component: () => <Legal docType="terms" />,
});
