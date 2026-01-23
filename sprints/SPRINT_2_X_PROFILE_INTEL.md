# Sprint 2: X Profile Intel

**Status:** NOT STARTED
**Target Start:** 2026-01-23
**Audience:** Dev, PM, Design

---

## Overview

Add a new module in CLARP Terminal that scans any X (Twitter) account and generates an evidence-backed reputation report. The scanner analyzes tokens/projects promoted, backlash/controversies, behavioral signals, network patterns, and linked entities. Core principle: **proof-first** - every flag links to supporting evidence.

### Value Proposition

"Know the founder before you ape."

Helps users answer: "Should I trust this founder/KOL before investing?"

---

## Goals

1. **KISS UX**: One page answers the trust question with evidence
2. **Shill Detection**: Show top tokens/projects promoted with timing + examples
3. **Backlash Surface**: Controversy timeline with citations to original posts
4. **Behavior Assessment**: Vulgarity/toxicity/hype/aggression with examples
5. **Entity Extraction**: Domains, TG/Discord, GitHub, wallet strings, related handles
6. **Explainable Scoring**: Factor breakdown with evidence for each

## Non-Goals (MVP)

- No definitive labeling ("scammer") - use "signals/indicators/allegations"
- No doxxing or private-person identification
- No guarantee of token outcome or rug detection
- No price/onchain correlation (V2)

---

## Deliverables

### 1. Types (`types/xintel.ts`)

New type definitions for X Profile Intel:

- [ ] `XIntelProfile` - Profile metadata (handle, name, bio, verified, timestamps, languages)
- [ ] `XIntelReport` - Full report container
- [ ] `ShilledEntity` - Entity with mentions, promo count, timestamps, evidence
- [ ] `BacklashEvent` - Category, severity, date range, sources, evidence
- [ ] `BehaviorMetrics` - Toxicity, vulgarity, hype, aggression, consistency scores
- [ ] `NetworkMetrics` - Top interactions, mention list, engagement heuristics
- [ ] `LinkedEntity` - Type (domain/telegram/github/wallet/handle), value, confidence
- [ ] `ScoreFactor` - Factor name, points, description, evidence IDs
- [ ] `XIntelEvidence` - Tweet ID, timestamp, excerpt, label, URL
- [ ] `ReputationScore` - Overall score (0-100), risk level, factor breakdown
- [ ] `ScanJob` - Handle, depth, status, timestamps
- [ ] `ScanStatus` type union

### 2. Scoring Module (`lib/terminal/scoring/xintel.ts`)

Reputation scoring engine with explainable factors:

| Factor | Max Points | Description |
|--------|------------|-------------|
| Serial Shill | 25 | Many unrelated tokens promoted in short time |
| Backlash Density | 25 | Repeated callouts/accusations over time |
| Toxic/Vulgar | 15 | Profanity, targeted harassment |
| Hype Merchant | 15 | "100x", "guaranteed", "ape now" patterns |
| Consistency | 10 | Sudden narrative shifts, conflicting claims |
| Engagement Suspicion | 10 | Bot-like patterns, abnormal ratios |

- [ ] `calculateShillScore()` - Detect promotion patterns
- [ ] `calculateBacklashScore()` - Track callout density
- [ ] `calculateToxicityScore()` - NLP-based toxicity detection
- [ ] `calculateHypeScore()` - Hype keyword patterns
- [ ] `calculateConsistencyScore()` - Topic drift and contradictions
- [ ] `calculateEngagementScore()` - Bot-like behavior heuristics
- [ ] `calculateReputationScore()` - Combined scoring (100 - sum of points)
- [ ] Risk level mapping: Low (75-100), Medium (45-74), High (0-44)

### 3. Entity Extractor (`lib/terminal/xintel/entity-extractor.ts`)

Extract and classify entities from post content:

- [ ] `extractTickers()` - $TICKER patterns
- [ ] `extractProjectNames()` - Known project mentions
- [ ] `extractDomains()` - URLs and domain references
- [ ] `extractTelegramLinks()` - t.me links
- [ ] `extractDiscordLinks()` - discord.gg links
- [ ] `extractGitHubLinks()` - github.com links
- [ ] `extractWalletStrings()` - Solana/EVM address patterns
- [ ] `extractMentions()` - @handle references
- [ ] `classifyEntity()` - Confidence scoring

### 4. Behavior Analyzer (`lib/terminal/xintel/behavior-analyzer.ts`)

Analyze behavioral patterns from posts:

- [ ] `analyzeToxicity()` - Profanity list + harassment patterns
- [ ] `analyzeVulgarity()` - Content classification
- [ ] `analyzeHypeIntensity()` - Hype keyword frequency
- [ ] `analyzeAggression()` - Reply targets, insult patterns
- [ ] `analyzeConsistency()` - Topic drift detection
- [ ] `detectShillBursts()` - Rapid promotion patterns
- [ ] Keyword seed lists (configurable):
  - Backlash: scam, rug, fraud, exposed, warning, don't trust, liar, stole, drained
  - Hype: 100x, guaranteed, send it, ape, easy money, don't fade
  - Vulgarity: profanity list + harassment terms

### 5. API Routes (`app/api/xintel/`)

- [ ] `POST /api/xintel/scan` - Submit scan job
  - Input: `{ handle: string, depth?: number, force?: boolean }`
  - Returns: `{ jobId: string, status: ScanStatus }`

- [ ] `GET /api/xintel/report/[handle]` - Fetch cached report
  - Returns cached report if within TTL (6-24 hours configurable)
  - Returns 404 if no report exists

- [ ] `GET /api/xintel/report/[handle]/share` - Get shareable link payload

- [ ] `GET /api/xintel/report/[handle]/export` - Export report (optional MVP)
  - Query: `?format=json|pdf`

### 6. Scan Service (`lib/terminal/xintel/scan-service.ts`)

- [ ] `submitScan()` - Queue scan job
- [ ] `processScan()` - Pipeline: fetch → normalize → extract → classify → score → package
- [ ] `fetchPosts()` - Retrieve posts (default 800-1200)
- [ ] `normalizePost()` - Clean and structure post data
- [ ] `buildEvidencePack()` - Collect evidence items for flags
- [ ] `cacheReport()` - Store with TTL and versioning
- [ ] Rate limiting per-user/per-IP

### 7. Evidence Rules (Hard Requirement)

Every displayed flag MUST have:
- `>= 3 evidence items` OR
- `1 high-signal item + 2 supporting items`

If threshold not met:
- Suppress the flag from display
- Store as "insufficient evidence" for tuning
- Evidence item structure: `{ tweet_id, timestamp, excerpt, label, link }`

### 8. UI Pages (`app/terminal/xintel/`)

#### 8.1 Scanner Page (`app/terminal/xintel/page.tsx`)

- [ ] Input field: Accept @handle, x.com/handle, twitter.com/handle
- [ ] Optional depth selector (posts to scan)
- [ ] Scan button with loading states
- [ ] Loading stepper: Fetching posts → Extracting entities → Analyzing behavior → Building report
- [ ] Error states: not found, protected, suspended, rate-limited
- [ ] Link to cached report if available

#### 8.2 Report Page (`app/terminal/xintel/[handle]/page.tsx`)

**Header Card:**
- [ ] Handle, display name, bio snapshot
- [ ] Verified status badge (if available)
- [ ] Follower metrics (if available)
- [ ] Risk Level badge: Low / Medium / High
- [ ] CLARP Reputation Score (0-100) + factor breakdown chart
- [ ] 3 Key Findings bullets (auto-generated)
- [ ] Scan timestamp + disclaimer

**Tabs:**
- [ ] Overview - Summary with key findings
- [ ] Shills - Token/project promotion map
- [ ] Backlash - Controversy timeline
- [ ] Behavior - Toxicity/hype analysis
- [ ] Network - Interaction graph
- [ ] Entities - Extracted links/addresses

**Evidence Drawer:**
- [ ] Click any flag/row/card to open supporting posts
- [ ] Show tweet excerpts with timestamps
- [ ] Link to original posts

#### 8.3 Shills Tab

- [ ] Top tokens/projects detected (ranked by promo intensity)
- [ ] For each entity:
  - First mention date
  - Last mention date
  - Total mention count
  - Promo % (promotional vs neutral)
  - Example post excerpts (expandable)

#### 8.4 Backlash Tab

- [ ] Timeline cards sorted by date
- [ ] For each event:
  - Category (scam allegation, rug accusation, etc.)
  - Severity indicator
  - Date range
  - Who called out (handle, if detectable)
  - Evidence posts (expandable)

#### 8.5 Behavior Tab

- [ ] Vulgarity/Toxicity score with gauge + examples
- [ ] Aggression/Harassment signals + target patterns
- [ ] Hype Intensity score + keyword examples
- [ ] Consistency meter + topic drift visualization
- [ ] Shill burst timeline

#### 8.6 Network Tab

- [ ] Top interacted accounts (reply/quote/RT frequency)
- [ ] Notable followers (if detectable)
- [ ] Interaction heatmap (optional)

#### 8.7 Entities Tab

- [ ] Domains extracted
- [ ] Telegram/Discord links
- [ ] GitHub links
- [ ] Wallet-like strings (with chain detection)
- [ ] Related handles mentioned
- [ ] Confidence tags on each

### 9. Components (`components/terminal/xintel/`)

- [ ] `ReputationScore.tsx` - Large score display with factor breakdown
- [ ] `RiskBadge.tsx` - Low/Medium/High badge
- [ ] `KeyFindings.tsx` - Top 3 auto-generated findings
- [ ] `ShillCard.tsx` - Entity promotion card
- [ ] `BacklashCard.tsx` - Controversy timeline card
- [ ] `BehaviorGauge.tsx` - Score visualization with examples
- [ ] `EntityList.tsx` - Linked entities with confidence
- [ ] `EvidenceDrawer.tsx` - Slide-out panel with posts
- [ ] `ScanStepper.tsx` - Loading progress indicator
- [ ] `ShareButton.tsx` - Generate shareable link

### 10. Mock Data (`lib/terminal/xintel/mock-data.ts`)

- [ ] 5 sample profiles with varying risk levels
- [ ] Sample shilled entities for each
- [ ] Sample backlash events
- [ ] Sample behavior metrics
- [ ] Pre-calculated scores with evidence

### 11. Tests (`__tests__/terminal/xintel/`)

- [ ] `entity-extractor.test.ts` - Entity extraction accuracy
- [ ] `behavior-analyzer.test.ts` - Behavior classification
- [ ] `scoring.test.ts` - Reputation score calculation
- [ ] `evidence-rules.test.ts` - Evidence threshold enforcement
- [ ] `mock-data.test.ts` - Mock data consistency

---

## UI States

| State | Display |
|-------|---------|
| Loading | Stepper: Fetching → Extracting → Analyzing → Building |
| Empty | "No strong signals found" + analyzed scope summary |
| Error: Not Found | "Account not found" |
| Error: Protected | "Account is protected" |
| Error: Suspended | "Account suspended" |
| Error: Rate Limited | Show cached report with warning banner |

---

## Safety Guardrails

1. **No doxxing** - Never infer real identity or private data
2. **No definitive accusations** - Use neutral phrasing: "signal", "indicator", "allegation"
3. **Proof-first** - Always provide citations to original posts
4. **UI Disclaimer** - "Automated analysis may be incorrect. Verify sources."

---

## Caching Strategy

- Default report TTL: 6-24 hours (configurable)
- Cache key: `(handle, scan_depth, scan_time)`
- On rate limit: Return cached report with warning banner
- Force rescan: Admin/pro tier only

---

## Navigation Integration

Add to terminal navigation:
- [ ] "X Intel" nav item in `TerminalLayout.tsx`
- [ ] Route: `/terminal/xintel`
- [ ] Icon: Twitter/X icon or profile scanner icon

---

## Analytics Events

| Event | Trigger | Properties |
|-------|---------|------------|
| `xintel_scan_started` | User submits scan | handle, depth, user_tier |
| `xintel_scan_completed` | Report ready | duration_ms, cached |
| `xintel_scan_failed` | Scan fails | error_code, stage |
| `xintel_report_viewed` | Report page open | handle |
| `xintel_tab_clicked` | User clicks tab | tab_name |
| `xintel_evidence_opened` | Evidence drawer open | flag_type |
| `xintel_share_clicked` | Share action | channel |

---

## Success Metrics

- Scan completion rate and median time-to-report
- Evidence engagement rate (opens per report view)
- Share rate (shares per report view)
- Return usage (repeat scans per user)

---

## Acceptance Criteria

- [ ] Valid handle returns report with score + breakdown + timestamp + disclaimer
- [ ] Any displayed flag contains >= 3 evidence items (or 1 high + 2 supporting)
- [ ] Shills tab shows detected tokens/projects OR "none detected"
- [ ] Backlash tab shows timeline OR "no strong backlash signals"
- [ ] UI remains readable (no wall-of-text); tables paginate/collapse
- [ ] Cache hit returns quickly; forced scan respects rate limits
- [ ] Build passes with no errors
- [ ] All tests pass

---

## Files to Create

### New Files
```
types/xintel.ts
lib/terminal/xintel/entity-extractor.ts
lib/terminal/xintel/behavior-analyzer.ts
lib/terminal/xintel/scan-service.ts
lib/terminal/xintel/mock-data.ts
lib/terminal/scoring/xintel.ts
app/terminal/xintel/page.tsx
app/terminal/xintel/[handle]/page.tsx
app/api/xintel/scan/route.ts
app/api/xintel/report/[handle]/route.ts
app/api/xintel/report/[handle]/share/route.ts
components/terminal/xintel/ReputationScore.tsx
components/terminal/xintel/RiskBadge.tsx
components/terminal/xintel/KeyFindings.tsx
components/terminal/xintel/ShillCard.tsx
components/terminal/xintel/BacklashCard.tsx
components/terminal/xintel/BehaviorGauge.tsx
components/terminal/xintel/EntityList.tsx
components/terminal/xintel/EvidenceDrawer.tsx
components/terminal/xintel/ScanStepper.tsx
components/terminal/xintel/ShareButton.tsx
__tests__/terminal/xintel/entity-extractor.test.ts
__tests__/terminal/xintel/behavior-analyzer.test.ts
__tests__/terminal/xintel/scoring.test.ts
__tests__/terminal/xintel/evidence-rules.test.ts
__tests__/terminal/xintel/mock-data.test.ts
```

### Files to Modify
```
components/terminal/TerminalLayout.tsx  # Add X Intel nav item
types/terminal.ts                        # Export xintel types (optional)
```

---

## V2 Roadmap (Future)

- Price/outcome correlation per shilled token
- Cross-entity linking (shared wallets/domains/clusters)
- Advanced contradiction detection ("claim ledger")
- Watchlist alerts (new shill bursts, controversy spikes)
- Full interaction graph visualization
- PDF export with branded formatting

---

## Notes

- This builds on Sprint 1's terminal infrastructure
- Reuse existing components where applicable (RiskCard, EvidenceItem, etc.)
- Score is inverted from PRD: higher = riskier (matches existing terminal pattern)
- Mock data first, real X API integration in future sprint
