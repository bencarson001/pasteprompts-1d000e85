-- ============ TikTok automation settings (single config row) ============
CREATE TABLE public.tiktok_automation_settings (
  id text PRIMARY KEY DEFAULT 'default',
  enabled boolean NOT NULL DEFAULT false,
  schedule_mode text NOT NULL DEFAULT 'interval', -- 'interval' | 'slots' | 'both'
  interval_hours integer NOT NULL DEFAULT 24,
  time_slots jsonb NOT NULL DEFAULT '[]'::jsonb,   -- [{ "day": "daily"|0-6, "time": "14:30" }]
  content_source text NOT NULL DEFAULT 'random',   -- 'random' | 'prompts' | 'tips'
  posts_per_run integer NOT NULL DEFAULT 1,
  slide_count integer NOT NULL DEFAULT 4,
  caption_instructions text,
  image_style text NOT NULL DEFAULT 'bold modern gradient, high contrast, clean typography friendly',
  timezone text NOT NULL DEFAULT 'Europe/London',
  auto_post boolean NOT NULL DEFAULT true,         -- if false, videos are generated but held for manual review
  last_run_at timestamptz,
  next_run_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT one_row CHECK (id = 'default')
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.tiktok_automation_settings TO authenticated;
GRANT ALL ON public.tiktok_automation_settings TO service_role;
ALTER TABLE public.tiktok_automation_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage tiktok settings"
  ON public.tiktok_automation_settings FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER trg_tiktok_settings_updated
  BEFORE UPDATE ON public.tiktok_automation_settings
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

INSERT INTO public.tiktok_automation_settings (id) VALUES ('default')
  ON CONFLICT (id) DO NOTHING;

-- ============ Generated TikTok videos / job queue ============
CREATE TABLE public.tiktok_videos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  status text NOT NULL DEFAULT 'queued', -- queued|generating|ready|posting|posted|failed|cancelled
  source_type text NOT NULL DEFAULT 'tip', -- 'prompt' | 'tip'
  prompt_id uuid REFERENCES public.prompts(id) ON DELETE SET NULL,
  topic text,
  caption text,
  slides jsonb NOT NULL DEFAULT '[]'::jsonb,    -- [{ "text": "...", "image_url": "..." }]
  video_url text,
  tiktok_post_id text,
  result jsonb,
  error text,
  scheduled_for timestamptz NOT NULL DEFAULT now(),
  posted_at timestamptz,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_tiktok_videos_status ON public.tiktok_videos(status, scheduled_for);
CREATE INDEX idx_tiktok_videos_created ON public.tiktok_videos(created_at DESC);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.tiktok_videos TO authenticated;
GRANT ALL ON public.tiktok_videos TO service_role;
ALTER TABLE public.tiktok_videos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage tiktok videos"
  ON public.tiktok_videos FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER trg_tiktok_videos_updated
  BEFORE UPDATE ON public.tiktok_videos
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();