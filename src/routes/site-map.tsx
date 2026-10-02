import { createFileRoute } from "@tanstack/react-router";
import SiteMap from "@/pages/SiteMap";

export const Route = createFileRoute("/site-map")({
  component: SiteMap,
});
