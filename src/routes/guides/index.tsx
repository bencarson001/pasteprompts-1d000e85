import { createFileRoute } from "@tanstack/react-router";
import { staticHead } from "@/lib/route-head";
import Guides from "@/pages/Guides";

export const Route = createFileRoute("/guides/")({
  head: () => staticHead("/guides"),
  component: Guides,
});
