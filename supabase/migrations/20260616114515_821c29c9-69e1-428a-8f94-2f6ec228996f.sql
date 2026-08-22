CREATE TABLE public.analytics_events (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  visitor_id text NOT NULL,
  session_id text,
  event_type text NOT NULL DEFAULT 'page_view',
  path text,
  prompt_id uuid,
  is_new_visitor boolean NOT NULL DEFAULT false,
  referrer text,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT INSERT ON public.analytics_events TO anon, authenticated;
GRANT SELECT ON public.analytics_events TO authenticated;
GRANT ALL ON public.analytics_events TO service_role;

ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can log analytics events"
  ON public.analytics_events FOR INSERT TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Admins can read analytics events"
  ON public.analytics_events FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE INDEX idx_analytics_events_created_at ON public.analytics_events (created_at);
CREATE INDEX idx_analytics_events_type_created ON public.analytics_events (event_type, created_at);
CREATE INDEX idx_analytics_events_visitor ON public.analytics_events (visitor_id);

CREATE OR REPLACE FUNCTION public.admin_analytics(_days integer DEFAULT 30)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_start timestamptz := now() - (_days || ' days')::interval;
  result jsonb;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Not authorised';
  END IF;

  SELECT jsonb_build_object(
    'days', _days,
    'page_views', (SELECT count(*) FROM analytics_events WHERE event_type = 'page_view' AND created_at >= v_start),
    'prompt_views', (SELECT count(*) FROM analytics_events WHERE event_type = 'prompt_view' AND created_at >= v_start),
    'unique_visitors', (SELECT count(DISTINCT visitor_id) FROM analytics_events WHERE created_at >= v_start),
    'new_visitors', (SELECT count(DISTINCT visitor_id) FROM analytics_events WHERE is_new_visitor AND created_at >= v_start),
    'sales', (SELECT count(*) FROM purchases WHERE created_at >= v_start AND is_free = false),
    'free_claims', (SELECT count(*) FROM purchases WHERE created_at >= v_start AND is_free = true),
    'repeat_buyers', (SELECT count(*) FROM (SELECT buyer_id FROM purchases GROUP BY buyer_id HAVING count(*) > 1) t),
    'total_buyers', (SELECT count(DISTINCT buyer_id) FROM purchases),
    'daily', (SELECT COALESCE(jsonb_agg(d ORDER BY d->>'day'), '[]'::jsonb) FROM (
        SELECT jsonb_build_object(
          'day', to_char(date_trunc('day', created_at), 'YYYY-MM-DD'),
          'page_views', count(*) FILTER (WHERE event_type = 'page_view'),
          'prompt_views', count(*) FILTER (WHERE event_type = 'prompt_view'),
          'visitors', count(DISTINCT visitor_id)
        ) AS d
        FROM analytics_events
        WHERE created_at >= v_start
        GROUP BY date_trunc('day', created_at)
      ) x),
    'top_prompts', (SELECT COALESCE(jsonb_agg(tp), '[]'::jsonb) FROM (
        SELECT p.title, p.slug, p.views, p.sales_count, p.copies_count
        FROM prompts p
        WHERE p.status = 'approved'
        ORDER BY p.views DESC
        LIMIT 10
      ) tp)
  ) INTO result;

  RETURN result;
END
$$;

GRANT EXECUTE ON FUNCTION public.admin_analytics(integer) TO authenticated;