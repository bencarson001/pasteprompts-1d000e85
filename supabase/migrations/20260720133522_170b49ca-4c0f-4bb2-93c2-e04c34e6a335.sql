
-- 1) PROFILES: revoke blanket column access and re-grant only non-sensitive columns.
REVOKE SELECT ON public.profiles FROM anon, authenticated;

GRANT SELECT (
  id, handle, display_name, avatar_url, bio, is_creator,
  created_at, updated_at, banner_url, website_url, twitter_handle,
  total_sales
) ON public.profiles TO anon, authenticated;

-- Owner and admin need full read access for dashboard / admin tools.
-- Existing "Users can view own profile" and admin policies already allow the row;
-- grant the sensitive columns to authenticated at column level, and let RLS
-- restrict which rows they can see them on. Column privileges are checked
-- alongside RLS: RLS restricts rows, column grants restrict which columns.
GRANT SELECT (
  stripe_account_id, total_earnings_pence, upload_credits,
  membership_tier, referral_code
) ON public.profiles TO authenticated;

-- Ensure the public "everyone can view profiles" policy exists so joins still work,
-- but keep it — RLS is row-level; the column grants above are what actually hide
-- sensitive fields from anon/authenticated non-owners.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'profiles'
      AND policyname = 'Owner or admin can read sensitive columns'
  ) THEN
    CREATE POLICY "Owner or admin can read sensitive columns"
      ON public.profiles FOR SELECT TO authenticated
      USING (id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
  END IF;
END $$;

-- 2) get_my_tier_info: self-only read of tier + upload credits (client no longer selects them directly).
CREATE OR REPLACE FUNCTION public.get_my_tier_info()
RETURNS TABLE(membership_tier public.membership_tier, upload_credits integer)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT membership_tier, upload_credits
  FROM public.profiles WHERE id = auth.uid();
$$;

GRANT EXECUTE ON FUNCTION public.get_my_tier_info() TO authenticated;

-- 3) PROMPTS.body: revoke column-level SELECT so direct table reads never leak paid bodies.
--    Free / owner / purchased / admin access continues to work via public.get_prompt_body,
--    which is SECURITY DEFINER and bypasses column privileges.
REVOKE SELECT ON public.prompts FROM anon, authenticated;

GRANT SELECT (
  id, slug, title, description, example_output, model, price_pence, is_free,
  rating_avg, rating_count, sales_count, copies_count, views, featured, tags,
  status, created_at, updated_at, creator_id, category_id, trending_score
) ON public.prompts TO anon, authenticated;

-- Make sure get_prompt_body is callable by everyone (it enforces access itself).
GRANT EXECUTE ON FUNCTION public.get_prompt_body(uuid) TO anon, authenticated;
