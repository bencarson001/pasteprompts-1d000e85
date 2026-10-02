import { createFileRoute } from "@tanstack/react-router";
import Legal from "@/pages/Legal";

export const Route = createFileRoute("/privacy")({
  component: () => <Legal docType="privacy" />,
});
