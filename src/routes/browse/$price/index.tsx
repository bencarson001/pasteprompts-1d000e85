import { createFileRoute } from "@tanstack/react-router";
import Browse from "@/pages/Browse";

export const Route = createFileRoute("/browse/$price/")({
  component: Browse,
});
