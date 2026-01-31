'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, X, AtSign, Link as LinkIcon, Coins, Github, Loader2, User, Building2, Boxes } from 'lucide-react';
import type { Project } from '@/types/project';

interface SearchInputProps {
  compact?: boolean;
  initialValue?: string;
  onSearch?: (query: string) => void;
}

type InputType = 'token_address' | 'x_handle' | 'x_url' | 'website' | 'github';

const INPUT_ICONS: Record<InputType, React.ReactNode> = {
  token_address: <Coins size={14} />,
  x_handle: <AtSign size={14} />,
  x_url: <LinkIcon size={14} />,
  website: <LinkIcon size={14} />,
  github: <Github size={14} />,
};

const INPUT_LABELS: Record<InputType, string> = {
  token_address: 'token',
  x_handle: 'handle',
  x_url: 'x url',
  website: 'website',
  github: 'github',
};

const RECENT_SEARCHES_KEY = 'clarp-recent-searches';
const MAX_RECENT_SEARCHES = 5;
const SUGGESTION_DEBOUNCE = 300;
const MAX_SUGGESTIONS = 5;

const PLACEHOLDER_OPTIONS = [
  'Paste a Solana token address...',
  'Enter an X handle like @claborators...',
  'Paste a GitHub URL...',
  'Enter a website like clarp.fun...',
  'Search for any token name...',
];

function getTrustDotColor(score: number): string {
  if (score >= 85) return '#22c55e';
  if (score >= 70) return '#84cc16';
  if (score >= 50) return '#6b7280';
  if (score >= 30) return '#f97316';
  return '#dc2626';
}

function getEntityIcon(entityType?: string) {
  switch (entityType) {
    case 'person': return <User size={14} className="text-larp-purple" />;
    case 'organization': return <Building2 size={14} className="text-larp-yellow" />;
    default: return <Boxes size={14} className="text-danger-orange" />;
  }
}

function getEntityRoute(project: Project): string {
  const identifier = project.xHandle || project.id;
  switch (project.entityType) {
    case 'person': return `/terminal/person/${identifier}`;
    case 'organization': return `/terminal/org/${identifier}`;
    default: return `/terminal/project/${identifier}`;
  }
}

export default function SearchInput({ compact, initialValue = '', onSearch }: SearchInputProps) {
  const router = useRouter();
  const [query, setQuery] = useState(initialValue);
  const [isFocused, setIsFocused] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [displayedPlaceholder, setDisplayedPlaceholder] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [suggestions, setSuggestions] = useState<Project[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Typewriter effect for placeholder — pauses when focused
  useEffect(() => {
    if (isFocused) return;

    const currentText = PLACEHOLDER_OPTIONS[placeholderIndex];

    const timeout = setTimeout(() => {
      if (!isDeleting) {
        if (displayedPlaceholder.length < currentText.length) {
          setDisplayedPlaceholder(currentText.slice(0, displayedPlaceholder.length + 1));
        } else {
          setTimeout(() => setIsDeleting(true), 2000);
        }
      } else {
        if (displayedPlaceholder.length > 0) {
          setDisplayedPlaceholder(displayedPlaceholder.slice(0, -1));
        } else {
          setIsDeleting(false);
          setPlaceholderIndex((prev) => (prev + 1) % PLACEHOLDER_OPTIONS.length);
        }
      }
    }, isDeleting ? 30 : 80);

    return () => clearTimeout(timeout);
  }, [displayedPlaceholder, isDeleting, placeholderIndex, isFocused]);

  // Load recent searches from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
    if (stored) {
      try {
        setRecentSearches(JSON.parse(stored));
      } catch {
        // Ignore parse errors
      }
    }
  }, []);

  // Debounced suggestion fetch
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    abortRef.current?.abort();

    const trimmed = query.trim();
    const detected = getDetectedType(trimmed);

    // Skip suggestions for URLs, addresses, etc — only suggest for name/handle-like queries
    if (trimmed.length < 2 || detected === 'token_address' || detected === 'x_url' || detected === 'website' || detected === 'github') {
      setSuggestions([]);
      setIsLoadingSuggestions(false);
      return;
    }

    setIsLoadingSuggestions(true);

    debounceRef.current = setTimeout(async () => {
      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const res = await fetch(`/api/projects?q=${encodeURIComponent(trimmed)}&limit=${MAX_SUGGESTIONS}`, {
          signal: controller.signal,
        });
        if (!res.ok) throw new Error('fetch failed');
        const data = await res.json();
        setSuggestions(data.projects || []);
      } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') return;
        setSuggestions([]);
      } finally {
        setIsLoadingSuggestions(false);
      }
    }, SUGGESTION_DEBOUNCE);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  // Clear suggestions on blur
  useEffect(() => {
    if (!isFocused) {
      // Small delay so click on suggestion registers before clearing
      const t = setTimeout(() => setSuggestions([]), 150);
      return () => clearTimeout(t);
    }
  }, [isFocused]);

  // Save search to recent
  const saveRecentSearch = useCallback((search: string) => {
    const updated = [search, ...recentSearches.filter(s => s !== search)].slice(0, MAX_RECENT_SEARCHES);
    setRecentSearches(updated);
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
  }, [recentSearches]);

  // Handle search submission
  const handleSearch = useCallback((searchQuery: string) => {
    const trimmed = searchQuery.trim();
    if (!trimmed) return;

    saveRecentSearch(trimmed);
    setIsFocused(false);

    if (onSearch) {
      onSearch(trimmed);
    } else {
      // Navigate to scan page to analyze
      router.push(`/terminal/scan?q=${encodeURIComponent(trimmed)}`);
    }
  }, [onSearch, router, saveRecentSearch]);

  // Handle form submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch(query);
  };

  // Handle recent search click
  const handleRecentClick = (search: string) => {
    setQuery(search);
    handleSearch(search);
  };

  // Handle suggestion click
  const handleSuggestionClick = (project: Project) => {
    setIsFocused(false);
    router.push(getEntityRoute(project));
  };

  // Clear input
  const handleClear = () => {
    setQuery('');
    inputRef.current?.focus();
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        !inputRef.current?.contains(e.target as Node)
      ) {
        setIsFocused(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Detect input type - prioritize token addresses
  const getDetectedType = (q: string): InputType | null => {
    if (!q) return null;
    const trimmed = q.trim();

    // Solana address: base58, 32-44 chars (typically 43-44)
    if (/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(trimmed)) return 'token_address';

    // EVM address: 0x + 40 hex chars
    if (/^0x[a-fA-F0-9]{40}$/.test(trimmed)) return 'token_address';

    // GitHub URL
    if (trimmed.includes('github.com/')) return 'github';

    // X/Twitter URL
    if (trimmed.includes('x.com/') || trimmed.includes('twitter.com/')) return 'x_url';

    // Website URL (has protocol or looks like domain)
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) return 'website';
    if (/^[a-zA-Z0-9][-a-zA-Z0-9]*\.[a-zA-Z]{2,}/.test(trimmed)) return 'website';

    // X handle with @
    if (trimmed.startsWith('@')) return 'x_handle';

    // Looks like a handle without @ (alphanumeric + underscore, 1-15 chars)
    if (/^[a-zA-Z0-9_]{1,15}$/.test(trimmed)) return 'x_handle';

    return null;
  };

  const detectedType = getDetectedType(query);
  const showDropdown = isFocused && (recentSearches.length > 0 || query);

  return (
    <div className={`relative ${compact ? 'h-full' : ''}`}>
      <form onSubmit={handleSubmit} className={compact ? 'h-full' : ''}>
        <div
          className={`flex items-center gap-2 border-b transition-colors ${
            isFocused
              ? 'border-danger-orange'
              : 'border-ivory-light/20 hover:border-ivory-light/40'
          } ${compact ? 'h-full px-1' : 'px-1 py-3'}`}
        >
          <Search size={compact ? 16 : 18} className="text-ivory-light shrink-0" />

          {detectedType && (
            <span className="flex items-center gap-1 px-2 py-0.5 bg-danger-orange/20 text-danger-orange text-xs font-mono shrink-0">
              {INPUT_ICONS[detectedType]}
              {INPUT_LABELS[detectedType]}
            </span>
          )}

          <div className="relative flex-1">
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setIsFocused(true)}
              placeholder=""
              className={`w-full bg-transparent text-ivory-light font-mono outline-none ${
                compact ? 'text-sm' : 'text-base'
              }`}
            />
            {/* Typewriter placeholder */}
            {!query && !isFocused && (
              <div
                className={`absolute inset-0 flex items-center pointer-events-none text-ivory-light font-mono ${
                  compact ? 'text-sm' : 'text-base'
                }`}
              >
                <span>{displayedPlaceholder}</span>
                <span className="animate-blink">|</span>
              </div>
            )}
          </div>

          {query && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 text-ivory-light hover:text-ivory-light"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </form>

      {/* Dropdown */}
      {showDropdown && (
        <div
          ref={dropdownRef}
          className="absolute top-full left-0 right-0 mt-1 bg-slate-dark border border-ivory-light/20 z-50 max-h-[35vh] sm:max-h-64 overflow-y-auto shadow-xl"
        >
          {/* Recent searches */}
          {recentSearches.length > 0 && !query && (
            <div className="p-2">
              <div className="text-[11px] sm:text-xs font-mono text-ivory-light px-2 py-1">Recent</div>
              {recentSearches.map((search, i) => (
                <button
                  key={i}
                  onClick={() => handleRecentClick(search)}
                  className="w-full text-left px-2 sm:px-3 py-2 font-mono text-xs sm:text-sm text-ivory-light hover:bg-ivory-light/5 hover:text-ivory-light flex items-center gap-2 overflow-hidden"
                >
                  <Search size={12} className="text-ivory-light shrink-0 sm:w-3.5 sm:h-3.5" />
                  <span className="truncate">{search}</span>
                </button>
              ))}
            </div>
          )}

          {/* Search hints */}
          {query && (
            <div className="p-2">
              <button
                onClick={() => handleSearch(query)}
                className="w-full text-left px-2 sm:px-3 py-2 font-mono text-xs sm:text-sm text-ivory-light hover:bg-danger-orange/10 flex items-center gap-2"
              >
                <Search size={12} className="text-danger-orange shrink-0 sm:w-3.5 sm:h-3.5" />
                <span className="truncate">Search for &quot;{query.slice(0, 30)}{query.length > 30 ? '...' : ''}&quot;</span>
              </button>
            </div>
          )}

          {/* Suggestions */}
          {query && (suggestions.length > 0 || isLoadingSuggestions) && (
            <div className="p-2 border-t border-ivory-light/10">
              <div className="flex items-center gap-2 px-2 py-1">
                <span className="text-[11px] sm:text-xs font-mono text-ivory-light">Suggestions</span>
                {isLoadingSuggestions && <Loader2 size={10} className="animate-spin text-ivory-light" />}
              </div>
              {suggestions.map((project) => (
                <button
                  key={project.id}
                  onClick={() => handleSuggestionClick(project)}
                  className="w-full text-left px-2 sm:px-3 py-2 font-mono text-xs sm:text-sm text-ivory-light hover:bg-ivory-light/5 hover:text-ivory-light flex items-center gap-2.5 overflow-hidden"
                >
                  {/* Entity type icon */}
                  <span className="shrink-0">{getEntityIcon(project.entityType)}</span>

                  {/* Avatar */}
                  {project.avatarUrl ? (
                    <img
                      src={project.avatarUrl}
                      alt=""
                      className="w-5 h-5 rounded-full shrink-0 object-cover"
                    />
                  ) : (
                    <div className="w-5 h-5 rounded-full shrink-0 bg-ivory-light/10 flex items-center justify-center text-[9px] text-ivory-light font-bold">
                      {project.name?.[0]?.toUpperCase() || '?'}
                    </div>
                  )}

                  {/* Name + secondary info */}
                  <div className="flex-1 min-w-0 flex items-center gap-1.5">
                    <span className="truncate text-ivory-light">{project.name}</span>
                    {project.ticker && (
                      <span className="text-[10px] text-ivory-light shrink-0">${project.ticker}</span>
                    )}
                    {!project.ticker && project.xHandle && (
                      <span className="text-[10px] text-ivory-light shrink-0">@{project.xHandle}</span>
                    )}
                  </div>

                  {/* Trust score dot */}
                  {project.trustScore && (
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: getTrustDotColor(project.trustScore.score) }}
                      title={`Trust: ${project.trustScore.score}`}
                    />
                  )}
                </button>
              ))}
            </div>
          )}

          {/* Input format hints */}
          <div className="p-2 border-t border-ivory-light/10">
            <div className="text-[11px] sm:text-xs font-mono text-ivory-light px-2 py-1">Accepted format</div>
            <div className="text-[10px] sm:text-xs font-mono text-ivory-light px-2">
              <span className="flex items-center gap-1">{INPUT_ICONS.token_address} Solana token address (32-44 chars)</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
