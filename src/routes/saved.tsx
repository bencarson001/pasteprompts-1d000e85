import { createFileRoute } from "@tanstack/react-router";
import { staticHead } from "@/lib/route-head";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Saved from "@/pages/Saved";

export const Route = createFileRoute("/saved")({
  head: () => staticHead("/saved"),
  component: () => (
    <ProtectedRoute>
      <Saved />
    </ProtectedRoute>
  ),
});
