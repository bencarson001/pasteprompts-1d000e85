import { createFileRoute } from "@tanstack/react-router";
import { staticHead } from "@/lib/route-head";
import About from "@/pages/About";

export const Route = createFileRoute("/about")({
  head: () => staticHead("/about"),
  component: About,
});
