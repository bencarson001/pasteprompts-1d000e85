DROP POLICY IF EXISTS "Allow authenticated users to upload prompt images" ON storage.objects;
CREATE POLICY "Allow authenticated users to upload prompt images"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'prompts' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users update own prompt images"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'prompts' AND (storage.foldername(name))[1] = auth.uid()::text)
WITH CHECK (bucket_id = 'prompts' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users delete own prompt images"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'prompts' AND (storage.foldername(name))[1] = auth.uid()::text);

REVOKE SELECT (user_id) ON public.output_showcases FROM anon, authenticated;

REVOKE SELECT (body) ON public.prompt_versions FROM anon, authenticated;