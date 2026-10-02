import { createFileRoute } from "@tanstack/react-router";
import { staticHead } from "@/lib/route-head";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Library from "@/pages/Library";

export const Route = createFileRoute("/library")({
  head: () => staticHead("/library"),
  component: () => (
    <ProtectedRoute>
      <Library />
    </ProtectedRoute>
  ),
});
