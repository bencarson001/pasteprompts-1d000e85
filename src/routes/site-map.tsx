import { createFileRoute } from "@tanstack/react-router";
import { staticHead } from "@/lib/route-head";
import SiteMap from "@/pages/SiteMap";

export const Route = createFileRoute("/site-map")({
  head: () => staticHead("/site-map"),
  component: SiteMap,
});
