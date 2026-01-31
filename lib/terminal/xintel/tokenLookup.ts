/**
 * Token Lookup Service for XIntel
 *
 * Discovers token data for shilled/promoted tokens using DexScreener API
 * Copied patterns from migrate-chart webapp
 */

export interface TokenData {
  address: string;
  symbol: string;
  name: string;
  priceUsd: number;
  // Price changes for multiple timeframes
  priceChange5m?: number;
  priceChange1h?: number;
  priceChange6h?: number;
  priceChange24h: number;
  volume24h: number;
  liquidity: number;
  marketCap: number;
  poolAddress: string;
  // DEX/trading venue
  dexType: 'raydium' | 'meteora' | 'orca' | 'pump_fun' | 'pumpswap' | 'moonshot' | 'jupiter' | 'unknown';
  // Raw DEX ID from DexScreener (for debugging/display)
  rawDexId?: string;
  // Detected launchpad (if any) - from address pattern or dexId
  detectedLaunchpad?: 'pump_fun' | 'bags_fm' | 'moonshot' | 'raydium_launchlab' | 'meteora_dbc' | 'letsbonk' | 'boop_fun' | 'sugar' | 'unknown';
  // For launchpad tokens: whether graduated from bonding curve
  // true = graduated to DEX, false = still on bonding curve, undefined = not applicable
  isGraduated?: boolean;
  // Transaction data
  buys24h?: number;
  sells24h?: number;
  // Token info
  imageUrl?: string;
  websiteUrl?: string;
  githubUrl?: string;
  twitterUrl?: string;
  telegramUrl?: string;
  // Age - timestamp when first trading pair was created
  pairCreatedAt?: number;
}

export interface TokenSearchResult {
  found: boolean;
  token?: TokenData;
  error?: string;
}

const DEXSCREENER_API = 'https://api.dexscreener.com/latest/dex';

/**
 * Normalize DEX identifiers to our standard types
 *
 * Solana DEX Landscape:
 * - 'raydium' = Raydium AMM/CLMM/CPMM (most volume)
 * - 'orca' = Orca Whirlpools
 * - 'meteora' = Meteora DLMM/Dynamic Pools
 * - 'jupiter' = Jupiter (aggregator, but also has native pools)
 * - 'pumpswap' = Graduated pump.fun tokens (post-March 2025)
 * - 'pump_fun' = Still on pump.fun bonding curve
 * - 'moonshot' = Moonshot by DexScreener
 */
function normalizeDexType(dexId: string): TokenData['dexType'] {
  const normalized = dexId.toLowerCase();

  // Major DEXs
  if (normalized.includes('raydium')) return 'raydium';
  if (normalized.includes('meteora')) return 'meteora';
  if (normalized.includes('orca') || normalized.includes('whirlpool')) return 'orca';
  if (normalized.includes('jupiter')) return 'jupiter';

  // Launchpad DEXs
  if (normalized.includes('pumpswap')) return 'pumpswap';
  if (normalized === 'pumpfun' || normalized === 'pump_fun') return 'pump_fun';
  if (normalized.includes('moonshot') || normalized.includes('moonit')) return 'moonshot';

  return 'unknown';
}

/**
 * Detect launchpad from DEX ID
 * Many launchpads have their own DEX/AMM that shows up in DexScreener
 */
function detectLaunchpadFromDex(dexId: string, tokenAddress?: string): TokenData['detectedLaunchpad'] {
  const normalized = dexId.toLowerCase();
  const isPumpToken = tokenAddress?.toLowerCase().endsWith('pump');

  // Pump.fun ecosystem
  if (normalized === 'pumpfun' || normalized.includes('pumpswap') || isPumpToken) {
    return 'pump_fun';
  }

  // Moonshot by DexScreener
  if (normalized.includes('moonshot') || normalized.includes('moonit')) {
    return 'moonshot';
  }

  // Meteora Dynamic Bonding Curve
  if (normalized.includes('meteora') && (normalized.includes('dbc') || normalized.includes('bonding'))) {
    return 'meteora_dbc';
  }

  // LetsBonk / Bonkfun
  if (normalized.includes('bonk') || normalized.includes('letsbonk')) {
    return 'letsbonk';
  }

  // Boop.fun
  if (normalized.includes('boop')) {
    return 'boop_fun';
  }

  // Sugar
  if (normalized.includes('sugar')) {
    return 'sugar';
  }

  // Raydium LaunchLab
  if (normalized.includes('launchlab')) {
    return 'raydium_launchlab';
  }

  // Bags.fm - check address pattern
  if (tokenAddress?.endsWith('BAGS')) {
    return 'bags_fm';
  }

  return undefined;
}

/**
 * Check if a pump.fun token has graduated based on DEX ID
 *
 * Pump.fun Token Lifecycle:
 * 1. Bonding curve phase (dexId: "pumpfun") - 800M tokens sold via bonding curve
 * 2. Graduation (at ~$69k market cap / 100% bonding progress)
 * 3. Post-graduation:
 *    - After March 2025: Migrates to PumpSwap (dexId: "pumpswap")
 *    - Before March 2025: Migrated to Raydium (dexId: "raydium")
 *
 * @param dexId - The DEX identifier from DexScreener
 * @param tokenAddress - Optional token address to check if it's a pump.fun token
 * @returns true if graduated, false if on bonding curve, undefined if not a pump.fun token
 */
/**
 * Check if a launchpad token has graduated based on DEX ID
 * Works for any launchpad that uses bonding curves (pump.fun, moonshot, etc.)
 *
 * Graduation means the token has left the bonding curve and is now
 * trading on a regular DEX (PumpSwap, Raydium, etc.)
 */
function checkGraduationStatus(dexId: string, tokenAddress?: string): boolean | undefined {
  const normalized = dexId.toLowerCase();
  const isPumpFunToken = tokenAddress?.toLowerCase().endsWith('pump');

  // PumpSwap = graduated pump.fun token
  if (normalized.includes('pumpswap')) return true;

  // Still on pumpfun bonding curve = not graduated
  if (normalized === 'pumpfun') return false;

  // Moonshot on bonding curve = not graduated, on Raydium = graduated
  if (normalized.includes('moonshot') || normalized.includes('moonit')) return false;

  // If on Raydium/Meteora/Orca and it's a pump.fun token, it graduated pre-PumpSwap
  // Note: Before March 2025, graduated tokens went to Raydium instead of PumpSwap
  if (isPumpFunToken) {
    if (normalized.includes('raydium') ||
        normalized.includes('meteora') ||
        normalized.includes('orca')) {
      return true;
    }
  }

  // Not a launchpad token or can't determine
  return undefined;
}

/**
 * Look up a token by its address
 */
export async function lookupTokenByAddress(tokenAddress: string): Promise<TokenSearchResult> {
  try {
    const response = await fetch(
      `${DEXSCREENER_API}/tokens/${tokenAddress}`,
      { cache: 'no-store' }
    );

    if (!response.ok) {
      return { found: false, error: `API error: ${response.status}` };
    }

    const data = await response.json();

    if (!data.pairs || data.pairs.length === 0) {
      return { found: false, error: 'Token not found' };
    }

    // Get the best Solana pool (highest liquidity)
    const solanaPairs = data.pairs
      .filter((pair: any) => pair.chainId === 'solana')
      .sort((a: any, b: any) => parseFloat(b.liquidity?.usd || '0') - parseFloat(a.liquidity?.usd || '0'));

    if (solanaPairs.length === 0) {
      return { found: false, error: 'No Solana pools found' };
    }

    const pair = solanaPairs[0];
    const tokenInfo = pair.baseToken?.address === tokenAddress ? pair.baseToken : pair.quoteToken;

    // Prefer marketCap over FDV for more accurate current valuation
    // FDV assumes all tokens are in circulation, which is often not the case
    const marketCapValue = parseFloat(pair.marketCap || pair.fdv || '0');

    return {
      found: true,
      token: {
        address: tokenAddress,
        symbol: tokenInfo?.symbol || 'UNKNOWN',
        name: tokenInfo?.name || 'Unknown Token',
        priceUsd: parseFloat(pair.priceUsd || '0'),
        priceChange5m: pair.priceChange?.m5 ? parseFloat(pair.priceChange.m5) : undefined,
        priceChange1h: pair.priceChange?.h1 ? parseFloat(pair.priceChange.h1) : undefined,
        priceChange6h: pair.priceChange?.h6 ? parseFloat(pair.priceChange.h6) : undefined,
        priceChange24h: parseFloat(pair.priceChange?.h24 || '0'),
        volume24h: parseFloat(pair.volume?.h24 || '0'),
        liquidity: parseFloat(pair.liquidity?.usd || '0'),
        marketCap: marketCapValue,
        poolAddress: pair.pairAddress,
        dexType: normalizeDexType(pair.dexId),
        rawDexId: pair.dexId,
        detectedLaunchpad: detectLaunchpadFromDex(pair.dexId, tokenAddress),
        isGraduated: checkGraduationStatus(pair.dexId, tokenAddress),
        buys24h: pair.txns?.h24?.buys,
        sells24h: pair.txns?.h24?.sells,
        imageUrl: pair.info?.imageUrl,
        websiteUrl: pair.info?.websites?.find((w: any) => !w.url?.includes('github.com'))?.url || pair.info?.websites?.[0]?.url,
        githubUrl: pair.info?.websites?.find((w: any) => w.url?.includes('github.com'))?.url,
        twitterUrl: pair.info?.socials?.find((s: any) => s.type === 'twitter')?.url,
        telegramUrl: pair.info?.socials?.find((s: any) => s.type === 'telegram')?.url,
        pairCreatedAt: pair.pairCreatedAt,
      },
    };
  } catch (error) {
    console.error('Token lookup by address failed:', error);
    return { found: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

/**
 * Search for a token by name or symbol
 */
export async function searchToken(query: string): Promise<TokenSearchResult> {
  try {
    const response = await fetch(
      `${DEXSCREENER_API}/search?q=${encodeURIComponent(query)}`,
      { cache: 'no-store' }
    );

    if (!response.ok) {
      return { found: false, error: `API error: ${response.status}` };
    }

    const data = await response.json();

    if (!data.pairs || data.pairs.length === 0) {
      return { found: false, error: 'Token not found' };
    }

    // Filter for Solana tokens whose symbol or name matches the query
    const queryLower = query.toLowerCase().replace('$', '');
    const solanaPairs = data.pairs
      .filter((pair: any) => pair.chainId === 'solana')
      .sort((a: any, b: any) => parseFloat(b.liquidity?.usd || '0') - parseFloat(a.liquidity?.usd || '0'));

    // Prefer exact symbol/name match over highest-liquidity unrelated token
    const exactMatch = solanaPairs.find((pair: any) => {
      const symbol = (pair.baseToken?.symbol || '').toLowerCase();
      const name = (pair.baseToken?.name || '').toLowerCase();
      return symbol === queryLower || name === queryLower;
    });

    const fuzzyMatch = solanaPairs.find((pair: any) => {
      const symbol = (pair.baseToken?.symbol || '').toLowerCase();
      const name = (pair.baseToken?.name || '').toLowerCase();
      return symbol.includes(queryLower) || name.includes(queryLower) || queryLower.includes(symbol);
    });

    const pair = exactMatch || fuzzyMatch;

    if (!pair) {
      return { found: false, error: 'No matching Solana tokens found' };
    }
    const tokenInfo = pair.baseToken;
    const tokenAddress = tokenInfo?.address || '';

    // Prefer marketCap over FDV for more accurate current valuation
    const marketCapValue = parseFloat(pair.marketCap || pair.fdv || '0');

    return {
      found: true,
      token: {
        address: tokenAddress,
        symbol: tokenInfo?.symbol || 'UNKNOWN',
        name: tokenInfo?.name || 'Unknown Token',
        priceUsd: parseFloat(pair.priceUsd || '0'),
        priceChange5m: pair.priceChange?.m5 ? parseFloat(pair.priceChange.m5) : undefined,
        priceChange1h: pair.priceChange?.h1 ? parseFloat(pair.priceChange.h1) : undefined,
        priceChange6h: pair.priceChange?.h6 ? parseFloat(pair.priceChange.h6) : undefined,
        priceChange24h: parseFloat(pair.priceChange?.h24 || '0'),
        volume24h: parseFloat(pair.volume?.h24 || '0'),
        liquidity: parseFloat(pair.liquidity?.usd || '0'),
        marketCap: marketCapValue,
        poolAddress: pair.pairAddress,
        dexType: normalizeDexType(pair.dexId),
        rawDexId: pair.dexId,
        detectedLaunchpad: detectLaunchpadFromDex(pair.dexId, tokenAddress),
        isGraduated: checkGraduationStatus(pair.dexId, tokenAddress),
        buys24h: pair.txns?.h24?.buys,
        sells24h: pair.txns?.h24?.sells,
        imageUrl: pair.info?.imageUrl,
        websiteUrl: pair.info?.websites?.[0]?.url,
        twitterUrl: pair.info?.socials?.find((s: any) => s.type === 'twitter')?.url,
        telegramUrl: pair.info?.socials?.find((s: any) => s.type === 'telegram')?.url,
        pairCreatedAt: pair.pairCreatedAt,
      },
    };
  } catch (error) {
    console.error('Token search failed:', error);
    return { found: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

/**
 * Look up a token by symbol or address (auto-detects which)
 * Returns the token data if found
 */
export async function lookupToken(symbolOrAddress: string): Promise<TokenSearchResult> {
  // Check if it looks like a Solana address (base58, 32-44 chars)
  const isAddress = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(symbolOrAddress);

  if (isAddress) {
    return lookupTokenByAddress(symbolOrAddress);
  }

  return searchToken(symbolOrAddress);
}

/**
 * Batch lookup multiple tokens
 */
export async function lookupTokens(queries: string[]): Promise<Map<string, TokenSearchResult>> {
  const results = new Map<string, TokenSearchResult>();

  // Process in parallel with a small delay between requests to avoid rate limiting
  const promises = queries.map(async (query, index) => {
    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, index * 100));
    const result = await lookupToken(query);
    results.set(query, result);
  });

  await Promise.all(promises);
  return results;
}

/**
 * Format price for display
 */
export function formatPrice(price: number): string {
  if (price === 0) return '$0.00';
  if (price < 0.00001) return `$${price.toExponential(2)}`;
  if (price < 0.01) return `$${price.toFixed(6)}`;
  if (price < 1) return `$${price.toFixed(4)}`;
  if (price < 1000) return `$${price.toFixed(2)}`;
  return `$${price.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
}

/**
 * Format market cap for display
 */
export function formatMarketCap(marketCap: number): string {
  if (marketCap === 0) return '-';
  if (marketCap < 1000) return `$${marketCap.toFixed(0)}`;
  if (marketCap < 1_000_000) return `$${(marketCap / 1000).toFixed(1)}K`;
  if (marketCap < 1_000_000_000) return `$${(marketCap / 1_000_000).toFixed(2)}M`;
  return `$${(marketCap / 1_000_000_000).toFixed(2)}B`;
}

/**
 * Format percentage change for display
 */
export function formatPercentChange(change: number): string {
  const sign = change >= 0 ? '+' : '';
  return `${sign}${change.toFixed(2)}%`;
}
