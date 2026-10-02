import { createFileRoute } from "@tanstack/react-router";
import Legal from "@/pages/Legal";

export const Route = createFileRoute("/cookies")({
  component: () => <Legal docType="cookies" />,
});
