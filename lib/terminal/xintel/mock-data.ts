// X Intel Mock Data
// Sample profiles with varying risk levels for development

import {
  XIntelReport,
  XIntelProfile,
  ReputationScore,
  KeyFinding,
  ShilledEntity,
  BacklashEvent,
  BehaviorMetrics,
  NetworkMetrics,
  LinkedEntity,
  XIntelEvidence,
} from '@/types/xintel';

// ============================================================================
// MOCK PROFILES
// ============================================================================

const MOCK_PROFILES: Record<string, XIntelProfile> = {
  cryptokol_alpha: {
    handle: 'cryptokol_alpha',
    displayName: 'Crypto Alpha King',
    bio: '100x calls only | NFA | DMs open for alpha | $MOON $APE $DEGEN',
    verified: false,
    followers: 125000,
    following: 892,
    createdAt: new Date('2023-03-15'),
    languagesDetected: ['en'],
    profileImageUrl: undefined,
  },
  legit_builder: {
    handle: 'legit_builder',
    displayName: 'Building in Public',
    bio: 'Solana dev | Working on something cool | Ship > Talk',
    verified: true,
    followers: 45000,
    following: 1200,
    createdAt: new Date('2021-06-10'),
    languagesDetected: ['en'],
    profileImageUrl: undefined,
  },
  degen_trader: {
    handle: 'degen_trader',
    displayName: 'DEGEN MODE ON',
    bio: 'Lost it all. Made it back. Lost it again. This is the way.',
    verified: false,
    followers: 78000,
    following: 445,
    createdAt: new Date('2024-01-05'),
    languagesDetected: ['en'],
    profileImageUrl: undefined,
  },
  anon_founder: {
    handle: 'anon_founder',
    displayName: 'Anonymous Founder',
    bio: 'Building the future of DeFi | Stealth mode | $ANON',
    verified: false,
    followers: 32000,
    following: 156,
    createdAt: new Date('2024-08-20'),
    languagesDetected: ['en'],
    profileImageUrl: undefined,
  },
  trusted_analyst: {
    handle: 'trusted_analyst',
    displayName: 'OnChain Analysis',
    bio: 'Data-driven crypto research | No paid promos | Educational content',
    verified: true,
    followers: 89000,
    following: 650,
    createdAt: new Date('2020-11-22'),
    languagesDetected: ['en'],
    profileImageUrl: undefined,
  },
};

// ============================================================================
// MOCK EVIDENCE
// ============================================================================

function createMockEvidence(id: string, label: string, excerpt: string, daysAgo: number): XIntelEvidence {
  return {
    id,
    tweetId: `tweet_${id}`,
    timestamp: new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000),
    excerpt,
    label: label as XIntelEvidence['label'],
    url: `https://x.com/user/status/${id}`,
    confidence: 0.85,
  };
}

const MOCK_EVIDENCE_SETS: Record<string, XIntelEvidence[]> = {
  cryptokol_alpha: [
    createMockEvidence('ev1', 'shill', '$MOON is going to 100x easy, ape in now before its too late. This is the gem of 2025.', 2),
    createMockEvidence('ev2', 'shill', 'Just loaded up on $APE, this one is guaranteed money. Trust me on this one.', 5),
    createMockEvidence('ev3', 'hype', 'DONT FADE THIS. $DEGEN launching in 1 hour, early buyers will be millionaires.', 8),
    createMockEvidence('ev4', 'shill', '$PUMP just did a 50x and were just getting started. Load your bags.', 12),
    createMockEvidence('ev5', 'backlash', 'Everyone calling me a scammer but I warned you to take profits. Not my fault you held.', 15),
    createMockEvidence('ev6', 'toxic', 'Stay poor then. HFSP. Blocked.', 18),
    createMockEvidence('ev7', 'shill', 'New stealth launch tomorrow. DM for alpha. Only 100 spots.', 20),
    createMockEvidence('ev8', 'hype', 'This is your last chance to be early on something life changing. $WAGMI', 25),
  ],
  legit_builder: [
    createMockEvidence('ev1', 'neutral', 'Shipped a new feature today. Performance improvements across the board.', 3),
    createMockEvidence('ev2', 'neutral', 'Working on some interesting problems in DeFi. Will share more soon.', 7),
    createMockEvidence('ev3', 'neutral', 'Great discussion at the hackathon. Lots of talented builders in this space.', 14),
  ],
  degen_trader: [
    createMockEvidence('ev1', 'hype', '$PEPE 2.0 is the play. Dont miss this one. 1000x potential.', 1),
    createMockEvidence('ev2', 'shill', 'Loaded a full bag of $WOJAK. Either lambo or food stamps.', 4),
    createMockEvidence('ev3', 'toxic', 'If you sold you are ngmi. Weak hands get rekt.', 6),
    createMockEvidence('ev4', 'backlash', 'Yes I promoted $RUG before it rugged. I got rugged too. We are all victims here.', 10),
    createMockEvidence('ev5', 'hype', 'Next moonshot loading... Trust the process.', 15),
  ],
  anon_founder: [
    createMockEvidence('ev1', 'shill', '$ANON presale filling up fast. Last chance to get in at seed round prices.', 2),
    createMockEvidence('ev2', 'hype', 'Our protocol will revolutionize DeFi. 100x from here is FUD.', 5),
    createMockEvidence('ev3', 'backlash', 'FUD accounts trying to spread lies about us. We have nothing to hide.', 8),
    createMockEvidence('ev4', 'shill', 'Team wallet moved for operational expenses. Stop the FUD.', 12),
    createMockEvidence('ev5', 'suspicious', 'Contract audit coming soon. Trust the team.', 15),
  ],
  trusted_analyst: [
    createMockEvidence('ev1', 'neutral', 'Analysis thread: Looking at on-chain data for the top DEXs. Some interesting patterns.', 2),
    createMockEvidence('ev2', 'neutral', 'Reminder: I dont give financial advice. Always do your own research.', 5),
    createMockEvidence('ev3', 'neutral', 'New report on liquidity distribution across L2s. Link in thread.', 10),
  ],
};

// ============================================================================
// MOCK SHILLED ENTITIES
// ============================================================================

const MOCK_SHILLED_ENTITIES: Record<string, ShilledEntity[]> = {
  cryptokol_alpha: [
    { id: 'se1', entityName: 'MoonCoin', ticker: 'MOON', mentionCount: 45, promoCount: 38, firstSeen: new Date('2024-11-01'), lastSeen: new Date('2025-01-20'), promoIntensity: 84, evidenceIds: ['ev1'] },
    { id: 'se2', entityName: 'ApeToken', ticker: 'APE', mentionCount: 32, promoCount: 28, firstSeen: new Date('2024-10-15'), lastSeen: new Date('2025-01-18'), promoIntensity: 87, evidenceIds: ['ev2'] },
    { id: 'se3', entityName: 'DegenDAO', ticker: 'DEGEN', mentionCount: 28, promoCount: 22, firstSeen: new Date('2024-12-01'), lastSeen: new Date('2025-01-15'), promoIntensity: 78, evidenceIds: ['ev3'] },
    { id: 'se4', entityName: 'PumpFi', ticker: 'PUMP', mentionCount: 20, promoCount: 18, firstSeen: new Date('2024-09-20'), lastSeen: new Date('2025-01-10'), promoIntensity: 90, evidenceIds: ['ev4'] },
    { id: 'se5', entityName: 'WAGMI Protocol', ticker: 'WAGMI', mentionCount: 15, promoCount: 12, firstSeen: new Date('2024-08-01'), lastSeen: new Date('2024-12-25'), promoIntensity: 80, evidenceIds: ['ev8'] },
  ],
  legit_builder: [],
  degen_trader: [
    { id: 'se1', entityName: 'Pepe 2.0', ticker: 'PEPE2', mentionCount: 25, promoCount: 20, firstSeen: new Date('2025-01-01'), lastSeen: new Date('2025-01-22'), promoIntensity: 80, evidenceIds: ['ev1'] },
    { id: 'se2', entityName: 'Wojak', ticker: 'WOJAK', mentionCount: 18, promoCount: 15, firstSeen: new Date('2024-12-15'), lastSeen: new Date('2025-01-19'), promoIntensity: 83, evidenceIds: ['ev2'] },
    { id: 'se3', entityName: 'RugPull', ticker: 'RUG', mentionCount: 12, promoCount: 10, firstSeen: new Date('2024-11-01'), lastSeen: new Date('2024-11-15'), promoIntensity: 83, evidenceIds: ['ev4'] },
  ],
  anon_founder: [
    { id: 'se1', entityName: 'Anon Protocol', ticker: 'ANON', mentionCount: 150, promoCount: 120, firstSeen: new Date('2024-08-20'), lastSeen: new Date('2025-01-22'), promoIntensity: 80, evidenceIds: ['ev1', 'ev2'] },
  ],
  trusted_analyst: [],
};

// ============================================================================
// MOCK BACKLASH EVENTS
// ============================================================================

const MOCK_BACKLASH_EVENTS: Record<string, BacklashEvent[]> = {
  cryptokol_alpha: [
    {
      id: 'be1',
      category: 'scam_allegation',
      severity: 'high',
      startDate: new Date('2024-12-01'),
      endDate: new Date('2024-12-15'),
      sources: [
        { handle: 'whale_watcher', displayName: 'Whale Watcher', followers: 50000 },
        { handle: 'ct_detective', displayName: 'CT Detective', followers: 35000 },
      ],
      evidenceIds: ['ev5'],
      summary: 'Multiple users accused of coordinated pump and dump on $PUMP token',
    },
    {
      id: 'be2',
      category: 'rug_accusation',
      severity: 'medium',
      startDate: new Date('2024-10-20'),
      sources: [
        { handle: 'defi_skeptic', displayName: 'DeFi Skeptic', followers: 28000 },
      ],
      evidenceIds: ['ev5'],
      summary: 'Promoted token that rugged, denied involvement',
    },
  ],
  legit_builder: [],
  degen_trader: [
    {
      id: 'be1',
      category: 'rug_accusation',
      severity: 'medium',
      startDate: new Date('2024-11-10'),
      sources: [
        { handle: 'anon_caller', displayName: 'Anon Caller', followers: 15000 },
      ],
      evidenceIds: ['ev4'],
      summary: 'Promoted $RUG token which subsequently rugged',
    },
  ],
  anon_founder: [
    {
      id: 'be1',
      category: 'warning',
      severity: 'high',
      startDate: new Date('2025-01-10'),
      sources: [
        { handle: 'security_researcher', displayName: 'Security Researcher', followers: 80000 },
        { handle: 'audit_firm', displayName: 'Audit Firm', followers: 120000 },
      ],
      evidenceIds: ['ev3', 'ev4', 'ev5'],
      summary: 'Security concerns raised about unaudited contract, team wallet movements flagged',
    },
  ],
  trusted_analyst: [],
};

// ============================================================================
// MOCK BEHAVIOR METRICS
// ============================================================================

const MOCK_BEHAVIOR_METRICS: Record<string, BehaviorMetrics> = {
  cryptokol_alpha: {
    toxicity: { score: 45, examples: [{ excerpt: 'Stay poor then. HFSP. Blocked.', tweetId: 'ev6', timestamp: new Date() }] },
    vulgarity: { score: 30, examples: [] },
    hype: { score: 85, examples: [{ excerpt: 'DONT FADE THIS. $DEGEN launching...', tweetId: 'ev3', timestamp: new Date() }], keywords: ['100x', 'guaranteed', 'ape', 'gem', 'millionaires'] },
    aggression: { score: 40, examples: [{ excerpt: 'Stay poor then. HFSP. Blocked.', tweetId: 'ev6', timestamp: new Date() }], targetPatterns: ['@skeptics', '@fudders'] },
    consistency: { score: 35, topicDrift: 65, contradictions: [] },
    spamBurst: { detected: true, burstPeriods: [{ start: new Date('2025-01-15'), end: new Date('2025-01-15'), count: 12 }] },
  },
  legit_builder: {
    toxicity: { score: 5, examples: [] },
    vulgarity: { score: 2, examples: [] },
    hype: { score: 10, examples: [], keywords: [] },
    aggression: { score: 3, examples: [], targetPatterns: [] },
    consistency: { score: 92, topicDrift: 8, contradictions: [] },
    spamBurst: { detected: false, burstPeriods: [] },
  },
  degen_trader: {
    toxicity: { score: 55, examples: [{ excerpt: 'If you sold you are ngmi. Weak hands get rekt.', tweetId: 'ev3', timestamp: new Date() }] },
    vulgarity: { score: 40, examples: [] },
    hype: { score: 75, examples: [{ excerpt: '$PEPE 2.0 is the play. 1000x potential.', tweetId: 'ev1', timestamp: new Date() }], keywords: ['1000x', 'lambo', 'moonshot'] },
    aggression: { score: 35, examples: [], targetPatterns: ['@sellers'] },
    consistency: { score: 45, topicDrift: 55, contradictions: [{ excerpt: 'Promoted $RUG, then called it a rug', tweetId: 'ev4', timestamp: new Date() }] },
    spamBurst: { detected: true, burstPeriods: [{ start: new Date('2025-01-01'), end: new Date('2025-01-01'), count: 8 }] },
  },
  anon_founder: {
    toxicity: { score: 20, examples: [] },
    vulgarity: { score: 10, examples: [] },
    hype: { score: 70, examples: [{ excerpt: '100x from here is FUD.', tweetId: 'ev2', timestamp: new Date() }], keywords: ['100x', 'revolutionize', 'presale'] },
    aggression: { score: 25, examples: [], targetPatterns: ['@fudders'] },
    consistency: { score: 50, topicDrift: 40, contradictions: [] },
    spamBurst: { detected: false, burstPeriods: [] },
  },
  trusted_analyst: {
    toxicity: { score: 2, examples: [] },
    vulgarity: { score: 0, examples: [] },
    hype: { score: 5, examples: [], keywords: [] },
    aggression: { score: 0, examples: [], targetPatterns: [] },
    consistency: { score: 95, topicDrift: 5, contradictions: [] },
    spamBurst: { detected: false, burstPeriods: [] },
  },
};

// ============================================================================
// MOCK NETWORK METRICS
// ============================================================================

const MOCK_NETWORK_METRICS: Record<string, NetworkMetrics> = {
  cryptokol_alpha: {
    topInteractions: [
      { handle: 'pump_group_1', displayName: 'Pump Group', followers: 5000, interactionCount: 45, interactionType: 'retweet' },
      { handle: 'shill_bot_a', displayName: 'Shill Account', followers: 2000, interactionCount: 38, interactionType: 'reply' },
    ],
    mentionList: ['pump_group_1', 'shill_bot_a', 'degen_caller', 'alpha_leaks'],
    engagementHeuristics: {
      replyRatio: 0.25,
      retweetRatio: 0.45,
      avgEngagementRate: 3.2,
      suspiciousPatterns: ['Coordinated RT timing', 'Bot-like reply patterns'],
    },
  },
  legit_builder: {
    topInteractions: [
      { handle: 'solana_dev', displayName: 'Solana Developer', followers: 85000, interactionCount: 25, interactionType: 'reply' },
      { handle: 'defi_protocol', displayName: 'DeFi Protocol', followers: 120000, interactionCount: 18, interactionType: 'quote' },
    ],
    mentionList: ['solana_dev', 'defi_protocol', 'hackathon_org'],
    engagementHeuristics: {
      replyRatio: 0.35,
      retweetRatio: 0.15,
      avgEngagementRate: 2.8,
      suspiciousPatterns: [],
    },
  },
  degen_trader: {
    topInteractions: [
      { handle: 'meme_coin_ct', displayName: 'Meme Coin CT', followers: 25000, interactionCount: 55, interactionType: 'retweet' },
    ],
    mentionList: ['meme_coin_ct', 'degen_plays', 'ape_signals'],
    engagementHeuristics: {
      replyRatio: 0.40,
      retweetRatio: 0.35,
      avgEngagementRate: 4.5,
      suspiciousPatterns: ['High RT ratio for low follower accounts'],
    },
  },
  anon_founder: {
    topInteractions: [
      { handle: 'anon_team_1', displayName: 'Team Member', followers: 500, interactionCount: 80, interactionType: 'retweet' },
      { handle: 'anon_team_2', displayName: 'Team Member 2', followers: 300, interactionCount: 65, interactionType: 'reply' },
    ],
    mentionList: ['anon_team_1', 'anon_team_2', 'anon_community'],
    engagementHeuristics: {
      replyRatio: 0.30,
      retweetRatio: 0.50,
      avgEngagementRate: 2.1,
      suspiciousPatterns: ['Circular engagement pattern', 'Team accounts dominate interactions'],
    },
  },
  trusted_analyst: {
    topInteractions: [
      { handle: 'data_platform', displayName: 'Data Platform', followers: 200000, interactionCount: 30, interactionType: 'quote' },
      { handle: 'research_firm', displayName: 'Research Firm', followers: 150000, interactionCount: 22, interactionType: 'reply' },
    ],
    mentionList: ['data_platform', 'research_firm', 'defi_analyst'],
    engagementHeuristics: {
      replyRatio: 0.45,
      retweetRatio: 0.10,
      avgEngagementRate: 3.5,
      suspiciousPatterns: [],
    },
  },
};

// ============================================================================
// MOCK LINKED ENTITIES
// ============================================================================

const MOCK_LINKED_ENTITIES: Record<string, LinkedEntity[]> = {
  cryptokol_alpha: [
    { id: 'le1', type: 'telegram', value: 'cryptoalphacalls', confidence: 'high', evidenceIds: [], firstSeen: new Date(), lastSeen: new Date(), mentionCount: 15 },
    { id: 'le2', type: 'domain', value: 'mooncoin.xyz', confidence: 'medium', evidenceIds: [], firstSeen: new Date(), lastSeen: new Date(), mentionCount: 8 },
  ],
  legit_builder: [
    { id: 'le1', type: 'github', value: 'legit-builder/solana-project', confidence: 'high', evidenceIds: [], firstSeen: new Date(), lastSeen: new Date(), mentionCount: 12 },
    { id: 'le2', type: 'domain', value: 'legitbuilder.dev', confidence: 'high', evidenceIds: [], firstSeen: new Date(), lastSeen: new Date(), mentionCount: 20 },
  ],
  degen_trader: [
    { id: 'le1', type: 'telegram', value: 'degenplays', confidence: 'medium', evidenceIds: [], firstSeen: new Date(), lastSeen: new Date(), mentionCount: 6 },
  ],
  anon_founder: [
    { id: 'le1', type: 'domain', value: 'anonprotocol.finance', confidence: 'high', evidenceIds: [], firstSeen: new Date(), lastSeen: new Date(), mentionCount: 45 },
    { id: 'le2', type: 'telegram', value: 'anonprotocol', confidence: 'high', evidenceIds: [], firstSeen: new Date(), lastSeen: new Date(), mentionCount: 30 },
    { id: 'le3', type: 'wallet', value: '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU', chain: 'solana', confidence: 'medium', evidenceIds: ['ev4'], firstSeen: new Date(), lastSeen: new Date(), mentionCount: 3 },
  ],
  trusted_analyst: [
    { id: 'le1', type: 'domain', value: 'onchainanalysis.com', confidence: 'high', evidenceIds: [], firstSeen: new Date(), lastSeen: new Date(), mentionCount: 25 },
    { id: 'le2', type: 'github', value: 'trusted-analyst/research', confidence: 'high', evidenceIds: [], firstSeen: new Date(), lastSeen: new Date(), mentionCount: 8 },
  ],
};

// ============================================================================
// MOCK SCORES
// ============================================================================

const MOCK_SCORES: Record<string, ReputationScore> = {
  cryptokol_alpha: {
    overall: 28,
    riskLevel: 'high',
    confidence: 'high',
    factors: [
      { type: 'serial_shill', points: 22, maxPoints: 25, description: 'Promotes 15+ tokens with aggressive patterns', evidenceIds: ['ev1', 'ev2', 'ev3'] },
      { type: 'backlash_density', points: 18, maxPoints: 25, description: '2 backlash events including coordinated pump allegations', evidenceIds: ['ev5'] },
      { type: 'toxic_vulgar', points: 8, maxPoints: 15, description: 'Moderate profanity and confrontational tone', evidenceIds: ['ev6'] },
      { type: 'hype_merchant', points: 13, maxPoints: 15, description: 'Heavy hype language: 100x, guaranteed, ape, gem', evidenceIds: ['ev3', 'ev8'] },
      { type: 'consistency', points: 6, maxPoints: 10, description: 'High topic drift (65%)', evidenceIds: [] },
      { type: 'engagement_suspicion', points: 5, maxPoints: 10, description: 'Coordinated RT timing detected', evidenceIds: [] },
    ],
  },
  legit_builder: {
    overall: 92,
    riskLevel: 'low',
    confidence: 'high',
    factors: [
      { type: 'serial_shill', points: 0, maxPoints: 25, description: 'Minimal promotional patterns detected', evidenceIds: [] },
      { type: 'backlash_density', points: 0, maxPoints: 25, description: 'Minimal public backlash', evidenceIds: [] },
      { type: 'toxic_vulgar', points: 1, maxPoints: 15, description: 'Generally civil discourse', evidenceIds: [] },
      { type: 'hype_merchant', points: 2, maxPoints: 15, description: 'Measured promotional language', evidenceIds: [] },
      { type: 'consistency', points: 2, maxPoints: 10, description: 'Generally consistent messaging', evidenceIds: [] },
      { type: 'engagement_suspicion', points: 3, maxPoints: 10, description: 'Normal engagement patterns', evidenceIds: [] },
    ],
  },
  degen_trader: {
    overall: 38,
    riskLevel: 'high',
    confidence: 'medium',
    factors: [
      { type: 'serial_shill', points: 15, maxPoints: 25, description: 'Promotes multiple meme tokens with high intensity', evidenceIds: ['ev1', 'ev2'] },
      { type: 'backlash_density', points: 12, maxPoints: 25, description: '1 rug accusation event', evidenceIds: ['ev4'] },
      { type: 'toxic_vulgar', points: 10, maxPoints: 15, description: 'Moderate toxicity and confrontational tone', evidenceIds: ['ev3'] },
      { type: 'hype_merchant', points: 12, maxPoints: 15, description: 'Heavy hype language: 1000x, lambo, moonshot', evidenceIds: ['ev1', 'ev5'] },
      { type: 'consistency', points: 8, maxPoints: 10, description: 'Contradictions detected on $RUG', evidenceIds: ['ev4'] },
      { type: 'engagement_suspicion', points: 5, maxPoints: 10, description: 'High RT ratio for low follower accounts', evidenceIds: [] },
    ],
  },
  anon_founder: {
    overall: 42,
    riskLevel: 'high',
    confidence: 'medium',
    factors: [
      { type: 'serial_shill', points: 8, maxPoints: 25, description: 'Single token focus but high promo intensity', evidenceIds: ['ev1', 'ev2'] },
      { type: 'backlash_density', points: 15, maxPoints: 25, description: 'High severity security warnings from researchers', evidenceIds: ['ev3', 'ev4', 'ev5'] },
      { type: 'toxic_vulgar', points: 3, maxPoints: 15, description: 'Generally civil discourse', evidenceIds: [] },
      { type: 'hype_merchant', points: 11, maxPoints: 15, description: 'Hype language: 100x, revolutionize, presale', evidenceIds: ['ev2'] },
      { type: 'consistency', points: 6, maxPoints: 10, description: 'Some topic drift detected', evidenceIds: [] },
      { type: 'engagement_suspicion', points: 8, maxPoints: 10, description: 'Circular engagement, team accounts dominate', evidenceIds: [] },
    ],
  },
  trusted_analyst: {
    overall: 95,
    riskLevel: 'low',
    confidence: 'high',
    factors: [
      { type: 'serial_shill', points: 0, maxPoints: 25, description: 'No promotional patterns detected', evidenceIds: [] },
      { type: 'backlash_density', points: 0, maxPoints: 25, description: 'No public backlash', evidenceIds: [] },
      { type: 'toxic_vulgar', points: 0, maxPoints: 15, description: 'Professional discourse', evidenceIds: [] },
      { type: 'hype_merchant', points: 1, maxPoints: 15, description: 'No hype language', evidenceIds: [] },
      { type: 'consistency', points: 1, maxPoints: 10, description: 'Highly consistent messaging', evidenceIds: [] },
      { type: 'engagement_suspicion', points: 2, maxPoints: 10, description: 'Normal engagement patterns', evidenceIds: [] },
    ],
  },
};

// ============================================================================
// KEY FINDINGS
// ============================================================================

const MOCK_KEY_FINDINGS: Record<string, KeyFinding[]> = {
  cryptokol_alpha: [
    { id: 'kf1', title: 'Serial Token Promoter', description: 'Promoted 15+ different tokens in the past 6 months with aggressive "100x" claims', severity: 'critical', evidenceIds: ['ev1', 'ev2', 'ev3'] },
    { id: 'kf2', title: 'Pump & Dump Allegations', description: 'Multiple users accused of coordinated pump and dump on $PUMP token', severity: 'critical', evidenceIds: ['ev5'] },
    { id: 'kf3', title: 'Hostile to Critics', description: 'Responds to criticism with aggressive language and blocking', severity: 'warning', evidenceIds: ['ev6'] },
  ],
  legit_builder: [
    { id: 'kf1', title: 'Verified Developer', description: 'Consistent track record of shipping code and engaging with dev community', severity: 'info', evidenceIds: [] },
  ],
  degen_trader: [
    { id: 'kf1', title: 'Rug History', description: 'Promoted $RUG token which subsequently rugged, claimed to be a victim', severity: 'critical', evidenceIds: ['ev4'] },
    { id: 'kf2', title: 'High-Risk Calls', description: 'Regularly promotes high-risk meme tokens with "lambo or food stamps" mentality', severity: 'warning', evidenceIds: ['ev1', 'ev2'] },
  ],
  anon_founder: [
    { id: 'kf1', title: 'Security Concerns', description: 'Unaudited contract flagged by security researchers', severity: 'critical', evidenceIds: ['ev5'] },
    { id: 'kf2', title: 'Suspicious Wallet Activity', description: 'Team wallet movements raised concerns in community', severity: 'warning', evidenceIds: ['ev4'] },
    { id: 'kf3', title: 'Insular Network', description: 'Engagement dominated by team-controlled accounts', severity: 'warning', evidenceIds: [] },
  ],
  trusted_analyst: [
    { id: 'kf1', title: 'Educational Focus', description: 'Consistently provides data-driven analysis without paid promotions', severity: 'info', evidenceIds: [] },
  ],
};

// ============================================================================
// RANDOM DATA GENERATOR
// ============================================================================

// Seeded random for consistent results per handle
function seededRandom(seed: string): () => number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return () => {
    hash = (hash * 1103515245 + 12345) & 0x7fffffff;
    return hash / 0x7fffffff;
  };
}

function pickRandom<T>(arr: T[], rand: () => number): T {
  return arr[Math.floor(rand() * arr.length)];
}

function pickMultiple<T>(arr: T[], count: number, rand: () => number): T[] {
  const shuffled = [...arr].sort(() => rand() - 0.5);
  return shuffled.slice(0, Math.min(count, arr.length));
}

const RANDOM_BIOS = [
  '🚀 Building the future | NFA | Not financial advice',
  'Crypto enthusiast | DeFi degen | GM',
  'Full-time shitposter | Part-time investor',
  'Anonymous trader | Sometimes right, always loud',
  'Web3 native | NFT collector | Building stuff',
  'Just here for the memes and the alpha',
  'Ex-TradFi | Now full degen mode',
  'Diamond hands only 💎',
  'Ape first, ask questions never',
  'Here to make it or lose it all',
];

const RANDOM_TICKERS = [
  'PUMP', 'MOON', 'DEGEN', 'PEPE', 'WOJAK', 'BONK', 'WIF', 'FLOKI',
  'SHIB', 'MEME', 'BASED', 'COPE', 'HOPIUM', 'ALPHA', 'BETA', 'APE',
  'FOMO', 'HODL', 'WAGMI', 'NGMI', 'GEM', 'ROCKET', 'LAMBO', 'BAGS',
];

const RANDOM_HYPE_KEYWORDS = [
  '100x', '1000x', 'guaranteed', 'moon', 'ape', 'gem', 'easy money',
  'life changing', 'generational wealth', 'dont miss', 'last chance',
  'next big thing', 'early', 'stealth launch', 'presale', 'alpha leak',
];

const RANDOM_BACKLASH_CATEGORIES: BacklashEvent['category'][] = [
  'scam_allegation', 'rug_accusation', 'warning', 'fraud_claim',
];

const RANDOM_FINDING_TITLES = [
  'Aggressive Token Promotion',
  'Suspicious Engagement Patterns',
  'High-Risk Call History',
  'Coordinated Activity Detected',
  'Community Trust Issues',
  'Wallet Activity Concerns',
  'Inconsistent Messaging',
  'Unverified Claims',
];

function generateRandomReport(handle: string): XIntelReport {
  const rand = seededRandom(handle);

  // Generate deterministic but varied metrics
  const toxicityScore = Math.floor(rand() * 80);
  const vulgarityScore = Math.floor(rand() * 60);
  const hypeScore = Math.floor(rand() * 100);
  const aggressionScore = Math.floor(rand() * 70);
  const consistencyScore = Math.floor(rand() * 100);

  const shillCount = Math.floor(rand() * 12) + 1;
  const backlashCount = Math.floor(rand() * 4);

  // Calculate overall score (inverse - lower is worse)
  const deductions = Math.floor(
    (shillCount * 2) +
    (backlashCount * 8) +
    (toxicityScore * 0.15) +
    (hypeScore * 0.15) +
    ((100 - consistencyScore) * 0.1)
  );
  const overallScore = Math.max(5, Math.min(95, 100 - deductions));
  const riskLevel = overallScore >= 75 ? 'low' : overallScore >= 45 ? 'medium' : 'high';

  // Generate profile
  const profile: XIntelProfile = {
    handle,
    displayName: handle.charAt(0).toUpperCase() + handle.slice(1).replace(/_/g, ' '),
    bio: pickRandom(RANDOM_BIOS, rand),
    verified: rand() > 0.85,
    followers: Math.floor(rand() * 200000) + 1000,
    following: Math.floor(rand() * 2000) + 100,
    createdAt: new Date(Date.now() - Math.floor(rand() * 3 * 365 * 24 * 60 * 60 * 1000)),
    languagesDetected: ['en'],
    profileImageUrl: undefined,
  };

  // Generate shilled entities
  const selectedTickers = pickMultiple(RANDOM_TICKERS, shillCount, rand);
  const shilledEntities: ShilledEntity[] = selectedTickers.map((ticker, i) => ({
    id: `se_${i}`,
    entityName: `${ticker} Token`,
    ticker: `$${ticker}`,
    mentionCount: Math.floor(rand() * 50) + 5,
    promoCount: Math.floor(rand() * 40) + 3,
    firstSeen: new Date(Date.now() - Math.floor(rand() * 180 * 24 * 60 * 60 * 1000)),
    lastSeen: new Date(Date.now() - Math.floor(rand() * 7 * 24 * 60 * 60 * 1000)),
    promoIntensity: Math.floor(rand() * 40) + 50,
    evidenceIds: [`ev_shill_${i}`],
  }));

  // Generate backlash events
  const backlashEvents: BacklashEvent[] = Array.from({ length: backlashCount }, (_, i) => ({
    id: `be_${i}`,
    category: pickRandom(RANDOM_BACKLASH_CATEGORIES, rand),
    severity: rand() > 0.6 ? 'critical' : rand() > 0.3 ? 'high' : 'medium',
    startDate: new Date(Date.now() - Math.floor(rand() * 90 * 24 * 60 * 60 * 1000)),
    sources: Array.from({ length: Math.floor(rand() * 3) + 1 }, (_, j) => ({
      handle: `critic_${i}_${j}`,
      displayName: `Crypto Critic ${j}`,
      followers: Math.floor(rand() * 50000) + 5000,
    })),
    evidenceIds: [`ev_backlash_${i}`],
    summary: `Community concerns raised about ${pickRandom(['promotional behavior', 'token performance', 'misleading claims', 'wallet activity'], rand)}`,
  }));

  // Generate behavior metrics
  const behaviorMetrics: BehaviorMetrics = {
    toxicity: {
      score: toxicityScore,
      examples: toxicityScore > 40 ? [{ excerpt: 'Sample toxic content flagged', tweetId: 'ev_toxic', timestamp: new Date() }] : []
    },
    vulgarity: {
      score: vulgarityScore,
      examples: []
    },
    hype: {
      score: hypeScore,
      examples: hypeScore > 50 ? [{ excerpt: 'This one is going to 100x easy', tweetId: 'ev_hype', timestamp: new Date() }] : [],
      keywords: pickMultiple(RANDOM_HYPE_KEYWORDS, Math.floor(hypeScore / 20), rand),
    },
    aggression: {
      score: aggressionScore,
      examples: [],
      targetPatterns: aggressionScore > 40 ? ['@critics', '@fudders'] : []
    },
    consistency: {
      score: consistencyScore,
      topicDrift: 100 - consistencyScore,
      contradictions: consistencyScore < 50 ? [{ excerpt: 'Contradictory statement detected', tweetId: 'ev_contra', timestamp: new Date() }] : []
    },
    spamBurst: {
      detected: rand() > 0.6,
      burstPeriods: rand() > 0.6 ? [{ start: new Date(), end: new Date(), count: Math.floor(rand() * 15) + 5 }] : []
    },
  };

  // Generate network metrics
  const networkMetrics: NetworkMetrics = {
    topInteractions: [
      { handle: 'interaction_1', displayName: 'Frequent Interactor', followers: Math.floor(rand() * 30000), interactionCount: Math.floor(rand() * 50) + 10, interactionType: 'retweet' },
    ],
    mentionList: ['interaction_1', 'mention_2', 'mention_3'],
    engagementHeuristics: {
      replyRatio: rand() * 0.5 + 0.1,
      retweetRatio: rand() * 0.5 + 0.1,
      avgEngagementRate: rand() * 5 + 1,
      suspiciousPatterns: rand() > 0.5 ? ['Unusual engagement timing patterns detected'] : [],
    },
  };

  // Generate linked entities
  const linkedEntities: LinkedEntity[] = [
    { id: 'le_1', type: 'telegram', value: `${handle}_group`, confidence: 'medium', evidenceIds: [], firstSeen: new Date(), lastSeen: new Date(), mentionCount: Math.floor(rand() * 20) },
  ];

  // Generate evidence
  const evidence: XIntelEvidence[] = [
    ...shilledEntities.slice(0, 3).map((entity, i) => ({
      id: `ev_shill_${i}`,
      tweetId: `tweet_shill_${i}`,
      timestamp: entity.lastSeen,
      excerpt: `${entity.ticker} is the next big thing. Don't miss this one. 🚀`,
      label: 'shill' as const,
      url: `https://x.com/${handle}/status/${1000000 + i}`,
      confidence: 0.85,
    })),
    ...backlashEvents.map((event, i) => ({
      id: `ev_backlash_${i}`,
      tweetId: `tweet_backlash_${i}`,
      timestamp: event.startDate,
      excerpt: `Response to criticism about ${event.category.replace(/_/g, ' ')}`,
      label: 'backlash' as const,
      url: `https://x.com/${handle}/status/${2000000 + i}`,
      confidence: 0.8,
    })),
  ];

  // Generate key findings
  const findingCount = Math.min(3, Math.floor(deductions / 20) + 1);
  const keyFindings: KeyFinding[] = pickMultiple(RANDOM_FINDING_TITLES, findingCount, rand).map((title, i) => ({
    id: `kf_${i}`,
    title,
    description: `Analysis detected patterns consistent with ${title.toLowerCase()}`,
    severity: i === 0 && riskLevel === 'high' ? 'critical' : i === 0 ? 'warning' : 'info',
    evidenceIds: evidence.slice(0, 2).map(e => e.id),
  }));

  // Generate score
  const score: ReputationScore = {
    overall: overallScore,
    riskLevel,
    confidence: 'medium',
    factors: [
      { type: 'serial_shill', points: Math.min(25, shillCount * 2), maxPoints: 25, description: `${shillCount} tokens promoted`, evidenceIds: [] },
      { type: 'backlash_density', points: Math.min(25, backlashCount * 8), maxPoints: 25, description: `${backlashCount} backlash events`, evidenceIds: [] },
      { type: 'toxic_vulgar', points: Math.floor(toxicityScore * 0.15), maxPoints: 15, description: 'Toxicity analysis', evidenceIds: [] },
      { type: 'hype_merchant', points: Math.floor(hypeScore * 0.15), maxPoints: 15, description: 'Hype language detected', evidenceIds: [] },
      { type: 'consistency', points: Math.floor((100 - consistencyScore) * 0.1), maxPoints: 10, description: 'Messaging consistency', evidenceIds: [] },
      { type: 'engagement_suspicion', points: Math.floor(rand() * 5), maxPoints: 10, description: 'Engagement patterns', evidenceIds: [] },
    ],
  };

  return {
    id: `report_${handle}_${Date.now()}`,
    profile,
    score,
    keyFindings,
    shilledEntities,
    backlashEvents,
    behaviorMetrics,
    networkMetrics,
    linkedEntities,
    evidence,
    scanTime: new Date(),
    postsAnalyzed: Math.floor(rand() * 500) + 200,
    cached: true,
    disclaimer: 'DEMO MODE: This is randomly generated data for demonstration purposes. Automated analysis may be incorrect. Verify sources before making decisions.',
  };
}

// ============================================================================
// REPORT BUILDER
// ============================================================================

export function getMockReport(handle: string): XIntelReport {
  const normalizedHandle = handle.toLowerCase().replace('@', '');

  const profile = MOCK_PROFILES[normalizedHandle];

  // If no preset data, generate random data
  if (!profile) {
    return generateRandomReport(normalizedHandle);
  }

  return {
    id: `report_${normalizedHandle}_${Date.now()}`,
    profile,
    score: MOCK_SCORES[normalizedHandle],
    keyFindings: MOCK_KEY_FINDINGS[normalizedHandle] || [],
    shilledEntities: MOCK_SHILLED_ENTITIES[normalizedHandle] || [],
    backlashEvents: MOCK_BACKLASH_EVENTS[normalizedHandle] || [],
    behaviorMetrics: MOCK_BEHAVIOR_METRICS[normalizedHandle],
    networkMetrics: MOCK_NETWORK_METRICS[normalizedHandle],
    linkedEntities: MOCK_LINKED_ENTITIES[normalizedHandle] || [],
    evidence: MOCK_EVIDENCE_SETS[normalizedHandle] || [],
    scanTime: new Date(),
    postsAnalyzed: normalizedHandle === 'cryptokol_alpha' ? 847 : normalizedHandle === 'legit_builder' ? 523 : 412,
    cached: true,
    disclaimer: 'Automated analysis may be incorrect. Verify sources before making decisions.',
  };
}

export function getMockProfiles(): XIntelProfile[] {
  return Object.values(MOCK_PROFILES);
}

export function getAvailableHandles(): string[] {
  return Object.keys(MOCK_PROFILES);
}
