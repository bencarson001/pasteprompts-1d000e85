import { createFileRoute } from "@tanstack/react-router";
import { staticHead } from "@/lib/route-head";
import CreatorsDiscovery from "@/pages/CreatorsDiscovery";

export const Route = createFileRoute("/creators/")({
  head: () => staticHead("/creators"),
  component: CreatorsDiscovery,
});
