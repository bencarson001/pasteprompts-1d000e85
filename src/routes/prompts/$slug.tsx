import { createFileRoute } from "@tanstack/react-router";
import { staticHead } from "@/lib/route-head";
import Landing from "@/pages/Landing";

export const Route = createFileRoute("/prompts/$slug")({
  head: ({ params }) => staticHead(`/prompts/${params.slug}`),
  component: Landing,
});
