// Cross-Reference Module
// Reconciles data from OSINT + Perplexity + Grok into a unified, verified result
// Priority: OSINT (API-verified) > Perplexity (cited web) > Grok (X analysis)

import type { GrokAnalysisResult } from '@/lib/grok/types';
import type { PerplexityResearchResult } from '@/lib/perplexity/types';
import type { ResolvedEntity } from '@/lib/terminal/entity-resolver';
import type {
  DataSourceId,
  SourceAttribution,
  SourceConflict,
  SourceFieldInfo,
  TeamMember,
  LegalEntity,
  Affiliation,
  AuditInfo,
  Tokenomics,
  LiquidityInfo,
  TechStack,
} from '@/types/project';

// ============================================================================
// TYPES
// ============================================================================

export interface CrossReferenceInput {
  osintEntity?: ResolvedEntity;
  perplexityResult?: PerplexityResearchResult | null;
  grokAnalysis: GrokAnalysisResult;
}

export interface CrossReferenceOutput {
  // Merged & verified fields
  teamMembers: TeamMember[];
  legalEntity?: LegalEntity;
  affiliations?: Affiliation[];
  fundingHistory?: Array<{
    round: string;
    amount?: string | null;
    date?: string | null;
    investors?: string[];
  }>;
  audit?: AuditInfo;
  techStack?: TechStack;
  tokenomics?: Tokenomics;
  liquidity?: LiquidityInfo;
  controversies: string[];
  keyFindings: string[];
  theStory?: string;
  recentNews?: Array<{
    date?: string | null;
    headline: string;
    source: string;
    url?: string | null;
  }>;

  // Source tracking
  sourceAttribution: SourceAttribution;

  // Perplexity citations for display
  citations: Array<{ url: string; title?: string }>;
}

// ============================================================================
// MAIN FUNCTION
// ============================================================================

/**
 * Cross-reference data from OSINT, Perplexity, and Grok.
 *
 * Priority for factual data:
 *   1. OSINT (API-verified, most reliable — RugCheck, GitHub API, DexScreener)
 *   2. Perplexity (cited web sources — grounded, not hallucinated)
 *   3. Grok (X analysis — least reliable for factual claims)
 *
 * Priority for behavioral data:
 *   1. Grok (has live X search — this is what it's best at)
 *   2. Perplexity (may surface some X/social data)
 *   3. OSINT (no behavioral data)
 */
export function crossReference(input: CrossReferenceInput): CrossReferenceOutput {
  const { osintEntity, perplexityResult, grokAnalysis } = input;
  const now = new Date();

  const fieldSources: Record<string, SourceFieldInfo> = {};
  const conflicts: SourceConflict[] = [];
  const allCitations: Array<{ url: string; title?: string }> = [];

  // Collect Perplexity citations
  if (perplexityResult?.citations) {
    allCitations.push(...perplexityResult.citations);
  }

  // --------------------------------------------------------------------------
  // TEAM MEMBERS — Merge all sources, deduplicate by handle/name
  // Perplexity preferred for real names & employers (has citations)
  // --------------------------------------------------------------------------
  const teamMembers = mergeTeamMembers(osintEntity, perplexityResult, grokAnalysis);
  if (teamMembers.length > 0) {
    const source: DataSourceId = perplexityResult?.teamMembers?.length
      ? 'perplexity'
      : grokAnalysis.positiveIndicators?.teamMembers?.length
        ? 'grok'
        : 'osint';
    fieldSources['team'] = { source, confidence: source === 'perplexity' ? 'high' : 'medium', retrievedAt: now };
  }

  // --------------------------------------------------------------------------
  // LEGAL ENTITY — Perplexity > Grok (web citations > uncited claims)
  // --------------------------------------------------------------------------
  let legalEntity: LegalEntity | undefined;
  if (perplexityResult?.legalEntity?.companyName) {
    legalEntity = perplexityResult.legalEntity;
    fieldSources['legalEntity'] = { source: 'perplexity', confidence: 'high', retrievedAt: now };

    // Check for conflict with Grok
    if (grokAnalysis.legalEntity?.companyName &&
        grokAnalysis.legalEntity.companyName.toLowerCase() !== perplexityResult.legalEntity.companyName?.toLowerCase()) {
      conflicts.push({
        field: 'legalEntity.companyName',
        sources: [
          { source: 'perplexity', value: perplexityResult.legalEntity.companyName || 'null' },
          { source: 'grok', value: grokAnalysis.legalEntity.companyName || 'null' },
        ],
        resolution: 'perplexity_wins',
      });
    }
  } else if (grokAnalysis.legalEntity?.companyName) {
    legalEntity = grokAnalysis.legalEntity;
    fieldSources['legalEntity'] = { source: 'grok', confidence: 'low', retrievedAt: now };
  }

  // --------------------------------------------------------------------------
  // AFFILIATIONS — Union of Perplexity + Grok, deduplicated
  // --------------------------------------------------------------------------
  const affiliations = mergeAffiliations(perplexityResult, grokAnalysis);
  if (affiliations.length > 0) {
    fieldSources['affiliations'] = {
      source: perplexityResult?.affiliations?.length ? 'perplexity' : 'grok',
      confidence: 'medium',
      retrievedAt: now,
    };
  }

  // --------------------------------------------------------------------------
  // FUNDING HISTORY — Perplexity > Grok (Perplexity can cite Crunchbase, news)
  // --------------------------------------------------------------------------
  let fundingHistory = perplexityResult?.fundingHistory?.length
    ? perplexityResult.fundingHistory
    : grokAnalysis.fundingHistory;
  if (fundingHistory?.length) {
    fieldSources['fundingHistory'] = {
      source: perplexityResult?.fundingHistory?.length ? 'perplexity' : 'grok',
      confidence: perplexityResult?.fundingHistory?.length ? 'high' : 'low',
      retrievedAt: now,
    };
  }

  // --------------------------------------------------------------------------
  // AUDIT — OSINT (website scrape) > Perplexity > Grok
  // --------------------------------------------------------------------------
  let audit: AuditInfo | undefined;
  // Note: websiteIntel is a ScrapedWebsite (from scraper), not WebsiteIntel (from AI analysis)
  // Audit info flags are checked via the allSocialLinks in upsertProjectFromAnalysis
  if (grokAnalysis.audit?.hasAudit) {
    // Grok found audit info
    audit = grokAnalysis.audit;
    fieldSources['audit'] = { source: 'grok', confidence: 'medium', retrievedAt: now };
  }
  if (!audit && perplexityResult?.audit?.hasAudit) {
    audit = {
      ...perplexityResult.audit,
      auditStatus: perplexityResult.audit.hasAudit ? 'completed' : 'none',
    };
    fieldSources['audit'] = { source: 'perplexity', confidence: 'high', retrievedAt: now };

    // Flag conflict if Grok says no audit but Perplexity found one (or vice versa)
    if (grokAnalysis.audit && grokAnalysis.audit.hasAudit !== perplexityResult.audit.hasAudit) {
      conflicts.push({
        field: 'audit.hasAudit',
        sources: [
          { source: 'perplexity', value: String(perplexityResult.audit.hasAudit) },
          { source: 'grok', value: String(grokAnalysis.audit.hasAudit) },
        ],
        resolution: 'perplexity_wins',
      });
    }
  }
  if (!audit && grokAnalysis.audit) {
    // Already set above if grokAnalysis.audit.hasAudit was true
    // This catches the case where Perplexity overrode the Grok audit
  }

  // --------------------------------------------------------------------------
  // TECH STACK — OSINT (GitHub API) > Perplexity > Grok
  // --------------------------------------------------------------------------
  let techStack: TechStack | undefined;
  if (osintEntity?.githubIntel?.repo?.primaryLanguage) {
    // OSINT has GitHub data — use Grok's structured techStack but with OSINT verification
    techStack = grokAnalysis.techStack;
    if (techStack) {
      fieldSources['techStack'] = { source: 'osint', confidence: 'high', retrievedAt: now };
    }
  }
  if (!techStack && perplexityResult?.techStack) {
    techStack = {
      blockchain: perplexityResult.techStack.blockchain || 'unknown',
      offlineCapability: false,
    };
    fieldSources['techStack'] = { source: 'perplexity', confidence: 'medium', retrievedAt: now };
  }
  if (!techStack && grokAnalysis.techStack) {
    techStack = grokAnalysis.techStack;
    fieldSources['techStack'] = { source: 'grok', confidence: 'low', retrievedAt: now };
  }

  // --------------------------------------------------------------------------
  // TOKENOMICS — OSINT > Grok (OSINT has on-chain data)
  // --------------------------------------------------------------------------
  const tokenomics = grokAnalysis.tokenomics;
  if (tokenomics) {
    fieldSources['tokenomics'] = { source: osintEntity?.securityIntel ? 'osint' : 'grok', confidence: 'medium', retrievedAt: now };
  }

  // --------------------------------------------------------------------------
  // LIQUIDITY — OSINT > Grok (OSINT has DexScreener data)
  // --------------------------------------------------------------------------
  const liquidity = grokAnalysis.liquidity;
  if (liquidity) {
    fieldSources['liquidity'] = { source: osintEntity?.marketIntel ? 'osint' : 'grok', confidence: 'medium', retrievedAt: now };
  }

  // --------------------------------------------------------------------------
  // CONTRACT ADDRESS CROSS-VALIDATION
  // OSINT (on-chain) is ground truth. When Perplexity returns a different
  // address, always prefer OSINT and log a conflict.
  // --------------------------------------------------------------------------
  const osintTokenAddress = osintEntity?.tokenAddresses?.[0]?.address;
  const perplexityTokenAddress = perplexityResult?.identifiers?.tokenAddress;

  if (osintTokenAddress && perplexityTokenAddress &&
      osintTokenAddress.toLowerCase() !== perplexityTokenAddress.toLowerCase()) {
    conflicts.push({
      field: 'identifiers.tokenAddress',
      sources: [
        { source: 'osint', value: osintTokenAddress },
        { source: 'perplexity', value: perplexityTokenAddress },
      ],
      resolution: 'osint_wins',
    });
    console.log(`[CrossRef] ⚠️ Contract address mismatch: OSINT=${osintTokenAddress.slice(0, 12)}... vs Perplexity=${perplexityTokenAddress.slice(0, 12)}... — using OSINT (on-chain ground truth)`);
  }

  // --------------------------------------------------------------------------
  // CONTROVERSIES — Union of all sources
  // Perplexity controversies have web citations, Grok has X-based allegations
  // --------------------------------------------------------------------------
  const controversies = mergeControversies(perplexityResult, grokAnalysis);
  if (controversies.length > 0) {
    fieldSources['controversies'] = { source: 'perplexity', confidence: 'medium', retrievedAt: now };
  }

  // --------------------------------------------------------------------------
  // KEY FINDINGS — Synthesized from all sources
  // --------------------------------------------------------------------------
  const keyFindings = mergeKeyFindings(osintEntity, perplexityResult, grokAnalysis);
  fieldSources['keyFindings'] = { source: 'perplexity', confidence: 'medium', retrievedAt: now };

  // Add contract address mismatch finding if detected
  if (osintTokenAddress && perplexityTokenAddress &&
      osintTokenAddress.toLowerCase() !== perplexityTokenAddress.toLowerCase()) {
    keyFindings.unshift('⚠️ Contract address mismatch between sources — using verified on-chain address');
  }

  // --------------------------------------------------------------------------
  // THE STORY — Perplexity preferred (grounded narrative with citations)
  // --------------------------------------------------------------------------
  let theStory: string | undefined;
  if (perplexityResult?.theStory) {
    theStory = perplexityResult.theStory;
    fieldSources['theStory'] = { source: 'perplexity', confidence: 'high', retrievedAt: now };
  } else if (grokAnalysis.theStory) {
    theStory = grokAnalysis.theStory;
    fieldSources['theStory'] = { source: 'grok', confidence: 'medium', retrievedAt: now };
  }

  // --------------------------------------------------------------------------
  // RECENT NEWS — Perplexity only (Grok doesn't produce structured news)
  // --------------------------------------------------------------------------
  const recentNews = perplexityResult?.recentNews;
  if (recentNews?.length) {
    fieldSources['recentNews'] = { source: 'perplexity', confidence: 'high', retrievedAt: now };
  }

  return {
    teamMembers,
    legalEntity,
    affiliations: affiliations.length > 0 ? affiliations : undefined,
    fundingHistory: fundingHistory?.length ? fundingHistory : undefined,
    audit,
    techStack,
    tokenomics,
    liquidity,
    controversies,
    keyFindings,
    theStory,
    recentNews,
    sourceAttribution: { fieldSources, conflicts: conflicts.length > 0 ? conflicts : undefined },
    citations: allCitations,
  };
}

// ============================================================================
// MERGE HELPERS
// ============================================================================

function mergeTeamMembers(
  osint?: ResolvedEntity,
  perplexity?: PerplexityResearchResult | null,
  grok?: GrokAnalysisResult
): TeamMember[] {
  const byKey = new Map<string, TeamMember>();

  // Helper to get a dedup key (prefer xHandle, fallback to lowercase name)
  const getKey = (m: { handle?: string; xHandle?: string | null; name?: string }): string => {
    const handle = m.handle || m.xHandle;
    if (handle) return handle.toLowerCase().replace('@', '');
    return (m.name || '').toLowerCase();
  };

  // 1. OSINT team (from GitHub contributors, website scrape)
  if (osint?.discoveredTeam) {
    for (const m of osint.discoveredTeam) {
      const key = (m.twitter || m.github || m.name || '').toLowerCase();
      if (!key) continue;
      byKey.set(key, {
        handle: m.twitter || m.github || '',
        displayName: m.name,
        realName: m.name,
        role: m.role,
        isDoxxed: m.isDoxxed,
      });
    }
  }

  // 2. Perplexity team (cited web sources — more reliable for real names)
  if (perplexity?.teamMembers) {
    for (const m of perplexity.teamMembers) {
      const key = getKey(m);
      if (!key) continue;
      const existing = byKey.get(key);
      byKey.set(key, {
        handle: m.xHandle || existing?.handle || m.name,
        displayName: m.name,
        realName: m.name,
        role: m.role || existing?.role,
        isDoxxed: m.isDoxxed || existing?.isDoxxed,
        previousEmployers: m.previousEmployers?.length ? m.previousEmployers : existing?.previousEmployers,
        linkedIn: m.linkedIn || existing?.linkedIn,
      });
    }
  }

  // 3. Grok team (from X analysis)
  if (grok?.positiveIndicators?.teamMembers) {
    for (const m of grok.positiveIndicators.teamMembers) {
      const key = getKey(m);
      if (!key) continue;
      const existing = byKey.get(key);
      if (!existing) {
        // Only add Grok team members if not already found by OSINT/Perplexity
        byKey.set(key, {
          handle: m.xHandle || m.name,
          displayName: m.name,
          realName: m.realName,
          role: m.role,
          isDoxxed: m.isDoxxed,
          previousEmployers: m.previousEmployers,
          linkedIn: m.linkedIn,
        });
      } else {
        // Supplement existing with Grok data for missing fields only
        if (!existing.realName && m.realName) existing.realName = m.realName;
        if (!existing.role && m.role) existing.role = m.role;
        if (!existing.previousEmployers?.length && m.previousEmployers?.length) {
          existing.previousEmployers = m.previousEmployers;
        }
        if (!existing.linkedIn && m.linkedIn) existing.linkedIn = m.linkedIn;
      }
    }
  }

  return Array.from(byKey.values());
}

function mergeAffiliations(
  perplexity?: PerplexityResearchResult | null,
  grok?: GrokAnalysisResult
): Affiliation[] {
  const seen = new Set<string>();
  const result: Affiliation[] = [];

  // Perplexity first (cited)
  if (perplexity?.affiliations) {
    for (const a of perplexity.affiliations) {
      const key = a.name.toLowerCase();
      if (!seen.has(key)) {
        seen.add(key);
        result.push({
          name: a.name,
          type: normalizeAffiliationType(a.type),
          details: a.details,
        });
      }
    }
  }

  // Grok second (supplement)
  if (grok?.affiliations) {
    for (const a of grok.affiliations as Affiliation[]) {
      const key = a.name.toLowerCase();
      if (!seen.has(key)) {
        seen.add(key);
        result.push(a);
      }
    }
  }

  return result;
}

function mergeControversies(
  perplexity?: PerplexityResearchResult | null,
  grok?: GrokAnalysisResult
): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  const perplexityKeys = new Set<string>();

  // Perplexity controversies (web-sourced, cited) — keep as-is
  if (perplexity?.controversies) {
    for (const c of perplexity.controversies) {
      const key = c.toLowerCase().slice(0, 50); // Rough dedup
      if (!seen.has(key)) {
        seen.add(key);
        perplexityKeys.add(key);
        result.push(c);
      }
    }
  }

  // Grok controversies (X-sourced) — tag as [Unverified] unless corroborated by Perplexity
  if (grok?.controversies) {
    for (const c of grok.controversies) {
      const key = c.toLowerCase().slice(0, 50);
      if (!seen.has(key)) {
        seen.add(key);
        // Check if Perplexity corroborates this claim (fuzzy match on first 30 chars)
        const isCorroborated = Array.from(perplexityKeys).some(pk =>
          pk.includes(key.slice(0, 30)) || key.includes(pk.slice(0, 30))
        );
        result.push(isCorroborated ? c : `[Unverified] ${c}`);
      }
    }
  }

  return result;
}

function mergeKeyFindings(
  osint?: ResolvedEntity,
  perplexity?: PerplexityResearchResult | null,
  grok?: GrokAnalysisResult
): string[] {
  const result: string[] = [];
  const perplexityFindings: string[] = [];

  // Perplexity findings first (grounded, cited — keep as-is)
  if (perplexity?.keyFindings) {
    perplexityFindings.push(...perplexity.keyFindings);
    result.push(...perplexity.keyFindings);
  }

  // Grok findings (behavioral, uncited) — tag as [Unverified] unless corroborated by Perplexity
  if (grok?.keyFindings) {
    for (const f of grok.keyFindings) {
      // Avoid duplicates (rough check)
      if (!result.some(existing => existing.toLowerCase().includes(f.toLowerCase().slice(0, 30)))) {
        // Check if Perplexity corroborates this finding
        const isCorroborated = perplexityFindings.some(pf =>
          pf.toLowerCase().includes(f.toLowerCase().slice(0, 30)) ||
          f.toLowerCase().includes(pf.toLowerCase().slice(0, 30))
        );
        result.push(isCorroborated ? f : `[Unverified] ${f}`);
      }
    }
  }

  // OSINT risk/legitimacy signals (API-verified — keep [OSINT] prefix)
  if (osint?.riskFlags) {
    for (const flag of osint.riskFlags) {
      if (!result.some(existing => existing.toLowerCase().includes(flag.toLowerCase().slice(0, 20)))) {
        result.push(`[OSINT] ${flag}`);
      }
    }
  }
  if (osint?.legitimacySignals) {
    for (const signal of osint.legitimacySignals) {
      if (!result.some(existing => existing.toLowerCase().includes(signal.toLowerCase().slice(0, 20)))) {
        result.push(`[OSINT] ${signal}`);
      }
    }
  }

  return result;
}

function normalizeAffiliationType(type: string): Affiliation['type'] {
  const t = type.toLowerCase();
  if (t === 'council') return 'council';
  if (t === 'accelerator') return 'accelerator';
  if (t === 'vc') return 'vc';
  if (t === 'exchange') return 'exchange';
  if (t === 'regulatory') return 'regulatory';
  return 'other';
}
