import { createFileRoute } from "@tanstack/react-router";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Dashboard from "@/pages/Dashboard";

export const Route = createFileRoute("/dashboard")({
  component: () => (
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  ),
});
