// X Intel Entity Extractor
// Extracts and classifies entities from post content

import { Chain } from '@/types/terminal';
import { LinkedEntity, LinkedEntityType, LinkedEntityConfidence } from '@/types/xintel';

// ============================================================================
// PATTERNS
// ============================================================================

const PATTERNS = {
  // $TICKER - uppercase, 2-10 chars
  ticker: /\$([A-Z]{2,10})\b/g,

  // Solana address: 32-44 base58 chars
  solanaWallet: /\b([1-9A-HJ-NP-Za-km-z]{32,44})\b/g,

  // EVM address: 0x + 40 hex chars
  evmWallet: /\b(0x[a-fA-F0-9]{40})\b/g,

  // @handle
  mention: /@([a-zA-Z0-9_]{1,15})\b/g,

  // URLs
  url: /https?:\/\/[^\s<>"{}|\\^`[\]]+/gi,

  // Telegram links
  telegram: /(?:https?:\/\/)?(?:t\.me|telegram\.me)\/([a-zA-Z0-9_]+)/gi,

  // Discord links
  discord: /(?:https?:\/\/)?discord\.(?:gg|com\/invite)\/([a-zA-Z0-9]+)/gi,

  // GitHub links
  github: /(?:https?:\/\/)?github\.com\/([a-zA-Z0-9_-]+(?:\/[a-zA-Z0-9_.-]+)?)/gi,

  // Domain extraction (from URLs)
  domain: /https?:\/\/(?:www\.)?([a-zA-Z0-9][a-zA-Z0-9-]*\.[a-zA-Z]{2,})/gi,
};

// Known project names to detect (expandable)
const KNOWN_PROJECTS = [
  'solana', 'ethereum', 'bitcoin', 'arbitrum', 'base', 'polygon',
  'uniswap', 'aave', 'compound', 'opensea', 'blur', 'magic eden',
  'jupiter', 'raydium', 'orca', 'marinade', 'jito', 'tensor',
  'pump.fun', 'moonshot', 'dexscreener', 'birdeye', 'dextools',
];

// ============================================================================
// EXTRACTION FUNCTIONS
// ============================================================================

export interface ExtractedTicker {
  ticker: string;
  count: number;
  contexts: string[];
}

export function extractTickers(text: string): ExtractedTicker[] {
  const matches: Map<string, { count: number; contexts: string[] }> = new Map();

  let match;
  while ((match = PATTERNS.ticker.exec(text)) !== null) {
    const ticker = match[1].toUpperCase();
    const existing = matches.get(ticker) || { count: 0, contexts: [] };

    // Get surrounding context (50 chars each side)
    const start = Math.max(0, match.index - 50);
    const end = Math.min(text.length, match.index + match[0].length + 50);
    const context = text.slice(start, end).replace(/\n/g, ' ').trim();

    existing.count++;
    if (existing.contexts.length < 3) {
      existing.contexts.push(context);
    }
    matches.set(ticker, existing);
  }

  return Array.from(matches.entries()).map(([ticker, data]) => ({
    ticker,
    ...data,
  }));
}

export interface ExtractedMention {
  handle: string;
  count: number;
}

export function extractMentions(text: string): ExtractedMention[] {
  const matches: Map<string, number> = new Map();

  let match;
  while ((match = PATTERNS.mention.exec(text)) !== null) {
    const handle = match[1].toLowerCase();
    matches.set(handle, (matches.get(handle) || 0) + 1);
  }

  return Array.from(matches.entries())
    .map(([handle, count]) => ({ handle, count }))
    .sort((a, b) => b.count - a.count);
}

export interface ExtractedWallet {
  address: string;
  chain: Chain;
  count: number;
}

export function extractWalletStrings(text: string): ExtractedWallet[] {
  const wallets: Map<string, { chain: Chain; count: number }> = new Map();

  // Solana wallets
  let match;
  while ((match = PATTERNS.solanaWallet.exec(text)) !== null) {
    const address = match[1];
    // Basic validation: must have mix of chars
    if (/[a-z]/.test(address) && /[A-Z]/.test(address) && /[0-9]/.test(address)) {
      const existing = wallets.get(address) || { chain: 'solana' as Chain, count: 0 };
      existing.count++;
      wallets.set(address, existing);
    }
  }

  // EVM wallets
  while ((match = PATTERNS.evmWallet.exec(text)) !== null) {
    const address = match[1].toLowerCase();
    const existing = wallets.get(address) || { chain: 'ethereum' as Chain, count: 0 };
    existing.count++;
    wallets.set(address, existing);
  }

  return Array.from(wallets.entries()).map(([address, data]) => ({
    address,
    ...data,
  }));
}

export interface ExtractedLink {
  type: LinkedEntityType;
  value: string;
  raw: string;
  count: number;
}

export function extractDomains(text: string): ExtractedLink[] {
  const domains: Map<string, { raw: string; count: number }> = new Map();

  let match;
  while ((match = PATTERNS.domain.exec(text)) !== null) {
    const domain = match[1].toLowerCase();
    const raw = match[0];

    // Skip common non-project domains
    if (isCommonDomain(domain)) continue;

    const existing = domains.get(domain) || { raw, count: 0 };
    existing.count++;
    domains.set(domain, existing);
  }

  return Array.from(domains.entries()).map(([value, data]) => ({
    type: 'domain' as LinkedEntityType,
    value,
    ...data,
  }));
}

export function extractTelegramLinks(text: string): ExtractedLink[] {
  const links: Map<string, { raw: string; count: number }> = new Map();

  let match;
  while ((match = PATTERNS.telegram.exec(text)) !== null) {
    const handle = match[1].toLowerCase();
    const raw = match[0];

    const existing = links.get(handle) || { raw, count: 0 };
    existing.count++;
    links.set(handle, existing);
  }

  return Array.from(links.entries()).map(([value, data]) => ({
    type: 'telegram' as LinkedEntityType,
    value,
    ...data,
  }));
}

export function extractDiscordLinks(text: string): ExtractedLink[] {
  const links: Map<string, { raw: string; count: number }> = new Map();

  let match;
  while ((match = PATTERNS.discord.exec(text)) !== null) {
    const code = match[1];
    const raw = match[0];

    const existing = links.get(code) || { raw, count: 0 };
    existing.count++;
    links.set(code, existing);
  }

  return Array.from(links.entries()).map(([value, data]) => ({
    type: 'discord' as LinkedEntityType,
    value,
    ...data,
  }));
}

export function extractGitHubLinks(text: string): ExtractedLink[] {
  const links: Map<string, { raw: string; count: number }> = new Map();

  let match;
  while ((match = PATTERNS.github.exec(text)) !== null) {
    const path = match[1].toLowerCase();
    const raw = match[0];

    const existing = links.get(path) || { raw, count: 0 };
    existing.count++;
    links.set(path, existing);
  }

  return Array.from(links.entries()).map(([value, data]) => ({
    type: 'github' as LinkedEntityType,
    value,
    ...data,
  }));
}

export function extractProjectNames(text: string): string[] {
  const textLower = text.toLowerCase();
  return KNOWN_PROJECTS.filter(project =>
    textLower.includes(project.toLowerCase())
  );
}

// ============================================================================
// CONFIDENCE SCORING
// ============================================================================

export function classifyEntityConfidence(
  entity: { count: number; type: LinkedEntityType }
): LinkedEntityConfidence {
  // Higher confidence for more mentions and certain types
  if (entity.count >= 5) return 'high';
  if (entity.count >= 2) return 'medium';
  return 'low';
}

// ============================================================================
// FULL EXTRACTION
// ============================================================================

export interface ExtractionResult {
  tickers: ExtractedTicker[];
  mentions: ExtractedMention[];
  wallets: ExtractedWallet[];
  domains: ExtractedLink[];
  telegram: ExtractedLink[];
  discord: ExtractedLink[];
  github: ExtractedLink[];
  projectNames: string[];
}

export function extractAllEntities(texts: string[]): ExtractionResult {
  const combined = texts.join('\n\n');

  return {
    tickers: extractTickers(combined),
    mentions: extractMentions(combined),
    wallets: extractWalletStrings(combined),
    domains: extractDomains(combined),
    telegram: extractTelegramLinks(combined),
    discord: extractDiscordLinks(combined),
    github: extractGitHubLinks(combined),
    projectNames: extractProjectNames(combined),
  };
}

export function toLinkedEntities(extraction: ExtractionResult): LinkedEntity[] {
  const entities: LinkedEntity[] = [];
  const now = new Date();

  // Domains
  extraction.domains.forEach((d, i) => {
    entities.push({
      id: `domain-${i}`,
      type: 'domain',
      value: d.value,
      confidence: classifyEntityConfidence({ count: d.count, type: 'domain' }),
      evidenceIds: [],
      firstSeen: now,
      lastSeen: now,
      mentionCount: d.count,
    });
  });

  // Telegram
  extraction.telegram.forEach((t, i) => {
    entities.push({
      id: `telegram-${i}`,
      type: 'telegram',
      value: t.value,
      confidence: classifyEntityConfidence({ count: t.count, type: 'telegram' }),
      evidenceIds: [],
      firstSeen: now,
      lastSeen: now,
      mentionCount: t.count,
    });
  });

  // Discord
  extraction.discord.forEach((d, i) => {
    entities.push({
      id: `discord-${i}`,
      type: 'discord',
      value: d.value,
      confidence: classifyEntityConfidence({ count: d.count, type: 'discord' }),
      evidenceIds: [],
      firstSeen: now,
      lastSeen: now,
      mentionCount: d.count,
    });
  });

  // GitHub
  extraction.github.forEach((g, i) => {
    entities.push({
      id: `github-${i}`,
      type: 'github',
      value: g.value,
      confidence: classifyEntityConfidence({ count: g.count, type: 'github' }),
      evidenceIds: [],
      firstSeen: now,
      lastSeen: now,
      mentionCount: g.count,
    });
  });

  // Wallets
  extraction.wallets.forEach((w, i) => {
    entities.push({
      id: `wallet-${i}`,
      type: 'wallet',
      value: w.address,
      chain: w.chain,
      confidence: classifyEntityConfidence({ count: w.count, type: 'wallet' }),
      evidenceIds: [],
      firstSeen: now,
      lastSeen: now,
      mentionCount: w.count,
    });
  });

  // Mentions as handles
  extraction.mentions.slice(0, 20).forEach((m, i) => {
    entities.push({
      id: `handle-${i}`,
      type: 'handle',
      value: m.handle,
      confidence: classifyEntityConfidence({ count: m.count, type: 'handle' }),
      evidenceIds: [],
      firstSeen: now,
      lastSeen: now,
      mentionCount: m.count,
    });
  });

  return entities.sort((a, b) => b.mentionCount - a.mentionCount);
}

// ============================================================================
// HELPERS
// ============================================================================

function isCommonDomain(domain: string): boolean {
  const common = [
    'twitter.com', 'x.com', 't.co', 'youtube.com', 'youtu.be',
    'instagram.com', 'facebook.com', 'reddit.com', 'tiktok.com',
    'google.com', 'medium.com', 'substack.com', 'linkedin.com',
    'twitch.tv', 'imgur.com', 'giphy.com', 'tenor.com',
  ];
  return common.includes(domain);
}
