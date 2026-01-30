// X Profile Intel - TypeScript Types
// "Know the founder before you ape"

import { Chain } from './terminal';

// ============================================================================
// SCAN STATUS & JOBS
// ============================================================================

export type ScanStatus =
  | 'queued'
  | 'fetching'
  | 'extracting'
  | 'researching'   // Perplexity web research (grounded facts)
  | 'analyzing'
  | 'scoring'
  | 'enriching'
  | 'complete'
  | 'failed'
  | 'cached';

export interface ScanJob {
  id: string;
  handle: string;
  depth: number;
  status: ScanStatus;
  progress: number; // 0-100
  statusMessage?: string; // Detailed step description
  startedAt: Date;
  completedAt?: Date;
  error?: string;
}

export const SCAN_STATUS_LABELS: Record<ScanStatus, string> = {
  queued: 'Initializing Scan',
  fetching: 'Fetching Profile & Posts',
  extracting: 'Extracting Crypto Intel',
  researching: 'Researching Background',
  analyzing: 'AI Behavioral Analysis',
  scoring: 'Building Trust Report',
  enriching: 'Enriching Token Data',
  complete: 'Complete',
  failed: 'Failed',
  cached: 'Cached',
};

// User-visible scan stages (derived from ScanStatus)
export interface ScanStageConfig {
  status: ScanStatus;
  label: string;
  order: number;
  optional?: boolean; // e.g. 'researching' only appears when Perplexity is active
}

export const SCAN_STAGES: ScanStageConfig[] = [
  { status: 'queued',      label: 'initializing scan',        order: 0 },
  { status: 'fetching',    label: 'fetching profile & posts', order: 1 },
  { status: 'extracting',  label: 'extracting crypto intel',  order: 2 },
  { status: 'researching', label: 'researching background',   order: 3, optional: true },
  { status: 'analyzing',   label: 'ai behavioral analysis',   order: 4 },
  { status: 'scoring',     label: 'building trust report',    order: 5 },
  { status: 'enriching',   label: 'enriching token data',     order: 6 },
];

export const SCAN_STATUS_PROGRESS: Record<ScanStatus, number> = {
  queued: 0,
  fetching: 15,
  extracting: 30,
  researching: 42,
  analyzing: 55,
  scoring: 75,
  enriching: 90,
  complete: 100,
  failed: 0,
  cached: 100,
};

// ============================================================================
// PROFILE
// ============================================================================

export interface XIntelProfile {
  handle: string;
  displayName?: string;
  bio?: string;
  verified: boolean;
  followers?: number;
  following?: number;
  createdAt?: Date;
  languagesDetected: string[];
  profileImageUrl?: string;
  bannerUrl?: string;
}

// ============================================================================
// EVIDENCE
// ============================================================================

export type XIntelEvidenceLabel =
  | 'shill'
  | 'backlash'
  | 'toxic'
  | 'hype'
  | 'contradiction'
  | 'suspicious'
  | 'neutral';

export interface XIntelEvidence {
  id: string;
  tweetId: string;
  timestamp: Date;
  excerpt: string;
  label: XIntelEvidenceLabel;
  url: string;
  confidence: number; // 0-1
}

export const EVIDENCE_LABEL_COLORS: Record<XIntelEvidenceLabel, string> = {
  shill: '#f97316',
  backlash: '#dc2626',
  toxic: '#7f1d1d',
  hype: '#eab308',
  contradiction: '#9B59B6',
  suspicious: '#f97316',
  neutral: '#6b7280',
};

// ============================================================================
// SHILLED ENTITIES
// ============================================================================

export interface TokenMarketData {
  tokenAddress: string;
  poolAddress?: string;
  priceUsd: number;
  // Price changes for multiple timeframes
  priceChange5m?: number;
  priceChange1h?: number;
  priceChange6h?: number;
  priceChange24h?: number;
  volume24h?: number;
  liquidity?: number;
  marketCap?: number;
  dexType?: 'raydium' | 'meteora' | 'orca' | 'pump_fun' | 'unknown';
  // Transaction data
  buys24h?: number;
  sells24h?: number;
  // Token info
  imageUrl?: string;
  pairCreatedAt?: number;
  // URLs
  dexScreenerUrl?: string;
  birdeyeUrl?: string;
}

export interface ShilledEntity {
  id: string;
  entityName: string;
  ticker?: string;
  mentionCount: number;
  promoCount: number;
  firstSeen: Date;
  lastSeen: Date;
  promoIntensity: number; // 0-100 (promotional vs neutral ratio)
  evidenceIds: string[];
  // Token market data (if resolved)
  tokenData?: TokenMarketData;
}

// ============================================================================
// BACKLASH EVENTS
// ============================================================================

export type BacklashCategory =
  | 'scam_allegation'
  | 'rug_accusation'
  | 'fraud_claim'
  | 'warning'
  | 'exposed'
  | 'criticism'
  | 'dispute';

export type BacklashSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface BacklashSource {
  handle: string;
  displayName?: string;
  followers?: number;
}

export interface BacklashEvent {
  id: string;
  category: BacklashCategory;
  severity: BacklashSeverity;
  startDate: Date;
  endDate?: Date;
  sources: BacklashSource[];
  evidenceIds: string[];
  summary: string;
}

export const BACKLASH_CATEGORY_LABELS: Record<BacklashCategory, string> = {
  scam_allegation: 'Scam Allegation',
  rug_accusation: 'Rug Accusation',
  fraud_claim: 'Fraud Claim',
  warning: 'Warning',
  exposed: 'Exposed',
  criticism: 'Criticism',
  dispute: 'Dispute',
};

export const BACKLASH_SEVERITY_COLORS: Record<BacklashSeverity, string> = {
  low: '#6b7280',
  medium: '#eab308',
  high: '#f97316',
  critical: '#dc2626',
};

// ============================================================================
// BEHAVIOR METRICS
// ============================================================================

export interface BehaviorExample {
  excerpt: string;
  tweetId: string;
  timestamp: Date;
}

export interface BehaviorMetrics {
  toxicity: {
    score: number; // 0-100
    examples: BehaviorExample[];
  };
  vulgarity: {
    score: number;
    examples: BehaviorExample[];
  };
  hype: {
    score: number;
    examples: BehaviorExample[];
    keywords: string[];
  };
  aggression: {
    score: number;
    examples: BehaviorExample[];
    targetPatterns: string[];
  };
  consistency: {
    score: number; // higher = more consistent (good)
    topicDrift: number;
    contradictions: BehaviorExample[];
  };
  spamBurst: {
    detected: boolean;
    burstPeriods: { start: Date; end: Date; count: number }[];
  };
}

// ============================================================================
// NETWORK METRICS
// ============================================================================

export interface InteractionAccount {
  handle: string;
  displayName?: string;
  followers?: number;
  interactionCount: number;
  interactionType: 'reply' | 'quote' | 'retweet' | 'mention';
}

export interface NetworkMetrics {
  topInteractions: InteractionAccount[];
  mentionList: string[];
  engagementHeuristics: {
    replyRatio: number;
    retweetRatio: number;
    avgEngagementRate: number;
    suspiciousPatterns: string[];
  };
}

// ============================================================================
// LINKED ENTITIES
// ============================================================================

export type LinkedEntityType =
  | 'domain'
  | 'telegram'
  | 'discord'
  | 'github'
  | 'wallet'
  | 'handle';

export type LinkedEntityConfidence = 'low' | 'medium' | 'high';

export interface LinkedEntity {
  id: string;
  type: LinkedEntityType;
  value: string;
  confidence: LinkedEntityConfidence;
  chain?: Chain;
  evidenceIds: string[];
  firstSeen: Date;
  lastSeen: Date;
  mentionCount: number;
}

export const LINKED_ENTITY_TYPE_LABELS: Record<LinkedEntityType, string> = {
  domain: 'Website',
  telegram: 'Telegram',
  discord: 'Discord',
  github: 'GitHub',
  wallet: 'Wallet',
  handle: 'X Handle',
};

export const LINKED_ENTITY_TYPE_ICONS: Record<LinkedEntityType, string> = {
  domain: '🌐',
  telegram: '📱',
  discord: '💬',
  github: '🔧',
  wallet: '👛',
  handle: '🐦',
};

// ============================================================================
// SCORING
// ============================================================================

export type ScoreFactorType =
  | 'serial_shill'
  | 'backlash_density'
  | 'toxic_vulgar'
  | 'hype_merchant'
  | 'consistency'
  | 'engagement_suspicion';

export interface ScoreFactor {
  type: ScoreFactorType;
  points: number; // 0 to max points for this factor
  maxPoints: number;
  description: string;
  evidenceIds: string[];
}

export const SCORE_FACTOR_CONFIG: Record<ScoreFactorType, { maxPoints: number; label: string; description: string }> = {
  serial_shill: {
    maxPoints: 25,
    label: 'Serial Shill',
    description: 'Promotes many unrelated tokens/projects in short time',
  },
  backlash_density: {
    maxPoints: 25,
    label: 'Backlash Density',
    description: 'Repeated callouts/accusations over time',
  },
  toxic_vulgar: {
    maxPoints: 15,
    label: 'Toxic/Vulgar',
    description: 'Profanity, targeted harassment',
  },
  hype_merchant: {
    maxPoints: 15,
    label: 'Hype Merchant',
    description: '"100x", "guaranteed", "ape now" patterns',
  },
  consistency: {
    maxPoints: 10,
    label: 'Consistency Issues',
    description: 'Sudden narrative shifts, conflicting claims',
  },
  engagement_suspicion: {
    maxPoints: 10,
    label: 'Engagement Suspicion',
    description: 'Bot-like patterns, abnormal ratios',
  },
};

export type XIntelRiskLevel = 'low' | 'medium' | 'high';

export interface ReputationScore {
  overall: number; // 0-100 (100 = clean, 0 = very risky)
  riskLevel: XIntelRiskLevel;
  factors: ScoreFactor[];
  confidence: 'low' | 'medium' | 'high';
}

// ============================================================================
// FULL REPORT
// ============================================================================

export interface KeyFinding {
  id: string;
  title: string;
  description: string;
  severity: 'info' | 'warning' | 'critical';
  evidenceIds: string[];
}

export interface XIntelReport {
  id: string;
  profile: XIntelProfile;
  score: ReputationScore;
  keyFindings: KeyFinding[];
  shilledEntities: ShilledEntity[];
  backlashEvents: BacklashEvent[];
  behaviorMetrics: BehaviorMetrics;
  networkMetrics: NetworkMetrics;
  linkedEntities: LinkedEntity[];
  evidence: XIntelEvidence[];
  scanTime: Date;
  postsAnalyzed: number;
  cached: boolean;
  disclaimer: string;
}

// ============================================================================
// API TYPES
// ============================================================================

export interface ScanRequest {
  handle: string;
  depth?: number;
  force?: boolean;
}

export interface ScanResponse {
  jobId: string;
  status: ScanStatus;
  cached?: boolean;
}

export interface ReportResponse {
  report: XIntelReport;
  cached: boolean;
  cacheAge?: number; // seconds
}

export interface ShareResponse {
  url: string;
  expiresAt: Date;
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

export function getRiskLevelFromScore(score: number): XIntelRiskLevel {
  if (score >= 75) return 'low';
  if (score >= 45) return 'medium';
  return 'high';
}

export function getRiskLevelColor(level: XIntelRiskLevel): string {
  switch (level) {
    case 'low': return '#22c55e';
    case 'medium': return '#eab308';
    case 'high': return '#dc2626';
  }
}

export function getRiskLevelLabel(level: XIntelRiskLevel): string {
  switch (level) {
    case 'low': return 'Low Risk';
    case 'medium': return 'Medium Risk';
    case 'high': return 'High Risk';
  }
}

export function getScoreLabel(score: number): string {
  if (score >= 85) return 'Appears Trustworthy';
  if (score >= 70) return 'Mostly Clean';
  if (score >= 50) return 'Some Concerns';
  if (score >= 30) return 'Multiple Red Flags';
  return 'High Risk Profile';
}

export function getScoreColor(score: number): string {
  if (score >= 85) return '#22c55e';
  if (score >= 70) return '#84cc16';
  if (score >= 50) return '#eab308';
  if (score >= 30) return '#f97316';
  return '#dc2626';
}

export function formatHandle(input: string): string {
  // Clean handle from various input formats
  let handle = input.trim();

  // Remove URL prefixes
  handle = handle.replace(/^https?:\/\/(www\.)?(twitter|x)\.com\//i, '');

  // Remove @ prefix
  handle = handle.replace(/^@/, '');

  // Remove trailing slashes and paths
  handle = handle.split('/')[0];
  handle = handle.split('?')[0];

  return handle.toLowerCase();
}

export function isValidHandle(handle: string): boolean {
  // X handles: 4-15 chars, alphanumeric + underscore
  const cleaned = formatHandle(handle);
  return /^[a-zA-Z0-9_]{4,15}$/.test(cleaned);
}
