import { createFileRoute } from "@tanstack/react-router";
import CreatorsDiscovery from "@/pages/CreatorsDiscovery";

export const Route = createFileRoute("/creators/")({
  component: CreatorsDiscovery,
});
