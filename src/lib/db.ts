import { supabase } from "@/integrations/supabase/client";

/**
 * Loosely-typed Supabase client.
 *
 * Some queries (admin-only projections, join aliases, dynamic columns) can't be
 * expressed with the generated `Database` types. Use `db` for those instead of
 * scattering `as never` casts. Everything else should keep using the typed
 * `supabase` client from `@/integrations/supabase/client`.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const db = supabase as any;

export default db;
