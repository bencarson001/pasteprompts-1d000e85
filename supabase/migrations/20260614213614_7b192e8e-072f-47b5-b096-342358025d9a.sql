
-- Admin: list members (reads protected columns via definer)
CREATE OR REPLACE FUNCTION public.admin_list_users(_q text DEFAULT NULL)
RETURNS TABLE(
  id uuid, handle text, display_name text, avatar_url text,
  is_creator boolean, membership_tier membership_tier,
  total_sales integer, total_earnings_pence integer, created_at timestamptz
)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT p.id, p.handle, p.display_name, p.avatar_url, p.is_creator,
         p.membership_tier, p.total_sales, p.total_earnings_pence, p.created_at
  FROM public.profiles p
  WHERE public.has_role(auth.uid(), 'admin')
    AND (_q IS NULL OR _q = '' OR p.handle ILIKE '%'||_q||'%' OR p.display_name ILIKE '%'||_q||'%')
  ORDER BY p.created_at DESC
  LIMIT 200;
$$;

-- Admin: set a member's tier
CREATE OR REPLACE FUNCTION public.admin_set_user_tier(_user_id uuid, _tier membership_tier)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Not authorised';
  END IF;
  UPDATE public.profiles SET membership_tier = _tier, updated_at = now() WHERE id = _user_id;
END $$;

-- Admin: set a member's creator status
CREATE OR REPLACE FUNCTION public.admin_set_user_creator(_user_id uuid, _is_creator boolean)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Not authorised';
  END IF;
  UPDATE public.profiles SET is_creator = _is_creator, updated_at = now() WHERE id = _user_id;
END $$;

GRANT EXECUTE ON FUNCTION public.admin_list_users(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_set_user_tier(uuid, membership_tier) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_set_user_creator(uuid, boolean) TO authenticated;

-- Admin: view all referrals
DROP POLICY IF EXISTS "Admins read referrals" ON public.referrals;
CREATE POLICY "Admins read referrals" ON public.referrals
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Close membership self-upgrade: members may only edit safe profile fields
REVOKE UPDATE ON public.profiles FROM authenticated;
REVOKE UPDATE ON public.profiles FROM anon;
GRANT UPDATE (handle, display_name, bio, avatar_url, banner_url, website_url, twitter_handle, is_creator, updated_at)
  ON public.profiles TO authenticated;
