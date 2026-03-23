import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
/** Supabase dashboard labels this "service_role"; accept both names so Vercel env matches docs. */
const supabaseKey = process.env.SUPABASE_SERVICE_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('[FATAL] Missing SUPABASE_URL or SUPABASE_SERVICE_KEY (or SUPABASE_SERVICE_ROLE_KEY)');
}

export const db: SupabaseClient = createClient(
  supabaseUrl ?? '',
  supabaseKey ?? '',
  { auth: { persistSession: false } }
);
