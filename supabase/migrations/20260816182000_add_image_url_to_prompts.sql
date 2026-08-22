-- Add image_url to prompts table
ALTER TABLE public.prompts 
ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Create public prompts storage bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'prompts', 
  'prompts', 
  true, 
  10485760, -- 10MB limit
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO UPDATE 
SET public = true, 
    file_size_limit = 10485760, 
    allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

-- Set up RLS policies on storage.objects for the prompts bucket
DO $$ 
BEGIN
  -- 1. Anyone can view public prompt images
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Public Read Access on Prompts Bucket'
  ) THEN
    CREATE POLICY "Public Read Access on Prompts Bucket"
      ON storage.objects FOR SELECT TO public
      USING (bucket_id = 'prompts');
  END IF;

  -- 2. Authenticated users can upload prompt images
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Allow authenticated users to upload prompt images'
  ) THEN
    CREATE POLICY "Allow authenticated users to upload prompt images"
      ON storage.objects FOR INSERT TO authenticated
      WITH CHECK (bucket_id = 'prompts');
  END IF;

  -- 3. Authenticated users can update prompt images
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Allow authenticated users to update prompt images'
  ) THEN
    CREATE POLICY "Allow authenticated users to update prompt images"
      ON storage.objects FOR UPDATE TO authenticated
      USING (bucket_id = 'prompts')
      WITH CHECK (bucket_id = 'prompts');
  END IF;

  -- 4. Authenticated users can delete prompt images
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Allow authenticated users to delete prompt images'
  ) THEN
    CREATE POLICY "Allow authenticated users to delete prompt images"
      ON storage.objects FOR DELETE TO authenticated
      USING (bucket_id = 'prompts');
  END IF;
END $$;
