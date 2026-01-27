/**
 * Test a single Grok prompt
 * Run with: npx tsx scripts/test-single-prompt.ts <handle>
 */

import { config } from 'dotenv';
config({ path: '.env.local' });

const XAI_API_KEY = process.env.XAI_API_KEY;
const XAI_BASE_URL = 'https://api.x.ai/v1';

const HYBRID_PROMPT = `You are an investigative crypto researcher. Perform EXHAUSTIVE research on @{handle}.

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

Return ONLY valid JSON.`;

async function main() {
  const handle = process.argv[2];

  if (!handle) {
    console.error('Usage: npx tsx scripts/test-single-prompt.ts <handle>');
    process.exit(1);
  }

  if (!XAI_API_KEY) {
    console.error('XAI_API_KEY not set');
    process.exit(1);
  }

  console.log(`Testing hybrid prompt for @${handle}...\n`);

  const startTime = Date.now();
  const finalPrompt = HYBRID_PROMPT.replace(/{handle}/g, handle);

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
    process.exit(1);
  }

  const textOutput = data.output?.find((o: any) => o.type === 'message' && o.role === 'assistant');
  const rawText = textOutput?.content?.[0]?.text || '';

  console.log(`Time: ${elapsed}ms`);
  console.log(`Tokens: ${data.usage?.total_tokens || 0}`);
  console.log(`X Searches: ${data.usage?.server_side_tool_usage_details?.x_search_calls || 0}`);
  console.log(`Response length: ${rawText.length} chars\n`);

  // Try to parse and pretty print
  try {
    const jsonMatch = rawText.match(/```(?:json)?\s*([\s\S]*?)```/) || rawText.match(/(\{[\s\S]*\})/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[1]);
      console.log(JSON.stringify(parsed, null, 2));

      // Save to file
      const fs = await import('fs');
      fs.writeFileSync(`./scripts/prompt-tests/hybrid-${handle}.json`, JSON.stringify(parsed, null, 2));
      console.log(`\nSaved to ./scripts/prompt-tests/hybrid-${handle}.json`);
    }
  } catch (e) {
    console.log('Raw response:');
    console.log(rawText);
  }
}

main().catch(console.error);
