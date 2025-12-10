import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (import.meta as any).env.VITE_SUPABASE_URL;
const supabaseAnonKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY;

const isConfigured = supabaseUrl && supabaseAnonKey;

if (!isConfigured) {
  console.warn('⚠️ Missing Supabase environment variables! The app is running in placeholder mode and DB calls will fail.');
  console.warn('Please check your .env file or Vercel Environment Variables.');
}

// Fallback to avoid crashes if vars are missing (will fail gracefully in auth context)
const validUrl = supabaseUrl || 'https://placeholder.supabase.co';
const validKey = supabaseAnonKey || 'placeholder';

export const supabase = createClient(
  validUrl,
  validKey,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    }
  }
);