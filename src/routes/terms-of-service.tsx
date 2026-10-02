import { createFileRoute } from "@tanstack/react-router";
import Legal from "@/pages/Legal";

export const Route = createFileRoute("/terms-of-service")({
  component: () => <Legal docType="terms" />,
});
