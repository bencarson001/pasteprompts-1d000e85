
-- Revoke the sensitive column grants — direct table SELECT on these columns
-- is now impossible; owner/admin reads go through SECURITY DEFINER functions.
REVOKE SELECT (
  stripe_account_id, total_earnings_pence, upload_credits,
  membership_tier, referral_code
) ON public.profiles FROM authenticated;

-- Drop the additive policy we added earlier — no longer needed since column
-- grants (not RLS) hide the sensitive fields; RLS still allows row visibility
-- for embeds and profile pages.
DROP POLICY IF EXISTS "Owner or admin can read sensitive columns" ON public.profiles;
