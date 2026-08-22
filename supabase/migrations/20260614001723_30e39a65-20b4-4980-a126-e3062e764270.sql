-- 1) prompts.body: re-assert that paid prompt body is NOT readable by anon/authenticated.
-- Access to the body goes through the get_prompt_body() RPC paywall only.
REVOKE SELECT (body) ON public.prompts FROM anon, authenticated;

-- 2) purchases: stop exposing stripe_session_id to clients.
-- Replace table-wide SELECT with explicit column grants that exclude stripe_session_id.
REVOKE SELECT ON public.purchases FROM anon;
REVOKE SELECT ON public.purchases FROM authenticated;
GRANT SELECT (id, buyer_id, prompt_id, amount_pence, platform_fee_pence, creator_earning_pence, is_free, created_at)
  ON public.purchases TO authenticated;

-- 3) referrals: stop exposing referred_user_id (links a specific account to the referrer).
-- Keep reward_pence/status visible to the referrer; drop the referred user's UUID.
REVOKE SELECT ON public.referrals FROM anon;
REVOKE SELECT ON public.referrals FROM authenticated;
GRANT SELECT (id, referrer_id, code, status, reward_pence, created_at)
  ON public.referrals TO authenticated;

-- 4) Set a fixed search_path on the email-queue helper functions.
CREATE OR REPLACE FUNCTION public.delete_email(queue_name text, message_id bigint)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  RETURN pgmq.delete(queue_name, message_id);
EXCEPTION WHEN undefined_table THEN
  RETURN FALSE;
END;
$function$;

CREATE OR REPLACE FUNCTION public.enqueue_email(queue_name text, payload jsonb)
 RETURNS bigint
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  RETURN pgmq.send(queue_name, payload);
EXCEPTION WHEN undefined_table THEN
  PERFORM pgmq.create(queue_name);
  RETURN pgmq.send(queue_name, payload);
END;
$function$;

CREATE OR REPLACE FUNCTION public.read_email_batch(queue_name text, batch_size integer, vt integer)
 RETURNS TABLE(msg_id bigint, read_ct integer, message jsonb)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  RETURN QUERY SELECT r.msg_id, r.read_ct, r.message FROM pgmq.read(queue_name, vt, batch_size) r;
EXCEPTION WHEN undefined_table THEN
  PERFORM pgmq.create(queue_name);
  RETURN;
END;
$function$;

CREATE OR REPLACE FUNCTION public.move_to_dlq(source_queue text, dlq_name text, message_id bigint, payload jsonb)
 RETURNS bigint
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE new_id BIGINT;
BEGIN
  SELECT pgmq.send(dlq_name, payload) INTO new_id;
  PERFORM pgmq.delete(source_queue, message_id);
  RETURN new_id;
EXCEPTION WHEN undefined_table THEN
  BEGIN
    PERFORM pgmq.create(dlq_name);
  EXCEPTION WHEN OTHERS THEN
    NULL;
  END;
  SELECT pgmq.send(dlq_name, payload) INTO new_id;
  BEGIN
    PERFORM pgmq.delete(source_queue, message_id);
  EXCEPTION WHEN undefined_table THEN
    NULL;
  END;
  RETURN new_id;
END;
$function$;