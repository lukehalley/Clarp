'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import {
  Filter,
  ArrowUpDown,
  RotateCcw,
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

// URL slug <-> internal entity type mapping
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
  page?: number;
}): string {
  const params = new URLSearchParams();

  if (filters.category && filters.category !== 'all') params.set('category', filters.category);
  if (filters.sort && filters.sort !== 'score-high') params.set('sort', filters.sort);
  if (filters.page && filters.page > 1) params.set('page', String(filters.page));

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
  const activeCategoryLabel = CATEGORY_FILTERS.find(f => f.id === category)?.label || 'All';
  const activeSortLabel = SORT_OPTIONS.find(s => s.id === sortBy)?.label || 'Trust: High to Low';

  return (
    <div className="flex items-stretch gap-2 h-12">
      {/* Search — takes remaining space */}
      <div className="flex-1 min-w-[180px]">
        <SearchInput compact />
      </div>

      {/* Right side: Filter | Sort | Reset */}
      <div className="shrink-0 hidden sm:flex items-center gap-0">
        {/* Category dropdown */}
        <div className="flex items-center gap-1.5">
          <Filter size={12} className="text-ivory-light" />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as CategoryFilter)}
            className="bg-transparent text-ivory-light font-mono text-[11px] focus:outline-none cursor-pointer appearance-none pr-3"
            style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'10\' height=\'10\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%239ca3af\' stroke-width=\'2\'%3E%3Cpath d=\'M6 9l6 6 6-6\'/%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0 center' }}
          >
            {CATEGORY_FILTERS.map((filter) => (
              <option key={filter.id} value={filter.id} className="bg-slate-dark">
                {filter.label}
              </option>
            ))}
          </select>
        </div>

        {/* Separator */}
        <div className="w-px h-4 bg-ivory-light/20 mx-3" />

        {/* Sort dropdown */}
        <div className="flex items-center gap-1.5">
          <ArrowUpDown size={12} className="text-ivory-light" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="bg-transparent text-ivory-light font-mono text-[11px] focus:outline-none cursor-pointer appearance-none pr-3"
            style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'10\' height=\'10\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%239ca3af\' stroke-width=\'2\'%3E%3Cpath d=\'M6 9l6 6 6-6\'/%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0 center' }}
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
            <div className="w-px h-4 bg-ivory-light/15 mx-3" />
            <button
              onClick={onReset}
              className="text-ivory-light hover:text-ivory-light transition-colors"
              title="Reset filters"
            >
              <RotateCcw size={12} />
            </button>
          </>
        )}
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

// Estimated card height (px): card padding + content + border + gap between cards
const CARD_HEIGHT_ESTIMATE = 86;
// Toolbar + padding overhead in the scrollable area (px)
const TOOLBAR_OVERHEAD = 60;
const MIN_ITEMS = 4;
const MAX_ITEMS = 30;

function useItemsPerPage(containerRef: React.RefObject<HTMLDivElement | null>) {
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const calculate = () => {
      const available = el.clientHeight - TOOLBAR_OVERHEAD;
      const count = Math.floor(available / CARD_HEIGHT_ESTIMATE);
      setItemsPerPage(Math.max(MIN_ITEMS, Math.min(MAX_ITEMS, count)));
    };

    calculate();

    const observer = new ResizeObserver(calculate);
    observer.observe(el);
    return () => observer.disconnect();
  }, [containerRef]);

  return itemsPerPage;
}

export default function TerminalEntityPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();

  // Ref for measuring available content height
  const contentRef = useRef<HTMLDivElement | null>(null);
  const itemsPerPage = useItemsPerPage(contentRef);

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

  const pageParam = searchParams.get('page');
  const currentPage = pageParam ? Math.max(1, parseInt(pageParam, 10) || 1) : 1;

  // Server-fetched data
  const [projects, setProjects] = useState<Project[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [entityCounts, setEntityCounts] = useState({ project: 0, person: 0, organization: 0 });

  // UI state
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // AbortController ref for cancelling stale requests
  const abortRef = useRef<AbortController | null>(null);

  const totalPages = Math.ceil(totalCount / itemsPerPage);

  // Redirect invalid slugs to /terminal/projects
  useEffect(() => {
    if (!SLUG_TO_ENTITY[entitySlug]) {
      router.replace('/terminal/projects');
    }
  }, [entitySlug, router]);

  const fetchProjects = useCallback(async (signal?: AbortSignal) => {
    try {
      setIsFetching(true);
      setError(null);

      const { orderBy, order } = sortOptionToParams(sortBy);
      const apiParams = new URLSearchParams({
        entityType: entityFilter,
        orderBy,
        order,
        limit: String(itemsPerPage),
        offset: String((currentPage - 1) * itemsPerPage),
      });

      if (category !== 'all') apiParams.set('category', category);

      const res = await fetch(`/api/projects?${apiParams.toString()}`, { signal });
      if (!res.ok) throw new Error('Failed to fetch projects');
      const data = await res.json();

      setProjects(data.projects || []);
      setTotalCount(data.total || 0);
      setEntityCounts(data.entityCounts || { project: 0, person: 0, organization: 0 });
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') return;
      console.error('[TerminalPage] Failed to fetch projects:', err);
      setError('Failed to load projects');
    } finally {
      setIsFetching(false);
      setIsInitialLoad(false);
    }
  }, [entityFilter, category, sortBy, currentPage, itemsPerPage]);

  // Fetch when any filter/sort/page changes
  useEffect(() => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    fetchProjects(controller.signal);
    return () => controller.abort();
  }, [fetchProjects]);

  // URL update helper — replaces URL without full navigation
  const updateUrl = useCallback((slug: string, filters: {
    category?: CategoryFilter;
    sort?: SortOption;
    page?: number;
  }) => {
    router.replace(buildUrl(slug, filters), { scroll: false });
  }, [router]);

  // Filter change handlers — update URL (state is derived from URL)
  const handleCategory = (c: CategoryFilter) => {
    updateUrl(ENTITY_TO_SLUG[entityFilter], { category: c, sort: sortBy });
  };

  const handleSortBy = (s: SortOption) => {
    updateUrl(ENTITY_TO_SLUG[entityFilter], { category, sort: s });
  };

  const handlePageChange = (page: number) => {
    updateUrl(ENTITY_TO_SLUG[entityFilter], { category, sort: sortBy, page });
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
        <div ref={contentRef} className="flex-1 flex flex-col overflow-hidden px-4 sm:px-6">
          {isInitialLoad ? (
            <LoadingState />
          ) : (
            <>
              {/* Search + Filters + Sort — single horizontal bar */}
              <div className="shrink-0">
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
                      onClick={() => fetchProjects()}
                      className="mt-4 font-mono text-xs text-ivory-light hover:text-ivory-light transition-colors"
                    >
                      Try again
                    </button>
                  </div>
                </div>
              ) : projects.length === 0 ? (
                <div className="flex-1 flex items-center justify-center">
                  <EmptyState />
                </div>
              ) : (
                <div className={`flex-1 flex flex-col justify-evenly py-2 transition-opacity duration-150 ${isFetching ? 'opacity-50 pointer-events-none' : ''}`}>
                  {projects.map((project) => (
                    <IntelCard key={project.id} project={project} />
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* Pagination — pinned to bottom */}
        {!isInitialLoad && totalPages > 1 && (
          <div className="shrink-0 border-t border-ivory-light/10 bg-slate-dark px-4 sm:px-6 py-3 z-10">
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 font-mono text-xs border border-ivory-light/20 text-ivory-light hover:text-ivory-light hover:border-ivory-light/40 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                ← Prev
              </button>
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`w-8 h-8 font-mono text-xs transition-colors ${
                      currentPage === page
                        ? 'bg-danger-orange text-black font-bold'
                        : 'border border-ivory-light/20 text-ivory-light hover:text-ivory-light hover:border-ivory-light/40'
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>
              <button
                onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 font-mono text-xs border border-ivory-light/20 text-ivory-light hover:text-ivory-light hover:border-ivory-light/40 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                Next →
              </button>
            </div>
          </div>
        )}
      </div>
    </WalletGate>
  );
}
