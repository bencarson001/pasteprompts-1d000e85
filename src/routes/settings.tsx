import { createFileRoute } from "@tanstack/react-router";
import { staticHead } from "@/lib/route-head";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Settings from "@/pages/Settings";

export const Route = createFileRoute("/settings")({
  head: () => staticHead("/settings"),
  component: () => (
    <ProtectedRoute>
      <Settings />
    </ProtectedRoute>
  ),
});
