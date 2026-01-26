import type { ResolvedEntity } from '@/types/terminal';

// Solana address: 32-44 base58 characters (no 0, O, I, l)
const SOLANA_ADDRESS_REGEX = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;

// X/Twitter handle patterns
const X_HANDLE_REGEX = /^@?[a-zA-Z0-9_]{1,15}$/;
const X_URL_REGEX = /(?:x\.com|twitter\.com)\/([a-zA-Z0-9_]{1,15})/;

// Domain pattern (simplified)
const DOMAIN_REGEX = /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z]{2,})+$/;

// Ticker pattern
const TICKER_REGEX = /^\$?[A-Za-z][A-Za-z0-9]{0,9}$/;

/**
 * Resolve a search query to an entity type
 */
export function resolveEntity(query: string): ResolvedEntity | null {
  const trimmed = query.trim();

  if (!trimmed) {
    return null;
  }

  // Check for ticker (starts with $ or looks like a ticker)
  if (trimmed.startsWith('$') || trimmed.startsWith('#')) {
    const ticker = trimmed.slice(1).toUpperCase();
    if (ticker.length > 0 && ticker.length <= 10 && /^[A-Z][A-Z0-9]*$/.test(ticker)) {
      return {
        type: 'ticker',
        value: trimmed,
        normalized: ticker,
      };
    }
  }

  // Check for Solana address
  if (SOLANA_ADDRESS_REGEX.test(trimmed)) {
    return {
      type: 'contract',
      value: trimmed,
      normalized: trimmed,
      chain: 'solana',
    };
  }

  // Check for X/Twitter URL
  const xUrlMatch = trimmed.match(X_URL_REGEX);
  if (xUrlMatch) {
    return {
      type: 'x_handle',
      value: trimmed,
      normalized: xUrlMatch[1].toLowerCase(),
    };
  }

  // Check for X handle (starts with @)
  if (trimmed.startsWith('@')) {
    const handle = trimmed.slice(1);
    if (X_HANDLE_REGEX.test(handle)) {
      return {
        type: 'x_handle',
        value: trimmed,
        normalized: handle.toLowerCase(),
      };
    }
  }

  // Check for domain
  if (DOMAIN_REGEX.test(trimmed)) {
    // Remove protocol if present
    const normalized = trimmed
      .replace(/^https?:\/\//, '')
      .replace(/\/$/, '')
      .toLowerCase();
    return {
      type: 'domain',
      value: trimmed,
      normalized,
    };
  }

  // Check for X handle without @
  if (X_HANDLE_REGEX.test(trimmed) && !trimmed.includes('.')) {
    return {
      type: 'x_handle',
      value: trimmed,
      normalized: trimmed.toLowerCase(),
    };
  }

  // Check for uppercase ticker without $
  if (TICKER_REGEX.test(trimmed)) {
    return {
      type: 'ticker',
      value: trimmed,
      normalized: trimmed.toUpperCase(),
    };
  }

  return null;
}

/**
 * Validate if a string is a valid Solana address
 */
export function isValidSolanaAddress(address: string): boolean {
  return SOLANA_ADDRESS_REGEX.test(address);
}

/**
 * Validate if a string is a valid X handle
 */
export function isValidXHandle(handle: string): boolean {
  const normalized = handle.startsWith('@') ? handle.slice(1) : handle;
  return X_HANDLE_REGEX.test(normalized);
}

/**
 * Validate if a string is a valid domain
 */
export function isValidDomain(domain: string): boolean {
  return DOMAIN_REGEX.test(domain);
}

/**
 * Extract X handle from various formats
 */
export function extractXHandle(input: string): string | null {
  // Check URL format
  const urlMatch = input.match(X_URL_REGEX);
  if (urlMatch) {
    return urlMatch[1].toLowerCase();
  }

  // Check @handle format
  if (input.startsWith('@')) {
    const handle = input.slice(1);
    if (X_HANDLE_REGEX.test(handle)) {
      return handle.toLowerCase();
    }
  }

  // Check plain handle
  if (X_HANDLE_REGEX.test(input)) {
    return input.toLowerCase();
  }

  return null;
}

/**
 * Format entity for display
 */
export function formatEntity(entity: ResolvedEntity): string {
  switch (entity.type) {
    case 'ticker':
      return `$${entity.normalized}`;
    case 'x_handle':
      return `@${entity.normalized}`;
    case 'contract':
      return `${entity.normalized.slice(0, 6)}...${entity.normalized.slice(-4)}`;
    case 'domain':
      return entity.normalized;
    default:
      return entity.value;
  }
}

/**
 * Get search suggestions based on partial input
 */
export function getSuggestions(query: string): string[] {
  const trimmed = query.trim();

  if (!trimmed) {
    return [];
  }

  const suggestions: string[] = [];

  // If starts with letter but no $, suggest ticker
  if (/^[a-zA-Z]/.test(trimmed) && !trimmed.includes('.') && !trimmed.startsWith('$')) {
    suggestions.push(`$${trimmed.toUpperCase()}`);
  }

  // If starts with letter, suggest @handle
  if (/^[a-zA-Z]/.test(trimmed) && !trimmed.startsWith('@') && trimmed.length <= 15) {
    suggestions.push(`@${trimmed.toLowerCase()}`);
  }

  // If looks like partial domain, suggest .com
  if (/^[a-zA-Z0-9-]+$/.test(trimmed) && trimmed.length > 2) {
    suggestions.push(`${trimmed.toLowerCase()}.com`);
  }

  return suggestions.slice(0, 3);
}
