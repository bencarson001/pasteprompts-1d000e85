import { createFileRoute } from "@tanstack/react-router";
import { staticHead } from "@/lib/route-head";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import EditProfile from "@/pages/EditProfile";

export const Route = createFileRoute("/profile/edit")({
  head: () => staticHead("/profile/edit"),
  component: () => (
    <ProtectedRoute>
      <EditProfile />
    </ProtectedRoute>
  ),
});
