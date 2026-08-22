CREATE TABLE public.maintenance_runs (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tasks text[] NOT NULL DEFAULT '{}',
  summary jsonb NOT NULL DEFAULT '{}'::jsonb,
  ok boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT SELECT ON public.maintenance_runs TO authenticated;
GRANT ALL ON public.maintenance_runs TO service_role;

ALTER TABLE public.maintenance_runs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins view maintenance runs"
ON public.maintenance_runs
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));