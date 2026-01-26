// Grok Client
// xAI Grok API client using the Responses API with Agent Tools for live X search

import {
  GrokAnalysisResult,
  GrokProfileInput,
  GrokResponsesApiResponse,
  GrokTextOutput,
} from './types';
import { ANALYSIS_PROMPT } from './prompts';

// ============================================================================
// CONFIGURATION
// ============================================================================

const XAI_API_KEY = process.env.XAI_API_KEY;
const XAI_BASE_URL = 'https://api.x.ai/v1';
const DEFAULT_MODEL = 'grok-4-1-fast';

// ============================================================================
// ERROR TYPES
// ============================================================================

export class GrokApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public rawError?: unknown
  ) {
    super(message);
    this.name = 'GrokApiError';
  }
}

export class GrokParseError extends Error {
  constructor(
    message: string,
    public rawResponse: string
  ) {
    super(message);
    this.name = 'GrokParseError';
  }
}

// ============================================================================
// CLIENT CLASS
// ============================================================================

export class GrokClient {
  private model: string;

  constructor(model: string = DEFAULT_MODEL) {
    this.model = model;
  }

  /**
   * Check if the client is configured with valid credentials
   */
  isConfigured(): boolean {
    return !!XAI_API_KEY;
  }

  /**
   * Analyze an X profile using Grok's live search capabilities
   * This uses the Responses API with x_search and web_search tools
   */
  async analyzeProfile(handle: string): Promise<GrokAnalysisResult> {
    if (!XAI_API_KEY) {
      throw new GrokApiError('Grok API client not configured. Set XAI_API_KEY environment variable.');
    }

    const normalizedHandle = handle.toLowerCase().replace('@', '');
    const prompt = ANALYSIS_PROMPT.replace('{handle}', normalizedHandle);

    try {
      const response = await fetch(`${XAI_BASE_URL}/responses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${XAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: this.model,
          input: [
            {
              role: 'user',
              content: prompt,
            },
          ],
          tools: [
            { type: 'x_search' },
            { type: 'web_search' },
          ],
          temperature: 0.3,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new GrokApiError(
          errorData.error || `API request failed with status ${response.status}`,
          response.status,
          errorData
        );
      }

      const data: GrokResponsesApiResponse = await response.json();

      if (data.error) {
        throw new GrokApiError(data.error, undefined, data);
      }

      // Extract text content from output
      const textOutput = data.output?.find(
        (o): o is GrokTextOutput => o.type === 'message' && o.role === 'assistant'
      );

      if (!textOutput?.content?.[0]?.text) {
        throw new GrokApiError('No text response from Grok API');
      }

      const analysisText = textOutput.content[0].text;
      const citations = textOutput.content[0].annotations?.filter(a => a.type === 'url_citation') || [];

      return this.parseAnalysisResponse(analysisText, citations, data.usage);
    } catch (error) {
      if (error instanceof GrokApiError || error instanceof GrokParseError) {
        throw error;
      }
      throw new GrokApiError(
        error instanceof Error ? error.message : 'Unknown error during analysis',
        undefined,
        error
      );
    }
  }

  /**
   * Quick research query - returns raw text response
   */
  async research(query: string): Promise<{ text: string; citations: Array<{ url: string; title?: string }> }> {
    if (!XAI_API_KEY) {
      throw new GrokApiError('Grok API client not configured. Set XAI_API_KEY environment variable.');
    }

    try {
      const response = await fetch(`${XAI_BASE_URL}/responses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${XAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: this.model,
          input: [
            {
              role: 'user',
              content: query,
            },
          ],
          tools: [
            { type: 'x_search' },
            { type: 'web_search' },
          ],
          temperature: 0.3,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new GrokApiError(
          errorData.error || `API request failed with status ${response.status}`,
          response.status,
          errorData
        );
      }

      const data: GrokResponsesApiResponse = await response.json();

      const textOutput = data.output?.find(
        (o): o is GrokTextOutput => o.type === 'message' && o.role === 'assistant'
      );

      if (!textOutput?.content?.[0]?.text) {
        throw new GrokApiError('No text response from Grok API');
      }

      const citations = textOutput.content[0].annotations
        ?.filter(a => a.type === 'url_citation')
        .map(a => ({ url: a.url, title: a.title })) || [];

      return {
        text: textOutput.content[0].text,
        citations,
      };
    } catch (error) {
      if (error instanceof GrokApiError) {
        throw error;
      }
      throw new GrokApiError(
        error instanceof Error ? error.message : 'Unknown error during research',
        undefined,
        error
      );
    }
  }

  // ============================================================================
  // PRIVATE METHODS
  // ============================================================================

  private parseAnalysisResponse(
    text: string,
    citations: Array<{ url: string; title?: string }>,
    usage?: GrokResponsesApiResponse['usage']
  ): GrokAnalysisResult {
    // Extract structured data from the response text
    // The prompt asks for specific sections that we can parse

    const result: GrokAnalysisResult = {
      handle: '',
      profile: {
        handle: '',
        displayName: undefined,
        bio: undefined,
        verified: false,
        followers: undefined,
        following: undefined,
        createdAt: undefined,
        xUrl: undefined,
      },
      github: undefined,
      website: undefined,
      accountAge: undefined,
      activityLevel: undefined,
      team: [],
      funding: undefined,
      controversies: [],
      rebrand: undefined,
      influencers: [],
      contract: undefined,
      keyFindings: [],
      riskLevel: 'medium',
      confidence: 'medium',
      rawAnalysis: text,
      citations: citations.map(c => ({ url: c.url, title: c.title })),
      tokensUsed: usage?.total_tokens,
      searchesPerformed: usage?.server_side_tool_usage_details?.x_search_calls ?? 0,
    };

    // Parse handle from text
    const handleMatch = text.match(/@(\w+)/);
    if (handleMatch) {
      result.handle = handleMatch[1];
      result.profile.handle = handleMatch[1];
    }

    // Parse X URL
    const xUrlMatch = text.match(/https:\/\/x\.com\/(\w+)/);
    if (xUrlMatch) {
      result.profile.xUrl = xUrlMatch[0];
      if (!result.handle) {
        result.handle = xUrlMatch[1];
        result.profile.handle = xUrlMatch[1];
      }
    }

    // Parse GitHub
    const githubMatch = text.match(/github\.com\/([^\s\]]+)/i);
    if (githubMatch) {
      result.github = `https://github.com/${githubMatch[1]}`;
    }

    // Parse website
    const websiteMatches = text.match(/(?:website|site|official):\s*\[?([^\s\]]+\.(?:org|io|com|xyz|finance|network)[^\s\]]*)/i);
    if (websiteMatches) {
      result.website = websiteMatches[1].replace(/[[\]()]/g, '');
    }

    // Parse followers count
    const followersMatch = text.match(/(\d+(?:,\d+)*(?:\.\d+)?)\s*[kK]?\s*followers/i);
    if (followersMatch) {
      let count = parseFloat(followersMatch[1].replace(/,/g, ''));
      if (followersMatch[0].toLowerCase().includes('k')) {
        count *= 1000;
      }
      result.profile.followers = Math.round(count);
    }

    // Parse account creation
    const createdMatch = text.match(/[Cc]reated[:\s]+(?:around\s+)?(\w+\s+\d{4}|\d{4})/);
    if (createdMatch) {
      result.accountAge = createdMatch[1];
    }

    // Parse activity level
    if (text.toLowerCase().includes('highly active') || text.toLowerCase().includes('very active')) {
      result.activityLevel = 'high';
    } else if (text.toLowerCase().includes('moderately active') || text.toLowerCase().includes('active')) {
      result.activityLevel = 'medium';
    } else if (text.toLowerCase().includes('inactive') || text.toLowerCase().includes('low activity')) {
      result.activityLevel = 'low';
    }

    // Parse contract address (Solana format)
    const contractMatch = text.match(/\b([1-9A-HJ-NP-Za-km-z]{32,44})\b/);
    if (contractMatch && contractMatch[1].length >= 32) {
      result.contract = {
        address: contractMatch[1],
        chain: 'solana',
        isFork: text.toLowerCase().includes('fork'),
      };
    }

    // Parse rebrand info
    if (text.toLowerCase().includes('rebrand')) {
      const rebrandMatch = text.match(/rebrand(?:ed)?\s+from\s+(\w+|\$\w+|@\w+)/i);
      result.rebrand = {
        isRebrand: true,
        previousName: rebrandMatch?.[1],
      };
    }

    // Parse controversies
    if (text.toLowerCase().includes('scam') || text.toLowerCase().includes('rug') || text.toLowerCase().includes('controversy')) {
      const hasRealControversy = !text.toLowerCase().includes('no rug') &&
        !text.toLowerCase().includes('no scam') &&
        !text.toLowerCase().includes('no controversy');
      if (hasRealControversy) {
        result.controversies.push('Potential concerns detected - see raw analysis');
      }
    }

    // Determine risk level based on findings
    const redFlags = [
      text.toLowerCase().includes('scam'),
      text.toLowerCase().includes('rug'),
      text.toLowerCase().includes('anonymous') && !text.toLowerCase().includes('not anonymous'),
      text.toLowerCase().includes('no audit'),
      result.accountAge?.includes('2025') || result.accountAge?.includes('2026'),
    ].filter(Boolean).length;

    if (redFlags >= 3) {
      result.riskLevel = 'high';
    } else if (redFlags >= 1) {
      result.riskLevel = 'medium';
    } else {
      result.riskLevel = 'low';
    }

    // Extract key findings (numbered items)
    const findings = text.match(/\d+\.\s+\*\*[^*]+\*\*[^0-9]*/g);
    if (findings) {
      result.keyFindings = findings.slice(0, 10).map(f => f.trim());
    }

    return result;
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

let grokClientInstance: GrokClient | null = null;

/**
 * Get the singleton Grok client instance
 */
export function getGrokClient(): GrokClient {
  if (!grokClientInstance) {
    grokClientInstance = new GrokClient();
  }
  return grokClientInstance;
}

/**
 * Check if Grok API is available (credentials configured)
 */
export function isGrokAvailable(): boolean {
  return !!XAI_API_KEY;
}
