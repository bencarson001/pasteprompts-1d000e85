import { createFileRoute } from "@tanstack/react-router";
import Legal from "@/pages/Legal";

export const Route = createFileRoute("/terms")({
  component: () => <Legal docType="terms" />,
});
