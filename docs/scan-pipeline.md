# Scan Pipeline

How a scan works from input to saved project.

## Pipeline overview

```
Input → Entity Resolver → Classification → Grok + Perplexity (parallel) → Post-AI OSINT → Cross-ref → Save
```

Each stage is independent. Grok does X. Perplexity does web. OSINT does APIs. They don't wait on each other — they feed forward.

## Stages

### 1. Input detection

Determine what the user typed. Supported inputs:

| Input | Example | Detection |
|-------|---------|-----------|
| X handle | `@zeralabs` | Starts with `@` or matches `[a-zA-Z0-9_]{1,15}` |
| X URL | `x.com/zeralabs` | URL pattern match |
| Token address | `So11...` | Base58 32-44 chars |
| Ticker | `$ZERA` | Starts with `$` |
| Website | `zeralabs.io` | Domain pattern |
| GitHub URL | `github.com/org/repo` | GitHub URL pattern |

Code: `detectInputType()` in `lib/terminal/entity-resolver.ts`

### 2. Entity resolver (OSINT)

Runs free API calls based on the input type. What it can find depends entirely on what the input gives it:

| Input type | What resolver can do |
|------------|---------------------|
| Token address | RugCheck, DexScreener, market data, social links from DEX listing |
| X handle | Almost nothing — just the handle string |
| Website | Scrape site, find social links, domain age, wayback history |
| GitHub URL | Stars, commits, contributors, languages |

For X handle inputs, the resolver returns a near-empty entity. This is why the later stages matter.

Code: `resolveEntity()` in `lib/terminal/entity-resolver.ts`

### 3. Preliminary save

If the resolver found a token address, save a skeleton project to the DB immediately. The user sees partial data while AI runs. Fields like `key_findings` contain `"⏳ AI analysis in progress..."`.

### 4. Quick classification (Grok)

Cheap Grok call. Two questions:
- Is this account crypto-related? If no, bail with a "not relevant" report.
- Is it a project, person, or company? This controls whether Perplexity runs (projects only).

Code: `grokClient.classifyHandle()` in `processRealScan()`

### 5. Parallel AI analysis

Two calls run simultaneously via `Promise.all`. Neither waits for the other.

#### Grok (X behavioral analysis)

- Tool: `x_search` (reads the account's actual X posts)
- Finds: shilling patterns, engagement quality, team mentions, promotional behavior, hype language, follower authenticity, controversies, linked accounts
- Prompt: `BEHAVIORAL_ANALYSIS_PROMPT` (X-only, no web search when Perplexity is active)
- Strength: real-time X data, behavioral pattern detection

#### Perplexity (web research with citations)

- Tool: Sonar web search
- Finds: team members, legal entity, funding rounds, audits, tech stack, affiliations, recent news, controversies
- Also discovers **identifiers**: token address, website URL, GitHub URL, ticker, chain
- Every claim backed by a citation URL
- Strength: factual web research, identifier discovery, cited sources

The identifier discovery is critical for X handle inputs. Perplexity searches DexScreener, CoinGecko, project sites, and returns the token address/website/GitHub that the entity resolver couldn't find.

Code: `processRealScan()` in `lib/terminal/xintel/scan-service.ts`, `buildResearchPrompt()` in `lib/perplexity/prompts.ts`

### 6. Post-AI OSINT enrichment

After both AI calls complete, take whatever identifiers they discovered and run the OSINT API modules that couldn't run earlier.

Only runs modules for **missing** data. If OSINT already has the data (e.g. input was a token address), this is a no-op.

| Identifier found | Modules that run |
|-------------------|-----------------|
| Token address (no security data) | RugCheck, market intel (Jupiter/DexScreener), token lookup |
| GitHub URL (no GitHub intel) | Comprehensive GitHub intel (stars, commits, contributors, health) |
| Website URL (no website intel) | Website scrape, domain RDAP (age/registrar), Wayback Machine |

All modules run in parallel via `Promise.allSettled`. Each one catches its own errors — a failed RugCheck call doesn't block GitHub intel.

Code: `enrichOsintFromDiscoveredLinks()` in `lib/terminal/xintel/scan-service.ts`

### 7. Cross-reference

Reconcile data from all three sources. Handles conflicts and deduplication.

- **Team**: merge members from Grok (has roles from AI), Perplexity (has real names, LinkedIn, employers), and OSINT (has GitHub contributors). Deduplicate by handle/name.
- **Factual fields** (legal entity, affiliations, audit): Perplexity preferred (cited sources) > Grok > OSINT
- **Behavioral fields** (engagement, hype, followers): Grok only
- **Quantitative fields** (security, market, GitHub stats): OSINT preferred (API data) > Perplexity > Grok
- **Conflicts**: logged and stored in `sourceAttribution.conflicts`

Code: `crossReference()` in `lib/terminal/xintel/cross-reference.ts`

### 8. Build project entity

Assemble the final project from all sources:

| Field | Primary source | Fallback |
|-------|---------------|----------|
| `securityIntel` | OSINT (RugCheck API) | — |
| `marketData` | OSINT (Jupiter/DexScreener API) | — |
| `githubIntel` | OSINT (GitHub API) | — |
| `websiteIntel` | OSINT (scrape + domain + wayback) | — |
| `team` | Cross-ref (merged) | Grok team |
| `legalEntity` | Cross-ref / Perplexity | Grok |
| `affiliations` | Cross-ref / Perplexity | Grok |
| `audit` | Cross-ref / Perplexity | Grok |
| `techStack` | Cross-ref / OSINT | Grok |
| `theStory` | Cross-ref | Grok |
| `keyFindings` | All sources merged | — |
| `sourceAttribution` | Cross-ref | — |
| `perplexityCitations` | Perplexity | — |
| `positiveIndicators` | Grok + OSINT | — |
| `negativeIndicators` | Grok + OSINT | — |

Code: `upsertProjectFromAnalysis()` in `lib/terminal/xintel/scan-service.ts`

### 9. Save to DB

Upsert the project by X handle. All fields mapped through `projectToInsert()` / `projectToUpdate()`.

Code: `upsertProjectByHandle()` in `lib/terminal/project-service.ts`

### 10. Cache report

Save the XIntel report (the raw Grok analysis format) to both Supabase and in-memory cache. TTL is 24 hours. Subsequent scans of the same handle return cached data unless `?force=true`.

## What each stage is best at

| Stage | Strength | Weakness |
|-------|----------|----------|
| **OSINT** (entity resolver) | Structured API data — exact numbers, on-chain truth | Can only work with known identifiers. Useless for X handle inputs without links. |
| **Grok** | Real-time X behavioral analysis — reads actual posts, detects patterns | Hallucinates factual claims (team names, funding). Don't trust for facts. |
| **Perplexity** | Web research with citations — finds real facts with source URLs | Can't read X posts. Slower for very new/obscure projects with no web presence. |

The pipeline plays to each one's strength: Grok reads X, Perplexity researches the web, OSINT calls APIs with whatever identifiers the AI stages discover.

## Example: X handle input (`@zeralabs`)

1. Entity resolver: returns just `{ canonicalId: "zeralabs", xHandle: "zeralabs" }`. No token, no website, no GitHub.
2. Classification: Grok says it's a crypto project.
3. Grok + Perplexity run in parallel:
   - Grok: reads X posts, finds team mentions, detects promotion patterns
   - Perplexity: searches web, finds token address `0x...`, website `zeralabs.io`, GitHub `github.com/zeralabs`
4. Post-AI OSINT: token address → RugCheck + market data. GitHub URL → repo intel. Website → scrape + domain age + wayback.
5. Cross-ref: merge all three sources, resolve conflicts.
6. Save: project entity has security intel, market data, GitHub stats, website info, team, legal entity — all populated.

## Example: Token address input (`So11...`)

1. Entity resolver: RugCheck, DexScreener, market data, finds X handle from DEX listing social links.
2. OSINT entity is already rich — has security, market, token data.
3. Grok + Perplexity run on the discovered X handle.
4. Post-AI OSINT: mostly a no-op (data already present from step 1).
5. Cross-ref + save as normal.

## Project entity schema

Every scan produces a single `Project` entity. The same schema is used for all three entity types — project, person, and organization — but different fields are relevant to each.

Types defined in `types/project.ts`.

### Core fields (all entity types)

```
id                              UUID, auto-generated
entityType                      "project" | "person" | "organization"
name                            Display name
description                     1-2 sentence summary
avatarUrl                       Profile image URL
tags[]                          Computed labels, e.g. ["builder", "doxxed", "pump-fun", "lp-locked"]
lastScanAt                      When last scanned
createdAt                       When first created
```

### Identifiers (all entity types)

```
xHandle                         X username without @
githubUrl                       GitHub org or repo URL
websiteUrl                      Official website
tokenAddress                    Solana/EVM contract address
ticker                          Token symbol without $
discordUrl                      Discord invite link
telegramUrl                     Telegram group link
```

### Trust score (all entity types)

```
trustScore.score                0-100 (100 = most trusted)
trustScore.tier                 "verified" | "trusted" | "neutral" | "caution" | "avoid"
trustScore.confidence           "low" | "medium" | "high"
trustScore.lastUpdated          Date
```

### Team (all entity types)

```
team[]
  handle                        X handle
  displayName                   e.g. "Meow"
  realName                      e.g. "Hayden Porter" (if doxxed)
  role                          "Founder" | "Lead Dev" | "CTO" | "Advisor" | ...
  avatarUrl                     X profile image
  isDoxxed                      Has verifiable real-world identity
  previousEmployers[]           e.g. ["MetaMask", "USAA"]
  linkedIn                      LinkedIn profile URL
```

### AI narrative (all entity types)

```
aiSummary                       Grok verdict summary
keyFindings[]                   Bullet points from all sources
controversies[]                 Known issues / allegations
theStory                        2-3 sentence narrative
```

### Source tracking (all entity types)

```
sourceAttribution
  fieldSources                  Map of field → { source, confidence, citationUrl, retrievedAt }
  conflicts[]                   Where sources disagreed
    field                       Which field
    sources[]                   Each source's value + citation
    resolution                  "perplexity_wins" | "grok_wins" | "osint_wins" | "unresolved"

perplexityCitations[]           URLs backing Perplexity's factual claims
  url
  title
```

### Social metrics (all entity types, from Grok)

```
socialMetrics
  followers                     X follower count
  engagement                    Engagement rate
  postsPerWeek                  Posting frequency
```

### Risk assessment (all entity types, from Grok + OSINT)

```
positiveIndicators
  isDoxxed                      Team has verifiable identities
  doxxedDetails                 How they're doxxed
  hasActiveGithub               Commits in last 30 days
  githubActivity                e.g. "42 commits in last 30d"
  hasRealProduct                Shipped something usable
  productDetails                What the product is
  accountAgeDays                X account or domain age
  hasConsistentHistory          Wayback/post history is consistent
  hasOrganicEngagement          Followers look real
  hasCredibleBackers            Known VCs/angels involved
  backersDetails                Who backed them

negativeIndicators
  hasScamAllegations            Community scam reports exist
  scamDetails                   What the allegations are
  hasRugHistory                 Previous rug pull flagged
  rugDetails                    RugCheck or community details
  isAnonymousTeam               No verifiable team identity
  hasHypeLanguage               "100x guaranteed" style posts
  hypeExamples[]                Actual hype quotes
  hasSuspiciousFollowers        Bot-like follower patterns
  suspiciousDetails             What looks fake
  hasPreviousRebrand            Changed name/token before
  rebrandDetails                Old name/token
  hasAggressivePromotion        Spam-level promotion
  promotionDetails              How they promote
  noPublicAudit                 No third-party audit found
  lowLiquidity                  Under $10K liquidity
  unverifiedLegalEntity         No registered company found
```

---

### Project-specific fields

These fields are most relevant when `entityType = "project"`. They can technically appear on any entity type but are primarily populated for projects.

#### Market data (OSINT — Jupiter, DexScreener, CoinGecko)

```
marketData
  price                         Current USD price
  priceChange24h                24h change percent
  marketCap                     Fully diluted market cap
  volume24h                     24h trading volume
  liquidity                     Total liquidity USD
```

#### Security intel (OSINT — RugCheck + RDAP)

```
securityIntel
  mintAuthorityEnabled          Can mint unlimited tokens
  freezeAuthorityEnabled        Can freeze holder tokens
  lpLocked                      Liquidity pool locked
  lpLockedPercent               What percent is locked
  risks[]                       RugCheck risk descriptions
  holdersCount                  Total unique holders
  top10HoldersPercent           Concentration of top 10
  domainAgeDays                 Website domain age
  domainRegistrar               Who registered the domain
```

#### Token economics (OSINT + Grok + Perplexity)

```
tokenomics
  totalSupply                   Total token supply
  circulatingSupply             Circulating supply
  burnMechanism                 e.g. "0.1-2% per transaction"
  burnRate                      Current burn rate
  isDeflationary                Supply decreasing over time
  vestingSchedule               Token unlock schedule

liquidity
  primaryDex                    "Raydium" | "Meteora" | "Jupiter" | ...
  poolType                      "DAMM v2" | "DLMM" | ...
  liquidityUsd                  Total liquidity in pool
  liquidityLocked               Is liquidity locked
  lockDuration                  How long locked for
```

#### GitHub intel (OSINT — GitHub API)

```
githubIntel
  stars                         Repository stars
  forks                         Fork count
  watchers                      Watchers
  openIssues                    Open issue count
  lastCommitDate                Most recent commit
  lastCommitMessage             Most recent commit message
  commitsLast30d                Commits in last 30 days
  commitsLast90d                Commits in last 90 days
  contributorsCount             Total contributors
  topContributors[]             Top 5 by commit count
    login                       GitHub username
    avatarUrl                   GitHub avatar
    contributions               Commit count
  primaryLanguage               e.g. "Rust", "TypeScript"
  license                       e.g. "MIT", "Apache-2.0"
  isArchived                    Repo archived (abandoned)
  healthScore                   0-100 computed health
  healthFactors[]               What contributes to score
```

#### Website intel (OSINT — scrape + RDAP + Wayback)

```
websiteIntel
  isLive                        Site responds to HTTP
  lastChecked                   When we checked
  hasDocumentation              Docs/gitbook link found
  hasRoadmap                    Roadmap page found
  hasTokenomics                 Tokenomics page found
  hasTeamPage                   Team/about page found
  hasAuditInfo                  Audit page/link found
  redFlags[]                    Risk signals from site analysis
  trustIndicators[]             Positive signals from site
  websiteQuality                "professional" | "basic" | "suspicious"
  qualityScore                  0-100 computed quality
```

#### Development & shipping (Grok + Perplexity)

```
techStack
  blockchain                    "solana" | "ethereum" | "multi-chain"
  zkTech                        e.g. "Groth16 zk-SNARKs"
  offlineCapability             Works offline
  hardwareProducts[]            e.g. ["NFC tags", "hardware wallet"]

roadmap[]
  milestone                     What's planned
  targetDate                    When
  status                        "completed" | "in-progress" | "planned"

shippingHistory[]
  date                          When shipped
  milestone                     What shipped
  details                       Description
  evidenceUrl                   Link to proof

audit
  hasAudit                      Third-party audit exists
  auditor                       "CertiK" | "Trail of Bits" | ...
  auditDate                     When audited
  auditUrl                      Link to audit report
  auditStatus                   "none" | "pending" | "completed"
```

#### Legal & affiliations (Perplexity + Grok)

```
legalEntity
  companyName                   Registered company name
  jurisdiction                  e.g. "Texas, USA"
  isRegistered                  Has a legal entity
  registrationDetails           "LLC" | "Inc" | "Foundation" | ...

affiliations[]
  name                          e.g. "Texas Blockchain Council"
  type                          "council" | "accelerator" | "vc" | "exchange" | "regulatory" | "other"
  details                       Nature of relationship
```

---

### Person-specific fields

When `entityType = "person"`, the scan focuses on the individual's X behavior and reputation. Most project-specific fields (market data, security intel, tokenomics) will be null unless the person has their own token.

Fields that matter most for people:

```
POPULATED                       SOURCE
─────────────────────────────── ──────
team[]                          Grok + Perplexity (their roles at various projects)
positiveIndicators.isDoxxed     Grok (verified real identity)
positiveIndicators.hasCredibleBackers  Grok (known associates)
negativeIndicators.*            Grok (scam history, hype language, shilling)
socialMetrics                   Grok (follower quality, engagement)
keyFindings                     All sources
theStory                        Cross-ref
controversies                   Perplexity + Grok
affiliations                    Perplexity (what projects/orgs they're tied to)
```

Fields typically null for people:
```
marketData                      (no token)
securityIntel                   (no token)
tokenomics                      (no token)
liquidity                       (no token)
githubIntel                     (unless personal GitHub found)
websiteIntel                    (unless personal site found)
techStack                       (no project)
roadmap                         (no project)
shippingHistory                 (no project)
audit                           (no project)
```

---

### Organization-specific fields

When `entityType = "organization"` (mapped from Grok's "company" classification), the scan covers the entity as a business. Most fields populate similarly to projects, but the emphasis shifts to corporate structure and affiliations.

Fields that matter most for organizations:

```
POPULATED                       SOURCE
─────────────────────────────── ──────
legalEntity                     Perplexity (company registration, jurisdiction)
affiliations                    Perplexity (partnerships, portfolio, councils)
team[]                          Perplexity + Grok (leadership, public figures)
positiveIndicators              Grok + OSINT
negativeIndicators              Grok + OSINT
socialMetrics                   Grok
keyFindings                     All sources
theStory                        Cross-ref
controversies                   Perplexity + Grok
githubIntel                     OSINT (if org has public repos)
websiteIntel                    OSINT (corporate site)
```

Fields that depend on whether the org has a token:
```
marketData                      Only if org has its own token
securityIntel                   Only if org has its own token
tokenomics                      Only if org has its own token
liquidity                       Only if org has its own token
```

---

### Field count summary

| Category | Fields | Project | Person | Organization |
|----------|--------|---------|--------|--------------|
| Core | 7 | always | always | always |
| Identifiers | 7 | always | partial | always |
| Trust | 4 | always | always | always |
| Team | 8 per member | always | always | always |
| Narrative | 4 | always | always | always |
| Source tracking | 3 | always | always | always |
| Social | 3 | always | always | always |
| Risk assessment | 26 | always | always | always |
| Market data | 5 | usually | rare | sometimes |
| Security intel | 9 | usually | rare | sometimes |
| Tokenomics | 6 | usually | never | sometimes |
| Liquidity | 5 | usually | never | sometimes |
| GitHub intel | 15 | often | rare | often |
| Website intel | 11 | often | rare | usually |
| Tech/dev | 14 | often | never | sometimes |
| Legal | 4 | sometimes | never | usually |
| Affiliations | 3 per item | sometimes | sometimes | usually |
| **Total possible** | **~130+** | | | |

## Configuration

| Env var | Effect |
|---------|--------|
| `XAI_API_KEY` | Enables Grok. Required. |
| `PERPLEXITY_API_KEY` | Enables Perplexity. Falls back to Grok-only if missing. |
| `ENABLE_PERPLEXITY=false` | Force-disable Perplexity even if key is set. |
| `DISABLE_SEARCH_TOOLS=true` | Grok uses training data only (no live X search). |
| `ENABLE_REAL_X_API=true` | Master switch for real API mode. |
