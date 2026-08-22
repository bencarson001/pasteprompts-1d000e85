DROP POLICY IF EXISTS "Creators insert own prompts" ON public.prompts;

CREATE POLICY "Creators insert own prompts"
ON public.prompts
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = creator_id);