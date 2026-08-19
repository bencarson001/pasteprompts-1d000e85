-- Replacement upload balance
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS upload_credits integer NOT NULL DEFAULT 0;

-- Resolve the site admin (owner) used to attribute unowned platform prompts
CREATE OR REPLACE FUNCTION public.default_admin_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT user_id FROM public.user_roles WHERE role = 'admin' ORDER BY user_id LIMIT 1
$$;

-- Upload rules: attribute unowned prompts to admin, fixed pricing,
-- admins unlimited, replacement credits extend the monthly quota.
CREATE OR REPLACE FUNCTION public.enforce_prompt_rules()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_tier public.membership_tier;
  v_quota int;
  v_used int;
  v_credits int;
BEGIN
  -- Unowned (platform) prompts belong to the site admin.
  IF NEW.creator_id IS NULL THEN
    NEW.creator_id := public.default_admin_id();
  END IF;

  -- Fixed single-prompt pricing.
  IF NEW.is_free THEN
    NEW.price_pence := 0;
  ELSE
    NEW.price_pence := 25;
  END IF;

  -- Admins (site owner) have unlimited uploads.
  IF public.has_role(NEW.creator_id, 'admin') THEN
    RETURN NEW;
  END IF;

  v_tier := public.get_creator_tier(NEW.creator_id);
  v_quota := public.tier_quota(v_tier);
  SELECT COUNT(*) INTO v_used FROM public.prompts
    WHERE creator_id = NEW.creator_id AND created_at >= date_trunc('month', now());
  SELECT COALESCE(upload_credits, 0) INTO v_credits FROM public.profiles WHERE id = NEW.creator_id;

  IF v_used >= v_quota THEN
    IF v_credits > 0 THEN
      -- Consume a replacement credit earned from a removed listing.
      UPDATE public.profiles SET upload_credits = upload_credits - 1, updated_at = now()
        WHERE id = NEW.creator_id;
    ELSE
      RAISE EXCEPTION 'Monthly upload limit reached for your membership tier (% of % used).', v_used, v_quota
        USING ERRCODE = 'check_violation';
    END IF;
  END IF;

  RETURN NEW;
END $$;

-- Remove paid creator listings with no sales for 2 months; grant a replacement credit.
CREATE OR REPLACE FUNCTION public.cleanup_stale_creator_prompts()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE n integer := 0; r record;
BEGIN
  FOR r IN
    SELECT p.id, p.creator_id
    FROM public.prompts p
    WHERE p.status = 'approved'
      AND p.is_free = false
      AND p.sales_count = 0
      AND p.created_at < now() - interval '2 months'
      AND NOT public.has_role(p.creator_id, 'admin')
  LOOP
    UPDATE public.prompts SET status = 'rejected', featured = false, updated_at = now() WHERE id = r.id;
    UPDATE public.profiles SET upload_credits = upload_credits + 1, updated_at = now() WHERE id = r.creator_id;
    n := n + 1;
  END LOOP;
  RETURN n;
END $$;

-- Refresh helper: prune ONLY platform (admin-owned) prompts with the fewest views.
-- Never removes prompts uploaded by real creators, and never removes anything with sales.
CREATE OR REPLACE FUNCTION public.prune_platform_prompts(_remove_count integer)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE n integer := 0;
BEGIN
  IF _remove_count IS NULL OR _remove_count <= 0 THEN RETURN 0; END IF;
  WITH victims AS (
    SELECT p.id FROM public.prompts p
    WHERE p.status = 'approved'
      AND p.sales_count = 0
      AND public.has_role(p.creator_id, 'admin')
    ORDER BY p.views ASC, p.trending_score ASC, p.created_at ASC
    LIMIT _remove_count
  )
  DELETE FROM public.prompts WHERE id IN (SELECT id FROM victims);
  GET DIAGNOSTICS n = ROW_COUNT;
  RETURN n;
END $$;

-- Lock down the maintenance routines to the system/admin only.
REVOKE ALL ON FUNCTION public.cleanup_stale_creator_prompts() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.prune_platform_prompts(integer) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.cleanup_stale_creator_prompts() TO service_role;
GRANT EXECUTE ON FUNCTION public.prune_platform_prompts(integer) TO service_role;