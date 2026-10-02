import { createFileRoute } from "@tanstack/react-router";
import Legal from "@/pages/Legal";

export const Route = createFileRoute("/disclaimer")({
  component: () => <Legal docType="disclaimer" />,
});
