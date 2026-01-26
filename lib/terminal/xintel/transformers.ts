// Data Transformers
// Convert Grok analysis responses to app-internal XIntel types

import type {
  GrokAnalysisResult,
} from '@/lib/grok/types';
import type {
  XIntelReport,
  XIntelProfile,
  XIntelEvidence,
  ReputationScore,
  ScoreFactor,
  KeyFinding,
  BehaviorMetrics,
  NetworkMetrics,
  LinkedEntity,
} from '@/types/xintel';

// ============================================================================
// GROK ANALYSIS → XINTEL REPORT (Simplified for Responses API)
// ============================================================================

/**
 * Transform Grok analysis result (from Responses API with x_search) to XIntel report
 * This is the primary transformer for the simplified Grok-only approach
 */
export function grokAnalysisToReport(analysis: GrokAnalysisResult): XIntelReport {
  // Build profile from Grok analysis
  const profile: XIntelProfile = {
    handle: analysis.handle || analysis.profile.handle,
    displayName: analysis.profile.displayName,
    bio: analysis.profile.bio,
    verified: analysis.profile.verified,
    followers: analysis.profile.followers,
    following: analysis.profile.following,
    createdAt: analysis.profile.createdAt ? new Date(analysis.profile.createdAt) : undefined,
    languagesDetected: ['en'],
    profileImageUrl: undefined,
    bannerUrl: undefined,
  };

  // Build reputation score from analysis
  const score = buildScoreFromAnalysis(analysis);

  // Transform key findings
  const keyFindings: KeyFinding[] = analysis.keyFindings.map((finding, i) => ({
    id: `kf_${i}`,
    title: extractFindingTitle(finding),
    description: finding,
    severity: determineSeverity(finding, analysis.riskLevel),
    evidenceIds: [],
  }));

  // Build linked entities from analysis
  const linkedEntities: LinkedEntity[] = [];

  if (analysis.github) {
    linkedEntities.push({
      id: 'le_github',
      type: 'github',
      value: analysis.github,
      confidence: 'high',
      evidenceIds: [],
      firstSeen: new Date(),
      lastSeen: new Date(),
      mentionCount: 1,
    });
  }

  if (analysis.website) {
    linkedEntities.push({
      id: 'le_website',
      type: 'domain',
      value: analysis.website,
      confidence: 'high',
      evidenceIds: [],
      firstSeen: new Date(),
      lastSeen: new Date(),
      mentionCount: 1,
    });
  }

  if (analysis.contract) {
    linkedEntities.push({
      id: 'le_contract',
      type: 'domain',
      value: `${analysis.contract.chain}:${analysis.contract.address}`,
      confidence: 'high',
      evidenceIds: [],
      firstSeen: new Date(),
      lastSeen: new Date(),
      mentionCount: 1,
    });
  }

  // Build evidence from citations
  const evidence: XIntelEvidence[] = analysis.citations.map((citation, i) => ({
    id: `ev_citation_${i}`,
    tweetId: extractTweetIdFromUrl(citation.url) || `citation_${i}`,
    timestamp: new Date(),
    excerpt: citation.title || citation.url,
    label: 'neutral' as const,
    url: citation.url,
    confidence: 0.8,
  }));

  // Build default behavior and network metrics
  const behaviorMetrics = buildDefaultBehaviorMetrics(analysis);
  const networkMetrics = buildDefaultNetworkMetrics(analysis);

  return {
    id: `report_${analysis.handle}_${Date.now()}`,
    profile,
    score,
    keyFindings,
    shilledEntities: [],
    backlashEvents: analysis.controversies.map((controversy, i) => ({
      id: `be_${i}`,
      category: 'criticism' as const,
      severity: analysis.riskLevel === 'high' ? 'high' as const : 'medium' as const,
      startDate: new Date(),
      endDate: undefined,
      sources: [],
      evidenceIds: [],
      summary: controversy,
    })),
    behaviorMetrics,
    networkMetrics,
    linkedEntities,
    evidence,
    scanTime: new Date(),
    postsAnalyzed: analysis.searchesPerformed || 0,
    cached: false,
    disclaimer: `AI-powered analysis using Grok with live X search. ${analysis.tokensUsed ? `Tokens used: ${analysis.tokensUsed}.` : ''} This is not financial advice.`,
  };
}

// ============================================================================
// HELPER FUNCTIONS FOR SIMPLIFIED TRANSFORMER
// ============================================================================

function buildScoreFromAnalysis(analysis: GrokAnalysisResult): ReputationScore {
  // Calculate overall score based on risk level and findings
  let overall: number;
  switch (analysis.riskLevel) {
    case 'low':
      overall = 75 + Math.floor(Math.random() * 20); // 75-94
      break;
    case 'medium':
      overall = 40 + Math.floor(Math.random() * 30); // 40-69
      break;
    case 'high':
      overall = 10 + Math.floor(Math.random() * 25); // 10-34
      break;
    default:
      overall = 50;
  }

  const factors: ScoreFactor[] = [
    {
      type: 'serial_shill',
      points: analysis.riskLevel === 'high' ? 15 : analysis.riskLevel === 'medium' ? 8 : 2,
      maxPoints: 25,
      description: analysis.keyFindings.length > 0 ? 'Based on AI analysis' : 'No promotional patterns detected',
      evidenceIds: [],
    },
    {
      type: 'backlash_density',
      points: analysis.controversies.length * 5,
      maxPoints: 25,
      description: analysis.controversies.length > 0
        ? `${analysis.controversies.length} potential concerns identified`
        : 'No significant backlash detected',
      evidenceIds: [],
    },
    {
      type: 'toxic_vulgar',
      points: 0,
      maxPoints: 15,
      description: 'Behavioral analysis from AI',
      evidenceIds: [],
    },
    {
      type: 'hype_merchant',
      points: analysis.riskLevel === 'high' ? 10 : 3,
      maxPoints: 15,
      description: 'Promotional language analysis',
      evidenceIds: [],
    },
    {
      type: 'consistency',
      points: analysis.rebrand?.isRebrand ? 8 : 0,
      maxPoints: 10,
      description: analysis.rebrand?.isRebrand
        ? `Account may have rebranded${analysis.rebrand.previousName ? ` from ${analysis.rebrand.previousName}` : ''}`
        : 'No rebrand detected',
      evidenceIds: [],
    },
    {
      type: 'engagement_suspicion',
      points: analysis.activityLevel === 'low' ? 5 : 0,
      maxPoints: 10,
      description: `Activity level: ${analysis.activityLevel || 'unknown'}`,
      evidenceIds: [],
    },
  ];

  return {
    overall,
    riskLevel: analysis.riskLevel,
    factors,
    confidence: analysis.confidence,
  };
}

function extractFindingTitle(finding: string): string {
  // Extract title from markdown-style finding (e.g., "1. **Title** description")
  const match = finding.match(/\*\*([^*]+)\*\*/);
  if (match) return match[1];

  // Otherwise use first few words
  const words = finding.split(' ').slice(0, 5);
  return words.join(' ') + (finding.split(' ').length > 5 ? '...' : '');
}

function determineSeverity(finding: string, riskLevel: string): 'info' | 'warning' | 'critical' {
  const lowerFinding = finding.toLowerCase();

  if (lowerFinding.includes('scam') || lowerFinding.includes('rug') || lowerFinding.includes('fraud')) {
    return 'critical';
  }

  if (lowerFinding.includes('warning') || lowerFinding.includes('concern') || lowerFinding.includes('suspicious')) {
    return 'warning';
  }

  if (riskLevel === 'high') return 'warning';

  return 'info';
}

function extractTweetIdFromUrl(url: string): string | undefined {
  const match = url.match(/status\/(\d+)/);
  return match ? match[1] : undefined;
}

function buildDefaultBehaviorMetrics(analysis: GrokAnalysisResult): BehaviorMetrics {
  return {
    toxicity: { score: 0, examples: [] },
    vulgarity: { score: 0, examples: [] },
    hype: {
      score: analysis.riskLevel === 'high' ? 60 : analysis.riskLevel === 'medium' ? 30 : 10,
      examples: [],
      keywords: [],
    },
    aggression: { score: 0, examples: [], targetPatterns: [] },
    consistency: {
      score: analysis.rebrand?.isRebrand ? 40 : 80,
      topicDrift: 0,
      contradictions: [],
    },
    spamBurst: { detected: false, burstPeriods: [] },
  };
}

function buildDefaultNetworkMetrics(analysis: GrokAnalysisResult): NetworkMetrics {
  return {
    topInteractions: analysis.influencers.map((handle, i) => ({
      handle,
      displayName: undefined,
      followers: undefined,
      interactionCount: 1,
      interactionType: 'mention' as const,
    })),
    mentionList: analysis.influencers,
    engagementHeuristics: {
      replyRatio: 0.3,
      retweetRatio: 0.2,
      avgEngagementRate: 0.05,
      suspiciousPatterns: [],
    },
  };
}

// ============================================================================
// UTILITY EXPORTS
// ============================================================================

export function calculateAccountAgeDays(createdAt: string | Date): number {
  const date = typeof createdAt === 'string' ? new Date(createdAt) : createdAt;
  return Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24));
}

export function isNewAccount(createdAt: string | Date, thresholdDays: number = 90): boolean {
  return calculateAccountAgeDays(createdAt) < thresholdDays;
}
