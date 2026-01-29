/**
 * CLARP SaaS Promo Video Spec
 * ─────────────────────────────
 * Reusable video specification for the CLARP Terminal product demo.
 * Import this spec into new compositions to maintain consistent design.
 *
 * Composition: ClarpSaasPromo
 * Format: 1920x1080 (16:9, optimized for X/Twitter video)
 * Duration: 17s @ 60fps (1020 frames)
 * Render: `npm run remotion:render:saas`
 */

// ─── Design Tokens ───────────────────────────────────────────────
export const colors = {
  bg: '#0a0a09',
  surface: '#141413',
  surfaceLight: '#1e1e1c',
  ivory: '#FAF9F5',
  terracotta: '#D97757',
  accentDark: '#C6613F',
  slate: '#5E5D59',
  slateDim: '#3D3D3A',
  success: '#2ECC71',
  error: '#E74C3C',
  warning: '#FFD93D',
  larp: '#9B59B6',
  cloud: '#B0AEA5',
  dangerOrange: '#FF6B35',
} as const;

// ─── Typography ──────────────────────────────────────────────────
export const fonts = {
  mono: '"JetBrains Mono", "SF Mono", "Fira Code", monospace',
  sans: '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, sans-serif',
} as const;

// ─── Scene Gradients ─────────────────────────────────────────────
// Each scene uses a radial gradient from an accent color center → black.
// 3-stop gradient: bright center → mid-tone @ 35% → bg black @ 85%.
export const sceneGradients = {
  /** Warm terracotta — used for intro/hook & CTA closing */
  terracotta: (bg: string) =>
    `radial-gradient(ellipse at 50% 60%, #4a2a18 0%, #2a1610 35%, ${bg} 85%)`,

  /** Hot orange — used for scan pipeline (pre-complete) */
  orange: (bg: string) =>
    `radial-gradient(ellipse at 50% 50%, #4a2005 0%, #2a1408 35%, ${bg} 85%)`,

  /** Success green — used for scan complete & project results */
  green: (bg: string) =>
    `radial-gradient(ellipse at 50% 40%, #0a4a1a 0%, #081a0e 35%, ${bg} 85%)`,

  /** Larp purple — used for OSINT sources / Grok AI scenes */
  purple: (bg: string) =>
    `radial-gradient(ellipse at 50% 50%, #2a1440 0%, #180c28 35%, ${bg} 85%)`,

  /** CTA terracotta (slightly lower center) */
  ctaTerracotta: (bg: string) =>
    `radial-gradient(ellipse at 50% 55%, #4a2a18 0%, #2a1610 35%, ${bg} 85%)`,
} as const;

// ─── Scene Breakdown ─────────────────────────────────────────────
export const scenes = {
  searchHook: {
    name: 'Search Hook',
    timeRange: '0–3s',
    frames: { from: 0, duration: 180 },
    gradient: 'terracotta',
    description: 'Types "$ZERA" into search bar with blinking cursor, SCAN button pulses, flash transition on enter.',
    elements: ['headline', 'subheadline', 'search bar', 'typing animation', 'scan button', 'input type hints', 'flash overlay'],
    animation3D: { rotY: [4, -3], floatAmplitude: 3, perspective: 1200 },
  },

  osintScanPipeline: {
    name: 'OSINT Scan Pipeline',
    timeRange: '3–7.5s',
    frames: { from: 180, duration: 270 },
    gradient: 'orange → green (crossfade on complete)',
    description: '5-step scan progress with corner accents, scanline overlay, spinner, progress bar. Background transitions orange→green when analysis completes.',
    steps: [
      { num: 1, label: 'identifying entity', detail: 'resolving token address...', source: '$ZERA → 8avj...wZERA' },
      { num: 2, label: 'gathering osint data', detail: 'querying RugCheck, DexScreener...', source: 'FREE' },
      { num: 3, label: 'discovering social links', detail: 'crawling zeralabs.org, finding socials...', source: 'FREE' },
      { num: 4, label: 'ai analysis', detail: 'grok analyzing @zeralabs activity...', source: 'GROK' },
      { num: 5, label: 'building trust report', detail: 'calculating trust score...', source: '' },
    ],
    animation3D: { rotY: [-4, 4], floatAmplitude: 5, perspective: 1400 },
  },

  projectResults: {
    name: 'Project Results — Trust Report',
    timeRange: '7.5–11s',
    frames: { from: 450, duration: 210 },
    gradient: 'green',
    description: 'Full trust report card with ZERA avatar, score 100 (green), Verified badge, tab nav, security data, Grok evidence cards, behavior metrics.',
    exampleProject: {
      name: 'ZERA',
      handle: '@zeralabs',
      ticker: '$ZERA',
      score: 100,
      tier: 'verified',
      entityType: 'project',
      avatar: 'https://cdn.dexscreener.com/cms/images/7f04cf532eabbae6fbd5761288737255678e4dc77a2d39d16f91f92fe1c7e551?width=800&height=800&quality=90',
    },
    securityData: [
      { label: 'Mint', value: 'DISABLED', good: true },
      { label: 'Freeze', value: 'DISABLED', good: true },
      { label: 'LP Status', value: 'LOCKED 100%', good: true },
      { label: 'Holders', value: '7,824', good: true },
    ],
    grokEvidence: [
      'open-sourced Offline Cash Desktop Application',
      'prev USAA, MetaMask... doxxed ex-MetaMask dev',
      'Zera Labs x @PorzioLaw — legal counsel for AML/OFAC',
    ],
    behaviorMetrics: [
      { label: 'serial shill', score: 0 },
      { label: 'hype', score: 0 },
      { label: 'toxicity', score: 0 },
      { label: 'consistency', score: 80 },
    ],
    animation3D: { rotY: [-3, 3], floatAmplitude: 4, perspective: 1400 },
  },

  osintSources: {
    name: 'OSINT Sources Reveal',
    timeRange: '11–13s',
    frames: { from: 660, duration: 120 },
    gradient: 'purple',
    description: '6 intelligence source cards in a grid with FREE/AI badges.',
    sources: [
      { name: 'RugCheck', type: 'security', desc: 'mint, freeze, LP lock, holders', free: true },
      { name: 'DexScreener', type: 'market', desc: 'price, volume, liquidity', free: true },
      { name: 'Birdeye', type: 'market', desc: 'market cap, trading activity', free: true },
      { name: 'RDAP/WHOIS', type: 'domain', desc: 'domain age, registrar, privacy', free: true },
      { name: 'GitHub API', type: 'code', desc: 'commits, stars, contributors, tests', free: true },
      { name: 'Grok (xAI)', type: 'ai', desc: 'x_search, behavior analysis, evidence', free: false },
    ],
    animation3D: { rotY: [3, -3], floatAmplitude: 0, perspective: 1200 },
  },

  ctaClosing: {
    name: 'CTA Closing',
    timeRange: '13–17s',
    frames: { from: 780, duration: 240 },
    gradient: 'ctaTerracotta',
    description: 'Mascot + $CLARP logo with glow + tagline + clarp.xyz/terminal CTA + orbiting particles.',
    cta: {
      url: 'clarp.xyz/terminal',
      tagline: 'scan any project. scan any person.\nosint + grok. evidence over vibes.',
      footer: 'solana · $CLARP · live now',
    },
    animation3D: { rotY: 'oscillating ±3°', floatAmplitude: 5, perspective: 1200 },
  },
} as const;

// ─── Animation Presets ───────────────────────────────────────────
export const springPresets = {
  /** Standard element entrance */
  entrance: { damping: 14, stiffness: 140 },
  /** Headline / large text */
  headline: { damping: 16, stiffness: 180 },
  /** Subtitle / secondary text */
  subtitle: { damping: 18, stiffness: 200 },
  /** Card entrance */
  card: { damping: 13, stiffness: 110 },
  /** Stagger default */
  stagger: { damping: 18, stiffness: 180 },
  /** Bouncy mascot entrance */
  bouncy: { damping: 10, stiffness: 130 },
  /** Completion states */
  complete: { damping: 20, stiffness: 200 },
} as const;

// ─── Composition Config ──────────────────────────────────────────
export const compositionConfig = {
  id: 'ClarpSaasPromo',
  width: 1920,
  height: 1080,
  fps: 60,
  durationInFrames: 1020,
  durationSeconds: 17,
} as const;

// ─── Assets ──────────────────────────────────────────────────────
export const assets = {
  mascot: 'clarp-mascot.svg', // public/ folder, use staticFile()
  zeraAvatar: 'https://cdn.dexscreener.com/cms/images/7f04cf532eabbae6fbd5761288737255678e4dc77a2d39d16f91f92fe1c7e551?width=800&height=800&quality=90',
} as const;

// ─── Reusable Patterns ──────────────────────────────────────────
/**
 * Key patterns used in this composition:
 *
 * 1. STAGGER SPRING — Delay spring animations per index:
 *    spring({ frame: frame - index * 4, fps, config })
 *
 * 2. 3D FLOAT — Subtle perspective + rotation + sine float:
 *    transform: `rotateY(${rotY}deg) translateY(${Math.sin(frame * 0.05) * 3}px)`
 *    with perspective on parent AbsoluteFill
 *
 * 3. GRADIENT CROSSFADE — Two stacked absolute divs with opposing opacity:
 *    <div style={{ ...gradient1, opacity: 1 - progress }} />
 *    <div style={{ ...gradient2, opacity: progress }} />
 *
 * 4. TYPING ANIMATION — interpolate frame → char count:
 *    const chars = Math.floor(interpolate(frame, [start, end], [0, 1]) * text.length)
 *
 * 5. WINDOW CHROME — macOS-style title bar with traffic lights
 *
 * 6. CORNER ACCENTS — 4 corner L-shapes that change color on state change
 *
 * 7. SCANLINE OVERLAY — repeating-linear-gradient for CRT effect
 */
