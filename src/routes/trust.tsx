import { createFileRoute } from "@tanstack/react-router";
import Trust from "@/pages/Trust";

export const Route = createFileRoute("/trust")({
  component: Trust,
});
