// X Intel Behavior Analyzer
// Analyzes behavioral patterns from posts

import { BehaviorMetrics, BehaviorExample } from '@/types/xintel';

// ============================================================================
// KEYWORD SEEDS
// ============================================================================

export const KEYWORD_SEEDS = {
  // Backlash/accusation keywords
  backlash: [
    'scam', 'scammer', 'rug', 'rugged', 'rugpull', 'fraud', 'fraudster',
    'exposed', 'exposing', 'warning', "don't trust", 'dont trust',
    'liar', 'lying', 'stole', 'stealing', 'drained', 'exit scam',
    'ponzi', 'pyramid', 'fake', 'con artist', 'grifter', 'scumbag',
    'beware', 'stay away', 'avoid', 'criminal', 'theft', 'stolen',
  ],

  // Hype keywords
  hype: [
    '100x', '1000x', '10x', '50x', 'guaranteed', 'guarantee',
    'send it', 'ape', 'aping', 'easy money', "don't fade", 'dont fade',
    'generational', 'moon', 'mooning', 'to the moon', 'lambo',
    'financial freedom', 'life changing', 'retire', 'millionaire',
    'massive gains', 'huge gains', 'free money', 'no brainer',
    'cant lose', "can't lose", 'risk free', 'safe bet', 'sure thing',
    'alpha', 'insider', 'early', 'dont miss', "don't miss",
    'last chance', 'before it moons', 'undervalued', 'gem',
  ],

  // Vulgarity/profanity (keeping it relatively mild for the codebase)
  vulgarity: [
    'fuck', 'fucking', 'shit', 'shitty', 'bullshit', 'ass', 'asshole',
    'bitch', 'damn', 'crap', 'dick', 'dumbass', 'idiot', 'moron',
    'retard', 'stupid', 'trash', 'garbage', 'worthless', 'loser',
  ],

  // Aggression/harassment patterns
  aggression: [
    'kill yourself', 'kys', 'die', 'death threat', 'gonna get you',
    'destroy you', 'ruin you', 'end you', 'watch your back',
    'youre done', "you're done", 'finished', 'over for you',
    'ngmi', 'stay poor', 'have fun staying poor', 'hfsp',
    'cope', 'seethe', 'cry more', 'ratio', 'blocked',
  ],

  // Promotional call-to-action patterns
  promotional: [
    'buy now', 'get in', 'join', 'mint', 'minting', 'presale',
    'whitelist', 'airdrop', 'giveaway', 'follow and rt',
    'follow + rt', 'like and rt', 'retweet', 'check out',
    'launching', 'just launched', 'live now', 'link in bio',
    'dyor', 'nfa', 'not financial advice',
  ],
};

// ============================================================================
// ANALYSIS FUNCTIONS
// ============================================================================

export interface AnalyzedPost {
  id: string;
  text: string;
  timestamp: Date;
  metrics?: {
    likes: number;
    retweets: number;
    replies: number;
  };
}

interface KeywordMatch {
  keyword: string;
  count: number;
  examples: BehaviorExample[];
}

function findKeywordMatches(
  posts: AnalyzedPost[],
  keywords: string[],
  maxExamples: number = 5
): KeywordMatch[] {
  const matches: Map<string, { count: number; examples: BehaviorExample[] }> = new Map();

  for (const post of posts) {
    const textLower = post.text.toLowerCase();

    for (const keyword of keywords) {
      if (textLower.includes(keyword.toLowerCase())) {
        const existing = matches.get(keyword) || { count: 0, examples: [] };
        existing.count++;

        if (existing.examples.length < maxExamples) {
          existing.examples.push({
            excerpt: truncateText(post.text, 200),
            tweetId: post.id,
            timestamp: post.timestamp,
          });
        }

        matches.set(keyword, existing);
      }
    }
  }

  return Array.from(matches.entries())
    .map(([keyword, data]) => ({ keyword, ...data }))
    .sort((a, b) => b.count - a.count);
}

export function analyzeToxicity(posts: AnalyzedPost[]): {
  score: number;
  examples: BehaviorExample[];
} {
  const vulgarMatches = findKeywordMatches(posts, KEYWORD_SEEDS.vulgarity);
  const aggroMatches = findKeywordMatches(posts, KEYWORD_SEEDS.aggression);

  const totalVulgar = vulgarMatches.reduce((sum, m) => sum + m.count, 0);
  const totalAggro = aggroMatches.reduce((sum, m) => sum + m.count, 0);

  // Aggression is weighted higher
  const rawScore = (totalVulgar * 2 + totalAggro * 5) / Math.max(posts.length, 1);

  // Normalize to 0-100
  const score = Math.min(100, Math.round(rawScore * 20));

  // Combine examples, prioritizing aggression
  const examples = [
    ...aggroMatches.flatMap(m => m.examples),
    ...vulgarMatches.flatMap(m => m.examples),
  ].slice(0, 5);

  return { score, examples };
}

export function analyzeVulgarity(posts: AnalyzedPost[]): {
  score: number;
  examples: BehaviorExample[];
} {
  const matches = findKeywordMatches(posts, KEYWORD_SEEDS.vulgarity);
  const totalMatches = matches.reduce((sum, m) => sum + m.count, 0);

  const rawScore = totalMatches / Math.max(posts.length, 1);
  const score = Math.min(100, Math.round(rawScore * 30));

  const examples = matches.flatMap(m => m.examples).slice(0, 5);

  return { score, examples };
}

export function analyzeHypeIntensity(posts: AnalyzedPost[]): {
  score: number;
  examples: BehaviorExample[];
  keywords: string[];
} {
  const matches = findKeywordMatches(posts, KEYWORD_SEEDS.hype);
  const totalMatches = matches.reduce((sum, m) => sum + m.count, 0);

  const rawScore = totalMatches / Math.max(posts.length, 1);
  const score = Math.min(100, Math.round(rawScore * 25));

  const examples = matches.flatMap(m => m.examples).slice(0, 5);
  const keywords = matches.slice(0, 10).map(m => m.keyword);

  return { score, examples, keywords };
}

export function analyzeAggression(posts: AnalyzedPost[]): {
  score: number;
  examples: BehaviorExample[];
  targetPatterns: string[];
} {
  const matches = findKeywordMatches(posts, KEYWORD_SEEDS.aggression);
  const totalMatches = matches.reduce((sum, m) => sum + m.count, 0);

  const rawScore = totalMatches / Math.max(posts.length, 1);
  const score = Math.min(100, Math.round(rawScore * 50));

  const examples = matches.flatMap(m => m.examples).slice(0, 5);

  // Extract targets from aggressive posts (mentions)
  const targetPatterns: string[] = [];
  for (const example of examples) {
    const mentions = example.excerpt.match(/@[a-zA-Z0-9_]+/g);
    if (mentions) {
      targetPatterns.push(...mentions.slice(0, 2));
    }
  }

  return {
    score,
    examples,
    targetPatterns: [...new Set(targetPatterns)].slice(0, 5),
  };
}

export function analyzeConsistency(posts: AnalyzedPost[]): {
  score: number;
  topicDrift: number;
  contradictions: BehaviorExample[];
} {
  if (posts.length < 10) {
    return { score: 80, topicDrift: 10, contradictions: [] };
  }

  // Simple topic drift analysis using ticker/project diversity over time
  const timeWindows = splitIntoWindows(posts, 3);
  const windowTopics = timeWindows.map(window => {
    const topics = new Set<string>();
    for (const post of window) {
      const tickers = post.text.match(/\$[A-Z]{2,10}/g) || [];
      tickers.forEach(t => topics.add(t));
    }
    return topics;
  });

  // Calculate topic overlap between windows
  let totalOverlap = 0;
  for (let i = 1; i < windowTopics.length; i++) {
    const prev = windowTopics[i - 1];
    const curr = windowTopics[i];
    const intersection = new Set([...prev].filter(x => curr.has(x)));
    const union = new Set([...prev, ...curr]);
    totalOverlap += union.size > 0 ? intersection.size / union.size : 1;
  }

  const avgOverlap = windowTopics.length > 1 ? totalOverlap / (windowTopics.length - 1) : 1;
  const topicDrift = Math.round((1 - avgOverlap) * 100);

  // Higher consistency = lower drift = higher score
  const score = Math.max(0, 100 - topicDrift);

  // Look for contradictory statements (simplified)
  const contradictions = findContradictions(posts);

  return { score, topicDrift, contradictions };
}

export function detectShillBursts(posts: AnalyzedPost[]): {
  detected: boolean;
  burstPeriods: { start: Date; end: Date; count: number }[];
} {
  const promoMatches = findKeywordMatches(posts, KEYWORD_SEEDS.promotional);
  const promoPostIds = new Set(promoMatches.flatMap(m => m.examples.map(e => e.tweetId)));

  // Group promo posts by hour
  const promoPosts = posts.filter(p => promoPostIds.has(p.id));
  const hourBuckets: Map<string, AnalyzedPost[]> = new Map();

  for (const post of promoPosts) {
    const hourKey = new Date(post.timestamp).toISOString().slice(0, 13);
    const existing = hourBuckets.get(hourKey) || [];
    existing.push(post);
    hourBuckets.set(hourKey, existing);
  }

  // Find burst periods (5+ promo posts in an hour)
  const burstPeriods: { start: Date; end: Date; count: number }[] = [];

  for (const [hourKey, hourPosts] of hourBuckets) {
    if (hourPosts.length >= 5) {
      const timestamps = hourPosts.map(p => p.timestamp.getTime());
      burstPeriods.push({
        start: new Date(Math.min(...timestamps)),
        end: new Date(Math.max(...timestamps)),
        count: hourPosts.length,
      });
    }
  }

  return {
    detected: burstPeriods.length > 0,
    burstPeriods: burstPeriods.sort((a, b) => b.count - a.count).slice(0, 5),
  };
}

// ============================================================================
// FULL ANALYSIS
// ============================================================================

export function analyzeBehavior(posts: AnalyzedPost[]): BehaviorMetrics {
  const toxicity = analyzeToxicity(posts);
  const vulgarity = analyzeVulgarity(posts);
  const hype = analyzeHypeIntensity(posts);
  const aggression = analyzeAggression(posts);
  const consistency = analyzeConsistency(posts);
  const spamBurst = detectShillBursts(posts);

  return {
    toxicity,
    vulgarity,
    hype,
    aggression,
    consistency,
    spamBurst,
  };
}

// ============================================================================
// BACKLASH DETECTION
// ============================================================================

export interface DetectedBacklash {
  category: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  posts: AnalyzedPost[];
  keywords: string[];
}

export function detectBacklash(posts: AnalyzedPost[]): DetectedBacklash[] {
  const matches = findKeywordMatches(posts, KEYWORD_SEEDS.backlash);

  if (matches.length === 0) return [];

  const totalMatches = matches.reduce((sum, m) => sum + m.count, 0);

  // Determine severity based on volume and keyword intensity
  let severity: 'low' | 'medium' | 'high' | 'critical' = 'low';
  const criticalKeywords = ['scam', 'rug', 'fraud', 'stole', 'exit scam'];
  const hasCritical = matches.some(m => criticalKeywords.includes(m.keyword));

  if (totalMatches > 20 || hasCritical) {
    severity = totalMatches > 50 ? 'critical' : 'high';
  } else if (totalMatches > 5) {
    severity = 'medium';
  }

  const backlashPosts = posts.filter(p => {
    const textLower = p.text.toLowerCase();
    return KEYWORD_SEEDS.backlash.some(kw => textLower.includes(kw));
  });

  return [{
    category: hasCritical ? 'scam_allegation' : 'criticism',
    severity,
    posts: backlashPosts.slice(0, 10),
    keywords: matches.slice(0, 5).map(m => m.keyword),
  }];
}

// ============================================================================
// HELPERS
// ============================================================================

function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + '...';
}

function splitIntoWindows<T>(items: T[], numWindows: number): T[][] {
  const windowSize = Math.ceil(items.length / numWindows);
  const windows: T[][] = [];

  for (let i = 0; i < items.length; i += windowSize) {
    windows.push(items.slice(i, i + windowSize));
  }

  return windows;
}

function findContradictions(posts: AnalyzedPost[]): BehaviorExample[] {
  // Simplified contradiction detection
  // Look for posts about same ticker with opposite sentiment
  const tickerSentiments: Map<string, { bullish: AnalyzedPost[]; bearish: AnalyzedPost[] }> = new Map();

  const bullishWords = ['bullish', 'moon', 'buy', 'long', 'pump', 'gem', 'alpha'];
  const bearishWords = ['bearish', 'dump', 'sell', 'short', 'rug', 'scam', 'avoid'];

  for (const post of posts) {
    const tickers = post.text.match(/\$[A-Z]{2,10}/g) || [];
    const textLower = post.text.toLowerCase();

    const isBullish = bullishWords.some(w => textLower.includes(w));
    const isBearish = bearishWords.some(w => textLower.includes(w));

    for (const ticker of tickers) {
      const existing = tickerSentiments.get(ticker) || { bullish: [], bearish: [] };

      if (isBullish && !isBearish) existing.bullish.push(post);
      if (isBearish && !isBullish) existing.bearish.push(post);

      tickerSentiments.set(ticker, existing);
    }
  }

  // Find tickers with both bullish and bearish posts
  const contradictions: BehaviorExample[] = [];

  for (const [ticker, sentiments] of tickerSentiments) {
    if (sentiments.bullish.length > 0 && sentiments.bearish.length > 0) {
      // Add both as contradictory examples
      if (sentiments.bullish[0]) {
        contradictions.push({
          excerpt: `Bullish on ${ticker}: ${truncateText(sentiments.bullish[0].text, 150)}`,
          tweetId: sentiments.bullish[0].id,
          timestamp: sentiments.bullish[0].timestamp,
        });
      }
      if (sentiments.bearish[0]) {
        contradictions.push({
          excerpt: `Bearish on ${ticker}: ${truncateText(sentiments.bearish[0].text, 150)}`,
          tweetId: sentiments.bearish[0].id,
          timestamp: sentiments.bearish[0].timestamp,
        });
      }
    }
  }

  return contradictions.slice(0, 6);
}
