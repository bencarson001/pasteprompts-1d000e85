create or replace function public.protect_profile_sensitive_columns()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  is_privileged boolean;
begin
  is_privileged :=
    (current_setting('request.jwt.claims', true)::jsonb ->> 'role') = 'service_role'
    or public.has_role(auth.uid(), 'admin');

  if not is_privileged then
    new.is_creator           := old.is_creator;
    new.stripe_account_id    := old.stripe_account_id;
    new.total_sales          := old.total_sales;
    new.total_earnings_pence := old.total_earnings_pence;
    new.referral_code        := old.referral_code;
    new.membership_tier      := old.membership_tier;
    new.upload_credits       := old.upload_credits;
  end if;

  return new;
end;
$$;

drop trigger if exists trg_protect_profile_sensitive_columns on public.profiles;

create trigger trg_protect_profile_sensitive_columns
  before update on public.profiles
  for each row
  execute function public.protect_profile_sensitive_columns();