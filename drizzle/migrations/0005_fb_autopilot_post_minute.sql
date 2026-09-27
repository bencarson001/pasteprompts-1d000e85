ALTER TABLE public.fb_autopilot_schedule ADD COLUMN IF NOT EXISTS post_minute integer NOT NULL DEFAULT 0;
ALTER TABLE public.fb_autopilot_schedule DROP CONSTRAINT IF EXISTS fb_autopilot_schedule_minute;
ALTER TABLE public.fb_autopilot_schedule ADD CONSTRAINT fb_autopilot_schedule_minute CHECK (post_minute BETWEEN 0 AND 55 AND post_minute % 5 = 0);
SELECT cron.alter_job(20, schedule := '*/5 * * * *');