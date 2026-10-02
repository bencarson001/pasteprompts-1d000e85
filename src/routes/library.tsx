import { createFileRoute } from "@tanstack/react-router";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Library from "@/pages/Library";

export const Route = createFileRoute("/library")({
  component: () => (
    <ProtectedRoute>
      <Library />
    </ProtectedRoute>
  ),
});
