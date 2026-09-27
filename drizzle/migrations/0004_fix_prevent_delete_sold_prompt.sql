CREATE OR REPLACE FUNCTION public.prevent_delete_sold_prompt()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF auth.uid() IS NOT NULL AND NOT public.has_role(auth.uid(), 'admin')
     AND EXISTS (SELECT 1 FROM public.purchases WHERE prompt_id = OLD.id) THEN
    RAISE EXCEPTION 'This prompt has buyers, so it can''t be deleted. Contact support to have it unlisted.'
      USING ERRCODE = 'check_violation';
  END IF;
  RETURN OLD;
END $$;