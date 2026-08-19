-- 1) Restrict sensitive profile columns from public/authenticated reads.
--    Owners read earnings/stripe/referral via get_my_billing() (security definer).
REVOKE SELECT ON public.profiles FROM anon, authenticated;
GRANT SELECT (
  id, handle, display_name, bio, avatar_url, is_creator, total_sales,
  created_at, updated_at, banner_url, website_url, twitter_handle
) ON public.profiles TO anon, authenticated;

-- 2) Restrict the paid prompt body column. All other columns remain public.
--    Body is served via get_prompt_body() which enforces purchase/owner/admin.
REVOKE SELECT ON public.prompts FROM anon, authenticated;
GRANT SELECT (
  id, slug, model, tags, price_pence, is_free, status, category_id,
  title, description, example_output, creator_id,
  featured, views, sales_count, copies_count, rating_avg, rating_count,
  trending_score, version, created_at, updated_at
) ON public.prompts TO anon, authenticated;

-- 3) Purchases: stop exposing buyer identity + Stripe session IDs to creators.
DROP POLICY IF EXISTS "Creators view sales of their prompts" ON public.purchases;

CREATE OR REPLACE FUNCTION public.get_my_sales()
RETURNS TABLE(
  id uuid,
  prompt_id uuid,
  prompt_title text,
  amount_pence integer,
  creator_earning_pence integer,
  is_free boolean,
  created_at timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT pu.id, pu.prompt_id, p.title, pu.amount_pence, pu.creator_earning_pence,
         pu.is_free, pu.created_at
  FROM public.purchases pu
  JOIN public.prompts p ON p.id = pu.prompt_id
  WHERE p.creator_id = auth.uid()
  ORDER BY pu.created_at DESC
  LIMIT 100;
$$;

REVOKE EXECUTE ON FUNCTION public.get_my_sales() FROM anon;
GRANT EXECUTE ON FUNCTION public.get_my_sales() TO authenticated;

-- 4) has_active_subscription: only reveal own (or admin) subscription status.
CREATE OR REPLACE FUNCTION public.has_active_subscription(user_uuid uuid, check_env text DEFAULT 'live')
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF user_uuid <> auth.uid() AND NOT public.has_role(auth.uid(), 'admin') THEN
    RETURN false;
  END IF;
  RETURN EXISTS (
    SELECT 1 FROM public.subscriptions
    WHERE user_id = user_uuid
      AND environment = check_env
      AND (
        (status IN ('active', 'trialing', 'past_due') AND (current_period_end IS NULL OR current_period_end > now()))
        OR (status = 'canceled' AND current_period_end > now())
      )
  );
END;
$$;

REVOKE EXECUTE ON FUNCTION public.has_active_subscription(uuid, text) FROM anon;
GRANT EXECUTE ON FUNCTION public.has_active_subscription(uuid, text) TO authenticated;

-- 5) Enforce the Pro selling gate server-side on prompt inserts.
DROP POLICY IF EXISTS "Creators insert own prompts" ON public.prompts;
CREATE POLICY "Creators insert own prompts"
  ON public.prompts FOR INSERT
  WITH CHECK (
    auth.uid() = creator_id
    AND (
      public.has_active_subscription(auth.uid(), 'live')
      OR public.has_active_subscription(auth.uid(), 'sandbox')
      OR public.has_role(auth.uid(), 'admin')
    )
  );

-- 6) Lock down internal / trigger functions from direct client execution.
REVOKE EXECUTE ON FUNCTION public.recompute_trending() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.recompute_prompt_rating() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.sync_showcase_votes() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.touch_updated_at() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.get_my_billing() FROM anon;
GRANT EXECUTE ON FUNCTION public.get_my_billing() TO authenticated;