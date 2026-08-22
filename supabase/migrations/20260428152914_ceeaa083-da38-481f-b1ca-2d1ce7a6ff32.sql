
ALTER TABLE public.profiles DROP CONSTRAINT profiles_id_fkey;
-- Real signups will still get profile rows via the existing trigger.
-- Seed/synthetic creators can now exist without an auth.users row.
