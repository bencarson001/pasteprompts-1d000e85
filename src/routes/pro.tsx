import { createFileRoute } from "@tanstack/react-router";
import Pro from "@/pages/Pro";

export const Route = createFileRoute("/pro")({
  component: Pro,
});
