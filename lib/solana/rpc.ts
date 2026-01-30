// RPC Retry Utility
// Retries Solana RPC calls with exponential backoff for transient failures (504s, network errors)

export interface RetryOptions {
  maxAttempts?: number;
  baseDelayMs?: number;
}

const DEFAULT_OPTIONS: Required<RetryOptions> = {
  maxAttempts: 3,
  baseDelayMs: 1000,
};

function isTransientError(err: unknown): boolean {
  if (!(err instanceof Error)) return true;

  // Don't retry known non-transient SPL token errors
  if (err.name === 'TokenAccountNotFoundError') return false;
  if (err.name === 'TokenInvalidAccountOwnerError') return false;

  const msg = err.message.toLowerCase();

  // 504 Gateway Timeout from Helius
  if (msg.includes('504') || msg.includes('gateway timeout')) return true;
  // Network-level failures
  if (msg.includes('fetch failed') || msg.includes('network') || msg.includes('econnrefused')) return true;
  // Generic timeout
  if (msg.includes('timeout') || msg.includes('timed out')) return true;
  // 429 rate limit
  if (msg.includes('429') || msg.includes('too many requests')) return true;
  // 503 service unavailable
  if (msg.includes('503') || msg.includes('service unavailable')) return true;

  return false;
}

export async function withRetry<T>(
  fn: () => Promise<T>,
  opts?: RetryOptions,
): Promise<T> {
  const { maxAttempts, baseDelayMs } = { ...DEFAULT_OPTIONS, ...opts };

  let lastError: unknown;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;

      if (attempt === maxAttempts || !isTransientError(err)) {
        throw err;
      }

      const delay = baseDelayMs * Math.pow(2, attempt - 1);
      console.warn(
        `[RPC] Attempt ${attempt}/${maxAttempts} failed, retrying in ${delay}ms`,
        err instanceof Error ? err.message : err,
      );
      await new Promise((r) => setTimeout(r, delay));
    }
  }

  // Unreachable, but satisfies TypeScript
  throw lastError;
}
