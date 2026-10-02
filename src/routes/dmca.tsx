import { createFileRoute } from "@tanstack/react-router";
import { staticHead } from "@/lib/route-head";
import DMCA from "@/pages/DMCA";

export const Route = createFileRoute("/dmca")({
  head: () => staticHead("/dmca"),
  component: DMCA,
});
