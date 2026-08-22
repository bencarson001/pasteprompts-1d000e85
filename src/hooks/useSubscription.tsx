import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface SubscriptionRow {
  status: string;
  price_id: string;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
}

function currentEnvironment(): "sandbox" | "live" {
  const token = import.meta.env.VITE_PAYMENTS_CLIENT_TOKEN as string | undefined;
  return token?.startsWith("pk_live_") ? "live" : "sandbox";
}

const ACTIVE = ["active", "trialing", "past_due"];

export function useSubscription() {
  const { user } = useAuth();
  const env = currentEnvironment();

  const query = useQuery({
    queryKey: ["subscription", user?.id, env],
    enabled: !!user?.id,
    queryFn: async (): Promise<SubscriptionRow | null> => {
      const { data } = await supabase
        .from("subscriptions")
        .select("status, price_id, current_period_end, cancel_at_period_end")
        .eq("user_id", user!.id)
        .eq("environment", env)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      return (data as SubscriptionRow | null) ?? null;
    },
  });

  const profileQuery = useQuery({
    queryKey: ["my-profile-tier", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data } = await supabase
        .from("profiles")
        .select("membership_tier, total_sales")
        .eq("id", user!.id)
        .maybeSingle();
      return data;
    },
  });

  // Realtime: refetch when this user's subscription changes.
  useEffect(() => {
    if (!user?.id) return;
    const channel = supabase
      .channel(`subscription-${user.id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "subscriptions", filter: `user_id=eq.${user.id}` },
        () => {
          query.refetch();
          profileQuery.refetch();
        },
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const sub = query.data ?? null;
  const periodActive = !sub?.current_period_end || new Date(sub.current_period_end) > new Date();
  
  const profile = profileQuery.data ?? null;
  const dbTier = profile?.membership_tier as string | undefined;
  const isDbProOrPlatinum = dbTier === "pro" || dbTier === "platinum" || (profile?.total_sales ?? 0) >= 5;

  const isPro = isDbProOrPlatinum || (!!sub && periodActive && (
    ACTIVE.includes(sub.status) || (sub.status === "canceled" && periodActive)
  ));

  return {
    subscription: sub,
    isPro,
    isLoading: query.isLoading || profileQuery.isLoading,
    refetch: async () => {
      await Promise.all([query.refetch(), profileQuery.refetch()]);
    },
  };
}
