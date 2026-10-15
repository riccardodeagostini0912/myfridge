import 'react-native-url-polyfill/auto';

import { createClient } from '@supabase/supabase-js';

// EXPO_PUBLIC_ variables are inlined at build time, so they must be read statically.
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  const missing = [
    !supabaseUrl && 'EXPO_PUBLIC_SUPABASE_URL',
    !supabaseKey && 'EXPO_PUBLIC_SUPABASE_KEY',
  ].filter(Boolean);
  throw new Error(
    `Supabase configuration error: missing ${missing.join(' and ')}. ` +
      'Copy .env.example to .env, fill in your project values, and restart Expo.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    // The app has no login, so there is no session to store or refresh.
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },
});
