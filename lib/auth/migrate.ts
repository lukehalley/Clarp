// LocalStorage to Supabase Migration Utility
// Migrates user data from localStorage to authenticated Supabase storage

// LocalStorage keys used in the app
const STORAGE_KEYS = {
  WATCHLIST: 'clarp-watchlist',
  ALERTS: 'clarp-alerts',
  ALERT_RULES: 'clarp-alert-rules',
  RECENT_SEARCHES: 'clarp-recent-searches',
  MIGRATED: 'clarp-data-migrated',
} as const;

interface MigrationResult {
  success: boolean;
  watchlistCount: number;
  searchesCount: number;
  alertRulesCount: number;
  errors: string[];
}

/**
 * Check if local data has already been migrated
 */
export function hasBeenMigrated(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(STORAGE_KEYS.MIGRATED) === 'true';
}

/**
 * Mark data as migrated
 */
function markAsMigrated(): void {
  localStorage.setItem(STORAGE_KEYS.MIGRATED, 'true');
}

/**
 * Get local watchlist items
 */
function getLocalWatchlist(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.WATCHLIST);
    if (!stored) return [];
    return JSON.parse(stored) as string[];
  } catch {
    return [];
  }
}

/**
 * Get local recent searches
 */
function getLocalSearches(): Array<{ query: string; type?: string; timestamp?: number }> {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.RECENT_SEARCHES);
    if (!stored) return [];
    const searches = JSON.parse(stored);
    // Handle both string array and object array formats
    if (Array.isArray(searches)) {
      return searches.map((s) =>
        typeof s === 'string' ? { query: s } : s
      );
    }
    return [];
  } catch {
    return [];
  }
}

/**
 * Get local alert rules
 */
function getLocalAlertRules(): Array<Record<string, unknown>> {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.ALERT_RULES);
    if (!stored) return [];
    return JSON.parse(stored) as Array<Record<string, unknown>>;
  } catch {
    return [];
  }
}

/**
 * Clear local storage data after successful migration
 */
function clearLocalData(): void {
  localStorage.removeItem(STORAGE_KEYS.WATCHLIST);
  localStorage.removeItem(STORAGE_KEYS.ALERTS);
  localStorage.removeItem(STORAGE_KEYS.ALERT_RULES);
  localStorage.removeItem(STORAGE_KEYS.RECENT_SEARCHES);
}

/**
 * Migrate local data to authenticated user's Supabase storage
 */
export async function migrateLocalData(authToken: string): Promise<MigrationResult> {
  const result: MigrationResult = {
    success: false,
    watchlistCount: 0,
    searchesCount: 0,
    alertRulesCount: 0,
    errors: [],
  };

  // Skip if already migrated
  if (hasBeenMigrated()) {
    result.success = true;
    return result;
  }

  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${authToken}`,
  };

  // Migrate watchlist
  const watchlist = getLocalWatchlist();
  if (watchlist.length > 0) {
    try {
      const response = await fetch('/api/user/watchlist/migrate', {
        method: 'POST',
        headers,
        body: JSON.stringify({ projectIds: watchlist }),
      });

      if (response.ok) {
        const data = await response.json();
        result.watchlistCount = data.migrated || watchlist.length;
      } else {
        result.errors.push(`Watchlist migration failed: ${response.statusText}`);
      }
    } catch (error) {
      result.errors.push(`Watchlist migration error: ${error instanceof Error ? error.message : 'Unknown'}`);
    }
  }

  // Migrate recent searches
  const searches = getLocalSearches();
  if (searches.length > 0) {
    try {
      const response = await fetch('/api/user/searches/migrate', {
        method: 'POST',
        headers,
        body: JSON.stringify({ searches }),
      });

      if (response.ok) {
        const data = await response.json();
        result.searchesCount = data.migrated || searches.length;
      } else {
        result.errors.push(`Searches migration failed: ${response.statusText}`);
      }
    } catch (error) {
      result.errors.push(`Searches migration error: ${error instanceof Error ? error.message : 'Unknown'}`);
    }
  }

  // Migrate alert rules
  const alertRules = getLocalAlertRules();
  if (alertRules.length > 0) {
    try {
      const response = await fetch('/api/user/alert-rules/migrate', {
        method: 'POST',
        headers,
        body: JSON.stringify({ rules: alertRules }),
      });

      if (response.ok) {
        const data = await response.json();
        result.alertRulesCount = data.migrated || alertRules.length;
      } else {
        result.errors.push(`Alert rules migration failed: ${response.statusText}`);
      }
    } catch (error) {
      result.errors.push(`Alert rules migration error: ${error instanceof Error ? error.message : 'Unknown'}`);
    }
  }

  // Mark as migrated if at least partially successful
  if (result.errors.length === 0 ||
      result.watchlistCount > 0 ||
      result.searchesCount > 0 ||
      result.alertRulesCount > 0) {
    markAsMigrated();
    clearLocalData();
    result.success = true;
  }

  return result;
}

/**
 * Check if there's any local data to migrate
 */
export function hasLocalDataToMigrate(): boolean {
  if (typeof window === 'undefined') return false;
  if (hasBeenMigrated()) return false;

  const watchlist = getLocalWatchlist();
  const searches = getLocalSearches();
  const alertRules = getLocalAlertRules();

  return watchlist.length > 0 || searches.length > 0 || alertRules.length > 0;
}

/**
 * Get summary of local data available for migration
 */
export function getLocalDataSummary(): {
  watchlistCount: number;
  searchesCount: number;
  alertRulesCount: number;
} {
  return {
    watchlistCount: getLocalWatchlist().length,
    searchesCount: getLocalSearches().length,
    alertRulesCount: getLocalAlertRules().length,
  };
}
