import { createClient } from '@supabase/supabase-js';
import config from '@/config/environment';

const { url: supabaseUrl, anonKey: supabaseAnonKey } = config.supabase;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});
