import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('[FATAL] Missing SUPABASE_URL or SUPABASE_SERVICE_KEY');
}

export const db: SupabaseClient = createClient(
  supabaseUrl ?? '',
  supabaseKey ?? '',
  { auth: { persistSession: false } }
);
