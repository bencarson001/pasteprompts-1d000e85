-- ============ Membership tiers ============
DO $$ BEGIN
  CREATE TYPE public.membership_tier AS ENUM ('free','pro','platinum');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS membership_tier public.membership_tier NOT NULL DEFAULT 'free';

-- Per-tier economics (all single prompts sell at 25p)
CREATE OR REPLACE FUNCTION public.tier_earning_pence(_tier public.membership_tier)
RETURNS integer LANGUAGE sql IMMUTABLE SET search_path = public AS $$
  SELECT CASE _tier WHEN 'platinum' THEN 22 WHEN 'pro' THEN 18 ELSE 15 END;
$$;

CREATE OR REPLACE FUNCTION public.tier_fee_pence(_tier public.membership_tier)
RETURNS integer LANGUAGE sql IMMUTABLE SET search_path = public AS $$
  SELECT 25 - public.tier_earning_pence(_tier);
$$;

CREATE OR REPLACE FUNCTION public.tier_quota(_tier public.membership_tier)
RETURNS integer LANGUAGE sql IMMUTABLE SET search_path = public AS $$
  SELECT CASE _tier WHEN 'platinum' THEN 200 WHEN 'pro' THEN 50 ELSE 15 END;
$$;

CREATE OR REPLACE FUNCTION public.get_creator_tier(_user_id uuid)
RETURNS public.membership_tier LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT COALESCE((SELECT membership_tier FROM public.profiles WHERE id = _user_id), 'free'::public.membership_tier);
$$;

CREATE OR REPLACE FUNCTION public.prompt_uploads_this_month(_user_id uuid)
RETURNS integer LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT COUNT(*)::int FROM public.prompts
  WHERE creator_id = _user_id AND created_at >= date_trunc('month', now());
$$;

-- Enforce fixed price + monthly quota at insert time
CREATE OR REPLACE FUNCTION public.enforce_prompt_rules()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_tier public.membership_tier;
  v_quota int;
  v_used int;
BEGIN
  v_tier := public.get_creator_tier(NEW.creator_id);
  IF NEW.is_free THEN
    NEW.price_pence := 0;
  ELSE
    NEW.price_pence := 25;
  END IF;
  v_quota := public.tier_quota(v_tier);
  SELECT COUNT(*) INTO v_used FROM public.prompts
    WHERE creator_id = NEW.creator_id AND created_at >= date_trunc('month', now());
  IF v_used >= v_quota THEN
    RAISE EXCEPTION 'Monthly upload limit reached for your membership tier (% of % used).', v_used, v_quota
      USING ERRCODE = 'check_violation';
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_enforce_prompt_rules ON public.prompts;
CREATE TRIGGER trg_enforce_prompt_rules
  BEFORE INSERT ON public.prompts
  FOR EACH ROW EXECUTE FUNCTION public.enforce_prompt_rules();

-- ============ error_logs ============
CREATE TABLE IF NOT EXISTS public.error_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  level text NOT NULL DEFAULT 'error',
  message text NOT NULL,
  context jsonb,
  source text,
  user_id uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, DELETE ON public.error_logs TO authenticated;
GRANT INSERT ON public.error_logs TO anon;
GRANT ALL ON public.error_logs TO service_role;
ALTER TABLE public.error_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can log errors" ON public.error_logs FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Admins read error logs" ON public.error_logs FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete error logs" ON public.error_logs FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- ============ admin_audit ============
CREATE TABLE IF NOT EXISTS public.admin_audit (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id uuid NOT NULL,
  action text NOT NULL,
  target_type text,
  target_id text,
  detail jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.admin_audit TO authenticated;
GRANT ALL ON public.admin_audit TO service_role;
ALTER TABLE public.admin_audit ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins read audit" ON public.admin_audit FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins write audit" ON public.admin_audit FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin') AND admin_id = auth.uid());

-- ============ feature_flags ============
CREATE TABLE IF NOT EXISTS public.feature_flags (
  key text PRIMARY KEY,
  enabled boolean NOT NULL DEFAULT false,
  description text,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.feature_flags TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.feature_flags TO authenticated;
GRANT ALL ON public.feature_flags TO service_role;
ALTER TABLE public.feature_flags ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone reads flags" ON public.feature_flags FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins manage flags" ON public.feature_flags FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ============ announcements ============
CREATE TABLE IF NOT EXISTS public.announcements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  body text,
  level text NOT NULL DEFAULT 'info',
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.announcements TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.announcements TO authenticated;
GRANT ALL ON public.announcements TO service_role;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone reads active announcements" ON public.announcements FOR SELECT TO anon, authenticated USING (active OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage announcements" ON public.announcements FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ============ reports ============
CREATE TABLE IF NOT EXISTS public.reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id uuid,
  target_type text NOT NULL,
  target_id text NOT NULL,
  reason text NOT NULL,
  status text NOT NULL DEFAULT 'open',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.reports TO authenticated;
GRANT ALL ON public.reports TO service_role;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users create reports" ON public.reports FOR INSERT TO authenticated WITH CHECK (reporter_id = auth.uid());
CREATE POLICY "Admins read reports" ON public.reports FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update reports" ON public.reports FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ============ scheduled_posts ============
CREATE TABLE IF NOT EXISTS public.scheduled_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  platform text NOT NULL,
  prompt_id uuid,
  topic text,
  caption text NOT NULL,
  media_url text,
  scheduled_at timestamptz NOT NULL DEFAULT now(),
  status text NOT NULL DEFAULT 'scheduled',
  result jsonb,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.scheduled_posts TO authenticated;
GRANT ALL ON public.scheduled_posts TO service_role;
ALTER TABLE public.scheduled_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage scheduled posts" ON public.scheduled_posts FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER trg_scheduled_posts_updated BEFORE UPDATE ON public.scheduled_posts
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();