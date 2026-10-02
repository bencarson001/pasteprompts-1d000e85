import { createFileRoute } from "@tanstack/react-router";
import { staticHead } from "@/lib/route-head";
import Browse from "@/pages/Browse";

export const Route = createFileRoute("/browse/")({
  head: () => staticHead("/browse"),
  component: Browse,
});
