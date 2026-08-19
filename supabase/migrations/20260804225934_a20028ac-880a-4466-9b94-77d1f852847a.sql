CREATE TABLE public.fb_groups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id text NOT NULL UNIQUE,
  name text NOT NULL DEFAULT '',
  active boolean NOT NULL DEFAULT true,
  last_posted_at timestamptz,
  last_error text,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.fb_groups TO authenticated;
GRANT ALL ON public.fb_groups TO service_role;

ALTER TABLE public.fb_groups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage facebook groups"
ON public.fb_groups FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));