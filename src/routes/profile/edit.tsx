import { createFileRoute } from "@tanstack/react-router";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import EditProfile from "@/pages/EditProfile";

export const Route = createFileRoute("/profile/edit")({
  component: () => (
    <ProtectedRoute>
      <EditProfile />
    </ProtectedRoute>
  ),
});
