# Sprint 005: Site Realignment

> Align the entire website with BUSINESS.md — the canonical source of truth.

## Problem

The site was built when CLARP was positioned as a Polymarket + meme coin project. The product has evolved into a **trust intelligence platform for scanning crypto projects and people**. The site content is now misaligned with reality.

## Key Misalignments

### Critical

| Issue | Current | Should Be |
|-------|---------|-----------|
| Hero tagline | "polymarket odds + on-chain receipts" | "scan any project or person. trust score with receipts." |
| Hero subtitle | "first autonomous trust pilot" | "trust intelligence for crypto" |
| Charity section | "100% of fees go to charity" | 50% dev, 30% ops, 20% burn (per BUSINESS.md) |
| Roadmap progress | 0% (nothing shipped) | ~40% (terminal, scanner, reports all shipped) |
| Navbar primary | C[LARP] AGENT | Terminal / Scan |

### High

| Issue | Current | Should Be |
|-------|---------|-----------|
| Hero sentences | 53 sentences about Polymarket/TROVE | Scanning, trust scores, OSINT pipeline |
| Mascot bullet points | "scanning polymarket while you sleep" | "scanning projects and people 24/7" |
| Footer positioning | "polymarket + on-chain analysis" | "trust intelligence. scan projects. scan people." |
| Footer coming soon | markets dashboard, X bot | token gate, staking, watchlist |
| Roadmap phases | v1=Polymarket, v2=X bot | v1=Terminal (shipped), v2=Token Gate (building) |

### Medium

| Issue | Current | Should Be |
|-------|---------|-----------|
| CTA section | "polymarket odds + on-chain analysis" | "scan projects. scan people. trust with receipts." |
| Roadmap component | old phases with Polymarket | updated phases matching BUSINESS.md |
| Roadmap page boot msgs | "polymarket odds loaded" | "OSINT pipeline loaded" |
| Roadmap page ticker | "POLYMARKET + AI" | "OSINT + AI" |

## Files to Modify

1. `app/page.tsx` — hero, mascot, charity→tokenomics, CTA
2. `data/hero-sentences.json` — full rewrite
3. `components/Navbar.tsx` — demote CLARP AGENT, terminal as primary
4. `components/Footer.tsx` — positioning text, coming soon items, link messages
5. `components/Roadmap.tsx` — phases reflect shipped + building + planned
6. `app/roadmap/page.tsx` — phases, progress, boot messages, tickers

## Source of Truth

All content changes reference [BUSINESS.md](../../BUSINESS.md).
