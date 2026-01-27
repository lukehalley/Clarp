// CLARP Token Configuration
// Constants for token gating, tiers, and revenue distribution

import { PublicKey } from '@solana/web3.js';

// CLARP Token
export const CLARP_MINT = new PublicKey('GtwMkjRY8Vi5oGaLaEsd1xnsr3AkZ6ZYBqsG5ipTBAGS');
export const CLARP_DECIMALS = 9;

// Tier thresholds (in whole tokens, not raw amounts)
export const TIER_THRESHOLDS = {
  free: 0,
  holder: 1_000,      // 1K CLARP
  power: 10_000,      // 10K CLARP
  whale: 100_000,     // 100K CLARP
} as const;

export type Tier = keyof typeof TIER_THRESHOLDS;

// Tier benefits
export interface TierLimits {
  dailyScans: number;
  freshScansAllowed: boolean;
  priorityQueue: boolean;
  apiAccess: boolean;
  bulkScans: boolean;
  exportReports: boolean;
  historyDays: number;
}

export const TIER_LIMITS: Record<Tier, TierLimits> = {
  free: {
    dailyScans: 3,
    freshScansAllowed: false,
    priorityQueue: false,
    apiAccess: false,
    bulkScans: false,
    exportReports: false,
    historyDays: 7,
  },
  holder: {
    dailyScans: 10,
    freshScansAllowed: true,
    priorityQueue: false,
    apiAccess: false,
    bulkScans: false,
    exportReports: true,
    historyDays: 30,
  },
  power: {
    dailyScans: Infinity,
    freshScansAllowed: true,
    priorityQueue: false,
    apiAccess: true,
    bulkScans: false,
    exportReports: true,
    historyDays: 90,
  },
  whale: {
    dailyScans: Infinity,
    freshScansAllowed: true,
    priorityQueue: true,
    apiAccess: true,
    bulkScans: true,
    exportReports: true,
    historyDays: Infinity,
  },
};

// Revenue distribution (from Bags.fm creator fees)
export const REVENUE_SPLIT = {
  profit: 0.50,      // 50% to owner
  operations: 0.30,  // 30% for API costs
  burn: 0.20,        // 20% buy & burn
};

// Minimum SOL to trigger distribution
export const MIN_DISTRIBUTION_SOL = 0.1;

// Bags.fm URL for buying CLARP
export const BAGS_FM_URL = 'https://bags.fm/token/GtwMkjRY8Vi5oGaLaEsd1xnsr3AkZ6ZYBqsG5ipTBAGS';

// Tier display config - icon names reference Lucide icons
// Uses brutalist design system colors for high visibility
export const TIER_CONFIG: Record<Tier, { label: string; color: string; bg: string; border: string; icon: string }> = {
  free: {
    label: 'Free',
    color: 'text-ivory-light/70',
    bg: 'bg-slate-medium/30',
    border: 'border-ivory-light/30',
    icon: 'user',
  },
  holder: {
    label: 'Holder',
    color: 'text-cyan-400',
    bg: 'bg-cyan-500/20',
    border: 'border-cyan-400',
    icon: 'star',
  },
  power: {
    label: 'Power',
    color: 'text-fuchsia-400',
    bg: 'bg-fuchsia-500/20',
    border: 'border-fuchsia-400',
    icon: 'gem',
  },
  whale: {
    label: 'Whale',
    color: 'text-danger-orange',
    bg: 'bg-danger-orange/20',
    border: 'border-danger-orange',
    icon: 'crown',
  },
};
