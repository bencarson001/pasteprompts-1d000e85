DROP POLICY IF EXISTS "Public Read Access on Prompts Bucket" ON storage.objects;
CREATE POLICY "Users can list own files in prompts bucket"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'prompts' AND (storage.foldername(name))[1] = (select auth.uid()::text));