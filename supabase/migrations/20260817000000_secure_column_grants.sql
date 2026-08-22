-- Migration: Security review resolution for prompt_versions, output_showcases, and profiles
-- 1. Ensure prompt_versions table has strict column grants and RLS enforcement
ALTER TABLE IF EXISTS public.prompt_versions ENABLE ROW LEVEL SECURITY;

-- Revoke raw public/anon SELECT on body column directly to prevent accidental disclosure outside RPC/RLS
REVOKE ALL ON public.prompt_versions FROM anon;
GRANT SELECT (id, prompt_id, version_number, changelog, created_at) ON public.prompt_versions TO anon;
GRANT SELECT ON public.prompt_versions TO authenticated;

-- Ensure RLS on prompt_versions only allows prompt creators and admins to read the full row (including body)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'prompt_versions' AND policyname = 'Creators and admins can view prompt versions'
  ) THEN
    CREATE POLICY "Creators and admins can view prompt versions"
      ON public.prompt_versions FOR SELECT
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM public.prompts p
          WHERE p.id = prompt_versions.prompt_id
          AND (p.creator_id = auth.uid() OR EXISTS (
            SELECT 1 FROM public.profiles prof WHERE prof.id = auth.uid() AND prof.is_admin = true
          ))
        )
      );
  END IF;
END $$;

-- 2. Confirm output_showcases community visibility and enforce mutation security
ALTER TABLE IF EXISTS public.output_showcases ENABLE ROW LEVEL SECURITY;

-- 3. Ensure financial columns on profiles remain protected
REVOKE ALL ON TABLE public.profiles FROM anon;
GRANT SELECT (id, handle, display_name, bio, avatar_url, banner_url, website_url, twitter_handle, is_creator, created_at) ON public.profiles TO anon;
GRANT SELECT ON public.profiles TO authenticated;
