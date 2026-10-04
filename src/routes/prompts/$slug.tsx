import { createFileRoute } from "@tanstack/react-router";
import { staticHead } from "@/lib/route-head";
import { getLandingContent } from "@/lib/landingContent";
import { fetchPrompts } from "@/lib/queries";
import Landing from "@/pages/Landing";

export const Route = createFileRoute("/prompts/$slug")({
  // Prefetch the real listing so prompt links are in the first HTML response
  // (same query key as Landing's useQuery). Failures fall back to client fetch.
  loader: async ({ params, context }) => {
    const content = getLandingContent(params.slug);
    if (!content) return;
    try {
      await context.queryClient.ensureQueryData({
        queryKey: ["landing-prompts", params.slug],
        queryFn: () => fetchPrompts(content.filters),
      });
    } catch {
      /* client will retry */
    }
  },
  head: ({ params }) => {
    if (!getLandingContent(params.slug)) {
      return { meta: [{ title: "Page not found | Paste Prompts" }, { name: "robots", content: "noindex, follow" }] };
    }
    return staticHead(`/prompts/${params.slug}`);
  },
  component: Landing,
});
