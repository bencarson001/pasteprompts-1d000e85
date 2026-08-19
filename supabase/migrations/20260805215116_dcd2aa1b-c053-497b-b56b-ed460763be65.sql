CREATE TABLE public.fb_autopilot_schedule (
  id integer PRIMARY KEY DEFAULT 1,
  enabled boolean NOT NULL DEFAULT true,
  days_of_week integer[] NOT NULL DEFAULT '{0,1,2,3,4,5,6}',
  post_hour integer NOT NULL DEFAULT 18,
  start_date date NOT NULL DEFAULT current_date,
  weeks integer NOT NULL DEFAULT 12,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT fb_autopilot_schedule_singleton CHECK (id = 1),
  CONSTRAINT fb_autopilot_schedule_hour CHECK (post_hour BETWEEN 0 AND 23),
  CONSTRAINT fb_autopilot_schedule_weeks CHECK (weeks BETWEEN 1 AND 260)
);

GRANT SELECT, INSERT, UPDATE ON public.fb_autopilot_schedule TO authenticated;
GRANT ALL ON public.fb_autopilot_schedule TO service_role;

ALTER TABLE public.fb_autopilot_schedule ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage fb autopilot schedule"
ON public.fb_autopilot_schedule FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER trg_fb_autopilot_schedule_touch
BEFORE UPDATE ON public.fb_autopilot_schedule
FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

INSERT INTO public.fb_autopilot_schedule (id) VALUES (1) ON CONFLICT (id) DO NOTHING;