import { createFileRoute } from "@tanstack/react-router";
import { staticHead } from "@/lib/route-head";
import DMCA from "@/pages/DMCA";

export const Route = createFileRoute("/takedown")({
  head: () => staticHead("/dmca"),
  component: DMCA,
});
