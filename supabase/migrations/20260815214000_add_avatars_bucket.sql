-- Create public avatars bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars', 
  'avatars', 
  true, 
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO UPDATE 
SET public = true, 
    file_size_limit = 5242880, 
    allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

-- Set up RLS policies on storage.objects for the avatars bucket
-- 1. Anyone can view public avatars
CREATE POLICY "Public Read Access on Avatars"
  ON storage.objects FOR SELECT TO public
  USING (bucket_id = 'avatars');

-- 2. Authenticated users can upload their own avatar file
CREATE POLICY "Allow authenticated users to upload avatars"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'avatars' 
    AND (auth.uid()::text = (storage.foldername(name))[1] OR auth.uid()::text = substring(name from '^[^/]+'))
  );

-- 3. Authenticated users can update/replace their own avatar file
CREATE POLICY "Allow authenticated users to update their own avatars"
  ON storage.objects FOR UPDATE TO authenticated
  USING (
    bucket_id = 'avatars' 
    AND (auth.uid()::text = (storage.foldername(name))[1] OR auth.uid()::text = substring(name from '^[^/]+'))
  )
  WITH CHECK (
    bucket_id = 'avatars' 
    AND (auth.uid()::text = (storage.foldername(name))[1] OR auth.uid()::text = substring(name from '^[^/]+'))
  );

-- 4. Authenticated users can delete their own avatar file
CREATE POLICY "Allow authenticated users to delete their own avatars"
  ON storage.objects FOR DELETE TO authenticated
  USING (
    bucket_id = 'avatars' 
    AND (auth.uid()::text = (storage.foldername(name))[1] OR auth.uid()::text = substring(name from '^[^/]+'))
  );
