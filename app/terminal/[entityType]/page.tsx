'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import {
  Filter,
  CheckCircle,
  AlertTriangle,
  Shield,
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

const CATEGORY_FILTERS: { id: CategoryFilter; label: string; icon: React.ReactNode }[] = [
  { id: 'all', label: 'All', icon: <Filter size={14} /> },
  { id: 'verified', label: 'Verified', icon: <CheckCircle size={14} /> },
  { id: 'high-risk', label: 'High Risk', icon: <AlertTriangle size={14} /> },
  { id: 'low-risk', label: 'Trusted', icon: <Shield size={14} /> },
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
  verified?: boolean;
  page?: number;
}): string {
  const params = new URLSearchParams();

  if (filters.category && filters.category !== 'all') params.set('category', filters.category);
  if (filters.sort && filters.sort !== 'score-high') params.set('sort', filters.sort);
  if (filters.verified) params.set('verified', 'true');
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
  verifiedOnly,
  setVerifiedOnly,
  hasActiveFilters,
  onReset,
}: {
  category: CategoryFilter;
  setCategory: (c: CategoryFilter) => void;
  sortBy: SortOption;
  setSortBy: (s: SortOption) => void;
  verifiedOnly: boolean;
  setVerifiedOnly: (v: boolean) => void;
  hasActiveFilters: boolean;
  onReset: () => void;
}) {
  return (
    <div className="flex items-center gap-2 py-3 border-b border-ivory-light/10 overflow-x-auto scrollbar-hide">
      {/* Search */}
      <div className="flex-1 min-w-[180px]">
        <SearchInput compact />
      </div>

      {/* Divider */}
      <div className="w-px h-6 bg-ivory-light/10 shrink-0 hidden sm:block" />

      {/* Category filters */}
      <div className="flex items-center gap-1 shrink-0">
        {CATEGORY_FILTERS.map((filter) => (
          <button
            key={filter.id}
            onClick={() => setCategory(filter.id)}
            className={`flex items-center gap-1 px-2 py-1.5 font-mono text-[11px] transition-colors border whitespace-nowrap ${
              category === filter.id
                ? 'bg-danger-orange text-black font-bold border-danger-orange'
                : 'bg-transparent border-ivory-light/20 text-ivory-light/60 hover:text-ivory-light hover:border-ivory-light/40'
            }`}
          >
            {filter.icon}
            <span className="hidden sm:inline">{filter.label}</span>
          </button>
        ))}
      </div>

      {/* Divider */}
      <div className="w-px h-6 bg-ivory-light/10 shrink-0 hidden sm:block" />

      {/* Sort */}
      <div className="flex items-center gap-1.5 shrink-0">
        <ArrowUpDown size={12} className="text-ivory-light/40" />
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as SortOption)}
          className="px-1.5 py-1.5 bg-transparent border border-ivory-light/20 text-ivory-light/60 font-mono text-[11px] focus:border-danger-orange/50 focus:outline-none cursor-pointer"
        >
          {SORT_OPTIONS.map((option) => (
            <option key={option.id} value={option.id} className="bg-slate-dark">
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* Verified toggle */}
      <button
        onClick={() => setVerifiedOnly(!verifiedOnly)}
        className={`flex items-center gap-1 px-2 py-1.5 font-mono text-[11px] transition-colors border shrink-0 ${
          verifiedOnly
            ? 'bg-larp-green/20 border-larp-green/50 text-larp-green'
            : 'bg-transparent border-ivory-light/20 text-ivory-light/40 hover:text-ivory-light/60'
        }`}
      >
        <CheckCircle size={11} />
        <span className="hidden sm:inline">Verified</span>
      </button>

      {/* Reset */}
      {hasActiveFilters && (
        <button
          onClick={onReset}
          className="flex items-center gap-1 px-2 py-1.5 font-mono text-[11px] text-ivory-light/40 hover:text-ivory-light/60 transition-colors shrink-0"
        >
          <RotateCcw size={11} />
        </button>
      )}
    </div>
  );
}

// ============================================================================
// STATES
// ============================================================================

function LoadingState() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <ClarpLoader size={80} variant="light" label="loading projects..." />
    </div>
  );
}

function EmptyState({ onRequestScan }: { onRequestScan: () => void }) {
  return (
    <div className="py-16 text-center border-2 border-ivory-light/10 bg-ivory-light/[0.02]">
      <p className="font-mono text-sm text-ivory-light/40 mb-4">
        No projects match your filters
      </p>
      <button
        onClick={onRequestScan}
        className="font-mono text-sm text-danger-orange hover:text-danger-orange/80 transition-colors"
      >
        Search and scan a project
      </button>
    </div>
  );
}

// ============================================================================
// PAGE
// ============================================================================

const ITEMS_PER_PAGE = 10;

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

  const verifiedOnly = searchParams.get('verified') === 'true';

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

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

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
        limit: String(ITEMS_PER_PAGE),
        offset: String((currentPage - 1) * ITEMS_PER_PAGE),
      });

      if (category !== 'all') apiParams.set('category', category);
      if (verifiedOnly) apiParams.set('verifiedOnly', 'true');

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
  }, [entityFilter, category, sortBy, verifiedOnly, currentPage]);

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
    verified?: boolean;
    page?: number;
  }) => {
    router.replace(buildUrl(slug, filters), { scroll: false });
  }, [router]);

  // Filter change handlers — update URL (state is derived from URL)
  const handleCategory = (c: CategoryFilter) => {
    updateUrl(ENTITY_TO_SLUG[entityFilter], { category: c, sort: sortBy, verified: verifiedOnly });
  };

  const handleSortBy = (s: SortOption) => {
    updateUrl(ENTITY_TO_SLUG[entityFilter], { category, sort: s, verified: verifiedOnly });
  };

  const handleVerifiedOnly = (v: boolean) => {
    updateUrl(ENTITY_TO_SLUG[entityFilter], { category, sort: sortBy, verified: v });
  };

  const handlePageChange = (page: number) => {
    updateUrl(ENTITY_TO_SLUG[entityFilter], { category, sort: sortBy, verified: verifiedOnly, page });
  };

  const handleRequestScan = () => {
    router.push('/terminal/scan');
  };

  const resetFilters = () => {
    updateUrl(ENTITY_TO_SLUG[entityFilter], {});
  };

  const hasActiveFilters =
    category !== 'all' ||
    sortBy !== 'score-high' ||
    verifiedOnly;

  // Get label for results count
  const getResultsLabel = () => {
    if (entityFilter === 'person') return totalCount === 1 ? 'person' : 'people';
    if (entityFilter === 'organization') return totalCount === 1 ? 'org' : 'orgs';
    return totalCount === 1 ? 'project' : 'projects';
  };

  return (
    <WalletGate showPreview={true}>
      <div className="px-4 sm:px-6 py-4">
        {isInitialLoad ? (
          <LoadingState />
        ) : (
          <>
          {/* Search + Filters + Sort — single horizontal bar */}
          <ToolBar
            category={category}
            setCategory={handleCategory}
            sortBy={sortBy}
            setSortBy={handleSortBy}
            verifiedOnly={verifiedOnly}
            setVerifiedOnly={handleVerifiedOnly}
            hasActiveFilters={hasActiveFilters}
            onReset={resetFilters}
          />

          {/* Results count */}
          <div className="flex items-center justify-between py-4">
            <span className="font-mono text-xs text-ivory-light/40">
              {totalCount} {getResultsLabel()}
            </span>
          </div>

          {error ? (
          <div className="py-16 text-center">
            <p className="font-mono text-sm text-larp-red/80">{error}</p>
            <button
              onClick={() => fetchProjects()}
              className="mt-4 font-mono text-xs text-ivory-light/40 hover:text-ivory-light/60 transition-colors"
            >
              Try again
            </button>
          </div>
        ) : projects.length === 0 ? (
          <EmptyState onRequestScan={handleRequestScan} />
        ) : (
          <div className={`transition-opacity duration-150 ${isFetching ? 'opacity-50 pointer-events-none' : ''}`}>
            <div className="space-y-4">
              {projects.map((project) => (
                <IntelCard key={project.id} project={project} />
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-6 pt-4 border-t border-ivory-light/10">
                <button
                  onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 font-mono text-xs border border-ivory-light/20 text-ivory-light/60 hover:text-ivory-light hover:border-ivory-light/40 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
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
                          : 'border border-ivory-light/20 text-ivory-light/60 hover:text-ivory-light hover:border-ivory-light/40'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1.5 font-mono text-xs border border-ivory-light/20 text-ivory-light/60 hover:text-ivory-light hover:border-ivory-light/40 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  Next →
                </button>
              </div>
            )}
          </div>
        )}

        {/* Bottom hint */}
        {totalCount > 0 && (
          <div className="mt-8 pt-6 border-t border-ivory-light/5 text-center">
            <p className="font-mono text-xs text-ivory-light/30">
              Can&apos;t find what you&apos;re looking for?{' '}
              <button
                onClick={handleRequestScan}
                className="text-danger-orange hover:text-danger-orange/80 transition-colors"
              >
                Search and scan
              </button>
            </p>
          </div>
        )}
          </>
        )}
      </div>
    </WalletGate>
  );
}
