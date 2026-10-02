import { createFileRoute } from "@tanstack/react-router";
import { staticHead } from "@/lib/route-head";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Sell from "@/pages/Sell";

export const Route = createFileRoute("/sell")({
  head: () => staticHead("/sell"),
  component: () => (
    <ProtectedRoute>
      <Sell />
    </ProtectedRoute>
  ),
});
