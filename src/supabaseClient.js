import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    "Supabase sozlamalari topilmadi. .env faylida VITE_SUPABASE_URL va VITE_SUPABASE_ANON_KEY borligini tekshiring."
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);