DROP POLICY IF EXISTS "Follows are public" ON public.follows;

CREATE POLICY "Users see their own follow relationships"
ON public.follows FOR SELECT TO authenticated
USING (follower_id = auth.uid() OR creator_id = auth.uid());

CREATE OR REPLACE FUNCTION public.creator_follower_count(_creator_id uuid)
RETURNS integer
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COUNT(*)::int FROM public.follows WHERE creator_id = _creator_id;
$$;

GRANT EXECUTE ON FUNCTION public.creator_follower_count(uuid) TO anon, authenticated;