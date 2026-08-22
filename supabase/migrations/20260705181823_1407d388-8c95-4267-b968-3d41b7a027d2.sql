-- 1) profiles: guarantee sensitive financial/referral columns are not readable by anon/authenticated.
REVOKE SELECT (stripe_account_id, total_earnings_pence, referral_code) ON public.profiles FROM anon;
REVOKE SELECT (stripe_account_id, total_earnings_pence, referral_code) ON public.profiles FROM authenticated;

-- 2) prompt_versions: guarantee the paid 'body' column is not readable directly by clients
--    (access is only via the get_prompt_body / changelog SECURITY DEFINER RPCs).
REVOKE SELECT (body) ON public.prompt_versions FROM anon;
REVOKE SELECT (body) ON public.prompt_versions FROM authenticated;

-- 3) email_send_state: allow admins to view send-state config through normal authenticated access.
GRANT SELECT ON public.email_send_state TO authenticated;
DROP POLICY IF EXISTS "Admins can view email send state" ON public.email_send_state;
CREATE POLICY "Admins can view email send state"
  ON public.email_send_state
  FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- 4) feedback: replace the always-true INSERT policy with a validated one.
DROP POLICY IF EXISTS "Anyone can submit feedback" ON public.feedback;
CREATE POLICY "Anyone can submit feedback"
  ON public.feedback
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    (user_id IS NULL OR user_id = auth.uid())
    AND char_length(btrim(name)) BETWEEN 1 AND 200
    AND char_length(btrim(email)) BETWEEN 3 AND 320
    AND char_length(btrim(message)) BETWEEN 1 AND 5000
    AND char_length(coalesce(subject, '')) <= 300
    AND char_length(coalesce(category, '')) <= 50
    AND status = 'new'
  );