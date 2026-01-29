<div align="center">

# $CLARP

**trust intelligence for crypto projects and people**

<br>

![Status](https://img.shields.io/badge/status-shipping-brightgreen?style=flat-square)
![Charity](https://img.shields.io/badge/fees-100%25%20to%20charity-blue?style=flat-square)
![Chain](https://img.shields.io/badge/chain-solana-purple?style=flat-square)
![License](https://img.shields.io/badge/license-MIT-black?style=flat-square)

<br>

[Website](https://clarp.lukehalley.com) · [Terminal](https://clarp.lukehalley.com/terminal) · [Dexscreener](https://dexscreener.com/solana/6c71mun334bafcuvn3cwajfqnk6skztzk9vfzrthstwj)

---

<br>

## the product

scan any crypto project or person. get a trust score with receipts.

paste a **token address**, **X handle**, **GitHub URL**, **website**, or **search query**. CLARP gathers OSINT from 9 free sources, runs AI analysis via Grok, and produces an evidence-backed trust report.

<br>

### what it scans

| entity | what you get |
|--------|-------------|
| **projects** | security intel, market data, GitHub activity, website quality, tokenomics, liquidity, audit status, tech stack, roadmap, shipping history |
| **people** | team discovery, promotion history, scam allegations, rug history, backlash density, hype language detection, contradictions, credibility signals |

<br>

### how it works

```
any input → entity resolution → OSINT gathering (free) → AI analysis (Grok) → trust report
```

| step | what happens |
|------|-------------|
| 1. resolve | detect input type, normalize to entity |
| 2. osint | query 9 free APIs in parallel (DexScreener, RugCheck, GitHub, WHOIS, Wayback, market data, socials) |
| 3. analyze | Grok AI with live X search for profile/post analysis |
| 4. score | trust score 0-100 with tier (verified / trusted / neutral / caution / avoid) |

<br>

### trust scoring

```
85-100  VERIFIED   strong evidence of legitimacy
70-84   TRUSTED    positive signals outweigh risks
50-69   NEUTRAL    insufficient data or mixed signals
30-49   CAUTION    notable risk flags present
 0-29   AVOID      strong evidence of scam/rug
```

<br>

## the plot twist

```
╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║   100% of protocol fees go to charity.                        ║
║                                                               ║
║   rug detection that funds AI safety research.                ║
║   full circle.                                                ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
```

<br>

## tech stack

| layer | tech |
|-------|------|
| framework | Next.js 16 |
| frontend | React 19, TailwindCSS |
| language | TypeScript |
| chain | **Solana only** |
| auth | Phantom wallet (Supabase Web3 Auth) |
| database | Supabase (Postgres) |
| AI | xAI Grok (primary), Anthropic Claude (secondary) |
| OSINT | DexScreener, RugCheck, GitHub API, WHOIS, Wayback Machine, Jupiter, Birdeye, CoinGecko, Telegram, Discord |

<br>

## getting started

```bash
npm install
npm run dev
```

<br>

## docs

| doc | what it covers |
|-----|---------------|
| [BUSINESS.md](./BUSINESS.md) | core business document - scanning pipeline, architecture, data sources, costs |
| [docs/database.md](./docs/database.md) | database schema and caching strategy |
| [docs/adr/](./docs/adr/) | architecture decision records |

<br>

## contract

```
CA: GtwMkjRY8Vi5oGaLaEsd1xnsr3AkZ6ZYBqsG5ipTBAGS
```

<br>

## contributing

contributions welcome. open an issue or submit a PR.

<br>

---

<br>

**$CLARP** — *scan projects. scan people. trust with receipts.*

<br>

<sub>2025 clarp. utility with a conscience.</sub>

</div>
