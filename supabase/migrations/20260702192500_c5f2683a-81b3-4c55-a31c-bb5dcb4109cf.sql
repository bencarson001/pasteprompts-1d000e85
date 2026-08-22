-- Ensure prompt_versions.body is never readable directly from the table.
-- Access to prompt bodies must go exclusively through SECURITY DEFINER RPCs.
REVOKE SELECT (body) ON public.prompt_versions FROM authenticated;
REVOKE SELECT (body) ON public.prompt_versions FROM anon;

-- Re-affirm that only the safe, non-sensitive columns are directly selectable.
GRANT SELECT (id, prompt_id, version, changelog, created_at) ON public.prompt_versions TO authenticated;
GRANT ALL ON public.prompt_versions TO service_role;