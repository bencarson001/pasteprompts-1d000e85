import { createFileRoute } from "@tanstack/react-router";
import DMCA from "@/pages/DMCA";

export const Route = createFileRoute("/takedown")({
  component: DMCA,
});
