'use client';

// Token Balance Hook
// Fetches and tracks CLARP token balance for connected wallet

import { useState, useEffect, useCallback } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { getAssociatedTokenAddress, getAccount } from '@solana/spl-token';
import { CLARP_MINT, CLARP_DECIMALS } from '@/lib/config/tokenomics';
import { withRetry } from '@/lib/solana/rpc';

/**
 * Format large numbers in compact form (e.g., 19.61B, 1.5M, 750K)
 */
function formatCompactNumber(num: number): string {
  if (num >= 1_000_000_000) {
    return (num / 1_000_000_000).toFixed(2).replace(/\.?0+$/, '') + 'B';
  }
  if (num >= 1_000_000) {
    return (num / 1_000_000).toFixed(2).replace(/\.?0+$/, '') + 'M';
  }
  if (num >= 1_000) {
    return (num / 1_000).toFixed(2).replace(/\.?0+$/, '') + 'K';
  }
  return num.toLocaleString(undefined, { maximumFractionDigits: 2 });
}

export interface TokenBalanceState {
  balance: number | null;
  balanceRaw: bigint | null;
  balanceFormatted: string;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useTokenBalance(): TokenBalanceState {
  const { connection } = useConnection();
  const { publicKey, connected } = useWallet();

  const [balance, setBalance] = useState<number | null>(null);
  const [balanceRaw, setBalanceRaw] = useState<bigint | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [consecutiveFailures, setConsecutiveFailures] = useState(0);

  const fetchBalance = useCallback(async () => {
    if (!publicKey || !connected) {
      setBalance(null);
      setBalanceRaw(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const ata = await getAssociatedTokenAddress(CLARP_MINT, publicKey);
      const account = await withRetry(() => getAccount(connection, ata));

      const rawBalance = account.amount;
      const formattedBalance = Number(rawBalance) / Math.pow(10, CLARP_DECIMALS);

      setBalanceRaw(rawBalance);
      setBalance(formattedBalance);
      setConsecutiveFailures(0);
    } catch (err) {
      // TokenAccountNotFoundError means user has no CLARP
      if (err instanceof Error && err.name === 'TokenAccountNotFoundError') {
        setBalance(0);
        setBalanceRaw(BigInt(0));
        setConsecutiveFailures(0);
      } else {
        console.error('[useTokenBalance] Error after retries:', err);
        setError(err instanceof Error ? err : new Error('Failed to fetch balance'));
        // Still set to 0 on error so UI can render
        setBalance(0);
        setBalanceRaw(BigInt(0));
        setConsecutiveFailures((c) => c + 1);
      }
    } finally {
      setIsLoading(false);
    }
  }, [connection, publicKey, connected]);

  // Fetch on mount and when wallet changes
  useEffect(() => {
    fetchBalance();
  }, [fetchBalance]);

  // Auto-refresh: 30s normally, 60s when RPC is degraded
  useEffect(() => {
    if (!connected) return;

    const intervalMs = consecutiveFailures >= 2 ? 60000 : 30000;
    const interval = setInterval(fetchBalance, intervalMs);
    return () => clearInterval(interval);
  }, [connected, fetchBalance, consecutiveFailures]);

  return {
    balance,
    balanceRaw,
    balanceFormatted: balance !== null ? formatCompactNumber(balance) : '—',
    isLoading,
    error,
    refetch: fetchBalance,
  };
}
