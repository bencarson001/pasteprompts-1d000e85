import { createFileRoute, redirect } from "@tanstack/react-router";

// Old /explore links should land on the real browse page instead of a "not found" page.
export const Route = createFileRoute("/explore")({
  beforeLoad: () => {
    throw redirect({ to: "/browse", statusCode: 301 });
  },
});
