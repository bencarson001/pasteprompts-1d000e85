import { createFileRoute } from "@tanstack/react-router";
import { staticHead } from "@/lib/route-head";
import Contact from "@/pages/Contact";

export const Route = createFileRoute("/contact")({
  head: () => staticHead("/contact"),
  component: Contact,
});
