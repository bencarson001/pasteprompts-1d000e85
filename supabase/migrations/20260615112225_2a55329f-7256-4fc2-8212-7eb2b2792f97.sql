-- 1) Prevent creators from self-approving prompts (force review for non-admins)
CREATE OR REPLACE FUNCTION public.enforce_prompt_rules()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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

  -- Admins (site owner) have unlimited uploads and may set status directly.
  IF public.has_role(NEW.creator_id, 'admin') THEN
    RETURN NEW;
  END IF;

  -- Non-admin creators can never self-approve: every new prompt must be
  -- reviewed (AI/human) before it can appear in the marketplace.
  IF TG_OP = 'INSERT' THEN
    NEW.status := 'pending';
  ELSIF TG_OP = 'UPDATE' AND NEW.status IS DISTINCT FROM OLD.status THEN
    -- Creators cannot change their own moderation status; preserve the
    -- previously set (admin/AI-controlled) status.
    NEW.status := OLD.status;
  END IF;

  v_tier := public.get_creator_tier(NEW.creator_id);
  v_quota := public.tier_quota(v_tier);
  SELECT COUNT(*) INTO v_used FROM public.prompts
    WHERE creator_id = NEW.creator_id AND created_at >= date_trunc('month', now());
  SELECT COALESCE(upload_credits, 0) INTO v_credits FROM public.profiles WHERE id = NEW.creator_id;

  IF TG_OP = 'INSERT' AND v_used >= v_quota THEN
    IF v_credits > 0 THEN
      UPDATE public.profiles SET upload_credits = upload_credits - 1, updated_at = now()
        WHERE id = NEW.creator_id;
    ELSE
      RAISE EXCEPTION 'Monthly upload limit reached for your membership tier (% of % used).', v_used, v_quota
        USING ERRCODE = 'check_violation';
    END IF;
  END IF;

  RETURN NEW;
END $function$;

-- 2) Revoke column-level read access to historical prompt bodies, mirroring
--    the prompts.body restriction (paid content must go through the paywall RPC).
REVOKE SELECT (body) ON public.prompt_versions FROM anon, authenticated;