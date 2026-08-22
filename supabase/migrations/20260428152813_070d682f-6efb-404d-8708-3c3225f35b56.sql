
-- Internal trigger functions should not be exposed to API users
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.touch_updated_at() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.recompute_prompt_rating() FROM PUBLIC, anon, authenticated;
