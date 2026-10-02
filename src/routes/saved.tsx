import { createFileRoute } from "@tanstack/react-router";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Saved from "@/pages/Saved";

export const Route = createFileRoute("/saved")({
  component: () => (
    <ProtectedRoute>
      <Saved />
    </ProtectedRoute>
  ),
});
