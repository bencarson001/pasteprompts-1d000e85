CREATE TABLE public.fb_cron_nonces (token uuid PRIMARY KEY DEFAULT gen_random_uuid(), created_at timestamptz NOT NULL DEFAULT now());
REVOKE ALL ON public.fb_cron_nonces FROM PUBLIC, anon, authenticated;
GRANT ALL ON public.fb_cron_nonces TO service_role;
ALTER TABLE public.fb_cron_nonces ENABLE ROW LEVEL SECURITY;

SELECT cron.unschedule('fb-autopilot-daily-post');
SELECT cron.schedule('fb-autopilot-daily-post', '15 1,2 * * *', $cmd$
  DELETE FROM public.fb_cron_nonces WHERE created_at < now() - interval '1 hour';
  WITH n AS (INSERT INTO public.fb_cron_nonces DEFAULT VALUES RETURNING token)
  SELECT net.http_post(
    url := 'https://iwmljuoplkqyhdygajpi.supabase.co/functions/v1/post-daily-fb',
    headers := jsonb_build_object('Content-Type','application/json',
      'apikey','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml3bWxqdW9wbGtxeWhkeWdhanBpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzczODM2NzEsImV4cCI6MjA5Mjk1OTY3MX0.jWAwvkdfu2fsai2NIPRQlNAezqKHb3jgiGLQ5Fk7zo0',
      'x-cron-nonce', (SELECT token::text FROM n)),
    body := '{"scheduled": true}'::jsonb);
$cmd$);