# Project Rules & Database Conventions

## 1. Canonical Backend
- **Project ID**: `iwmljuoplkqyhdygajpi`
- **Supabase URL**: `https://iwmljuoplkqyhdygajpi.supabase.co`
- **Rule**: NEVER repoint or change the Supabase backend configuration. See `BACKEND.md`.

## 2. Database Queries, Edits & Type Safety
- **CRITICAL**: Any database edits, updates, or mutations MUST ONLY be done through the API (`src/lib/dataApi.ts` / edge function `/functions/v1/data-api`). Direct database writes or mutations outside the API are strictly forbidden.
- Always inspect `src/integrations/supabase/types.ts` for exact, valid database table & column names before writing queries.
- **Forbidden Column References** (do NOT reference columns that do not exist):
  - Do NOT reference `profiles.location`
  - Do NOT reference `purchases.user_id`
  - Do NOT reference `email_send_log.to_email` or `email_send_log.subject`
- Only select columns permitted by column-level RLS permissions.

## 3. Authentication
- Always use the official Lovable Cloud OAuth helper in `src/integrations/lovable/index.ts` for authentication flows.
- Do NOT alter or rewrite Google login into hybrid/custom auth flows.
