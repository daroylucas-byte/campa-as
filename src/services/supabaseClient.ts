import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isConfigured = 
  !!supabaseUrl && 
  !!supabaseAnonKey && 
  supabaseAnonKey !== 'REPLACEME_CON_TU_ANON_KEY';

export const supabase = isConfigured 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : (null as any);

