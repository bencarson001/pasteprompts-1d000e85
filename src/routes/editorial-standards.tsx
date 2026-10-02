import { createFileRoute } from "@tanstack/react-router";
import EditorialStandards from "@/pages/EditorialStandards";

export const Route = createFileRoute("/editorial-standards")({
  component: EditorialStandards,
});
