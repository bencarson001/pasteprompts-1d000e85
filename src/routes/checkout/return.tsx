import { createFileRoute } from "@tanstack/react-router";
import { staticHead } from "@/lib/route-head";
import CheckoutReturn from "@/pages/CheckoutReturn";

export const Route = createFileRoute("/checkout/return")({
  head: () => staticHead("/checkout/return"),
  component: CheckoutReturn,
});
