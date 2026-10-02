import { createFileRoute } from "@tanstack/react-router";
import { staticHead } from "@/lib/route-head";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Admin from "@/pages/Admin";

export const Route = createFileRoute("/admin")({
  head: () => staticHead("/admin"),
  component: () => (
    <ProtectedRoute requireAdmin>
      <Admin />
    </ProtectedRoute>
  ),
});
