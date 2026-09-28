CREATE TABLE public.creator_payouts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  amount_pence integer NOT NULL CHECK (amount_pence > 0),
  method text NOT NULL DEFAULT 'bank',
  reference text,
  note text,
  paid_by uuid,
  paid_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.creator_payouts TO authenticated;
GRANT ALL ON public.creator_payouts TO service_role;
ALTER TABLE public.creator_payouts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Creators see own payouts, admins all" ON public.creator_payouts FOR SELECT TO authenticated
  USING (creator_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
CREATE INDEX ON public.creator_payouts (creator_id);

CREATE TABLE public.payout_details (
  user_id uuid PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  method text NOT NULL DEFAULT 'paypal' CHECK (method IN ('paypal','bank','other')),
  details text NOT NULL CHECK (char_length(details) BETWEEN 3 AND 500),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.payout_details TO authenticated;
GRANT ALL ON public.payout_details TO service_role;
ALTER TABLE public.payout_details ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own payout details read" ON public.payout_details FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Own payout details insert" ON public.payout_details FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Own payout details update" ON public.payout_details FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "Own payout details delete" ON public.payout_details FOR DELETE TO authenticated USING (user_id = auth.uid());

-- Live (non-test) earnings per creator, from purchase records.
CREATE OR REPLACE FUNCTION public.creator_earned_pence(_creator uuid)
RETURNS integer LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT coalesce(sum(pu.creator_earning_pence),0)::int
  FROM purchases pu JOIN prompts p ON p.id = pu.prompt_id
  WHERE p.creator_id = _creator AND NOT pu.is_free
    AND coalesce(pu.stripe_session_id,'') NOT LIKE 'cs_test_%';
$$;
REVOKE EXECUTE ON FUNCTION public.creator_earned_pence(uuid) FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION public.get_my_payout_summary()
RETURNS TABLE(earned_pence integer, paid_pence integer, owed_pence integer, paid_sales integer, last_paid_at timestamptz)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  WITH e AS (SELECT public.creator_earned_pence(auth.uid()) AS v),
       pd AS (SELECT coalesce(sum(amount_pence),0)::int AS v, max(paid_at) AS last FROM creator_payouts WHERE creator_id = auth.uid()),
       s AS (SELECT count(*)::int AS v FROM purchases pu JOIN prompts p ON p.id = pu.prompt_id
             WHERE p.creator_id = auth.uid() AND NOT pu.is_free AND coalesce(pu.stripe_session_id,'') NOT LIKE 'cs_test_%')
  SELECT e.v, pd.v, greatest(e.v - pd.v, 0), s.v, pd.last FROM e, pd, s WHERE auth.uid() IS NOT NULL;
$$;
REVOKE EXECUTE ON FUNCTION public.get_my_payout_summary() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_my_payout_summary() TO authenticated;

CREATE OR REPLACE FUNCTION public.admin_creator_balances()
RETURNS TABLE(creator_id uuid, handle text, display_name text, avatar_url text, email text, membership_tier membership_tier,
  paid_sales integer, earned_pence integer, paid_pence integer, owed_pence integer, last_paid_at timestamptz,
  payout_method text, payout_details text)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN RAISE EXCEPTION 'Admins only'; END IF;
  RETURN QUERY
  WITH sales AS (
    SELECT p.creator_id AS cid, count(*)::int AS n, sum(pu.creator_earning_pence)::int AS earned
    FROM purchases pu JOIN prompts p ON p.id = pu.prompt_id
    WHERE NOT pu.is_free AND coalesce(pu.stripe_session_id,'') NOT LIKE 'cs_test_%'
    GROUP BY p.creator_id),
  paid AS (SELECT cp.creator_id AS cid, sum(amount_pence)::int AS total, max(paid_at) AS last FROM creator_payouts cp GROUP BY cp.creator_id)
  SELECT pr.id, pr.handle, pr.display_name, pr.avatar_url, u.email::text, pr.membership_tier,
    coalesce(s.n,0), coalesce(s.earned,0), coalesce(pd.total,0),
    greatest(coalesce(s.earned,0) - coalesce(pd.total,0), 0), pd.last, d.method, d.details
  FROM profiles pr
  LEFT JOIN sales s ON s.cid = pr.id
  LEFT JOIN paid pd ON pd.cid = pr.id
  LEFT JOIN payout_details d ON d.user_id = pr.id
  LEFT JOIN auth.users u ON u.id = pr.id
  WHERE pr.is_creator OR s.cid IS NOT NULL OR pd.cid IS NOT NULL
  ORDER BY greatest(coalesce(s.earned,0) - coalesce(pd.total,0), 0) DESC, pr.handle;
END; $$;
REVOKE EXECUTE ON FUNCTION public.admin_creator_balances() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_creator_balances() TO authenticated;

CREATE OR REPLACE FUNCTION public.admin_record_payout(_creator_id uuid, _amount_pence integer, _method text, _reference text, _note text)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE owed integer; new_id uuid;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN RAISE EXCEPTION 'Admins only'; END IF;
  IF _amount_pence IS NULL OR _amount_pence <= 0 THEN RAISE EXCEPTION 'Amount must be more than zero'; END IF;
  owed := public.creator_earned_pence(_creator_id) - (SELECT coalesce(sum(amount_pence),0) FROM creator_payouts WHERE creator_id = _creator_id);
  IF _amount_pence > owed THEN RAISE EXCEPTION 'Amount is more than the £% this creator is owed', to_char(greatest(owed,0)/100.0,'FM999990.00'); END IF;
  INSERT INTO creator_payouts (creator_id, amount_pence, method, reference, note, paid_by)
  VALUES (_creator_id, _amount_pence, coalesce(nullif(trim(_method),''),'bank'), nullif(trim(_reference),''), nullif(trim(_note),''), auth.uid())
  RETURNING id INTO new_id;
  INSERT INTO admin_audit (admin_id, action, target_type, target_id, detail)
  VALUES (auth.uid(), 'record_payout', 'profile', _creator_id::text, jsonb_build_object('amount_pence', _amount_pence, 'reference', _reference));
  INSERT INTO notifications (user_id, type, title, body, link)
  VALUES (_creator_id, 'payout', 'You''ve been paid 💸', 'A payout of £' || to_char(_amount_pence/100.0,'FM999990.00') || ' has been sent to you.', '/dashboard');
  RETURN new_id;
END; $$;
REVOKE EXECUTE ON FUNCTION public.admin_record_payout(uuid,integer,text,text,text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_record_payout(uuid,integer,text,text,text) TO authenticated;