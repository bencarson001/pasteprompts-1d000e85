CREATE OR REPLACE FUNCTION public.prevent_delete_sold_prompt()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF current_user IN ('authenticated','anon') AND NOT public.has_role(auth.uid(), 'admin')
     AND EXISTS (SELECT 1 FROM public.purchases WHERE prompt_id = OLD.id) THEN
    RAISE EXCEPTION 'This prompt has buyers, so it can''t be deleted. Contact support to have it unlisted.'
      USING ERRCODE = 'check_violation';
  END IF;
  RETURN OLD;
END $$;
REVOKE EXECUTE ON FUNCTION public.prevent_delete_sold_prompt() FROM PUBLIC, anon, authenticated;
DROP TRIGGER IF EXISTS prevent_delete_sold_prompt ON public.prompts;
CREATE TRIGGER prevent_delete_sold_prompt BEFORE DELETE ON public.prompts
FOR EACH ROW EXECUTE FUNCTION public.prevent_delete_sold_prompt();