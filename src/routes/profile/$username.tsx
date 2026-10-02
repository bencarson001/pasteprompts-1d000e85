import { createFileRoute } from "@tanstack/react-router";
import { dynamicHead, humanize } from "@/lib/route-head";
import UserProfile from "@/pages/UserProfile";

export const Route = createFileRoute("/profile/$username")({
  head: ({ params }) => dynamicHead(`${humanize(params.username)} — Creator Profile`, `View ${humanize(params.username)}'s published AI prompts and creator profile on Paste Prompts.`, `/creators/${params.username}`),
  component: UserProfile,
});
