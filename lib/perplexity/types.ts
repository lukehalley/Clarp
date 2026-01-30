// Perplexity Sonar Types
// Types for Perplexity API responses and grounded web research results

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

export interface PerplexityMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface PerplexityChatCompletionResponse {
  id: string;
  model: string;
  object: string;
  created: number;
  choices: Array<{
    index: number;
    finish_reason: string;
    message: {
      role: 'assistant';
      content: string;
    };
  }>;
  citations?: string[];
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

// ============================================================================
// RESEARCH RESULT TYPES
// ============================================================================

export interface PerplexityTeamMember {
  name: string;
  role: string;
  previousEmployers?: string[];
  linkedIn?: string | null;
  isDoxxed: boolean;
  xHandle?: string | null;
}

export interface PerplexityLegalEntity {
  companyName?: string | null;
  jurisdiction?: string | null;
  isRegistered: boolean;
  registrationDetails?: string | null;
}

export interface PerplexityFundingRound {
  round: string;
  amount?: string | null;
  date?: string | null;
  investors?: string[];
}

export interface PerplexityAuditInfo {
  hasAudit: boolean;
  auditor?: string | null;
  auditDate?: string | null;
  auditUrl?: string | null;
}

export interface PerplexityAffiliation {
  name: string;
  type: string;
  details?: string;
}

export interface PerplexityNewsItem {
  date?: string | null;
  headline: string;
  source: string;
  url?: string | null;
}

/**
 * Result from Perplexity Sonar web research.
 * All fields are grounded with citations - Perplexity returns sources for claims.
 */
export interface PerplexityResearchResult {
  // Project factual data
  projectName?: string | null;
  description?: string | null;
  foundingDate?: string | null;

  // Team (with real names and background - cited)
  teamMembers?: PerplexityTeamMember[];

  // Legal entity (cited from registration records, news)
  legalEntity?: PerplexityLegalEntity;

  // Funding (cited from news, Crunchbase, etc.)
  fundingHistory?: PerplexityFundingRound[];

  // Audit status (cited)
  audit?: PerplexityAuditInfo;

  // Tech
  techStack?: {
    blockchain?: string | null;
    smartContractLanguage?: string | null;
    keyTechnologies?: string[];
  };

  // Affiliations (partnerships, accelerators, VCs)
  affiliations?: PerplexityAffiliation[];

  // Recent news (all with source URLs)
  recentNews?: PerplexityNewsItem[];

  // Controversies found via web search
  controversies?: string[];

  // Summary findings
  keyFindings?: string[];

  // The narrative (grounded summary of the project)
  theStory?: string | null;

  // Metadata
  citations: Array<{ url: string; title?: string }>;
  tokensUsed?: number;
  confidence: 'low' | 'medium' | 'high';
}

/**
 * Focused controversy/scam research result
 */
export interface PerplexityControversyResult {
  hasControversies: boolean;
  allegations: Array<{
    type: 'scam' | 'rug' | 'fraud' | 'lawsuit' | 'warning' | 'hack';
    summary: string;
    date?: string | null;
    source: string;
    url?: string | null;
  }>;
  citations: Array<{ url: string; title?: string }>;
  confidence: 'low' | 'medium' | 'high';
}

// ============================================================================
// ERROR TYPES
// ============================================================================

export class PerplexityApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public rawError?: unknown
  ) {
    super(message);
    this.name = 'PerplexityApiError';
  }
}
