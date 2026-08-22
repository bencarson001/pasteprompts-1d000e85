insert into public.feature_flags (key, enabled, description, updated_at) values
  ('ai_try_sandbox', false, 'Run prompts live with AI on the prompt page (uses AI credits).', now()),
  ('ai_vetting', false, 'AI quality check when creators submit a prompt to sell (uses AI credits).', now()),
  ('ai_moderation', false, 'AI reviews & approves/rejects pending prompts during maintenance (uses AI credits).', now()),
  ('ai_social_captions', false, 'Generate social captions in the AI scheduler (uses AI credits).', now()),
  ('social_posting', false, 'Publish due scheduled posts to connected platforms.', now())
on conflict (key) do update set enabled = excluded.enabled, description = excluded.description, updated_at = now();