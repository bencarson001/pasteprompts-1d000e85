import { createFileRoute } from "@tanstack/react-router";
import { staticHead } from "@/lib/route-head";
import Trust from "@/pages/Trust";

export const Route = createFileRoute("/trust")({
  head: () => staticHead("/trust"),
  component: Trust,
});
