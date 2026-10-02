import { createFileRoute } from "@tanstack/react-router";
import { dynamicHead } from "@/lib/route-head";
import Browse from "@/pages/Browse";

export const Route = createFileRoute("/browse/$price/")({
  // Intermediate browse wizard step: noindex, matching the page's <SEO>.
  head: ({ params }) =>
    dynamicHead(
      "Browse AI prompts",
      "Browse AI prompts by price, platform and category. Find free and 49p prompts for ChatGPT, Claude, Gemini, Midjourney and more.",
      `/browse/${params.price}`,
      true,
    ),
  component: Browse,
});
