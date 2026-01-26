// Server-side Supabase Client
// Uses service role key for authenticated API operations

import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Singleton for service role client
let serviceClient: SupabaseClient | null = null;

/**
 * Get Supabase client with service role (server-side only)
 * This bypasses RLS and should only be used in API routes
 */
export function getServiceClient(): SupabaseClient | null {
  if (serviceClient) {
    return serviceClient;
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    console.warn('[Supabase] Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
    return null;
  }

  serviceClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  return serviceClient;
}

/**
 * Check if service client is available
 */
export function isServiceClientAvailable(): boolean {
  return !!(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

// User-related database operations

export interface UserRecord {
  id: string;
  wallet_address: string;
  created_at: string;
  last_login: string;
}

/**
 * Find or create user by wallet address
 */
export async function upsertUser(walletAddress: string): Promise<UserRecord | null> {
  const client = getServiceClient();
  if (!client) return null;

  try {
    const { data, error } = await client
      .from('users')
      .upsert(
        {
          wallet_address: walletAddress,
          last_login: new Date().toISOString(),
        },
        { onConflict: 'wallet_address' }
      )
      .select()
      .single();

    if (error) {
      console.error('[Supabase] Error upserting user:', error.message);
      return null;
    }

    return data as UserRecord;
  } catch (err) {
    console.error('[Supabase] Failed to upsert user:', err);
    return null;
  }
}

/**
 * Get user by ID
 */
export async function getUserById(userId: string): Promise<UserRecord | null> {
  const client = getServiceClient();
  if (!client) return null;

  try {
    const { data, error } = await client
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      if (error.code !== 'PGRST116') {
        console.error('[Supabase] Error fetching user:', error.message);
      }
      return null;
    }

    return data as UserRecord;
  } catch (err) {
    console.error('[Supabase] Failed to fetch user:', err);
    return null;
  }
}

/**
 * Get user by wallet address
 */
export async function getUserByWallet(walletAddress: string): Promise<UserRecord | null> {
  const client = getServiceClient();
  if (!client) return null;

  try {
    const { data, error } = await client
      .from('users')
      .select('*')
      .eq('wallet_address', walletAddress)
      .single();

    if (error) {
      if (error.code !== 'PGRST116') {
        console.error('[Supabase] Error fetching user by wallet:', error.message);
      }
      return null;
    }

    return data as UserRecord;
  } catch (err) {
    console.error('[Supabase] Failed to fetch user by wallet:', err);
    return null;
  }
}
