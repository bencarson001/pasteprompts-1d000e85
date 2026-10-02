import { createFileRoute } from "@tanstack/react-router";
import { staticHead } from "@/lib/route-head";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Messages from "@/pages/Messages";

export const Route = createFileRoute("/messages")({
  head: () => staticHead("/messages"),
  component: () => (
    <ProtectedRoute>
      <Messages />
    </ProtectedRoute>
  ),
});
