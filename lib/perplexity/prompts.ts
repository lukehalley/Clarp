// Perplexity Sonar Prompts
// Prompts for grounded web research with citations
// Key principle: "Only state facts you can cite. Use null for unknowns. Do NOT guess."

import type { OsintContext } from '../grok/prompts';

// ============================================================================
// PROJECT RESEARCH PROMPT
// ============================================================================

/**
 * Structured project research prompt.
 * Perplexity Sonar will search the web and return cited facts.
 * OSINT context is injected so Perplexity focuses on gaps, not re-discovery.
 */
export function buildResearchPrompt(
  query: string,
  osintContext?: OsintContext
): string {
  let contextBlock = '';

  if (osintContext?.found) {
    const f = osintContext.found;
    const lines: string[] = ['## ALREADY KNOWN (do not re-research):'];
    if (f.website) lines.push(`- Website: ${f.website}`);
    if (f.github) lines.push(`- GitHub: ${f.github}`);
    if (f.telegram) lines.push(`- Telegram: ${f.telegram}`);
    if (f.discord) lines.push(`- Discord: ${f.discord}`);
    if (f.tokenAddress) lines.push(`- Token: ${f.tokenSymbol || 'Unknown'} (${f.tokenAddress})`);
    if (f.holders) lines.push(`- Holders: ${f.holders.toLocaleString()}`);
    if (f.marketCap) lines.push(`- Market Cap: $${f.marketCap.toLocaleString()}`);
    if (f.domainAgeDays) lines.push(`- Domain Age: ${f.domainAgeDays} days`);
    if (f.teamMembers && f.teamMembers.length > 0) {
      lines.push(`- Known Team: ${f.teamMembers.map(m => m.name || m.github || 'Unknown').join(', ')}`);
    }
    contextBlock = lines.join('\n') + '\n\nFocus on information NOT listed above.\n\n';
  }

  return `Research the cryptocurrency/blockchain project "${query}" and return structured factual data.

${contextBlock}## INSTRUCTIONS
- Search for: "${query}" crypto project, team, funding, audit, controversies
- CRITICAL — Search for identifiers on these specific sites:
  - "${query}" site:dexscreener.com OR site:coingecko.com OR site:coinmarketcap.com (to find token address, chain, ticker)
  - "${query}" site:github.com (to find GitHub org/repo URL)
  - "${query}" official website (look in X bio, CoinGecko info, project docs)
- The "identifiers" field is HIGH PRIORITY — search hard for token contract address, website URL, and GitHub URL
- ONLY report facts you can cite with source URLs
- If you cannot find information for a field, use null — do NOT guess or infer
- Distinguish between verified facts and unverified claims
- Include recent news (last 6 months if available)
- For team members: search for founders, developers, core team. Check X bios, LinkedIn, blog posts, GitHub profiles

## REQUIRED JSON OUTPUT
Return ONLY a valid JSON object:
{
  "projectName": "Official project name",
  "description": "What the project does (1-2 sentences)",
  "identifiers": {
    "tokenAddress": "Solana/EVM contract address from DexScreener, CoinGecko, or project site — or null",
    "website": "Official website URL or null",
    "githubUrl": "GitHub org or repo URL or null",
    "ticker": "$SYMBOL or null",
    "chain": "solana|ethereum|base|null"
  },
  "foundingDate": "YYYY-MM-DD or null",
  "teamMembers": [
    {
      "name": "Display/real name",
      "role": "founder|cto|developer|advisor|community",
      "previousEmployers": ["Company1"],
      "linkedIn": "linkedin.com/in/... or null",
      "isDoxxed": true,
      "xHandle": "handle_without_at or null"
    }
  ],
  "legalEntity": {
    "companyName": "Registered company name or null",
    "jurisdiction": "Country/state or null",
    "isRegistered": false,
    "registrationDetails": "LLC, Inc, Foundation, etc. or null"
  },
  "fundingHistory": [
    {
      "round": "seed|series-a|public|grant",
      "amount": "$X or null",
      "date": "YYYY-MM-DD or null",
      "investors": ["Investor1"]
    }
  ],
  "audit": {
    "hasAudit": false,
    "auditor": "Auditing firm or null",
    "auditDate": "YYYY-MM-DD or null",
    "auditUrl": "URL to audit report or null"
  },
  "techStack": {
    "blockchain": "solana|ethereum|multi-chain|null",
    "smartContractLanguage": "Rust|Solidity|null",
    "keyTechnologies": ["Tech1"]
  },
  "affiliations": [
    {
      "name": "Organization name",
      "type": "council|accelerator|vc|exchange|partnership",
      "details": "Nature of relationship"
    }
  ],
  "recentNews": [
    {
      "date": "YYYY-MM-DD",
      "headline": "News headline",
      "source": "Source name",
      "url": "Article URL"
    }
  ],
  "controversies": ["Specific controversy with context"],
  "keyFindings": ["Most important finding 1", "Finding 2"],
  "theStory": "2-3 sentence narrative summary of the project",
  "confidence": "low|medium|high"
}

CRITICAL RULES:
- Return ONLY valid JSON
- Use null for any field you cannot verify
- Do NOT fabricate team members, funding rounds, or audit details
- Every claim should be backed by your search results
- If the project is unknown/tiny with no web presence, say so in keyFindings`;
}

// ============================================================================
// CONTROVERSY RESEARCH PROMPT
// ============================================================================

/**
 * Focused controversy/scam research prompt.
 * Searches specifically for negative signals about an entity.
 */
export function buildControversyPrompt(query: string): string {
  return `Search for scam allegations, rug pulls, fraud, lawsuits, and community warnings about "${query}" in the cryptocurrency/blockchain space.

## SEARCH QUERIES TO RUN:
- "${query}" scam
- "${query}" rug pull
- "${query}" fraud lawsuit
- "${query}" warning crypto
- "${query}" hack exploit

## REQUIRED JSON OUTPUT
Return ONLY a valid JSON object:
{
  "hasControversies": false,
  "allegations": [
    {
      "type": "scam|rug|fraud|lawsuit|warning|hack",
      "summary": "What happened (1-2 sentences)",
      "date": "YYYY-MM-DD or null",
      "source": "Source name (e.g., 'CoinDesk', 'Rekt News', 'Twitter community')",
      "url": "Source URL or null"
    }
  ],
  "confidence": "low|medium|high"
}

CRITICAL RULES:
- ONLY include allegations you can cite with sources
- Do NOT fabricate allegations — false accusations are harmful
- If no controversies found, return hasControversies: false with empty allegations array
- Distinguish between verified incidents and unverified community rumors
- Include the source for every allegation`;
}
