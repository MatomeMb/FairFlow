import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL || "https://placeholder.supabase.co";
const key = import.meta.env.VITE_SUPABASE_ANON_KEY || "placeholder-key";

if (import.meta.env.DEV && !import.meta.env.VITE_SUPABASE_URL) {
  console.warn("[fairflow] VITE_SUPABASE_URL is not set — auth will not work.");
}

export const supabase = createClient(url, key);
