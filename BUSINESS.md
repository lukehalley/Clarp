# CLARP - Core Business Document

> **This is the canonical business document for CLARP. All other docs defer to this.**
>
> Last updated: 2026-01-29

---

## What CLARP Is

CLARP is a **trust intelligence platform for crypto projects and people**. It scans any crypto entity - token address, X/Twitter handle, GitHub repo, website, or search query - and produces an evidence-backed trust report with a score from 0-100.

**One-liner:** Scan any crypto project or person. Get a trust score with receipts.

**Positioning:** The first platform that combines free OSINT data gathering with AI-powered social analysis to answer one question: *should I trust this before I ape?*

---

## Core Service: Scanning

CLARP's entire product is built around **two scanning capabilities**:

### 1. Project Scanning

Scan any crypto project by pasting a token address, website, or GitHub URL.

**What it produces:**
- Trust score (0-100) with tier (Verified / Trusted / Neutral / Caution / Avoid)
- Security intel (mint/freeze authority, LP lock, holder distribution, risk flags)
- Market data (price, volume, liquidity, market cap - live from DEX)
- GitHub intel (commit activity, contributor diversity, health score)
- Website intel (quality score, documentation, team page, audit info)
- Tokenomics (supply, burn mechanism, vesting, deflationary model)
- Liquidity analysis (DEX, pool type, lock status/duration)
- Audit status (auditor, date, report link)
- Tech stack (blockchain, ZK tech, hardware)
- Roadmap and shipping history (milestones with evidence URLs)
- Key findings and controversies

### 2. People Scanning

Scan any crypto personality by pasting an X/Twitter handle.

**What it produces:**
- Trust score with evidence-backed signals
- Team discovery (real names, roles, previous employers)
- Positive indicators (doxxed, active GitHub, real product, credible backers, account age)
- Negative indicators (scam allegations, rug history, anonymous team, suspicious followers, hype language, aggressive promotion)
- Promotion history (what they shilled, what happened)
- Contradictory statements over time
- Community backlash and callout density
- Legal entity and affiliation discovery

---

## How Scanning Works

### The Pipeline

```
User Input (any type)
    |
    v
Entity Resolution (detect input type)
    |
    v
OSINT Data Gathering (FREE - parallel)
    |--- DexScreener (token metadata)
    |--- RugCheck (security flags)
    |--- GitHub API (repo stats, contributors)
    |--- Website scraping (social links, docs)
    |--- Domain WHOIS (age, registrar)
    |--- Wayback Machine (website history)
    |--- Market APIs (Jupiter, Birdeye, CoinGecko)
    |--- Telegram/Discord (member counts)
    |--- Launchpad APIs (Pump.fun, Bags.fm)
    |
    v
AI Analysis (PAID - Grok with live X search)
    |--- Profile and post analysis
    |--- Team member extraction
    |--- Scam allegation detection
    |--- Tokenomics and legal entity research
    |
    v
Trust Scoring + Report Generation
    |
    v
Cache (24-hour TTL) + Display
```

### Design Principles

1. **OSINT-first, AI-second**: Gather all free data before making expensive AI calls
2. **Immediate display**: Show OSINT data instantly; AI analysis runs in background
3. **Evidence-first**: Every flag links to verifiable proof
4. **Universal input**: One search bar accepts any identifier type
5. **Aggressive caching**: 24-hour TTL to minimize API costs
6. **Cost transparency**: ~$0.02 per scan (Grok), free for cached results

---

## Trust Scoring

| Score | Tier | Meaning |
|-------|------|---------|
| 85-100 | Verified | Strong evidence of legitimacy |
| 70-84 | Trusted | Positive signals outweigh risks |
| 50-69 | Neutral | Insufficient data or mixed signals |
| 30-49 | Caution | Notable risk flags present |
| 0-29 | Avoid | Strong evidence of scam/rug |

Confidence level (low / medium / high) reflects data completeness.

---

## Data Sources

### Free (OSINT)

| Source | Data |
|--------|------|
| GitHub API | Repo stats, contributors, commit frequency, languages |
| DexScreener | Token metadata, prices, DEX info, liquidity |
| RugCheck.xyz | Mint/freeze authority, LP lock, holder concentration |
| Website scraping | Social links, docs presence, team page |
| Domain WHOIS/RDAP | Domain age, registrar, registration risk |
| Wayback Machine | Website history, first archive date |
| Jupiter / Birdeye / CoinGecko | Price, liquidity, market cap, volume |
| Pump.fun / Bags.fm | Launchpad data, graduation status |
| Telegram / Discord | Member counts, verification level |

### Paid (AI)

| Provider | Model | Use |
|----------|-------|-----|
| xAI Grok | grok-4-1-fast | Live X search, profile analysis, team extraction |
| Anthropic Claude | Claude 3.5 Haiku | GitHub repo code analysis (legacy scanner) |

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 16 |
| Frontend | React 19, TailwindCSS |
| Language | TypeScript |
| Database | Supabase (PostgreSQL) |
| Chain | Solana only |
| Auth | Phantom wallet (Supabase Web3 Auth) |
| AI | xAI Grok (primary), Anthropic Claude (secondary) |
| Hosting | Vercel |

---

## Product Routes

| Route | Purpose |
|-------|---------|
| `/` | Landing page |
| `/terminal` | Browse all scanned entities (Projects / People / Orgs) |
| `/terminal/scan?q=` | Real-time scan progress UI |
| `/terminal/project/[id]` | Full trust report (5 tabs: Overview, Security, Market, Intel, Development) |

---

## Token

| Attribute | Value |
|-----------|-------|
| Name | CLARP |
| Ticker | $CLARP |
| Chain | Solana |
| CA | `GtwMkjRY8Vi5oGaLaEsd1xnsr3AkZ6ZYBqsG5ipTBAGS` |
| DEX | Bags.fm (Meteora DBC) |

100% of protocol fees go to AI safety research.

---

## What's Shipped

| Feature | Status |
|---------|--------|
| Landing page | Shipped |
| CLARP Terminal (browse/filter/sort) | Shipped |
| Universal scanner (any input type) | Shipped |
| Project trust reports | Shipped |
| People trust reports | Shipped |
| OSINT pipeline (9 free sources) | Shipped |
| Grok AI analysis | Shipped |
| GitHub code scanner (legacy) | Shipped |
| Aggressive caching (24hr TTL) | Shipped |
| Phantom wallet auth | Shipped |

---

## What's Next

| Feature | Status |
|---------|--------|
| Token staking (tier-gated access) | Proposed (ADR-002) |
| Watchlist + alerts | Planned |
| Shareable report pages | Planned |
| Compare mode | Planned |
| Weekly risk digest | Planned |

---

## Key Architecture Files

| File | Purpose |
|------|---------|
| `lib/terminal/entity-resolver.ts` | Input detection + OSINT orchestration |
| `lib/terminal/xintel/scan-service.ts` | Scan job lifecycle + Grok integration |
| `lib/terminal/project-service.ts` | Project CRUD + trust scoring |
| `lib/terminal/osint/` | 9 OSINT modules (all free APIs) |
| `lib/grok/` | Grok API client + prompts |
| `app/api/xintel/scan/route.ts` | Universal scan API endpoint |
| `app/api/projects/` | Project listing/detail API |
| `app/terminal/` | Terminal UI (browse, scan, report) |
| `types/project.ts` | Core type definitions |

---

## Costs

| Level | Scans/month | Cost |
|-------|-------------|------|
| Light | 100 | ~$2 |
| Medium | 1,000 | ~$20 |
| Heavy | 10,000 | ~$200 |

Caching reduces effective cost by 50-80%.

---

*CLARP spots LARP. Know who to trust before you ape.*
