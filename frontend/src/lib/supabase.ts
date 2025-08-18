import { createClient } from '@supabase/supabase-js';

// Check if Supabase is configured for client-side
const isClientSupabaseConfigured = () => {
  return !!(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
};

// Check if Supabase is configured for server-side
const isServerSupabaseConfigured = () => {
  return !!(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
};

// Create client-side Supabase client
const createClientSupabase = () => {
  if (!isClientSupabaseConfigured()) {
    console.warn('Client-side Supabase environment variables are not set.');
    return null;
  }
  
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
};

// Create server-side Supabase client
const createServerSupabase = () => {
  if (!isServerSupabaseConfigured()) {
    console.warn('Server-side Supabase environment variables are not set.');
    return null;
  }
  
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  );
};

// Client-side Supabase instance
export const supabase = createClientSupabase();

// Server-side Supabase client getter
export const getSupabaseClient = () => {
  // Check if we're on the server side
  if (typeof window === 'undefined') {
    const serverClient = createServerSupabase();
    if (!serverClient) {
      throw new Error('Server-side Supabase is not properly configured. Please check your environment variables.');
    }
    return serverClient;
  }
  
  // Client-side
  if (!supabase) {
    throw new Error('Client-side Supabase is not properly configured. Please check your environment variables.');
  }
  
  return supabase;
};

// Check if Supabase is configured (for both client and server)
export const isSupabaseConfigured = () => {
  return isClientSupabaseConfigured() || isServerSupabaseConfigured();
};
