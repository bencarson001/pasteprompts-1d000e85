-- Defensive lock-down: ensure the full prompt content column on prompt_versions
-- is never readable by anon/authenticated roles (matches prompts.body protection).
-- Historical prompt bodies must only be reachable via SECURITY DEFINER functions.
REVOKE SELECT (body) ON public.prompt_versions FROM anon;
REVOKE SELECT (body) ON public.prompt_versions FROM authenticated;

-- Ensure metadata columns remain readable (idempotent re-grant).
GRANT SELECT (id, prompt_id, version, changelog, created_at) ON public.prompt_versions TO anon, authenticated;

-- TikTok media bucket: writes are performed exclusively by the service role
-- (edge functions) which bypasses RLS. Add an explicit deny-by-omission note by
-- ensuring no permissive write policy exists for anon/authenticated. We add a
-- restrictive admin-only write policy set so intent is documented and any future
-- non-service-role write path is correctly scoped to admins only.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects'
      AND policyname = 'tiktok-media admin write'
  ) THEN
    CREATE POLICY "tiktok-media admin write"
      ON storage.objects FOR INSERT TO authenticated
      WITH CHECK (bucket_id = 'tiktok-media' AND public.has_role(auth.uid(), 'admin'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects'
      AND policyname = 'tiktok-media admin update'
  ) THEN
    CREATE POLICY "tiktok-media admin update"
      ON storage.objects FOR UPDATE TO authenticated
      USING (bucket_id = 'tiktok-media' AND public.has_role(auth.uid(), 'admin'))
      WITH CHECK (bucket_id = 'tiktok-media' AND public.has_role(auth.uid(), 'admin'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects'
      AND policyname = 'tiktok-media admin delete'
  ) THEN
    CREATE POLICY "tiktok-media admin delete"
      ON storage.objects FOR DELETE TO authenticated
      USING (bucket_id = 'tiktok-media' AND public.has_role(auth.uid(), 'admin'));
  END IF;
END $$;