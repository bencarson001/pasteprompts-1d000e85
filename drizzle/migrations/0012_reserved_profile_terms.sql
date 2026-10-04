CREATE OR REPLACE FUNCTION public.profile_text_is_reserved(_txt text, _strict boolean)
RETURNS boolean LANGUAGE sql IMMUTABLE SET search_path = public AS $$
  SELECT CASE WHEN _txt IS NULL OR _txt = '' THEN false
  ELSE (
    regexp_replace(translate(lower(_txt),'01!|34@5$78','oiiieaasstb'),'[^a-z]','','g') ~ 'adm[i]*n'
    OR regexp_replace(translate(lower(_txt),'01!|34@5$78','oiiieaasstb'),'[^a-z]','','g') ~ 'moderat'
    OR (_strict AND regexp_replace(translate(lower(_txt),'01!|34@5$78','oiiieaasstb'),'[^a-z]','','g') ~ 'mod')
    OR (NOT _strict AND translate(lower(_txt),'01!|34@5$78','oiiieaasstb') ~ '(^|[^a-z])m[^a-z]*o[^a-z]*d[^a-z]*s?([^a-z]|$)')
  ) END
$$;

CREATE OR REPLACE FUNCTION public.enforce_reserved_profile_terms()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE bad boolean;
BEGIN
  IF public.has_role(NEW.id, 'admin') OR (auth.uid() IS NOT NULL AND public.has_role(auth.uid(), 'admin')) THEN
    RETURN NEW;
  END IF;
  bad := public.profile_text_is_reserved(NEW.handle, true)
      OR public.profile_text_is_reserved(NEW.display_name, true)
      OR public.profile_text_is_reserved(NEW.twitter_handle, true)
      OR public.profile_text_is_reserved(NEW.bio, false)
      OR public.profile_text_is_reserved(NEW.website_url, false);
  IF NOT bad THEN RETURN NEW; END IF;
  IF TG_OP = 'INSERT' THEN
    -- never block sign-up: replace reserved values with neutral ones
    IF public.profile_text_is_reserved(NEW.handle, true) THEN NEW.handle := 'member' || substr(replace(NEW.id::text,'-',''),1,10); END IF;
    IF public.profile_text_is_reserved(NEW.display_name, true) THEN NEW.display_name := 'Member'; END IF;
    IF public.profile_text_is_reserved(NEW.twitter_handle, true) THEN NEW.twitter_handle := NULL; END IF;
    IF public.profile_text_is_reserved(NEW.bio, false) THEN NEW.bio := NULL; END IF;
    IF public.profile_text_is_reserved(NEW.website_url, false) THEN NEW.website_url := NULL; END IF;
    RETURN NEW;
  END IF;
  RAISE EXCEPTION 'The terms admin, mod and moderator (and variations) are reserved for platform administrators.' USING ERRCODE = '22023';
END $$;

DROP TRIGGER IF EXISTS trg_enforce_reserved_profile_terms ON public.profiles;
CREATE TRIGGER trg_enforce_reserved_profile_terms
BEFORE INSERT OR UPDATE OF handle, display_name, bio, website_url, twitter_handle ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.enforce_reserved_profile_terms();

-- clean up existing non-admin profiles that already use reserved terms
UPDATE public.profiles p SET
  handle = CASE WHEN public.profile_text_is_reserved(p.handle, true) THEN 'member' || substr(replace(p.id::text,'-',''),1,10) ELSE p.handle END,
  display_name = CASE WHEN public.profile_text_is_reserved(p.display_name, true) THEN 'Member' ELSE p.display_name END
WHERE NOT public.has_role(p.id, 'admin')
  AND (public.profile_text_is_reserved(p.handle, true) OR public.profile_text_is_reserved(p.display_name, true));