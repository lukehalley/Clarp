'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Filter,
  CheckCircle,
  AlertTriangle,
  Shield,
  ArrowUpDown,
  RotateCcw,
  Boxes,
  User,
  Building2,
} from 'lucide-react';
import IntelCard from '@/components/terminal/IntelCard';
import WalletGate from '@/components/auth/WalletGate';
import TokenomicsDashboard from '@/components/tokenomics/Dashboard';
import ClarpLoader from '@/components/ClarpLoader';
import type { Project } from '@/types/project';

// ============================================================================
// TYPES
// ============================================================================

type EntityFilter = 'project' | 'person' | 'organization';
type CategoryFilter = 'all' | 'verified' | 'high-risk' | 'low-risk';
type SortOption = 'score-high' | 'score-low' | 'recent' | 'name-asc';

const SORT_OPTIONS: { id: SortOption; label: string }[] = [
  { id: 'score-high', label: 'Trust: High to Low' },
  { id: 'score-low', label: 'Trust: Low to High' },
  { id: 'recent', label: 'Recently Scanned' },
  { id: 'name-asc', label: 'Name: A to Z' },
];

const ENTITY_FILTERS: { id: EntityFilter; label: string; shortLabel: string; icon: React.ReactNode; color: string }[] = [
  { id: 'project', label: 'Projects', shortLabel: 'Projects', icon: <Boxes size={14} />, color: 'text-danger-orange' },
  { id: 'person', label: 'People', shortLabel: 'People', icon: <User size={14} />, color: 'text-larp-purple' },
  { id: 'organization', label: 'Orgs', shortLabel: 'Orgs', icon: <Building2 size={14} />, color: 'text-larp-yellow' },
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
// ENTITY TYPE TABS
// ============================================================================

function EntityTypeTabs({
  entityFilter,
  setEntityFilter,
  counts,
}: {
  entityFilter: EntityFilter;
  setEntityFilter: (e: EntityFilter) => void;
  counts: { project: number; person: number; organization: number };
}) {
  return (
    <div className="border-b-2 border-ivory-light/10">
      <div className="flex">
        {ENTITY_FILTERS.map((filter, index) => {
          const isActive = entityFilter === filter.id;
          const count = counts[filter.id];

          return (
            <button
              key={filter.id}
              onClick={() => setEntityFilter(filter.id)}
              className={`
                relative flex items-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-3 sm:py-4
                font-mono text-[11px] sm:text-xs transition-all duration-200
                border-b-2 -mb-[2px]
                ${isActive
                  ? `${filter.color} border-current font-bold bg-current/5`
                  : 'text-ivory-light/40 border-transparent hover:text-ivory-light/60 hover:bg-ivory-light/[0.02]'
                }
                ${index === 0 ? '' : 'border-l border-ivory-light/5'}
              `}
            >
              <span className={`transition-transform duration-200 ${isActive ? 'scale-110' : ''}`}>
                {filter.icon}
              </span>
              <span className="hidden xs:inline">{filter.label}</span>
              <span className="xs:hidden">{filter.shortLabel}</span>
              {count > 0 && (
                <span className={`
                  ml-1 px-1.5 py-0.5 text-[9px] sm:text-[10px] rounded-sm
                  ${isActive
                    ? 'bg-current/20 text-current'
                    : 'bg-ivory-light/10 text-ivory-light/40'
                  }
                `}>
                  {count}
                </span>
              )}
              {/* Active indicator glow */}
              {isActive && (
                <div
                  className="absolute bottom-0 left-0 right-0 h-[2px] blur-sm"
                  style={{
                    backgroundColor: filter.id === 'project' ? '#FF6B35'
                      : filter.id === 'person' ? '#9B59B6'
                      : '#FFD93D'
                  }}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ============================================================================
// FILTER BAR
// ============================================================================

function FilterBar({
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
    <div className="space-y-3 py-4 border-b border-ivory-light/10">
      {/* Row 1: Category filters - scrollable on mobile */}
      <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0 scrollbar-hide">
        <div className="flex items-center gap-1 min-w-max sm:min-w-0">
          {CATEGORY_FILTERS.map((filter) => (
            <button
              key={filter.id}
              onClick={() => setCategory(filter.id)}
              className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 font-mono text-[11px] sm:text-xs transition-colors border whitespace-nowrap ${
                category === filter.id
                  ? 'bg-danger-orange text-black font-bold border-danger-orange'
                  : 'bg-transparent border-ivory-light/20 text-ivory-light/60 hover:text-ivory-light hover:border-ivory-light/40'
              }`}
            >
              {filter.icon}
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {/* Row 2: Sort + Verified + Reset */}
      <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
        {/* Sort */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <ArrowUpDown size={12} className="text-ivory-light/40 sm:w-3.5 sm:h-3.5" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="px-1.5 sm:px-2 py-1.5 bg-transparent border border-ivory-light/20 text-ivory-light/60 font-mono text-[11px] sm:text-xs focus:border-danger-orange/50 focus:outline-none cursor-pointer max-w-[140px] sm:max-w-none"
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
          className={`flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 font-mono text-[11px] sm:text-xs transition-colors border ${
            verifiedOnly
              ? 'bg-larp-green/20 border-larp-green/50 text-larp-green'
              : 'bg-transparent border-ivory-light/20 text-ivory-light/40 hover:text-ivory-light/60'
          }`}
        >
          <CheckCircle size={11} className="sm:w-3 sm:h-3" />
          <span className="hidden xs:inline">Verified</span>
          <span className="xs:hidden">✓</span>
        </button>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Reset */}
        {hasActiveFilters && (
          <button
            onClick={onReset}
            className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 font-mono text-[11px] sm:text-xs text-ivory-light/40 hover:text-ivory-light/60 transition-colors"
          >
            <RotateCcw size={11} className="sm:w-3 sm:h-3" />
            <span className="hidden xs:inline">Reset</span>
          </button>
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

export default function TerminalPage() {
  const router = useRouter();

  // Server-fetched data
  const [projects, setProjects] = useState<Project[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [entityCounts, setEntityCounts] = useState({ project: 0, person: 0, organization: 0 });

  // UI state
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  // Filters
  const [entityFilter, setEntityFilter] = useState<EntityFilter>('project');
  const [category, setCategory] = useState<CategoryFilter>('all');
  const [sortBy, setSortBy] = useState<SortOption>('score-high');
  const [scoreRange, setScoreRange] = useState<[number, number]>([0, 100]);
  const [verifiedOnly, setVerifiedOnly] = useState(false);

  // AbortController ref for cancelling stale requests
  const abortRef = useRef<AbortController | null>(null);

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  const fetchProjects = useCallback(async (signal?: AbortSignal) => {
    try {
      setIsFetching(true);
      setError(null);

      const { orderBy, order } = sortOptionToParams(sortBy);
      const params = new URLSearchParams({
        entityType: entityFilter,
        orderBy,
        order,
        limit: String(ITEMS_PER_PAGE),
        offset: String((currentPage - 1) * ITEMS_PER_PAGE),
      });

      if (category !== 'all') params.set('category', category);
      if (verifiedOnly) params.set('verifiedOnly', 'true');
      if (scoreRange[0] > 0) params.set('minScore', String(scoreRange[0]));
      if (scoreRange[1] < 100) params.set('maxScore', String(scoreRange[1]));

      const res = await fetch(`/api/projects?${params.toString()}`, { signal });
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
  }, [entityFilter, category, sortBy, scoreRange, verifiedOnly, currentPage]);

  // Fetch when any filter/sort/page changes
  useEffect(() => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    fetchProjects(controller.signal);
    return () => controller.abort();
  }, [fetchProjects]);

  // Reset page to 1 when filters change (not when page itself changes)
  const handleEntityFilter = (e: EntityFilter) => { setEntityFilter(e); setCurrentPage(1); };
  const handleCategory = (c: CategoryFilter) => { setCategory(c); setCurrentPage(1); };
  const handleSortBy = (s: SortOption) => { setSortBy(s); setCurrentPage(1); };
  const handleVerifiedOnly = (v: boolean) => { setVerifiedOnly(v); setCurrentPage(1); };

  const handleRequestScan = () => {
    router.push('/terminal/scan');
  };

  const resetFilters = () => {
    setEntityFilter('project');
    setCategory('all');
    setSortBy('score-high');
    setScoreRange([0, 100]);
    setVerifiedOnly(false);
    setCurrentPage(1);
  };

  const hasActiveFilters =
    entityFilter !== 'project' ||
    category !== 'all' ||
    sortBy !== 'score-high' ||
    scoreRange[0] !== 0 ||
    scoreRange[1] !== 100 ||
    verifiedOnly;

  // Get label for results count
  const getResultsLabel = () => {
    if (entityFilter === 'person') return totalCount === 1 ? 'person' : 'people';
    if (entityFilter === 'organization') return totalCount === 1 ? 'org' : 'orgs';
    return totalCount === 1 ? 'project' : 'projects';
  };

  return (
    <WalletGate showPreview={true}>
      <div className="px-4 sm:px-6 py-6">
        <div className="max-w-7xl mx-auto">
        {isInitialLoad ? (
          <LoadingState />
        ) : (
          <>
          {/* Entity Type Tabs */}
          <EntityTypeTabs
            entityFilter={entityFilter}
            setEntityFilter={handleEntityFilter}
            counts={entityCounts}
          />

          {/* Filter Bar */}
          <FilterBar
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
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 font-mono text-xs border border-ivory-light/20 text-ivory-light/60 hover:text-ivory-light hover:border-ivory-light/40 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  ← Prev
                </button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
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
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1.5 font-mono text-xs border border-ivory-light/20 text-ivory-light/60 hover:text-ivory-light hover:border-ivory-light/40 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  Next →
                </button>
              </div>
            )}
          </div>
        )}

        {/* Tokenomics Dashboard */}
        <div className="mt-8 pt-6 border-t-2 border-ivory-light/10">
          <TokenomicsDashboard />
        </div>

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
      </div>
    </WalletGate>
  );
}
