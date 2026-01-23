// X Intel Reputation Scoring Engine
// Explainable scoring with factor breakdown

import {
  ReputationScore,
  ScoreFactor,
  ScoreFactorType,
  SCORE_FACTOR_CONFIG,
  XIntelRiskLevel,
  getRiskLevelFromScore,
  BehaviorMetrics,
  BacklashEvent,
  ShilledEntity,
  NetworkMetrics,
} from '@/types/xintel';

// ============================================================================
// FACTOR CALCULATORS
// ============================================================================

export interface ScoreInput {
  shilledEntities: ShilledEntity[];
  backlashEvents: BacklashEvent[];
  behaviorMetrics: BehaviorMetrics;
  networkMetrics: NetworkMetrics;
  postsAnalyzed: number;
  accountAgeDays?: number;
}

/**
 * Serial Shill Score (max 25 points)
 * Detects accounts that promote many unrelated tokens in short time
 */
export function calculateShillScore(input: ScoreInput): ScoreFactor {
  const { shilledEntities, behaviorMetrics } = input;
  const config = SCORE_FACTOR_CONFIG.serial_shill;

  let points = 0;
  const evidenceIds: string[] = [];

  // Number of unique tokens promoted
  const uniqueTokens = shilledEntities.length;
  if (uniqueTokens >= 20) points += 12;
  else if (uniqueTokens >= 10) points += 8;
  else if (uniqueTokens >= 5) points += 4;

  // High promo intensity across multiple tokens
  const highPromoEntities = shilledEntities.filter(e => e.promoIntensity > 70);
  if (highPromoEntities.length >= 5) points += 8;
  else if (highPromoEntities.length >= 3) points += 5;
  else if (highPromoEntities.length >= 1) points += 2;

  // Shill burst detection
  if (behaviorMetrics.spamBurst.detected) {
    const burstCount = behaviorMetrics.spamBurst.burstPeriods.length;
    points += Math.min(5, burstCount * 2);
  }

  // Collect evidence
  shilledEntities.slice(0, 5).forEach(e => {
    evidenceIds.push(...e.evidenceIds.slice(0, 2));
  });

  return {
    type: 'serial_shill',
    points: Math.min(config.maxPoints, points),
    maxPoints: config.maxPoints,
    description: points > 15
      ? `Promotes ${uniqueTokens}+ tokens with aggressive patterns`
      : points > 5
        ? `Moderate promotional activity across ${uniqueTokens} tokens`
        : 'Minimal promotional patterns detected',
    evidenceIds: [...new Set(evidenceIds)],
  };
}

/**
 * Backlash Density Score (max 25 points)
 * Tracks repeated callouts and accusations over time
 */
export function calculateBacklashScore(input: ScoreInput): ScoreFactor {
  const { backlashEvents } = input;
  const config = SCORE_FACTOR_CONFIG.backlash_density;

  let points = 0;
  const evidenceIds: string[] = [];

  // Number of backlash events
  const eventCount = backlashEvents.length;
  if (eventCount >= 10) points += 12;
  else if (eventCount >= 5) points += 8;
  else if (eventCount >= 2) points += 4;
  else if (eventCount >= 1) points += 2;

  // Severity weighting
  const criticalEvents = backlashEvents.filter(e => e.severity === 'critical');
  const highEvents = backlashEvents.filter(e => e.severity === 'high');

  points += criticalEvents.length * 4;
  points += highEvents.length * 2;

  // Multiple sources adds credibility to accusations
  const multiSourceEvents = backlashEvents.filter(e => e.sources.length >= 3);
  points += multiSourceEvents.length * 2;

  // Collect evidence
  backlashEvents.slice(0, 5).forEach(e => {
    evidenceIds.push(...e.evidenceIds.slice(0, 2));
  });

  return {
    type: 'backlash_density',
    points: Math.min(config.maxPoints, points),
    maxPoints: config.maxPoints,
    description: points > 15
      ? `${eventCount} backlash events including ${criticalEvents.length} critical`
      : points > 5
        ? `${eventCount} backlash events detected`
        : 'Minimal public backlash',
    evidenceIds: [...new Set(evidenceIds)],
  };
}

/**
 * Toxicity/Vulgarity Score (max 15 points)
 * Measures profanity and targeted harassment
 */
export function calculateToxicityScore(input: ScoreInput): ScoreFactor {
  const { behaviorMetrics } = input;
  const config = SCORE_FACTOR_CONFIG.toxic_vulgar;

  const toxicityRaw = behaviorMetrics.toxicity.score;
  const vulgarityRaw = behaviorMetrics.vulgarity.score;
  const aggressionRaw = behaviorMetrics.aggression.score;

  // Weighted combination (aggression weighted highest)
  const combinedScore = (toxicityRaw * 0.3 + vulgarityRaw * 0.2 + aggressionRaw * 0.5);

  // Map to points (0-100 → 0-15)
  const points = Math.round((combinedScore / 100) * config.maxPoints);

  const evidenceIds: string[] = [
    ...behaviorMetrics.toxicity.examples.map((_, i) => `toxic-${i}`),
    ...behaviorMetrics.aggression.examples.map((_, i) => `aggro-${i}`),
  ];

  return {
    type: 'toxic_vulgar',
    points: Math.min(config.maxPoints, points),
    maxPoints: config.maxPoints,
    description: points > 10
      ? 'High toxicity and aggressive language patterns'
      : points > 5
        ? 'Moderate profanity or confrontational tone'
        : 'Generally civil discourse',
    evidenceIds,
  };
}

/**
 * Hype Merchant Score (max 15 points)
 * Detects "100x", "guaranteed", "ape now" patterns
 */
export function calculateHypeScore(input: ScoreInput): ScoreFactor {
  const { behaviorMetrics } = input;
  const config = SCORE_FACTOR_CONFIG.hype_merchant;

  const hypeRaw = behaviorMetrics.hype.score;

  // Map to points (0-100 → 0-15)
  const points = Math.round((hypeRaw / 100) * config.maxPoints);

  const keywords = behaviorMetrics.hype.keywords.slice(0, 5);
  const evidenceIds = behaviorMetrics.hype.examples.map((_, i) => `hype-${i}`);

  return {
    type: 'hype_merchant',
    points: Math.min(config.maxPoints, points),
    maxPoints: config.maxPoints,
    description: points > 10
      ? `Heavy hype language: ${keywords.join(', ')}`
      : points > 5
        ? `Moderate hype patterns detected`
        : 'Measured promotional language',
    evidenceIds,
  };
}

/**
 * Consistency Score (max 10 points)
 * Measures topic drift and contradictions
 */
export function calculateConsistencyScore(input: ScoreInput): ScoreFactor {
  const { behaviorMetrics } = input;
  const config = SCORE_FACTOR_CONFIG.consistency;

  const consistencyRaw = behaviorMetrics.consistency.score;
  const topicDrift = behaviorMetrics.consistency.topicDrift;
  const contradictions = behaviorMetrics.consistency.contradictions;

  // Lower consistency = higher points (bad)
  let points = Math.round(((100 - consistencyRaw) / 100) * config.maxPoints * 0.6);

  // Add points for contradictions
  points += Math.min(4, contradictions.length);

  const evidenceIds = contradictions.map((_, i) => `contradiction-${i}`);

  return {
    type: 'consistency',
    points: Math.min(config.maxPoints, points),
    maxPoints: config.maxPoints,
    description: points > 7
      ? `High topic drift (${topicDrift}%) with ${contradictions.length} contradictions`
      : points > 3
        ? `Some inconsistency detected`
        : 'Generally consistent messaging',
    evidenceIds,
  };
}

/**
 * Engagement Suspicion Score (max 10 points)
 * Detects bot-like patterns and abnormal engagement ratios
 */
export function calculateEngagementScore(input: ScoreInput): ScoreFactor {
  const { networkMetrics, postsAnalyzed, accountAgeDays } = input;
  const config = SCORE_FACTOR_CONFIG.engagement_suspicion;

  let points = 0;

  const { engagementHeuristics } = networkMetrics;

  // Suspicious patterns
  points += engagementHeuristics.suspiciousPatterns.length * 2;

  // Abnormal ratios
  if (engagementHeuristics.replyRatio > 0.8) points += 2; // Almost all replies
  if (engagementHeuristics.retweetRatio > 0.7) points += 2; // Mostly retweets

  // New account with high volume
  if (accountAgeDays && accountAgeDays < 90 && postsAnalyzed > 500) {
    points += 3;
  }

  const evidenceIds = engagementHeuristics.suspiciousPatterns.map((_, i) => `engage-${i}`);

  return {
    type: 'engagement_suspicion',
    points: Math.min(config.maxPoints, points),
    maxPoints: config.maxPoints,
    description: points > 7
      ? 'Multiple suspicious engagement patterns'
      : points > 3
        ? 'Some unusual engagement behavior'
        : 'Normal engagement patterns',
    evidenceIds,
  };
}

// ============================================================================
// COMBINED SCORING
// ============================================================================

export function calculateReputationScore(input: ScoreInput): ReputationScore {
  // Calculate all factors
  const factors: ScoreFactor[] = [
    calculateShillScore(input),
    calculateBacklashScore(input),
    calculateToxicityScore(input),
    calculateHypeScore(input),
    calculateConsistencyScore(input),
    calculateEngagementScore(input),
  ];

  // Total deducted points
  const totalDeducted = factors.reduce((sum, f) => sum + f.points, 0);
  const maxPossible = factors.reduce((sum, f) => sum + f.maxPoints, 0);

  // Overall score: 100 - deductions (higher = cleaner)
  const overall = Math.max(0, Math.min(100, 100 - totalDeducted));

  // Risk level
  const riskLevel = getRiskLevelFromScore(overall);

  // Confidence based on data quality
  let confidence: 'low' | 'medium' | 'high' = 'medium';
  if (input.postsAnalyzed >= 500) confidence = 'high';
  else if (input.postsAnalyzed < 100) confidence = 'low';

  return {
    overall,
    riskLevel,
    factors,
    confidence,
  };
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

export function getFactorSummary(factors: ScoreFactor[]): string[] {
  return factors
    .filter(f => f.points > 0)
    .sort((a, b) => b.points - a.points)
    .slice(0, 3)
    .map(f => `${SCORE_FACTOR_CONFIG[f.type].label}: ${f.description}`);
}

export function getTopRiskFactors(factors: ScoreFactor[]): ScoreFactorType[] {
  return factors
    .filter(f => f.points >= f.maxPoints * 0.5) // At least 50% of max
    .sort((a, b) => (b.points / b.maxPoints) - (a.points / a.maxPoints))
    .map(f => f.type);
}

export function formatScoreForDisplay(score: ReputationScore): {
  scoreText: string;
  riskText: string;
  summaryText: string;
} {
  const { overall, riskLevel, factors } = score;

  let scoreText = '';
  if (overall >= 85) scoreText = 'Appears Trustworthy';
  else if (overall >= 70) scoreText = 'Mostly Clean';
  else if (overall >= 50) scoreText = 'Some Concerns';
  else if (overall >= 30) scoreText = 'Multiple Red Flags';
  else scoreText = 'High Risk Profile';

  const riskText = riskLevel === 'low' ? 'Low Risk'
    : riskLevel === 'medium' ? 'Medium Risk'
    : 'High Risk';

  const topFactors = factors
    .filter(f => f.points > 0)
    .sort((a, b) => b.points - a.points)
    .slice(0, 2);

  const summaryText = topFactors.length > 0
    ? `Key concerns: ${topFactors.map(f => SCORE_FACTOR_CONFIG[f.type].label).join(', ')}`
    : 'No major concerns detected';

  return { scoreText, riskText, summaryText };
}
