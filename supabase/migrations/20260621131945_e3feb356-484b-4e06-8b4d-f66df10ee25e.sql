ALTER TABLE public.tiktok_automation_settings
  ADD COLUMN IF NOT EXISTS cron_secret text NOT NULL DEFAULT gen_random_uuid()::text;