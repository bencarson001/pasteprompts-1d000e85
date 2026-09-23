GRANT SELECT ON public.subscriptions TO authenticated;
GRANT ALL ON public.subscriptions TO service_role;
CREATE UNIQUE INDEX IF NOT EXISTS subscriptions_stripe_subscription_id_key ON public.subscriptions(stripe_subscription_id);