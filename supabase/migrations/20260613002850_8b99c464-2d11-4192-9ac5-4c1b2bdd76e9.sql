-- 1. Enforce safe URL scheme on profiles.website_url to prevent stored XSS
--    (javascript:, data:, etc.). Allow NULL/empty or http(s) URLs only.
ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_website_url_scheme_chk;

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_website_url_scheme_chk
  CHECK (
    website_url IS NULL
    OR website_url = ''
    OR website_url ~* '^https?://[^[:space:]]+$'
  );

-- 2. Reduce blast radius: client never needs Stripe identifiers, so revoke
--    column-level SELECT on subscriptions Stripe IDs from client roles.
--    Edge functions use the service role and are unaffected.
REVOKE SELECT (stripe_subscription_id, stripe_customer_id)
  ON public.subscriptions FROM anon, authenticated;