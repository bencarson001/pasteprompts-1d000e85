import { createFileRoute } from "@tanstack/react-router";
import { staticHead } from "@/lib/route-head";
import EditorialStandards from "@/pages/EditorialStandards";

export const Route = createFileRoute("/editorial-standards")({
  head: () => staticHead("/editorial-standards"),
  component: EditorialStandards,
});
