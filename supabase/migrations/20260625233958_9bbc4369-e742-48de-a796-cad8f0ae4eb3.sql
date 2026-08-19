ALTER TABLE public.tiktok_automation_settings
  ADD COLUMN IF NOT EXISTS tt_access_token text,
  ADD COLUMN IF NOT EXISTS tt_refresh_token text,
  ADD COLUMN IF NOT EXISTS tt_token_expires_at timestamptz,
  ADD COLUMN IF NOT EXISTS tt_open_id text,
  ADD COLUMN IF NOT EXISTS tt_username text,
  ADD COLUMN IF NOT EXISTS tt_scope text,
  ADD COLUMN IF NOT EXISTS tt_oauth_state text;