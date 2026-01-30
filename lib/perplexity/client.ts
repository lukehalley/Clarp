// Perplexity Sonar Client
// Grounded web research with citations — the antidote to hallucinations
// Uses Perplexity's chat completions API with the sonar model

import {
  PerplexityApiError,
  PerplexityChatCompletionResponse,
  PerplexityResearchResult,
  PerplexityControversyResult,
} from './types';
import { buildResearchPrompt, buildControversyPrompt } from './prompts';
import type { OsintContext } from '../grok/prompts';

// ============================================================================
// CONFIGURATION
// ============================================================================

const PERPLEXITY_API_KEY = process.env.PERPLEXITY_API_KEY;
const PERPLEXITY_BASE_URL = 'https://api.perplexity.ai';
const DEFAULT_MODEL = 'sonar';

// ============================================================================
// CLIENT CLASS
// ============================================================================

export class PerplexityClient {
  private model: string;

  constructor(model: string = DEFAULT_MODEL) {
    this.model = model;
  }

  /**
   * Check if the client is configured with valid credentials
   */
  isConfigured(): boolean {
    return !!PERPLEXITY_API_KEY;
  }

  /**
   * Research a crypto project using grounded web search.
   * Returns structured facts with citations — no hallucinations.
   *
   * @param query - Project name, handle, or search term
   * @param osintContext - What OSINT already found (to avoid duplicate work)
   */
  async researchProject(
    query: string,
    osintContext?: OsintContext
  ): Promise<PerplexityResearchResult> {
    if (!PERPLEXITY_API_KEY) {
      throw new PerplexityApiError('Perplexity API client not configured. Set PERPLEXITY_API_KEY environment variable.');
    }

    const prompt = buildResearchPrompt(query, osintContext);

    console.log(`[Perplexity] Researching project: "${query}"...`);

    // Retry up to 2 times with exponential backoff
    const maxRetries = 2;
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      if (attempt > 0) {
        const delay = 1000 * Math.pow(2, attempt - 1); // 1s, 2s
        console.log(`[Perplexity] Retry ${attempt}/${maxRetries} for "${query}" after ${delay}ms...`);
        await new Promise(r => setTimeout(r, delay));
      }

      try {
        // 45-second timeout — Perplexity typically responds in 5-15s
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 45_000);

        let response: Response;
        try {
          response = await fetch(`${PERPLEXITY_BASE_URL}/chat/completions`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${PERPLEXITY_API_KEY}`,
            },
            body: JSON.stringify({
              model: this.model,
              messages: [
                {
                  role: 'system',
                  content: 'You are a factual crypto research assistant. Return ONLY valid JSON. Never fabricate information — use null for unknowns.',
                },
                {
                  role: 'user',
                  content: prompt,
                },
              ],
              temperature: 0.1,
              return_citations: true,
              search_recency_filter: 'month', // Prefer recent results
            }),
            signal: controller.signal,
          });
        } catch (err) {
          clearTimeout(timeout);
          if (err instanceof Error && err.name === 'AbortError') {
            lastError = new PerplexityApiError(`Perplexity API timed out after 45s for "${query}"`, 408);
            continue; // retry
          }
          throw err;
        }
        clearTimeout(timeout);

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          const statusCode = response.status;
          lastError = new PerplexityApiError(
            (errorData as Record<string, string>).error || `API request failed with status ${statusCode}`,
            statusCode,
            errorData
          );
          // Retry on 5xx errors and 429 rate limits, not on 4xx client errors
          if (statusCode >= 500 || statusCode === 429) continue;
          throw lastError;
        }

        const data: PerplexityChatCompletionResponse = await response.json();

        const content = data.choices?.[0]?.message?.content;
        if (!content) {
          throw new PerplexityApiError('No content in Perplexity response');
        }

        // Parse citations from the API response
        const citations: Array<{ url: string; title?: string }> = (data.citations || []).map(
          (url: string) => ({ url })
        );

        const result = this.parseResearchResponse(content, citations, data.usage?.total_tokens);

        console.log(`[Perplexity] Research complete: ${result.projectName || query}, confidence: ${result.confidence}, citations: ${result.citations.length}, tokens: ${data.usage?.total_tokens}${attempt > 0 ? ` (after ${attempt} retries)` : ''}`);

        return result;
      } catch (error) {
        if (error instanceof PerplexityApiError) {
          lastError = error;
          // Don't retry client errors (except rate limits handled above)
          if (error.statusCode && error.statusCode < 500 && error.statusCode !== 429 && error.statusCode !== 408) {
            throw error;
          }
          continue;
        }
        throw new PerplexityApiError(
          error instanceof Error ? error.message : 'Unknown error during Perplexity research',
          undefined,
          error
        );
      }
    }

    // All retries exhausted
    throw lastError || new PerplexityApiError(`Perplexity research failed after ${maxRetries + 1} attempts`);
  }

  /**
   * Research controversies and scam allegations specifically.
   * Focused search for negative signals.
   */
  async researchControversies(query: string): Promise<PerplexityControversyResult> {
    if (!PERPLEXITY_API_KEY) {
      throw new PerplexityApiError('Perplexity API client not configured. Set PERPLEXITY_API_KEY environment variable.');
    }

    const prompt = buildControversyPrompt(query);

    console.log(`[Perplexity] Researching controversies for: "${query}"...`);

    try {
      // 30-second timeout for controversy search (simpler query)
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 30_000);

      let response: Response;
      try {
        response = await fetch(`${PERPLEXITY_BASE_URL}/chat/completions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${PERPLEXITY_API_KEY}`,
          },
          body: JSON.stringify({
            model: this.model,
            messages: [
              {
                role: 'system',
                content: 'You are a factual crypto risk analyst. Return ONLY valid JSON. Never fabricate allegations — only report what you can cite.',
              },
              {
                role: 'user',
                content: prompt,
              },
            ],
            temperature: 0.1,
            return_citations: true,
          }),
          signal: controller.signal,
        });
      } catch (err) {
        clearTimeout(timeout);
        if (err instanceof Error && err.name === 'AbortError') {
          throw new PerplexityApiError(`Perplexity controversy research timed out after 30s for "${query}"`, 408);
        }
        throw err;
      }
      clearTimeout(timeout);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new PerplexityApiError(
          (errorData as Record<string, string>).error || `API request failed with status ${response.status}`,
          response.status,
          errorData
        );
      }

      const data: PerplexityChatCompletionResponse = await response.json();

      const content = data.choices?.[0]?.message?.content;
      if (!content) {
        throw new PerplexityApiError('No content in Perplexity controversy response');
      }

      const citations: Array<{ url: string; title?: string }> = (data.citations || []).map(
        (url: string) => ({ url })
      );

      const result = this.parseControversyResponse(content, citations);

      console.log(`[Perplexity] Controversy research complete: found=${result.hasControversies}, allegations=${result.allegations.length}`);

      return result;
    } catch (error) {
      if (error instanceof PerplexityApiError) throw error;
      throw new PerplexityApiError(
        error instanceof Error ? error.message : 'Unknown error during controversy research',
        undefined,
        error
      );
    }
  }

  // ============================================================================
  // PRIVATE METHODS
  // ============================================================================

  private parseResearchResponse(
    text: string,
    citations: Array<{ url: string; title?: string }>,
    tokensUsed?: number
  ): PerplexityResearchResult {
    // Extract JSON from possible markdown wrapping
    const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/) || text.match(/(\{[\s\S]*\})/);

    if (!jsonMatch) {
      console.warn('[Perplexity] Failed to parse JSON from research response');
      return {
        citations,
        tokensUsed,
        confidence: 'low',
        keyFindings: ['Perplexity returned non-structured response'],
      };
    }

    try {
      const parsed = JSON.parse(jsonMatch[1].trim());

      return {
        projectName: parsed.projectName || null,
        description: parsed.description || null,
        foundingDate: parsed.foundingDate || null,
        teamMembers: Array.isArray(parsed.teamMembers) ? parsed.teamMembers.map((m: Record<string, unknown>) => ({
          name: String(m.name || ''),
          role: String(m.role || ''),
          previousEmployers: Array.isArray(m.previousEmployers) ? m.previousEmployers : [],
          linkedIn: m.linkedIn as string | null || null,
          isDoxxed: Boolean(m.isDoxxed),
          xHandle: m.xHandle as string | null || null,
        })) : [],
        legalEntity: parsed.legalEntity ? {
          companyName: parsed.legalEntity.companyName || null,
          jurisdiction: parsed.legalEntity.jurisdiction || null,
          isRegistered: Boolean(parsed.legalEntity.isRegistered),
          registrationDetails: parsed.legalEntity.registrationDetails || null,
        } : undefined,
        fundingHistory: Array.isArray(parsed.fundingHistory) ? parsed.fundingHistory.map((f: Record<string, unknown>) => ({
          round: String(f.round || 'other'),
          amount: f.amount as string | null || null,
          date: f.date as string | null || null,
          investors: Array.isArray(f.investors) ? f.investors : [],
        })) : [],
        audit: parsed.audit ? {
          hasAudit: Boolean(parsed.audit.hasAudit),
          auditor: parsed.audit.auditor || null,
          auditDate: parsed.audit.auditDate || null,
          auditUrl: parsed.audit.auditUrl || null,
        } : undefined,
        techStack: parsed.techStack ? {
          blockchain: parsed.techStack.blockchain || null,
          smartContractLanguage: parsed.techStack.smartContractLanguage || null,
          keyTechnologies: Array.isArray(parsed.techStack.keyTechnologies) ? parsed.techStack.keyTechnologies : [],
        } : undefined,
        affiliations: Array.isArray(parsed.affiliations) ? parsed.affiliations.map((a: Record<string, unknown>) => ({
          name: String(a.name || ''),
          type: String(a.type || 'other'),
          details: a.details as string | undefined,
        })) : [],
        recentNews: Array.isArray(parsed.recentNews) ? parsed.recentNews.map((n: Record<string, unknown>) => ({
          date: n.date as string | null || null,
          headline: String(n.headline || ''),
          source: String(n.source || ''),
          url: n.url as string | null || null,
        })) : [],
        controversies: Array.isArray(parsed.controversies) ? parsed.controversies : [],
        keyFindings: Array.isArray(parsed.keyFindings) ? parsed.keyFindings : [],
        theStory: parsed.theStory || null,
        citations,
        tokensUsed,
        confidence: this.normalizeConfidence(parsed.confidence),
      };
    } catch (e) {
      console.warn('[Perplexity] JSON parse failed:', e);
      return {
        citations,
        tokensUsed,
        confidence: 'low',
        keyFindings: ['Failed to parse Perplexity research response'],
      };
    }
  }

  private parseControversyResponse(
    text: string,
    citations: Array<{ url: string; title?: string }>
  ): PerplexityControversyResult {
    const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/) || text.match(/(\{[\s\S]*\})/);

    if (!jsonMatch) {
      console.warn('[Perplexity] Failed to parse JSON from controversy response');
      return {
        hasControversies: false,
        allegations: [],
        citations,
        confidence: 'low',
      };
    }

    try {
      const parsed = JSON.parse(jsonMatch[1].trim());

      return {
        hasControversies: Boolean(parsed.hasControversies),
        allegations: Array.isArray(parsed.allegations) ? parsed.allegations.map((a: Record<string, unknown>) => ({
          type: this.normalizeAllegationType(a.type as string),
          summary: String(a.summary || ''),
          date: a.date as string | null || null,
          source: String(a.source || ''),
          url: a.url as string | null || null,
        })) : [],
        citations,
        confidence: this.normalizeConfidence(parsed.confidence),
      };
    } catch {
      console.warn('[Perplexity] Controversy JSON parse failed');
      return {
        hasControversies: false,
        allegations: [],
        citations,
        confidence: 'low',
      };
    }
  }

  private normalizeConfidence(conf: unknown): 'low' | 'medium' | 'high' {
    const normalized = String(conf || '').toLowerCase();
    if (normalized === 'high') return 'high';
    if (normalized === 'medium') return 'medium';
    return 'low';
  }

  private normalizeAllegationType(
    type: string | undefined
  ): 'scam' | 'rug' | 'fraud' | 'lawsuit' | 'warning' | 'hack' {
    const normalized = String(type || '').toLowerCase();
    if (normalized === 'scam') return 'scam';
    if (normalized === 'rug') return 'rug';
    if (normalized === 'fraud') return 'fraud';
    if (normalized === 'lawsuit') return 'lawsuit';
    if (normalized === 'hack') return 'hack';
    return 'warning';
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

let perplexityClientInstance: PerplexityClient | null = null;

/**
 * Get the singleton Perplexity client instance
 */
export function getPerplexityClient(): PerplexityClient {
  if (!perplexityClientInstance) {
    perplexityClientInstance = new PerplexityClient();
  }
  return perplexityClientInstance;
}

/**
 * Check if Perplexity API is available (credentials configured)
 */
export function isPerplexityAvailable(): boolean {
  return !!PERPLEXITY_API_KEY;
}
