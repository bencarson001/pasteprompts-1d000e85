-- Column-level SELECT only works when there is no table-wide SELECT grant.
-- Revoke the blanket grant, then re-grant SELECT on every column except body.
REVOKE SELECT ON public.prompt_versions FROM anon, authenticated;
GRANT SELECT (id, prompt_id, version, changelog, created_at) ON public.prompt_versions TO anon, authenticated;