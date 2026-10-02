import { createFileRoute } from "@tanstack/react-router";
import { dynamicHead, humanize } from "@/lib/route-head";
import Category from "@/pages/Category";

export const Route = createFileRoute("/category/$slug")({
  head: ({ params }) => dynamicHead(`${humanize(params.slug)} AI Prompts`, `Browse ${humanize(params.slug).toLowerCase()} AI prompts on Paste Prompts. Compare real listings and open each prompt's full marketplace page.`, `/category/${params.slug}`),
  component: Category,
});
