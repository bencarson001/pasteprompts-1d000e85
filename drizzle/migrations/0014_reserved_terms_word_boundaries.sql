CREATE OR REPLACE FUNCTION public.profile_text_is_reserved(_txt text, _strict boolean)
RETURNS boolean LANGUAGE sql IMMUTABLE SET search_path = public AS $$
  SELECT CASE WHEN _txt IS NULL OR _txt = '' THEN false
  ELSE EXISTS (
    SELECT 1 FROM regexp_split_to_table(translate(lower(_txt),'01!|34@5$78','oiiieaasstb'), '[^a-z]+') AS t(w)
    WHERE w <> '' AND (
      CASE WHEN _strict THEN
        (w ~ 'adm[i]*n' AND w !~ 'badminton' AND w !~ '^administrat')
        OR (w ~ 'mod' AND w !~ '^(model|models|modelling|modeling|modern|modest|mode|modes|modular|module|modules|modify|modified)$')
      ELSE
        w ~ '^(admin|admins|adm[i]*n|administrator|administrators|mod|mods|moderator|moderators|sysadmin|siteadmin)$'
      END
    )
  ) END
$$;