-- Protect prompt body: only free, purchased, owned, or admin can read it
REVOKE SELECT (body) ON public.prompts FROM anon, authenticated;

CREATE OR REPLACE FUNCTION public.get_prompt_body(_prompt_id uuid)
RETURNS text
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT p.body
  FROM public.prompts p
  WHERE p.id = _prompt_id
    AND (
      p.is_free
      OR p.creator_id = auth.uid()
      OR public.has_purchased(auth.uid(), p.id)
      OR public.has_role(auth.uid(), 'admin')
    )
$$;

-- Counter increments (bypass RLS safely)
CREATE OR REPLACE FUNCTION public.increment_prompt_views(_prompt_id uuid)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE public.prompts SET views = views + 1 WHERE id = _prompt_id AND status = 'approved';
$$;

CREATE OR REPLACE FUNCTION public.increment_prompt_copies(_prompt_id uuid)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE public.prompts SET copies_count = copies_count + 1 WHERE id = _prompt_id AND status = 'approved';
$$;

-- Trending recompute used by the maintenance job
CREATE OR REPLACE FUNCTION public.recompute_trending()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE n integer;
BEGIN
  UPDATE public.prompts SET trending_score =
    (sales_count * 3) + (views * 0.1) + (rating_avg * copies_count * 0.01)
  WHERE status = 'approved';
  GET DIAGNOSTICS n = ROW_COUNT;
  RETURN n;
END $$;

GRANT EXECUTE ON FUNCTION public.get_prompt_body(uuid) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.increment_prompt_views(uuid) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.increment_prompt_copies(uuid) TO anon, authenticated;

-- Ensure a settings row exists
INSERT INTO public.settings (id, commission_percent) VALUES (1, 20) ON CONFLICT (id) DO NOTHING;