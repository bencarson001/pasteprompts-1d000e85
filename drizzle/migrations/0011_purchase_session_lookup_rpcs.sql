CREATE OR REPLACE FUNCTION public.get_my_purchase_by_session(_session_id text)
RETURNS TABLE(id uuid, title text, slug text)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT pu.id, pr.title, pr.slug FROM public.purchases pu
  LEFT JOIN public.prompts pr ON pr.id = pu.prompt_id
  WHERE pu.stripe_session_id = _session_id AND pu.buyer_id = auth.uid()
  LIMIT 1
$$;
REVOKE ALL ON FUNCTION public.get_my_purchase_by_session(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_my_purchase_by_session(text) TO authenticated;

CREATE OR REPLACE FUNCTION public.admin_test_purchase_ids()
RETURNS SETOF uuid
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN RAISE EXCEPTION 'forbidden'; END IF;
  RETURN QUERY SELECT id FROM public.purchases WHERE is_free = false AND stripe_session_id LIKE 'cs_test_%';
END $$;
REVOKE ALL ON FUNCTION public.admin_test_purchase_ids() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_test_purchase_ids() TO authenticated;