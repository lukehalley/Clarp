// Supabase Client for CLARP
// Used for authentication and data storage

import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Database types for xintel_reports table
export interface XIntelReportRow {
  handle: string;
  report: Record<string, unknown>;
  scanned_at: string;
  expires_at: string;
}

// Singleton client instance
let supabaseClient: SupabaseClient | null = null;

/**
 * Get or create Supabase client (browser/client-side)
 * Returns null if credentials are not configured
 */
export function getSupabaseClient(): SupabaseClient | null {
  if (supabaseClient) {
    return supabaseClient;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('[Supabase] Missing SUPABASE_URL or SUPABASE_ANON_KEY, client disabled');
    return null;
  }

  supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
  });

  return supabaseClient;
}

/**
 * Create a fresh Supabase client (for client components)
 * Use this when you need a new instance
 */
export function createSupabaseClient(): SupabaseClient | null {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return null;
  }

  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
  });
}

/**
 * Check if Supabase is available
 */
export function isSupabaseAvailable(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
  return !!(url && key);
}

/**
 * Get cached report from Supabase
 */
export async function getCachedReportFromSupabase(
  handle: string
): Promise<XIntelReportRow | null> {
  const client = getSupabaseClient();
  if (!client) return null;

  try {
    const { data, error } = await client
      .from('xintel_reports')
      .select('*')
      .eq('handle', handle)
      .gt('expires_at', new Date().toISOString())
      .single();

    if (error) {
      if (error.code !== 'PGRST116') {
        // PGRST116 = no rows returned, not a real error
        console.error('[Supabase] Error fetching cached report:', error.message);
      }
      return null;
    }

    return data as XIntelReportRow;
  } catch (err) {
    console.error('[Supabase] Failed to fetch cached report:', err);
    return null;
  }
}

/**
 * Store report in Supabase cache
 */
export async function cacheReportInSupabase(
  handle: string,
  report: Record<string, unknown>,
  ttlMs: number
): Promise<boolean> {
  const client = getSupabaseClient();
  if (!client) return false;

  try {
    const now = new Date();
    const expiresAt = new Date(now.getTime() + ttlMs);

    const { error } = await client.from('xintel_reports').upsert(
      {
        handle,
        report,
        scanned_at: now.toISOString(),
        expires_at: expiresAt.toISOString(),
      },
      { onConflict: 'handle' }
    );

    if (error) {
      console.error('[Supabase] Error caching report:', error.message);
      return false;
    }

    console.log(`[Supabase] Cached report for @${handle}, expires at ${expiresAt.toISOString()}`);
    return true;
  } catch (err) {
    console.error('[Supabase] Failed to cache report:', err);
    return false;
  }
}

/**
 * Delete cached report from Supabase
 */
export async function deleteCachedReportFromSupabase(handle: string): Promise<boolean> {
  const client = getSupabaseClient();
  if (!client) return false;

  try {
    const { error } = await client
      .from('xintel_reports')
      .delete()
      .eq('handle', handle);

    if (error) {
      console.error('[Supabase] Error deleting cached report:', error.message);
      return false;
    }

    return true;
  } catch (err) {
    console.error('[Supabase] Failed to delete cached report:', err);
    return false;
  }
}

/**
 * Get cache age in seconds for a handle
 */
export async function getCacheAgeFromSupabase(handle: string): Promise<number | null> {
  const client = getSupabaseClient();
  if (!client) return null;

  try {
    const { data, error } = await client
      .from('xintel_reports')
      .select('scanned_at')
      .eq('handle', handle)
      .single();

    if (error || !data) return null;

    const scannedAt = new Date(data.scanned_at);
    return Math.floor((Date.now() - scannedAt.getTime()) / 1000);
  } catch {
    return null;
  }
}

/**
 * Clean up expired reports (can be called periodically)
 */
export async function cleanupExpiredReports(): Promise<number> {
  const client = getSupabaseClient();
  if (!client) return 0;

  try {
    const { data, error } = await client
      .from('xintel_reports')
      .delete()
      .lt('expires_at', new Date().toISOString())
      .select('handle');

    if (error) {
      console.error('[Supabase] Error cleaning up expired reports:', error.message);
      return 0;
    }

    const count = data?.length || 0;
    if (count > 0) {
      console.log(`[Supabase] Cleaned up ${count} expired reports`);
    }
    return count;
  } catch (err) {
    console.error('[Supabase] Failed to cleanup expired reports:', err);
    return 0;
  }
}
