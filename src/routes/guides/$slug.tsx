import { createFileRoute, notFound } from "@tanstack/react-router";
import { dynamicHead, humanize } from "@/lib/route-head";
import { guideQueryOptions } from "@/lib/guide-query";
import GuideDetail from "@/pages/GuideDetail";

export const Route = createFileRoute("/guides/$slug")({
  loader: async ({ params, context }) => {
    const guide = await context.queryClient.ensureQueryData(guideQueryOptions(params.slug));
    if (!guide) throw notFound();
    return guide;
  },
  head: ({ params, loaderData: guide }) => {
    return guide
      ? dynamicHead(guide.title, guide.description, `/guides/${guide.slug}`)
      : dynamicHead(humanize(params.slug), "Read this Paste Prompts guide to getting better results from AI tools.", `/guides/${params.slug}`, true);
  },
  component: GuideDetail,
  errorComponent: () => <main role="alert">This guide could not be loaded. Please try again.</main>,
  notFoundComponent: () => <main>Guide not found. <a href="/guides">Browse guides</a></main>,
});
