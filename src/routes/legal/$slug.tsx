import { createFileRoute } from "@tanstack/react-router";
import { staticHead } from "@/lib/route-head";
import Legal from "@/pages/Legal";

export const Route = createFileRoute("/legal/$slug")({
  head: ({ params }) => staticHead(`/legal/${params.slug}`),
  component: Legal,
});
