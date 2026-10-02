import { createFileRoute } from "@tanstack/react-router";
import { staticHead } from "@/lib/route-head";
import Legal from "@/pages/Legal";

export const Route = createFileRoute("/cookies")({
  head: () => staticHead("/legal/cookies"),
  component: () => <Legal docType="cookies" />,
});
