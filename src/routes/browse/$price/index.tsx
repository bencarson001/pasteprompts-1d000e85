import { createFileRoute } from "@tanstack/react-router";
import { staticHead } from "@/lib/route-head";
import Browse from "@/pages/Browse";

export const Route = createFileRoute("/browse/$price/")({
  head: ({ params }) => staticHead(`/browse/${params.price}`),
  component: Browse,
});
