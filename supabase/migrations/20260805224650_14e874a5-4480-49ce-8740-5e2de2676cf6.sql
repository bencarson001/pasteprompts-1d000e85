CREATE TABLE IF NOT EXISTS public.fb_credentials (
  id integer PRIMARY KEY DEFAULT 1,
  page_id text,
  page_access_token text,
  user_access_token text,
  token_type text NOT NULL DEFAULT 'long_lived',
  expires_at timestamptz,
  page_name text,
  last_checked_at timestamptz,
  last_error text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT fb_credentials_singleton CHECK (id = 1)
);

GRANT ALL ON public.fb_credentials TO service_role;

ALTER TABLE public.fb_credentials ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "fb_credentials_admin_all" ON public.fb_credentials;
CREATE POLICY "fb_credentials_admin_all" ON public.fb_credentials
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

INSERT INTO public.fb_credentials (id) VALUES (1) ON CONFLICT (id) DO NOTHING;