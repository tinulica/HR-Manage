// src/supabaseClient.js
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL    = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON   = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON) {
  throw new Error(
    'Missing env vars: VITE_SUPABASE_URL and/or VITE_SUPABASE_ANON_KEY'
  );
}

/**
 * Create a Supabase client, optionally injecting a Bearer token.
 * @param {string} [accessToken] Clerk-issued Supabase JWT
 */
export function createSupabaseClient(accessToken) {
  const options = {
    auth: {
      persistSession:     false,
      detectSessionInUrl: false,
      autoRefreshToken:   false,
    },
  };

  if (accessToken) {
    options.global = {
      headers: { Authorization: `Bearer ${accessToken}` },
    };
  }

  return createClient(SUPABASE_URL, SUPABASE_ANON, options);
}
