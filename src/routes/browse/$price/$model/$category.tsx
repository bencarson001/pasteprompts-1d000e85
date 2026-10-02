import { createFileRoute } from "@tanstack/react-router";
import { staticHead } from "@/lib/route-head";
import Browse from "@/pages/Browse";

export const Route = createFileRoute("/browse/$price/$model/$category")({
  head: ({ params }) => staticHead(`/browse/${params.price}/${params.model}/${params.category}`),
  component: Browse,
});
