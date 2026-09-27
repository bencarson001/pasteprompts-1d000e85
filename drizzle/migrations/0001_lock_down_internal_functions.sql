-- Internal / system-only: nobody outside the backend may call these directly
REVOKE EXECUTE ON FUNCTION public.cleanup_stale_creator_prompts() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.prune_platform_prompts(integer) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.default_admin_id() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.get_creator_tier(uuid) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.delete_email(text, bigint) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.enqueue_email(text, jsonb) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.read_email_batch(text, integer, integer) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.move_to_dlq(text, text, bigint, jsonb) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.email_queue_dispatch() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.email_queue_wake() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.enforce_collection_rules() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.enforce_prompt_rules() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.notify_on_follow() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.protect_profile_sensitive_columns() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.recompute_prompt_rating() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.sync_showcase_votes() FROM PUBLIC, anon, authenticated;

-- Signed-in only (admin/own-account functions; admin ones also check role inside)
REVOKE EXECUTE ON FUNCTION public.admin_analytics(integer) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.admin_early_bird_recipients() FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.admin_enqueue_email(text, text, text) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.admin_find_user(text) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.admin_list_users(text) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.admin_set_user_creator(uuid, boolean) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.admin_set_user_tier(uuid, public.membership_tier) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.grant_early_bird_promo(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.get_my_billing() FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.get_my_sales() FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.get_my_tier_info() FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.prompt_uploads_this_month(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.has_active_subscription(uuid, text) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.recompute_trending() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_analytics(integer), public.admin_early_bird_recipients(), public.admin_enqueue_email(text, text, text), public.admin_find_user(text), public.admin_list_users(text), public.admin_set_user_creator(uuid, boolean), public.admin_set_user_tier(uuid, public.membership_tier), public.grant_early_bird_promo(uuid), public.get_my_billing(), public.get_my_sales(), public.get_my_tier_info(), public.prompt_uploads_this_month(uuid), public.has_active_subscription(uuid, text), public.recompute_trending() TO authenticated;