-- 1. Collections: force non-admin creators to 'pending' on insert and prevent
--    them from self-approving on update (mirrors enforce_prompt_rules).
CREATE OR REPLACE FUNCTION public.enforce_collection_rules()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Admins may set status directly.
  IF public.has_role(auth.uid(), 'admin') THEN
    RETURN NEW;
  END IF;

  IF TG_OP = 'INSERT' THEN
    NEW.status := 'pending';
  ELSIF TG_OP = 'UPDATE' AND NEW.status IS DISTINCT FROM OLD.status THEN
    -- Creators cannot change their own moderation status.
    NEW.status := OLD.status;
  END IF;

  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS enforce_collection_rules_trg ON public.collections;
CREATE TRIGGER enforce_collection_rules_trg
  BEFORE INSERT OR UPDATE ON public.collections
  FOR EACH ROW EXECUTE FUNCTION public.enforce_collection_rules();

-- 2. analytics_events: bound the data anonymous users can insert and replace the
--    always-true INSERT policy with a validating one.
ALTER TABLE public.analytics_events
  ADD CONSTRAINT analytics_events_event_type_chk
    CHECK (event_type IN ('page_view', 'prompt_view')) NOT VALID;
ALTER TABLE public.analytics_events
  ADD CONSTRAINT analytics_events_visitor_id_chk
    CHECK (char_length(visitor_id) <= 64) NOT VALID;
ALTER TABLE public.analytics_events
  ADD CONSTRAINT analytics_events_session_id_chk
    CHECK (session_id IS NULL OR char_length(session_id) <= 64) NOT VALID;
ALTER TABLE public.analytics_events
  ADD CONSTRAINT analytics_events_path_chk
    CHECK (path IS NULL OR char_length(path) <= 512) NOT VALID;
ALTER TABLE public.analytics_events
  ADD CONSTRAINT analytics_events_referrer_chk
    CHECK (referrer IS NULL OR char_length(referrer) <= 1024) NOT VALID;

DROP POLICY IF EXISTS "Anyone can log analytics events" ON public.analytics_events;
CREATE POLICY "Anyone can log analytics events"
  ON public.analytics_events
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    event_type IN ('page_view', 'prompt_view')
    AND char_length(visitor_id) BETWEEN 1 AND 64
    AND (session_id IS NULL OR char_length(session_id) <= 64)
    AND (path IS NULL OR char_length(path) <= 512)
    AND (referrer IS NULL OR char_length(referrer) <= 1024)
  );