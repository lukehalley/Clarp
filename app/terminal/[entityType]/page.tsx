'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import {
  Filter,
  ArrowUpDown,
  RotateCcw,
  Loader2,
  SlidersHorizontal,
} from 'lucide-react';
import IntelCard from '@/components/terminal/IntelCard';
import SearchInput from '@/components/terminal/SearchInput';
import WalletGate from '@/components/auth/WalletGate';
import ClarpLoader from '@/components/ClarpLoader';
import type { Project } from '@/types/project';

// ============================================================================
// TYPES & CONSTANTS
// ============================================================================

type EntityFilter = 'project' | 'person' | 'organization';
type CategoryFilter = 'all' | 'verified' | 'high-risk' | 'low-risk';
type SortOption = 'score-high' | 'score-low' | 'recent' | 'name-asc';

const SLUG_TO_ENTITY: Record<string, EntityFilter> = {
  projects: 'project',
  people: 'person',
  orgs: 'organization',
};

const ENTITY_TO_SLUG: Record<EntityFilter, string> = {
  project: 'projects',
  person: 'people',
  organization: 'orgs',
};

const VALID_CATEGORIES: CategoryFilter[] = ['all', 'verified', 'high-risk', 'low-risk'];
const VALID_SORTS: SortOption[] = ['score-high', 'score-low', 'recent', 'name-asc'];

const SORT_OPTIONS: { id: SortOption; label: string }[] = [
  { id: 'score-high', label: 'Trust: High to Low' },
  { id: 'score-low', label: 'Trust: Low to High' },
  { id: 'recent', label: 'Recently Scanned' },
  { id: 'name-asc', label: 'Name: A to Z' },
];

const CATEGORY_FILTERS: { id: CategoryFilter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'verified', label: 'Verified' },
  { id: 'high-risk', label: 'High Risk' },
  { id: 'low-risk', label: 'Trusted' },
];

const PAGE_SIZE = 20;

function sortOptionToParams(sortBy: SortOption): { orderBy: string; order: string } {
  switch (sortBy) {
    case 'score-high': return { orderBy: 'trust_score', order: 'desc' };
    case 'score-low':  return { orderBy: 'trust_score', order: 'asc' };
    case 'name-asc':   return { orderBy: 'name', order: 'asc' };
    case 'recent':     return { orderBy: 'last_scan_at', order: 'desc' };
  }
}

// ============================================================================
// URL HELPERS
// ============================================================================

function buildUrl(entitySlug: string, filters: {
  category?: CategoryFilter;
  sort?: SortOption;
}): string {
  const params = new URLSearchParams();

  if (filters.category && filters.category !== 'all') params.set('category', filters.category);
  if (filters.sort && filters.sort !== 'score-high') params.set('sort', filters.sort);

  const qs = params.toString();
  return `/terminal/${entitySlug}${qs ? `?${qs}` : ''}`;
}

// ============================================================================
// FILTER BAR
// ============================================================================

function ToolBar({
  category,
  setCategory,
  sortBy,
  setSortBy,
  hasActiveFilters,
  onReset,
}: {
  category: CategoryFilter;
  setCategory: (c: CategoryFilter) => void;
  sortBy: SortOption;
  setSortBy: (s: SortOption) => void;
  hasActiveFilters: boolean;
  onReset: () => void;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement | null>(null);

  // Close popover on outside click
  useEffect(() => {
    if (!mobileOpen) return;
    const handler = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setMobileOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [mobileOpen]);

  const selectBgStyle = { backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'10\' height=\'10\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%239ca3af\' stroke-width=\'2\'%3E%3Cpath d=\'M6 9l6 6 6-6\'/%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0 center' } as const;

  const filterControls = (
    <>
      {/* Category dropdown */}
      <div className="flex items-center gap-1.5">
        <Filter size={12} className="text-ivory-light shrink-0" />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value as CategoryFilter)}
          className="bg-transparent text-ivory-light font-mono text-[11px] focus:outline-none cursor-pointer appearance-none pr-3"
          style={selectBgStyle}
        >
          {CATEGORY_FILTERS.map((filter) => (
            <option key={filter.id} value={filter.id} className="bg-slate-dark">
              {filter.label}
            </option>
          ))}
        </select>
      </div>

      {/* Sort dropdown */}
      <div className="flex items-center gap-1.5">
        <ArrowUpDown size={12} className="text-ivory-light shrink-0" />
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as SortOption)}
          className="bg-transparent text-ivory-light font-mono text-[11px] focus:outline-none cursor-pointer appearance-none pr-3"
          style={selectBgStyle}
        >
          {SORT_OPTIONS.map((option) => (
            <option key={option.id} value={option.id} className="bg-slate-dark">
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* Reset */}
      {hasActiveFilters && (
        <>
          <div className="w-px h-4 bg-ivory-light/15" />
          <button
            onClick={onReset}
            className="text-ivory-light hover:text-ivory-light transition-colors"
            title="Reset filters"
          >
            <RotateCcw size={12} />
          </button>
        </>
      )}
    </>
  );

  return (
    <div className="flex items-stretch gap-2 h-12">
      {/* Search */}
      <div className="flex-1 min-w-0">
        <SearchInput compact />
      </div>

      {/* Mobile: filter button + popover */}
      <div className="relative sm:hidden shrink-0 flex items-center" ref={popoverRef}>
        <button
          onClick={() => setMobileOpen((v) => !v)}
          className={`w-10 h-10 flex items-center justify-center border transition-colors ${
            mobileOpen || hasActiveFilters
              ? 'border-danger-orange/50 text-danger-orange'
              : 'border-ivory-light/20 text-ivory-light/60'
          }`}
        >
          <SlidersHorizontal size={16} />
        </button>

        {mobileOpen && (
          <div className="absolute right-0 top-full mt-2 z-50 bg-slate-dark border border-ivory-light/15 p-3 flex flex-col gap-3 min-w-[200px] shadow-lg">
            {filterControls}
          </div>
        )}
      </div>

      {/* Desktop: inline filters */}
      <div className="shrink-0 hidden sm:flex items-center gap-3">
        {filterControls}
      </div>
    </div>
  );
}

// ============================================================================
// STATES
// ============================================================================

function LoadingState() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <ClarpLoader size={80} variant="light" label="loading projects..." />
    </div>
  );
}

function EmptyState() {
  return (
    <div className="py-16 text-center border-2 border-ivory-light/10 bg-ivory-light/[0.02]">
      <p className="font-mono text-sm text-ivory-light">
        No results match your filters
      </p>
    </div>
  );
}

// ============================================================================
// PAGE
// ============================================================================

export default function TerminalEntityPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();

  // Derive entity type from URL slug
  const entitySlug = params.entityType as string;
  const entityFilter: EntityFilter = SLUG_TO_ENTITY[entitySlug] || 'project';

  // Read filter state from URL search params
  const categoryParam = searchParams.get('category');
  const category: CategoryFilter = (categoryParam && VALID_CATEGORIES.includes(categoryParam as CategoryFilter))
    ? categoryParam as CategoryFilter
    : 'all';

  const sortParam = searchParams.get('sort');
  const sortBy: SortOption = (sortParam && VALID_SORTS.includes(sortParam as SortOption))
    ? sortParam as SortOption
    : 'score-high';

  // Server-fetched data — accumulated for infinite scroll
  const [projects, setProjects] = useState<Project[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [entityCounts, setEntityCounts] = useState({ project: 0, person: 0, organization: 0 });

  // UI state
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [hasFetched, setHasFetched] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Track current offset for infinite scroll
  const offsetRef = useRef(0);
  const hasMore = projects.length < totalCount;

  // Sentinel ref for intersection observer
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  // AbortController ref for cancelling stale requests
  const abortRef = useRef<AbortController | null>(null);

  // Track current filter key to detect changes
  const filterKey = `${entityFilter}:${category}:${sortBy}`;
  const prevFilterKeyRef = useRef(filterKey);

  // Redirect invalid slugs to /terminal/projects
  useEffect(() => {
    if (!SLUG_TO_ENTITY[entitySlug]) {
      router.replace('/terminal/projects');
    }
  }, [entitySlug, router]);

  // Fetch a page of projects, optionally appending to existing list
  const fetchProjects = useCallback(async (offset: number, append: boolean, signal?: AbortSignal) => {
    if (append) {
      setIsFetchingMore(true);
    }
    setError(null);

    try {
      const { orderBy, order } = sortOptionToParams(sortBy);
      const apiParams = new URLSearchParams({
        entityType: entityFilter,
        orderBy,
        order,
        limit: String(PAGE_SIZE),
        offset: String(offset),
      });

      if (category !== 'all') apiParams.set('category', category);

      const res = await fetch(`/api/projects?${apiParams.toString()}`, { signal });
      if (!res.ok) throw new Error('Failed to fetch projects');
      const data = await res.json();

      const newProjects: Project[] = data.projects || [];

      if (append) {
        setProjects((prev) => [...prev, ...newProjects]);
      } else {
        setProjects(newProjects);
      }

      setTotalCount(data.total || 0);
      setEntityCounts(data.entityCounts || { project: 0, person: 0, organization: 0 });
      offsetRef.current = offset + newProjects.length;
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') return;
      console.error('[TerminalPage] Failed to fetch projects:', err);
      setError('Failed to load projects');
    }

    setIsFetchingMore(false);
    setIsInitialLoad(false);
    setHasFetched(true);
  }, [entityFilter, category, sortBy]);

  // Reset and fetch from the beginning when filters change
  useEffect(() => {
    const filtersChanged = prevFilterKeyRef.current !== filterKey;
    prevFilterKeyRef.current = filterKey;

    if (filtersChanged) {
      setProjects([]);
      setIsInitialLoad(true);
      setHasFetched(false);
    }

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    offsetRef.current = 0;
    fetchProjects(0, false, controller.signal);
    return () => controller.abort();
  }, [filterKey, fetchProjects]);

  // Infinite scroll — observe sentinel element
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting && hasMore && !isFetchingMore && !isInitialLoad) {
          fetchProjects(offsetRef.current, true);
        }
      },
      { rootMargin: '200px' },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, isFetchingMore, isInitialLoad, fetchProjects]);

  // URL update helper — replaces URL without full navigation
  const updateUrl = useCallback((slug: string, filters: {
    category?: CategoryFilter;
    sort?: SortOption;
  }) => {
    router.replace(buildUrl(slug, filters), { scroll: false });
  }, [router]);

  // Filter change handlers
  const handleCategory = (c: CategoryFilter) => {
    updateUrl(ENTITY_TO_SLUG[entityFilter], { category: c, sort: sortBy });
  };

  const handleSortBy = (s: SortOption) => {
    updateUrl(ENTITY_TO_SLUG[entityFilter], { category, sort: s });
  };

  const resetFilters = () => {
    updateUrl(ENTITY_TO_SLUG[entityFilter], {});
  };

  const hasActiveFilters =
    category !== 'all' ||
    sortBy !== 'score-high';

  return (
    <WalletGate showPreview={true}>
      <div className="absolute inset-0 flex flex-col">
        <div className="flex-1 flex flex-col overflow-hidden px-4 sm:px-6">
          {isInitialLoad ? (
            <LoadingState />
          ) : (
            <>
              {/* Search + Filters + Sort — single horizontal bar */}
              <div className="shrink-0 pt-4 pb-4">
                <ToolBar
                  category={category}
                  setCategory={handleCategory}
                  sortBy={sortBy}
                  setSortBy={handleSortBy}
                  hasActiveFilters={hasActiveFilters}
                  onReset={resetFilters}
                />
              </div>

              {error ? (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <p className="font-mono text-sm text-larp-red/80">{error}</p>
                    <button
                      onClick={() => {
                        offsetRef.current = 0;
                        fetchProjects(0, false);
                      }}
                      className="mt-4 font-mono text-xs text-ivory-light hover:text-ivory-light transition-colors"
                    >
                      Try again
                    </button>
                  </div>
                </div>
              ) : !hasFetched && projects.length === 0 ? (
                <div className="flex-1 flex items-center justify-center">
                  <ClarpLoader size={80} variant="light" label="loading projects..." />
                </div>
              ) : projects.length === 0 ? (
                <div className="flex-1 flex items-center justify-center">
                  <EmptyState />
                </div>
              ) : (
                <div className="flex-1 overflow-y-auto py-1">
                  <div className="flex flex-col gap-7">
                    {projects.map((project) => (
                      <IntelCard key={project.id} project={project} />
                    ))}
                  </div>

                  {/* Sentinel for infinite scroll */}
                  <div ref={sentinelRef} className="h-1" />

                  {/* Loading more indicator */}
                  {isFetchingMore && (
                    <div className="flex items-center justify-center py-4">
                      <Loader2 size={20} className="animate-spin text-ivory-light/40" />
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </WalletGate>
  );
}
