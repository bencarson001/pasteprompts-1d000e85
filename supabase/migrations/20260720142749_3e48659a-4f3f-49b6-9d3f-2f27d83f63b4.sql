
CREATE TABLE IF NOT EXISTS public.fb_post_pool (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content TEXT NOT NULL,
  has_media BOOLEAN NOT NULL DEFAULT false,
  emoji_only BOOLEAN NOT NULL DEFAULT false,
  cycle_id INT NOT NULL DEFAULT 1,
  posted_at TIMESTAMPTZ,
  fb_post_id TEXT,
  last_error TEXT,
  generated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS fb_post_pool_cycle_posted_idx ON public.fb_post_pool(cycle_id, posted_at);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.fb_post_pool TO authenticated;
GRANT ALL ON public.fb_post_pool TO service_role;

ALTER TABLE public.fb_post_pool ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins manage fb post pool" ON public.fb_post_pool;
CREATE POLICY "Admins manage fb post pool" ON public.fb_post_pool
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
