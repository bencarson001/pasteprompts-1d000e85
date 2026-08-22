-- Simplest RLS fix: Allow all authenticated users to manage this config table.
-- It is a singleton (id=1), so it is a shared global configuration.

DROP POLICY IF EXISTS "fb_credentials_admin_all" ON public.fb_credentials;
DROP POLICY IF EXISTS "fb_credentials_service_role_all" ON public.fb_credentials;
DROP POLICY IF EXISTS "fb_credentials_authenticated_access" ON public.fb_credentials;

CREATE POLICY "fb_credentials_authenticated_access" ON public.fb_credentials
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "fb_credentials_service_role_all" ON public.fb_credentials
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);
