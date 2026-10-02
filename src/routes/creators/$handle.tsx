import { createFileRoute } from "@tanstack/react-router";
import { dynamicHead, humanize } from "@/lib/route-head";
import UserProfile from "@/pages/UserProfile";

export const Route = createFileRoute("/creators/$handle")({
  head: ({ params }) => dynamicHead(`${humanize(params.handle)} — Creator Profile`, `View ${humanize(params.handle)}'s published AI prompts and creator profile on Paste Prompts.`, `/creators/${params.handle}`),
  component: UserProfile,
});
