import {
  calculateShillScore,
  calculateBacklashScore,
  calculateToxicityScore,
  calculateHypeScore,
  calculateConsistencyScore,
  calculateEngagementScore,
  calculateReputationScore,
  ScoreInput,
} from '@/lib/terminal/scoring/xintel';

const createMockInput = (overrides: Partial<ScoreInput> = {}): ScoreInput => ({
  shilledEntities: [],
  backlashEvents: [],
  behaviorMetrics: {
    toxicity: { score: 0, examples: [] },
    vulgarity: { score: 0, examples: [] },
    hype: { score: 0, examples: [], keywords: [] },
    aggression: { score: 0, examples: [], targetPatterns: [] },
    consistency: { score: 100, topicDrift: 0, contradictions: [] },
    spamBurst: { detected: false, burstPeriods: [] },
  },
  networkMetrics: {
    topInteractions: [],
    mentionList: [],
    engagementHeuristics: {
      replyRatio: 0.3,
      retweetRatio: 0.2,
      avgEngagementRate: 2.0,
      suspiciousPatterns: [],
    },
  },
  postsAnalyzed: 500,
  ...overrides,
});

describe('X Intel Scoring', () => {
  describe('calculateShillScore', () => {
    it('returns 0 points for no shilled entities', () => {
      const input = createMockInput();
      const result = calculateShillScore(input);

      expect(result.points).toBe(0);
      expect(result.type).toBe('serial_shill');
    });

    it('increases score for many promoted tokens', () => {
      const entities = Array.from({ length: 15 }, (_, i) => ({
        id: `se${i}`,
        entityName: `Token ${i}`,
        ticker: `TKN${i}`,
        mentionCount: 10,
        promoCount: 8,
        firstSeen: new Date(),
        lastSeen: new Date(),
        promoIntensity: 80,
        evidenceIds: [],
      }));

      const input = createMockInput({ shilledEntities: entities });
      const result = calculateShillScore(input);

      expect(result.points).toBeGreaterThan(15);
    });

    it('detects shill bursts', () => {
      const input = createMockInput({
        behaviorMetrics: {
          ...createMockInput().behaviorMetrics,
          spamBurst: {
            detected: true,
            burstPeriods: [
              { start: new Date(), end: new Date(), count: 10 },
              { start: new Date(), end: new Date(), count: 8 },
            ],
          },
        },
      });

      const result = calculateShillScore(input);
      expect(result.points).toBeGreaterThan(0);
    });
  });

  describe('calculateBacklashScore', () => {
    it('returns 0 points for no backlash events', () => {
      const input = createMockInput();
      const result = calculateBacklashScore(input);

      expect(result.points).toBe(0);
    });

    it('increases score for critical backlash events', () => {
      const input = createMockInput({
        backlashEvents: [
          {
            id: 'be1',
            category: 'scam_allegation',
            severity: 'critical',
            startDate: new Date(),
            sources: [{ handle: 'user1' }, { handle: 'user2' }, { handle: 'user3' }],
            evidenceIds: [],
            summary: 'Scam allegations',
          },
        ],
      });

      const result = calculateBacklashScore(input);
      expect(result.points).toBeGreaterThan(5);
    });
  });

  describe('calculateToxicityScore', () => {
    it('returns 0 for clean behavior', () => {
      const input = createMockInput();
      const result = calculateToxicityScore(input);

      expect(result.points).toBe(0);
    });

    it('weights aggression higher than vulgarity', () => {
      const inputAggro = createMockInput({
        behaviorMetrics: {
          ...createMockInput().behaviorMetrics,
          aggression: { score: 50, examples: [], targetPatterns: [] },
        },
      });

      const inputVulgar = createMockInput({
        behaviorMetrics: {
          ...createMockInput().behaviorMetrics,
          vulgarity: { score: 50, examples: [] },
        },
      });

      const aggroResult = calculateToxicityScore(inputAggro);
      const vulgarResult = calculateToxicityScore(inputVulgar);

      expect(aggroResult.points).toBeGreaterThan(vulgarResult.points);
    });
  });

  describe('calculateHypeScore', () => {
    it('returns 0 for no hype language', () => {
      const input = createMockInput();
      const result = calculateHypeScore(input);

      expect(result.points).toBe(0);
    });

    it('increases score for high hype intensity', () => {
      const input = createMockInput({
        behaviorMetrics: {
          ...createMockInput().behaviorMetrics,
          hype: {
            score: 80,
            examples: [],
            keywords: ['100x', 'guaranteed', 'moon'],
          },
        },
      });

      const result = calculateHypeScore(input);
      expect(result.points).toBeGreaterThan(10);
    });
  });

  describe('calculateConsistencyScore', () => {
    it('returns low score for consistent messaging', () => {
      const input = createMockInput();
      const result = calculateConsistencyScore(input);

      expect(result.points).toBeLessThan(3);
    });

    it('increases score for contradictions', () => {
      const input = createMockInput({
        behaviorMetrics: {
          ...createMockInput().behaviorMetrics,
          consistency: {
            score: 40,
            topicDrift: 60,
            contradictions: [
              { excerpt: 'Contradiction 1', tweetId: 't1', timestamp: new Date() },
              { excerpt: 'Contradiction 2', tweetId: 't2', timestamp: new Date() },
            ],
          },
        },
      });

      const result = calculateConsistencyScore(input);
      expect(result.points).toBeGreaterThan(5);
    });
  });

  describe('calculateEngagementScore', () => {
    it('returns low score for normal patterns', () => {
      const input = createMockInput();
      const result = calculateEngagementScore(input);

      expect(result.points).toBeLessThan(3);
    });

    it('flags suspicious patterns', () => {
      const input = createMockInput({
        networkMetrics: {
          ...createMockInput().networkMetrics,
          engagementHeuristics: {
            replyRatio: 0.85,
            retweetRatio: 0.75,
            avgEngagementRate: 2.0,
            suspiciousPatterns: ['Bot-like patterns', 'Coordinated activity'],
          },
        },
      });

      const result = calculateEngagementScore(input);
      expect(result.points).toBeGreaterThan(5);
    });
  });

  describe('calculateReputationScore', () => {
    it('returns high score for clean profile', () => {
      const input = createMockInput();
      const result = calculateReputationScore(input);

      expect(result.overall).toBeGreaterThan(90);
      expect(result.riskLevel).toBe('low');
    });

    it('returns low score for problematic profile', () => {
      const input = createMockInput({
        shilledEntities: Array.from({ length: 25 }, (_, i) => ({
          id: `se${i}`,
          entityName: `Token ${i}`,
          mentionCount: 10,
          promoCount: 8,
          firstSeen: new Date(),
          lastSeen: new Date(),
          promoIntensity: 90,
          evidenceIds: [],
        })),
        backlashEvents: [
          {
            id: 'be1',
            category: 'scam_allegation',
            severity: 'critical',
            startDate: new Date(),
            sources: [{ handle: 'user1' }, { handle: 'user2' }, { handle: 'user3' }],
            evidenceIds: [],
            summary: 'Scam allegation',
          },
          {
            id: 'be2',
            category: 'rug_accusation',
            severity: 'critical',
            startDate: new Date(),
            sources: [{ handle: 'user4' }, { handle: 'user5' }, { handle: 'user6' }],
            evidenceIds: [],
            summary: 'Rug accusation',
          },
          {
            id: 'be3',
            category: 'fraud_claim',
            severity: 'high',
            startDate: new Date(),
            sources: [{ handle: 'user7' }],
            evidenceIds: [],
            summary: 'Fraud claim',
          },
        ],
        behaviorMetrics: {
          toxicity: { score: 70, examples: [] },
          vulgarity: { score: 50, examples: [] },
          hype: { score: 90, examples: [], keywords: ['100x', 'guaranteed', 'moon'] },
          aggression: { score: 60, examples: [], targetPatterns: [] },
          consistency: { score: 20, topicDrift: 80, contradictions: [{ excerpt: 'test', tweetId: 't1', timestamp: new Date() }] },
          spamBurst: { detected: true, burstPeriods: [{ start: new Date(), end: new Date(), count: 15 }] },
        },
      });

      const result = calculateReputationScore(input);

      expect(result.overall).toBeLessThan(50);
      expect(['high', 'medium']).toContain(result.riskLevel);
    });

    it('calculates confidence based on posts analyzed', () => {
      const lowDataInput = createMockInput({ postsAnalyzed: 50 });
      const highDataInput = createMockInput({ postsAnalyzed: 800 });

      const lowResult = calculateReputationScore(lowDataInput);
      const highResult = calculateReputationScore(highDataInput);

      expect(lowResult.confidence).toBe('low');
      expect(highResult.confidence).toBe('high');
    });
  });
});
