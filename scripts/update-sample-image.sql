// SQL script to generate sample AI images for prompts directly via SQL
-- You can run this in Lovable/Supabase SQL editor, or admin panel

-- Step 1: Update one prompt to test
UPDATE public.prompts
SET image_url = 'https://image.pollinations.ai/prompt/' || replace(replace(title, ' ', '%20'), '&', '%26') || '%20ultra%20detailed%20photorealistic?width=800&height=533&nologo=true'
WHERE id = (
  SELECT id FROM public.prompts 
  WHERE image_url IS NULL 
  ORDER BY created_at DESC 
  LIMIT 1
);
