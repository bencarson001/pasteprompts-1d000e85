import { createFileRoute } from "@tanstack/react-router";
import { staticHead } from "@/lib/route-head";
import Index from "@/pages/Index";

export const Route = createFileRoute("/")({
  head: () => staticHead("/"),
  component: Index,
});
