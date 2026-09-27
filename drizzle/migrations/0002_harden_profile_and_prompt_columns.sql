-- 1. Private profile fields: signed-in users could read every user's earnings, Stripe account, referral code, credits and promo data.
REVOKE SELECT ON public.profiles FROM authenticated;
GRANT SELECT (id, handle, display_name, bio, avatar_url, is_creator, total_sales, created_at, updated_at, banner_url, website_url, twitter_handle, membership_tier) ON public.profiles TO authenticated;

-- 2. Also protect early-bird / promo fields from self-edits.
CREATE OR REPLACE FUNCTION public.protect_profile_sensitive_columns()
 RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $function$
declare
  is_privileged boolean;
  effective_tier text;
begin
  is_privileged :=
    (current_setting('request.jwt.claims', true)::jsonb ->> 'role') = 'service_role'
    or public.has_role(auth.uid(), 'admin');

  if not is_privileged then
    new.is_creator            := old.is_creator;
    new.stripe_account_id     := old.stripe_account_id;
    new.total_sales           := old.total_sales;
    new.total_earnings_pence  := old.total_earnings_pence;
    new.referral_code         := old.referral_code;
    new.membership_tier       := old.membership_tier;
    new.upload_credits        := old.upload_credits;
    new.early_bird_recipient  := old.early_bird_recipient;
    new.early_bird_granted_at := old.early_bird_granted_at;
    new.promo_expires_at      := old.promo_expires_at;

    effective_tier := coalesce(old.membership_tier, 'free');
    if old.promo_expires_at is not null and old.promo_expires_at < now()
       and effective_tier not in ('pro', 'platinum') then
      effective_tier := 'free';
    end if;

    if effective_tier not in ('pro', 'platinum') then
      new.website_url    := old.website_url;
      new.twitter_handle := old.twitter_handle;
      new.banner_url     := old.banner_url;
    end if;
  end if;

  return new;
end;
$function$;

-- 3. Creators could self-approve, feature, re-price or fake stats on their own prompts via direct updates.
CREATE OR REPLACE FUNCTION public.protect_prompt_update_columns()
 RETURNS trigger LANGUAGE plpgsql SECURITY INVOKER SET search_path TO 'public'
AS $function$
BEGIN
  -- Internal counters/triggers run as the function owner or service role; only restrict direct API callers.
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
  -- Fixed pricing rule, same as on insert.
  IF NEW.is_free THEN NEW.price_pence := 0; ELSE NEW.price_pence := 25; END IF;
  RETURN NEW;
END $function$;

REVOKE EXECUTE ON FUNCTION public.protect_prompt_update_columns() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS trg_protect_prompt_update_columns ON public.prompts;
CREATE TRIGGER trg_protect_prompt_update_columns
  BEFORE UPDATE ON public.prompts
  FOR EACH ROW EXECUTE FUNCTION public.protect_prompt_update_columns();