import { createFileRoute } from "@tanstack/react-router";
import UserProfile from "@/pages/UserProfile";

export const Route = createFileRoute("/creators/$handle")({
  component: UserProfile,
});
