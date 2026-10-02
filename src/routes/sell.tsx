import { createFileRoute } from "@tanstack/react-router";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Sell from "@/pages/Sell";

export const Route = createFileRoute("/sell")({
  component: () => (
    <ProtectedRoute>
      <Sell />
    </ProtectedRoute>
  ),
});
