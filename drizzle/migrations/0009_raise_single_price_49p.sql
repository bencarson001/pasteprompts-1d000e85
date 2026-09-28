CREATE OR REPLACE FUNCTION public.tier_earning_pence(_tier membership_tier)
 RETURNS integer LANGUAGE sql IMMUTABLE SET search_path TO 'public'
AS $$ SELECT CASE _tier WHEN 'platinum' THEN 43 WHEN 'pro' THEN 35 ELSE 29 END; $$;

CREATE OR REPLACE FUNCTION public.tier_fee_pence(_tier membership_tier)
 RETURNS integer LANGUAGE sql IMMUTABLE SET search_path TO 'public'
AS $$ SELECT 49 - public.tier_earning_pence(_tier); $$;

CREATE OR REPLACE FUNCTION public.enforce_prompt_rules()
 RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $function$
DECLARE
  v_tier public.membership_tier;
  v_quota int;
  v_used int;
  v_credits int;
BEGIN
  IF NEW.creator_id IS NULL THEN
    NEW.creator_id := public.default_admin_id();
  END IF;
  IF NEW.is_free THEN NEW.price_pence := 0; ELSE NEW.price_pence := 49; END IF;
  IF public.has_role(NEW.creator_id, 'admin') THEN
    RETURN NEW;
  END IF;
  IF TG_OP = 'INSERT' THEN
    NEW.status := 'pending';
  ELSIF TG_OP = 'UPDATE' AND NEW.status IS DISTINCT FROM OLD.status THEN
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

CREATE OR REPLACE FUNCTION public.protect_prompt_update_columns()
 RETURNS trigger LANGUAGE plpgsql SET search_path TO 'public'
AS $function$
BEGIN
  IF current_user NOT IN ('authenticated', 'anon') THEN
    RETURN NEW;
  END IF;
  IF public.has_role(auth.uid(), 'admin') THEN
    RETURN NEW;
  END IF;
  NEW.creator_id     := OLD.creator_id;
  NEW.status         := OLD.status;
  NEW.featured       := OLD.featured;
  NEW.views          := OLD.views;
  NEW.sales_count    := OLD.sales_count;
  NEW.copies_count   := OLD.copies_count;
  NEW.rating_avg     := OLD.rating_avg;
  NEW.rating_count   := OLD.rating_count;
  NEW.trending_score := OLD.trending_score;
  NEW.created_at     := OLD.created_at;
  IF NEW.is_free THEN NEW.price_pence := 0; ELSE NEW.price_pence := 49; END IF;
  RETURN NEW;
END $function$;

UPDATE public.prompts SET price_pence = 49 WHERE is_free = false AND price_pence <> 49;