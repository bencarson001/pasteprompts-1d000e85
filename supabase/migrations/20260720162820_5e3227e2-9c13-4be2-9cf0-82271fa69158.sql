
ALTER TABLE public.fb_post_pool ADD COLUMN IF NOT EXISTS image_url text;

CREATE TABLE IF NOT EXISTS public.fb_autopilot_cycles (
  cycle_id integer PRIMARY KEY,
  attach_media boolean NOT NULL DEFAULT true,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.fb_autopilot_cycles TO authenticated;
GRANT ALL ON public.fb_autopilot_cycles TO service_role;

ALTER TABLE public.fb_autopilot_cycles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage cycles"
  ON public.fb_autopilot_cycles
  FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER trg_fb_autopilot_cycles_touch
  BEFORE UPDATE ON public.fb_autopilot_cycles
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- Seed cycle rows for any existing cycles
INSERT INTO public.fb_autopilot_cycles (cycle_id)
SELECT DISTINCT cycle_id FROM public.fb_post_pool
ON CONFLICT (cycle_id) DO NOTHING;
