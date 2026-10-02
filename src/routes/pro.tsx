import { createFileRoute } from "@tanstack/react-router";
import { staticHead } from "@/lib/route-head";
import Pro from "@/pages/Pro";

export const Route = createFileRoute("/pro")({
  head: () => staticHead("/pro"),
  component: Pro,
});
