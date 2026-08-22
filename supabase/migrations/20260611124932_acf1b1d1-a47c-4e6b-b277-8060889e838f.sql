-- ============================================================
-- 1. SECURITY: profiles — hide financial / identity columns
-- ============================================================
REVOKE SELECT ON public.profiles FROM anon, authenticated;
GRANT SELECT (
  id, handle, display_name, bio, avatar_url, is_creator,
  total_sales, created_at, updated_at, banner_url, website_url, twitter_handle
) ON public.profiles TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.get_my_billing()
RETURNS TABLE (
  total_earnings_pence integer,
  total_sales integer,
  stripe_account_id text,
  referral_code text
)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT total_earnings_pence, total_sales, stripe_account_id, referral_code
  FROM public.profiles WHERE id = auth.uid();
$$;
GRANT EXECUTE ON FUNCTION public.get_my_billing() TO authenticated;

-- ============================================================
-- 2. SECURITY: prompts — hide paid body column from direct reads
-- ============================================================
REVOKE SELECT ON public.prompts FROM anon, authenticated;
GRANT SELECT (
  id, creator_id, category_id, slug, title, description, example_output,
  model, tags, price_pence, is_free, status, featured, views, sales_count,
  copies_count, rating_avg, rating_count, trending_score, created_at, updated_at, version
) ON public.prompts TO anon, authenticated;

-- ============================================================
-- 3. SECURITY: validate free-purchase inserts
-- ============================================================
DROP POLICY IF EXISTS "Users insert own free purchases" ON public.purchases;
CREATE POLICY "Users insert own free purchases" ON public.purchases
FOR INSERT TO authenticated
WITH CHECK (
  auth.uid() = buyer_id
  AND is_free = true
  AND amount_pence = 0
  AND EXISTS (
    SELECT 1 FROM public.prompts
    WHERE id = prompt_id AND is_free = true AND status = 'approved'
  )
);

-- ============================================================
-- 4. Pro subscriptions
-- ============================================================
CREATE TABLE public.subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  stripe_subscription_id text NOT NULL UNIQUE,
  stripe_customer_id text NOT NULL,
  product_id text NOT NULL,
  price_id text NOT NULL,
  status text NOT NULL DEFAULT 'active',
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancel_at_period_end boolean DEFAULT false,
  environment text NOT NULL DEFAULT 'sandbox',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX idx_subscriptions_stripe_id ON public.subscriptions(stripe_subscription_id);

GRANT SELECT ON public.subscriptions TO authenticated;
GRANT ALL ON public.subscriptions TO service_role;

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own subscription"
  ON public.subscriptions FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage subscriptions"
  ON public.subscriptions FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

CREATE TRIGGER subscriptions_touch_updated_at
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE OR REPLACE FUNCTION public.has_active_subscription(
  user_uuid uuid,
  check_env text DEFAULT 'live'
)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.subscriptions
    WHERE user_id = user_uuid
    AND environment = check_env
    AND (
      (status IN ('active', 'trialing', 'past_due') AND (current_period_end IS NULL OR current_period_end > now()))
      OR (status = 'canceled' AND current_period_end > now())
    )
  );
$$;
GRANT EXECUTE ON FUNCTION public.has_active_subscription(uuid, text) TO authenticated;