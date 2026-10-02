import { createFileRoute } from "@tanstack/react-router";
import { staticHead } from "@/lib/route-head";
import Auth from "@/pages/Auth";

export const Route = createFileRoute("/signup")({
  head: () => staticHead("/signup"),
  component: Auth,
});
