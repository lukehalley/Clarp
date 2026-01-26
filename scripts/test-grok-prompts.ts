/**
 * Grok Prompt Engineering Test Script
 * Tests different prompts to find the best approach for comprehensive X profile analysis
 *
 * Run with: npx tsx scripts/test-grok-prompts.ts <handle>
 */

import { config } from 'dotenv';
config({ path: '.env.local' });

const XAI_API_KEY = process.env.XAI_API_KEY;
const XAI_BASE_URL = 'https://api.x.ai/v1';

interface TestResult {
  promptName: string;
  tokensUsed: number;
  searchCalls: number;
  responseLength: number;
  hasEvidence: boolean;
  evidenceCount: number;
  hasTimeline: boolean;
  keyFindingsCount: number;
  postsAnalyzedClaim: number;
  rawResponse: string;
}

const PROMPTS: Record<string, string> = {
  // PROMPT 1: Original (baseline)
  original: `You are a crypto project researcher. Use your X search and web search capabilities to thoroughly research the X/Twitter account @{handle}.

IMPORTANT: Search for and analyze at LEAST 20-30 recent posts from this account. Look through their timeline comprehensively.

Research this account and respond with a JSON object. Be fair and objective - not everyone in crypto is a scammer. Look for BOTH positive and negative indicators.

Respond with this exact JSON structure:
{
  "handle": "the_handle",
  "postsAnalyzed": 25,
  "profile": { "displayName": "", "bio": "", "verified": false, "followers": 0, "createdAt": "" },
  "positiveIndicators": { "isDoxxed": false, "hasActiveGithub": false, "hasRealProduct": false, "accountAgeDays": 0 },
  "negativeIndicators": { "hasScamAllegations": false, "hasRugHistory": false, "hasHypeLanguage": false },
  "keyFindings": ["finding 1", "finding 2"],
  "evidence": [{ "tweetExcerpt": "actual tweet text", "tweetUrl": "url", "label": "neutral", "relevance": "why relevant" }],
  "riskLevel": "low/medium/high",
  "confidence": "low/medium/high"
}

Return ONLY valid JSON.`,

  // PROMPT 2: Chronological deep dive
  chronological: `You are an investigative researcher analyzing the X/Twitter account @{handle}. Your goal is to build a comprehensive timeline of this person's online presence and activity patterns.

RESEARCH INSTRUCTIONS:
1. Search for this account's posts going back as far as possible (ideally 6-12 months)
2. Search for mentions OF this account by others (what do people say about them?)
3. Search for any controversies, callouts, or drama involving this account
4. Search for any projects, tokens, or ventures they've promoted
5. Search for their interactions with known figures in crypto

Provide a DETAILED chronological analysis:

{
  "handle": "the_handle",
  "accountOverview": {
    "displayName": "",
    "bio": "",
    "verified": false,
    "followers": 0,
    "following": 0,
    "accountCreated": "YYYY-MM-DD",
    "accountAgeDays": 0,
    "estimatedPostsAnalyzed": 50
  },
  "timeline": [
    {
      "period": "Month Year",
      "summary": "What they were doing/promoting during this period",
      "notableEvents": ["event 1", "event 2"],
      "promotedProjects": ["project names"],
      "sentimentFromOthers": "positive/negative/mixed/neutral"
    }
  ],
  "promotionHistory": [
    {
      "projectName": "",
      "ticker": "$XXX or null",
      "firstMention": "YYYY-MM-DD",
      "lastMention": "YYYY-MM-DD",
      "outcome": "unknown/success/failed/rugged",
      "evidenceUrls": ["urls"]
    }
  ],
  "reputationAnalysis": {
    "positiveSignals": ["signal 1"],
    "negativeSignals": ["signal 1"],
    "controversies": [{ "date": "", "summary": "", "sources": ["urls"] }],
    "communityPerception": "description of how others view this person"
  },
  "evidence": [
    {
      "date": "YYYY-MM-DD",
      "tweetExcerpt": "actual tweet text (280 chars max)",
      "tweetUrl": "https://x.com/...",
      "category": "promotion|controversy|claim|interaction|milestone",
      "significance": "why this matters"
    }
  ],
  "assessment": {
    "trustworthiness": 1-10,
    "consistency": 1-10,
    "transparency": 1-10,
    "overallRisk": "low/medium/high",
    "confidence": "low/medium/high",
    "summary": "2-3 sentence overall assessment"
  }
}

Be thorough. Search multiple times if needed. I want to understand WHO this person has been over the past year, not just who they are today.

Return ONLY valid JSON.`,

  // PROMPT 3: Multi-search comprehensive
  multiSearch: `You are a due diligence analyst. Perform COMPREHENSIVE research on the X account @{handle}.

REQUIRED SEARCHES (perform ALL of these):
1. "from:@{handle}" - Get their recent posts (at least 30-50)
2. "@{handle} scam" - Check for scam allegations
3. "@{handle} rug" - Check for rug accusations
4. "@{handle}" - General mentions and sentiment
5. Search for any tokens/projects they promote
6. Search for their real identity if mentioned anywhere

For EACH search you perform, include the findings in your response.

{
  "handle": "the_handle",
  "searchesPerformed": [
    { "query": "search query used", "resultsSummary": "what you found", "relevantTweets": 5 }
  ],
  "profile": {
    "displayName": "",
    "bio": "",
    "verified": false,
    "followers": 0,
    "accountAge": "X years/months",
    "postingFrequency": "X posts per day/week"
  },
  "identity": {
    "isDoxxed": false,
    "realName": "if known, else null",
    "linkedAccounts": ["github, linkedin, etc"],
    "location": "if known",
    "profession": "if known"
  },
  "activityAnalysis": {
    "mainTopics": ["topic 1", "topic 2"],
    "promotedTokens": [{ "name": "", "ticker": "", "mentions": 5, "firstSeen": "", "outcome": "" }],
    "engagementStyle": "description of how they interact",
    "redFlags": ["flag 1"],
    "greenFlags": ["flag 1"]
  },
  "externalPerception": {
    "positiveTestimonials": [{ "from": "@handle", "excerpt": "", "url": "" }],
    "negativeTestimonials": [{ "from": "@handle", "excerpt": "", "url": "" }],
    "controversies": [{ "date": "", "summary": "", "severity": "low/medium/high" }]
  },
  "evidence": [
    { "excerpt": "tweet text", "url": "", "date": "", "label": "shill|positive|negative|neutral", "context": "" }
  ],
  "verdict": {
    "riskLevel": "low/medium/high",
    "confidence": "low/medium/high",
    "recommendation": "1-2 sentence recommendation",
    "keyReasons": ["reason 1", "reason 2"]
  }
}

Return ONLY valid JSON.`,

  // PROMPT 4: Behavioral analysis focus
  behavioral: `Analyze the X account @{handle} with focus on BEHAVIORAL PATTERNS over time.

Search extensively for:
- Their posting history (go back 6+ months if possible)
- How their messaging has changed over time
- Projects they promoted and what happened to them
- How they respond to criticism
- Their network (who do they interact with most?)

{
  "handle": "",
  "dataCollection": {
    "postsAnalyzed": 0,
    "timeframeStart": "earliest post found",
    "timeframeEnd": "most recent post",
    "mentionsAnalyzed": 0
  },
  "behaviorProfile": {
    "postingPatterns": {
      "frequency": "X per day/week",
      "peakActivity": "time of day/week",
      "contentMix": { "original": 0, "replies": 0, "retweets": 0, "quotes": 0 }
    },
    "communicationStyle": {
      "tone": "professional/casual/aggressive/hype-driven",
      "useOfUrgency": false,
      "useOfFOMO": false,
      "engagementWithCritics": "ignores/blocks/argues/addresses",
      "examples": ["example tweet excerpts showing their style"]
    },
    "consistencyAnalysis": {
      "narrativeShifts": [{ "date": "", "from": "", "to": "", "possible_reason": "" }],
      "deletedContentEvidence": "any signs of deleted posts?",
      "contradictions": [{ "claim1": "", "claim2": "", "dates": "" }]
    }
  },
  "promotionTrack": [
    {
      "project": "",
      "role": "founder/advisor/paid_promoter/organic_supporter",
      "promotionPeriod": "start - end",
      "claimsMade": ["claim 1"],
      "outcome": "success/failure/unknown/rugged",
      "followUpBehavior": "did they address failure? delete posts?"
    }
  ],
  "networkAnalysis": {
    "frequentInteractions": ["@handle1", "@handle2"],
    "knownAssociations": [{ "handle": "", "relationship": "", "reputation": "" }],
    "suspiciousPatterns": ["coordinated activity signs?"]
  },
  "trustSignals": {
    "positive": [{ "signal": "", "evidence": "", "weight": "strong/moderate/weak" }],
    "negative": [{ "signal": "", "evidence": "", "weight": "strong/moderate/weak" }]
  },
  "evidence": [
    { "date": "", "tweet": "", "url": "", "category": "", "notes": "" }
  ],
  "assessment": {
    "overallRisk": "low/medium/high",
    "confidence": "low/medium/high",
    "characterSummary": "Who is this person based on their behavior?",
    "watchFor": ["things to monitor going forward"]
  }
}

Return ONLY valid JSON.`,

  // PROMPT 6: Hybrid optimized (combines best of all approaches)
  hybrid: `You are an investigative crypto researcher. Perform EXHAUSTIVE research on @{handle}.

REQUIRED RESEARCH (do ALL of these searches):
1. Search "from:@{handle}" - Get 50+ posts going back 6-12 months
2. Search "@{handle} scam OR rug OR fraud" - Check for allegations
3. Search "@{handle}" - What do others say about them?
4. Search for any tokens/projects they've promoted with outcomes

BUILD A COMPLETE PROFILE:

{
  "handle": "",
  "research": {
    "postsAnalyzed": 50,
    "mentionsAnalyzed": 20,
    "timeframeCovered": "earliest - latest",
    "searchesPerformed": ["query1", "query2"]
  },
  "profile": {
    "displayName": "",
    "bio": "",
    "verified": false,
    "followers": 0,
    "accountCreated": "YYYY-MM-DD",
    "accountAgeDays": 0
  },
  "theStory": "Write 3-4 detailed paragraphs telling who this person is, their evolution over time, key events, controversies, and reputation. Include specific dates and cite tweets.",
  "timeline": [
    {
      "period": "Month YYYY",
      "activity": "What they were doing",
      "promotedProjects": ["$TOKEN"],
      "notableEvents": ["event"],
      "sentiment": "how others perceived them"
    }
  ],
  "promotionHistory": [
    {
      "project": "",
      "ticker": "$XXX",
      "role": "founder/advisor/paid/organic",
      "period": "start - end",
      "claims": ["what they claimed"],
      "outcome": "success/failed/rugged/unknown",
      "evidence": ["tweet urls"]
    }
  ],
  "communicationStyle": {
    "tone": "professional/casual/aggressive/hype",
    "useOfUrgency": false,
    "useOfFOMO": false,
    "profanity": false,
    "examples": ["actual tweet excerpts showing their style - include controversial ones"]
  },
  "reputation": {
    "supporters": [{ "who": "@handle", "what": "what they said", "url": "" }],
    "critics": [{ "who": "@handle", "accusation": "what they alleged", "url": "" }],
    "controversies": [{ "date": "", "summary": "", "resolution": "" }]
  },
  "trustSignals": {
    "positive": [{ "signal": "", "evidence": "", "weight": "strong/moderate/weak" }],
    "negative": [{ "signal": "", "evidence": "", "weight": "strong/moderate/weak" }]
  },
  "evidence": [
    {
      "date": "YYYY-MM-DD",
      "content": "actual tweet text (280 chars)",
      "url": "https://x.com/...",
      "type": "promotion|controversy|claim|scam_warning|milestone",
      "importance": "high/medium/low",
      "notes": "why this matters"
    }
  ],
  "verdict": {
    "trustLevel": 1-10,
    "riskLevel": "low/medium/high",
    "confidence": "low/medium/high",
    "summary": "2-3 sentence verdict",
    "watchFor": ["things to monitor"]
  }
}

CRITICAL: Include 10+ evidence items with actual tweet content. Search multiple times. I need to understand who this person has BEEN over the past year.

Return ONLY valid JSON.`,

  // PROMPT 5: Narrative-driven (let Grok be more free-form)
  narrative: `Research the X account @{handle} and tell me their story.

I need you to:
1. Search their timeline extensively (6-12 months of history)
2. Search what others say about them
3. Search for any controversies or callouts
4. Track any projects/tokens they've been involved with

Then provide:

{
  "handle": "",
  "researchSummary": {
    "postsReviewed": 0,
    "mentionsFound": 0,
    "timeframeCovered": ""
  },
  "theStory": "Write 3-5 paragraphs telling me who this person is, what they've done, how they've evolved, and what their reputation is. Include specific dates and events. Be detailed and cite specific tweets.",
  "keyMoments": [
    { "date": "", "event": "", "significance": "", "tweetUrl": "" }
  ],
  "promotionHistory": [
    { "project": "", "period": "", "outcome": "", "details": "" }
  ],
  "publicPerception": {
    "supporters": "Who supports them and why?",
    "critics": "Who criticizes them and why?",
    "controversies": [{ "date": "", "summary": "", "resolution": "" }]
  },
  "evidenceArchive": [
    { "date": "", "content": "", "url": "", "type": "", "importance": "high/medium/low" }
  ],
  "bottomLine": {
    "trustLevel": "trustworthy/neutral/suspicious/avoid",
    "riskLevel": "low/medium/high",
    "confidence": "low/medium/high",
    "oneSentence": "One sentence summary of who this person is"
  }
}

Return ONLY valid JSON.`
};

async function testPrompt(promptName: string, prompt: string, handle: string): Promise<TestResult> {
  const finalPrompt = prompt.replace(/{handle}/g, handle);

  console.log(`\n${'='.repeat(60)}`);
  console.log(`Testing prompt: ${promptName}`);
  console.log(`${'='.repeat(60)}`);

  const startTime = Date.now();

  try {
    const response = await fetch(`${XAI_BASE_URL}/responses`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${XAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'grok-4-1-fast',
        input: [{ role: 'user', content: finalPrompt }],
        tools: [
          { type: 'x_search' },
          { type: 'web_search' },
        ],
        temperature: 0.3,
      }),
    });

    const data = await response.json();
    const elapsed = Date.now() - startTime;

    if (data.error) {
      console.error(`Error: ${data.error}`);
      return {
        promptName,
        tokensUsed: 0,
        searchCalls: 0,
        responseLength: 0,
        hasEvidence: false,
        evidenceCount: 0,
        hasTimeline: false,
        keyFindingsCount: 0,
        postsAnalyzedClaim: 0,
        rawResponse: JSON.stringify(data),
      };
    }

    const textOutput = data.output?.find((o: any) => o.type === 'message' && o.role === 'assistant');
    const rawText = textOutput?.content?.[0]?.text || '';

    // Try to parse the JSON
    let parsed: any = null;
    const jsonMatch = rawText.match(/```(?:json)?\s*([\s\S]*?)```/) || rawText.match(/(\{[\s\S]*\})/);
    if (jsonMatch) {
      try {
        parsed = JSON.parse(jsonMatch[1]);
      } catch (e) {
        console.log('Failed to parse JSON');
      }
    }

    const result: TestResult = {
      promptName,
      tokensUsed: data.usage?.total_tokens || 0,
      searchCalls: data.usage?.server_side_tool_usage_details?.x_search_calls || 0,
      responseLength: rawText.length,
      hasEvidence: !!(parsed?.evidence?.length > 0 || parsed?.evidenceArchive?.length > 0),
      evidenceCount: parsed?.evidence?.length || parsed?.evidenceArchive?.length || 0,
      hasTimeline: !!(parsed?.timeline?.length > 0 || parsed?.keyMoments?.length > 0),
      keyFindingsCount: parsed?.keyFindings?.length || parsed?.keyMoments?.length || 0,
      postsAnalyzedClaim: parsed?.postsAnalyzed || parsed?.dataCollection?.postsAnalyzed || parsed?.researchSummary?.postsReviewed || 0,
      rawResponse: rawText,
    };

    console.log(`Time: ${elapsed}ms`);
    console.log(`Tokens: ${result.tokensUsed}`);
    console.log(`X Searches: ${result.searchCalls}`);
    console.log(`Response length: ${result.responseLength} chars`);
    console.log(`Has evidence: ${result.hasEvidence} (${result.evidenceCount} items)`);
    console.log(`Has timeline: ${result.hasTimeline}`);
    console.log(`Posts analyzed claim: ${result.postsAnalyzedClaim}`);

    // Save raw response
    const fs = await import('fs');
    const outputDir = './scripts/prompt-tests';
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    fs.writeFileSync(`${outputDir}/${promptName}-${handle}.json`, rawText);
    console.log(`Saved to ${outputDir}/${promptName}-${handle}.json`);

    return result;
  } catch (error) {
    console.error(`Error testing ${promptName}:`, error);
    return {
      promptName,
      tokensUsed: 0,
      searchCalls: 0,
      responseLength: 0,
      hasEvidence: false,
      evidenceCount: 0,
      hasTimeline: false,
      keyFindingsCount: 0,
      postsAnalyzedClaim: 0,
      rawResponse: String(error),
    };
  }
}

async function main() {
  const handle = process.argv[2];

  if (!handle) {
    console.error('Usage: npx tsx scripts/test-grok-prompts.ts <handle>');
    process.exit(1);
  }

  if (!XAI_API_KEY) {
    console.error('XAI_API_KEY not set');
    process.exit(1);
  }

  console.log(`\nTesting prompts for @${handle}`);
  console.log(`${'='.repeat(60)}\n`);

  const results: TestResult[] = [];

  // Test each prompt (with delay between to avoid rate limits)
  for (const [name, prompt] of Object.entries(PROMPTS)) {
    const result = await testPrompt(name, prompt, handle);
    results.push(result);

    // Wait between tests
    if (Object.keys(PROMPTS).indexOf(name) < Object.keys(PROMPTS).length - 1) {
      console.log('\nWaiting 5 seconds before next test...');
      await new Promise(r => setTimeout(r, 5000));
    }
  }

  // Summary
  console.log(`\n${'='.repeat(60)}`);
  console.log('SUMMARY');
  console.log(`${'='.repeat(60)}\n`);

  console.log('| Prompt | Tokens | Searches | Evidence | Timeline | Posts Claimed |');
  console.log('|--------|--------|----------|----------|----------|---------------|');

  for (const r of results) {
    console.log(`| ${r.promptName.padEnd(14)} | ${String(r.tokensUsed).padEnd(6)} | ${String(r.searchCalls).padEnd(8)} | ${String(r.evidenceCount).padEnd(8)} | ${r.hasTimeline ? 'Yes' : 'No'.padEnd(8)} | ${String(r.postsAnalyzedClaim).padEnd(13)} |`);
  }

  // Find best
  const byEvidence = [...results].sort((a, b) => b.evidenceCount - a.evidenceCount);
  const bySearches = [...results].sort((a, b) => b.searchCalls - a.searchCalls);

  console.log(`\nBest by evidence count: ${byEvidence[0].promptName} (${byEvidence[0].evidenceCount} items)`);
  console.log(`Best by search depth: ${bySearches[0].promptName} (${bySearches[0].searchCalls} searches)`);
}

main().catch(console.error);
