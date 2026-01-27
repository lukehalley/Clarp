'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';

// localStorage keys
const STORAGE_KEYS = {
  WATCHLIST: 'clarp-watchlist',
  RECENT_SEARCHES: 'clarp-recent-searches',
  ALERT_RULES: 'clarp-alert-rules',
} as const;

// ============================================================================
// Watchlist Hook
// ============================================================================

interface WatchlistItem {
  projectId: string;
  addedAt?: string;
}

export function useWatchlist() {
  const { isAuthenticated, supabase, user } = useAuth();
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load watchlist
  const loadWatchlist = useCallback(async () => {
    setIsLoading(true);

    if (isAuthenticated && supabase && user) {
      try {
        const { data, error } = await supabase
          .from('user_watchlist')
          .select('project_id, added_at')
          .eq('user_id', user.id)
          .order('added_at', { ascending: false });

        if (error) throw error;
        setWatchlist(
          (data || []).map((item) => ({
            projectId: item.project_id,
            addedAt: item.added_at,
          }))
        );
      } catch (error) {
        console.error('[Watchlist] Load error:', error);
        setWatchlist([]);
      }
    } else {
      // Load from localStorage
      try {
        const stored = localStorage.getItem(STORAGE_KEYS.WATCHLIST);
        if (stored) {
          const ids = JSON.parse(stored) as string[];
          setWatchlist(ids.map((id) => ({ projectId: id })));
        } else {
          setWatchlist([]);
        }
      } catch {
        setWatchlist([]);
      }
    }

    setIsLoading(false);
  }, [isAuthenticated, supabase, user]);

  // Add to watchlist
  const addToWatchlist = useCallback(
    async (projectId: string) => {
      if (isAuthenticated && supabase && user) {
        try {
          const { error } = await supabase.from('user_watchlist').upsert(
            {
              user_id: user.id,
              project_id: projectId,
              added_at: new Date().toISOString(),
            },
            { onConflict: 'user_id,project_id' }
          );

          if (error) throw error;
          setWatchlist((prev) => [
            { projectId, addedAt: new Date().toISOString() },
            ...prev,
          ]);
        } catch (error) {
          console.error('[Watchlist] Add error:', error);
          throw error;
        }
      } else {
        // Save to localStorage
        const stored = localStorage.getItem(STORAGE_KEYS.WATCHLIST);
        const ids = stored ? (JSON.parse(stored) as string[]) : [];
        if (!ids.includes(projectId)) {
          ids.push(projectId);
          localStorage.setItem(STORAGE_KEYS.WATCHLIST, JSON.stringify(ids));
          setWatchlist((prev) => [...prev, { projectId }]);
        }
      }
    },
    [isAuthenticated, supabase, user]
  );

  // Remove from watchlist
  const removeFromWatchlist = useCallback(
    async (projectId: string) => {
      if (isAuthenticated && supabase && user) {
        try {
          const { error } = await supabase
            .from('user_watchlist')
            .delete()
            .eq('user_id', user.id)
            .eq('project_id', projectId);

          if (error) throw error;
          setWatchlist((prev) => prev.filter((item) => item.projectId !== projectId));
        } catch (error) {
          console.error('[Watchlist] Remove error:', error);
          throw error;
        }
      } else {
        // Remove from localStorage
        const stored = localStorage.getItem(STORAGE_KEYS.WATCHLIST);
        const ids = stored ? (JSON.parse(stored) as string[]) : [];
        const updated = ids.filter((id) => id !== projectId);
        localStorage.setItem(STORAGE_KEYS.WATCHLIST, JSON.stringify(updated));
        setWatchlist((prev) => prev.filter((item) => item.projectId !== projectId));
      }
    },
    [isAuthenticated, supabase, user]
  );

  // Check if in watchlist
  const isInWatchlist = useCallback(
    (projectId: string) => {
      return watchlist.some((item) => item.projectId === projectId);
    },
    [watchlist]
  );

  // Load on mount and auth change
  useEffect(() => {
    loadWatchlist();
  }, [loadWatchlist]);

  return {
    watchlist,
    isLoading,
    addToWatchlist,
    removeFromWatchlist,
    isInWatchlist,
    refresh: loadWatchlist,
  };
}

// ============================================================================
// Recent Searches Hook
// ============================================================================

interface SearchItem {
  query: string;
  type?: string;
  timestamp: number;
}

const MAX_RECENT_SEARCHES = 10;

export function useRecentSearches() {
  const [searches, setSearches] = useState<SearchItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load searches (always from localStorage for fast UX)
  const loadSearches = useCallback(async () => {
    setIsLoading(true);

    try {
      const stored = localStorage.getItem(STORAGE_KEYS.RECENT_SEARCHES);
      if (stored) {
        setSearches(JSON.parse(stored) as SearchItem[]);
      } else {
        setSearches([]);
      }
    } catch {
      setSearches([]);
    }

    setIsLoading(false);
  }, []);

  // Add search
  const addSearch = useCallback(async (query: string, type?: string) => {
    const newSearch: SearchItem = {
      query,
      type,
      timestamp: Date.now(),
    };

    // Update localStorage immediately for fast UX
    const stored = localStorage.getItem(STORAGE_KEYS.RECENT_SEARCHES);
    let current = stored ? (JSON.parse(stored) as SearchItem[]) : [];

    // Remove duplicates and add new
    current = current.filter((s) => s.query.toLowerCase() !== query.toLowerCase());
    current.unshift(newSearch);
    current = current.slice(0, MAX_RECENT_SEARCHES);

    localStorage.setItem(STORAGE_KEYS.RECENT_SEARCHES, JSON.stringify(current));
    setSearches(current);
  }, []);

  // Clear searches
  const clearSearches = useCallback(() => {
    localStorage.removeItem(STORAGE_KEYS.RECENT_SEARCHES);
    setSearches([]);
  }, []);

  // Load on mount
  useEffect(() => {
    loadSearches();
  }, [loadSearches]);

  return {
    searches,
    isLoading,
    addSearch,
    clearSearches,
    refresh: loadSearches,
  };
}

// ============================================================================
// Alert Rules Hook
// ============================================================================

interface AlertRule {
  id: string;
  rule: Record<string, unknown>;
  enabled: boolean;
  createdAt?: string;
}

export function useAlertRules() {
  const { isAuthenticated, supabase, user } = useAuth();
  const [rules, setRules] = useState<AlertRule[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load rules
  const loadRules = useCallback(async () => {
    setIsLoading(true);

    if (isAuthenticated && supabase && user) {
      try {
        const { data, error } = await supabase
          .from('user_alert_rules')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setRules(
          (data || []).map((item) => ({
            id: item.id,
            rule: item.rule,
            enabled: item.enabled,
            createdAt: item.created_at,
          }))
        );
      } catch (error) {
        console.error('[AlertRules] Load error:', error);
        setRules([]);
      }
    } else {
      // Load from localStorage
      try {
        const stored = localStorage.getItem(STORAGE_KEYS.ALERT_RULES);
        if (stored) {
          setRules(JSON.parse(stored) as AlertRule[]);
        } else {
          setRules([]);
        }
      } catch {
        setRules([]);
      }
    }

    setIsLoading(false);
  }, [isAuthenticated, supabase, user]);

  // Create rule
  const createRule = useCallback(
    async (rule: Record<string, unknown>) => {
      if (isAuthenticated && supabase && user) {
        try {
          const { data, error } = await supabase
            .from('user_alert_rules')
            .insert({
              user_id: user.id,
              rule: rule,
              enabled: true,
            })
            .select()
            .single();

          if (error) throw error;

          const newRule: AlertRule = {
            id: data.id,
            rule: data.rule,
            enabled: data.enabled,
            createdAt: data.created_at,
          };

          setRules((prev) => [newRule, ...prev]);
          return newRule;
        } catch (error) {
          console.error('[AlertRules] Create error:', error);
          throw error;
        }
      } else {
        // Save to localStorage
        const newRule: AlertRule = {
          id: `local-${Date.now()}`,
          rule,
          enabled: true,
          createdAt: new Date().toISOString(),
        };

        const stored = localStorage.getItem(STORAGE_KEYS.ALERT_RULES);
        const current = stored ? (JSON.parse(stored) as AlertRule[]) : [];
        current.unshift(newRule);
        localStorage.setItem(STORAGE_KEYS.ALERT_RULES, JSON.stringify(current));
        setRules(current);
        return newRule;
      }
    },
    [isAuthenticated, supabase, user]
  );

  // Toggle rule enabled
  const toggleRule = useCallback(
    async (ruleId: string, enabled: boolean) => {
      if (isAuthenticated && supabase && user) {
        try {
          const { error } = await supabase
            .from('user_alert_rules')
            .update({ enabled, updated_at: new Date().toISOString() })
            .eq('id', ruleId)
            .eq('user_id', user.id);

          if (error) throw error;
          setRules((prev) =>
            prev.map((r) => (r.id === ruleId ? { ...r, enabled } : r))
          );
        } catch (error) {
          console.error('[AlertRules] Toggle error:', error);
          throw error;
        }
      } else {
        // Update localStorage
        const stored = localStorage.getItem(STORAGE_KEYS.ALERT_RULES);
        const current = stored ? (JSON.parse(stored) as AlertRule[]) : [];
        const updated = current.map((r) =>
          r.id === ruleId ? { ...r, enabled } : r
        );
        localStorage.setItem(STORAGE_KEYS.ALERT_RULES, JSON.stringify(updated));
        setRules(updated);
      }
    },
    [isAuthenticated, supabase, user]
  );

  // Delete rule
  const deleteRule = useCallback(
    async (ruleId: string) => {
      if (isAuthenticated && supabase && user) {
        try {
          const { error } = await supabase
            .from('user_alert_rules')
            .delete()
            .eq('id', ruleId)
            .eq('user_id', user.id);

          if (error) throw error;
          setRules((prev) => prev.filter((r) => r.id !== ruleId));
        } catch (error) {
          console.error('[AlertRules] Delete error:', error);
          throw error;
        }
      } else {
        // Remove from localStorage
        const stored = localStorage.getItem(STORAGE_KEYS.ALERT_RULES);
        const current = stored ? (JSON.parse(stored) as AlertRule[]) : [];
        const updated = current.filter((r) => r.id !== ruleId);
        localStorage.setItem(STORAGE_KEYS.ALERT_RULES, JSON.stringify(updated));
        setRules(updated);
      }
    },
    [isAuthenticated, supabase, user]
  );

  // Load on mount and auth change
  useEffect(() => {
    loadRules();
  }, [loadRules]);

  return {
    rules,
    isLoading,
    createRule,
    toggleRule,
    deleteRule,
    refresh: loadRules,
  };
}
