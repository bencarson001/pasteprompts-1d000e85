import { createFileRoute } from "@tanstack/react-router";
import { dynamicHead, humanize } from "@/lib/route-head";
import GuideDetail from "@/pages/GuideDetail";

export const Route = createFileRoute("/guides/$slug")({
  head: ({ params }) => dynamicHead(humanize(params.slug), `Read this Paste Prompts guide to getting better results from AI tools.`, `/guides/${params.slug}`),
  component: GuideDetail,
});
