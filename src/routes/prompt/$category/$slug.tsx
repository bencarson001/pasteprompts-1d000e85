import { createFileRoute } from "@tanstack/react-router";
import { loadPromptHead, promptHead } from "@/lib/prompt-head";
import PromptDetail from "@/pages/PromptDetail";

export const Route = createFileRoute("/prompt/$category/$slug")({
  loader: ({ params }) => loadPromptHead(params.slug),
  head: ({ params, loaderData }) => promptHead(params.slug, loaderData),
  component: PromptDetail,
});
