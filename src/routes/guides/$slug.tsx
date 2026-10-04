import { createFileRoute } from "@tanstack/react-router";
import { dynamicHead, humanize } from "@/lib/route-head";
import { getGuide } from "@/lib/guides";
import GuideDetail from "@/pages/GuideDetail";

export const Route = createFileRoute("/guides/$slug")({
  head: ({ params }) => {
    const guide = getGuide(params.slug);
    return guide
      ? dynamicHead(guide.title, guide.description, `/guides/${params.slug}`)
      : dynamicHead(humanize(params.slug), "Read this Paste Prompts guide to getting better results from AI tools.", `/guides/${params.slug}`, true);
  },
  component: GuideDetail,
});
