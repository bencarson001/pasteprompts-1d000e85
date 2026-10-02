import { createFileRoute } from "@tanstack/react-router";
import { dynamicHead, humanize } from "@/lib/route-head";
import PromptDetail from "@/pages/PromptDetail";

export const Route = createFileRoute("/prompt/$category/$slug")({
  head: ({ params }) => dynamicHead(humanize(params.slug), `View this AI prompt on Paste Prompts, including what it does, which AI tool it's written for and how to use it.`, `/prompt/${params.slug}`),
  component: PromptDetail,
});
