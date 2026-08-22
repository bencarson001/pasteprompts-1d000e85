-- ============ error_logs: lock down anonymous arbitrary writes ============
-- Remove permissive anon INSERT and the always-true policy
DROP POLICY IF EXISTS "Anyone can log errors" ON public.error_logs;
REVOKE INSERT ON public.error_logs FROM anon;

-- Authenticated users may log errors only for themselves, with validation
CREATE POLICY "Authenticated users log own errors"
  ON public.error_logs FOR INSERT TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    AND length(message) <= 2000
    AND level IN ('debug', 'info', 'warn', 'error', 'fatal')
  );

-- ============ showcase_votes: stop public enumeration of who voted ============
DROP POLICY IF EXISTS "Votes are public" ON public.showcase_votes;
REVOKE SELECT ON public.showcase_votes FROM anon;

CREATE POLICY "Users read own votes"
  ON public.showcase_votes FOR SELECT TO authenticated
  USING (user_id = auth.uid());
