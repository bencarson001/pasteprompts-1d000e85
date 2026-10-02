import { createFileRoute } from "@tanstack/react-router";
import { staticHead } from "@/lib/route-head";
import Glossary from "@/pages/Glossary";

export const Route = createFileRoute("/glossary")({
  head: () => staticHead("/glossary"),
  component: Glossary,
});
