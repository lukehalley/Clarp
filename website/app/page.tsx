'use client';

import { useState, useEffect, useRef } from 'react';
import Terminal from '@/components/Terminal';
import ProductCard from '@/components/ProductCard';
import ProgressBar from '@/components/ProgressBar';
import Badge from '@/components/Badge';
import Button from '@/components/Button';
import Mascot from '@/components/Mascot';
import DocsSection from '@/components/DocsSection';
import Footer from '@/components/Footer';

const ASCII_LOGO = `
 ██████╗██╗      █████╗
██╔════╝██║     ██╔══██╗
██║     ██║     ███████║
██║     ██║     ██╔══██║
╚██████╗███████╗██║  ██║
 ╚═════╝╚══════╝╚═╝  ╚═╝`;

const PRODUCTS = [
  {
    name: 'cla terminal',
    tagline: 'ide for shipping fuck all',
    description: 'auto-generates "coming soon" pages. 97% of pump.fun projects die in 24 hours using this exact strategy. you bought those too.',
    features: ['readme-only mode', '// TODO injection', 'private repo until rug'],
    progress: 99,
    status: 'coming-soon' as const,
  },
  {
    name: 'larpscan',
    tagline: 'detector for the bullshit you ape',
    description: 'scans "ai agent" repos for actual code. there isn\'t any. zerebro\'s $180m "trading agent" was if-else. you\'re holding that bag.',
    features: ['detects code (lol)', 'bundle % scanner', 'rug probability: yes'],
    progress: 73,
    status: 'development' as const,
  },
  {
    name: 'cla x402',
    tagline: 'invoicing for shit that doesn\'t exist',
    description: '"interesting plumbing, nowhere near production" - actual devs. vcs can\'t read code anyway, they just read pitch decks and lose money.',
    features: ['vaporware invoicing', 'milestone theater', '"directionally real"'],
    progress: 47,
    status: 'roadmap' as const,
  },
];

const TERMINAL_VARIATIONS = [
  {
    command: 'claude-larp generate --revolutionary-infrastructure',
    lines: [
      { type: 'success', content: '✓ copied chatgpt api wrapper' },
      { type: 'success', content: '✓ added "autonomous" to readme 47 times' },
      { type: 'success', content: '✓ bundled 80% supply to insider wallets' },
      { type: 'error', content: '✗ wrote a single fucking line of real code' },
    ],
    info: 'shipping nothing... $50m fdv incoming',
  },
  {
    command: 'claude-larp generate --decentralized-future',
    lines: [
      { type: 'success', content: '✓ forked uniswap, changed colors' },
      { type: 'success', content: '✓ wrote whitepaper with 73 buzzwords' },
      { type: 'success', content: '✓ created 12 telegram groups, 0 developers' },
      { type: 'error', content: '✗ understood what blockchain actually does' },
    ],
    info: 'roadmap: vibes only... $120m mcap loading',
  },
  {
    command: 'claude-larp generate --ai-powered-defi',
    lines: [
      { type: 'success', content: '✓ wrapped openai endpoint in nextjs' },
      { type: 'success', content: '✓ called it "neural network protocol"' },
      { type: 'success', content: '✓ paid influencers, forgot about product' },
      { type: 'error', content: '✗ trained a single model' },
    ],
    info: 'gasless launch... your money vanishing soon',
  },
  {
    command: 'claude-larp generate --web3-ecosystem',
    lines: [
      { type: 'success', content: '✓ deployed 47 smart contracts (all ownable)' },
      { type: 'success', content: '✓ locked liquidity (for 7 days)' },
      { type: 'success', content: '✓ "doxxed" team: stock photo linkedin profiles' },
      { type: 'error', content: '✗ passed a basic audit' },
    ],
    info: 'community-driven rug... pulling shortly',
  },
  {
    command: 'claude-larp generate --modular-stack',
    lines: [
      { type: 'success', content: '✓ made landing page with particles.js' },
      { type: 'success', content: '✓ added waitlist for vaporware' },
      { type: 'success', content: '✓ raised seed round from other vaporware' },
      { type: 'error', content: '✗ shipped anything to mainnet' },
    ],
    info: '"coming Q2"... since Q2 2022',
  },
  {
    command: 'claude-larp generate --intent-based-architecture',
    lines: [
      { type: 'success', content: '✓ renamed transactions to "intents"' },
      { type: 'success', content: '✓ added solver that\'s just a mempool' },
      { type: 'success', content: '✓ trademarked existing technology' },
      { type: 'error', content: '✗ improved on anything' },
    ],
    info: 'series A secured... still no users',
  },
  {
    command: 'claude-larp generate --institutional-grade',
    lines: [
      { type: 'success', content: '✓ slapped permissioned on top of ethereum' },
      { type: 'success', content: '✓ compliance theater: 9 dashboard buttons' },
      { type: 'success', content: '✓ enterprise sales to other crypto companies' },
      { type: 'error', content: '✗ onboarded a single tradfi client' },
    ],
    info: 'b2b pivot... selling shovels to shovel salesmen',
  },
  {
    command: 'claude-larp generate --omnichain-solution',
    lines: [
      { type: 'success', content: '✓ bridged 14 chains no one uses' },
      { type: 'success', content: '✓ created token that wraps tokens wrapping tokens' },
      { type: 'success', content: '✓ "interoperability" = one multisig' },
      { type: 'error', content: '✗ secured more than the bug bounty' },
    ],
    info: 'trustless bridge... trust us bro',
  },
  {
    command: 'claude-larp generate --social-fi-protocol',
    lines: [
      { type: 'success', content: '✓ put posts onchain (the whole post, gas = $47)' },
      { type: 'success', content: '✓ tokenized friendships with bonding curves' },
      { type: 'success', content: '✓ ponzinomics disguised as engagement metrics' },
      { type: 'error', content: '✗ asked if anyone wanted this' },
    ],
    info: 'creator economy... where creators create exit liquidity',
  },
  {
    command: 'claude-larp generate --restaking-primitive',
    lines: [
      { type: 'success', content: '✓ staked the stake of staked stakes' },
      { type: 'success', content: '✓ infinite recursive yield (on paper)' },
      { type: 'success', content: '✓ risk model: "number go up"' },
      { type: 'error', content: '✗ calculated actual slashing scenarios' },
    ],
    info: 'capital efficient... until it isn\'t',
  },
];

// Animation phases: 'typing' | 'paused' | 'deleting'
type AnimationPhase = 'typing' | 'paused' | 'deleting';

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [currentVariation, setCurrentVariation] = useState(0);
  const [visibleLines, setVisibleLines] = useState(0);
  const [phase, setPhase] = useState<AnimationPhase>('typing');
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [showSmoke, setShowSmoke] = useState(false);
  const terminalRef = useRef<HTMLDivElement>(null);

  const totalLines = 7; // command + empty + 4 lines + info

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    let timeout: NodeJS.Timeout;

    if (phase === 'typing') {
      if (visibleLines < totalLines) {
        timeout = setTimeout(() => {
          setVisibleLines((prev) => prev + 1);
        }, 300);
      } else {
        // Done typing, pause before deleting
        timeout = setTimeout(() => {
          setPhase('deleting');
        }, 2500);
      }
    } else if (phase === 'deleting') {
      if (visibleLines > 0) {
        timeout = setTimeout(() => {
          setVisibleLines((prev) => prev - 1);
        }, 50);
      } else {
        // Done deleting, move to next variation
        setCurrentVariation((prev) => (prev + 1) % TERMINAL_VARIATIONS.length);
        setPhase('typing');
      }
    }

    return () => clearTimeout(timeout);
  }, [mounted, phase, visibleLines]);

  // Auto-scroll terminal to bottom when lines change
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [visibleLines]);

  if (!mounted) return null;

  return (
    <main className="min-h-screen">
      {/* danger stripe header */}
      <div className="construction-stripe h-3" />

      {/* navigation */}
      <nav className="sticky top-0 z-50 bg-ivory-light/95 backdrop-blur-sm border-b-2 border-slate-dark">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="font-mono text-xl font-bold text-slate-dark">$cla</span>
            <span className="text-danger-orange text-sm">⚠</span>
          </div>
          <div className="flex items-center gap-6">
            <a href="#products" className="text-sm text-slate-light hover:text-danger-orange transition-colors">products</a>
            <a href="#docs" className="text-sm text-slate-light hover:text-danger-orange transition-colors">docs</a>
            <a href="#victims" className="text-sm text-slate-light hover:text-danger-orange transition-colors">hall of shame</a>
            <button className="btn-secondary text-sm px-4 py-2" onClick={() => setShowWalletModal(true)}>connect wallet</button>
          </div>
        </div>
      </nav>

      {/* hero section */}
      <section className="relative py-24 px-6 overflow-hidden">
        {/* background grid */}
        <div className="absolute inset-0 bg-grid bg-grid opacity-30" />

        <div className="max-w-6xl mx-auto relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* left: terminal */}
            <div className="order-2 lg:order-1">
              <Terminal title="claude-larp">
                <div
                  ref={terminalRef}
                  className="h-[320px] overflow-y-auto overflow-x-hidden scrollbar-hide"
                >
                  <pre className="ascii-art text-danger-orange mb-6">{ASCII_LOGO}</pre>
                  <div className="space-y-1">
                    {/* Command line */}
                    {visibleLines >= 1 && (
                      <div className="flex items-start gap-2">
                        <span className="terminal-prompt text-ivory-light/90">
                          {TERMINAL_VARIATIONS[currentVariation].command}
                        </span>
                      </div>
                    )}
                    {/* Empty line */}
                    {visibleLines >= 2 && <div>&nbsp;</div>}
                    {/* Success/error lines */}
                    {TERMINAL_VARIATIONS[currentVariation].lines.map((line, i) => (
                      visibleLines >= i + 3 && (
                        <div key={i} className="flex items-start gap-2">
                          {line.type === 'success' && (
                            <span className="text-larp-green">{line.content}</span>
                          )}
                          {line.type === 'error' && (
                            <span className="text-larp-red">{line.content}</span>
                          )}
                        </div>
                      )
                    ))}
                    {/* Info line */}
                    {visibleLines >= 7 && (
                      <div className="flex items-start gap-2 mt-2">
                        <span className="text-danger-orange flicker">
                          {TERMINAL_VARIATIONS[currentVariation].info}
                        </span>
                      </div>
                    )}
                    {/* Blinking cursor */}
                    <span className="inline-block w-3 h-5 bg-danger-orange animate-blink" />
                  </div>
                </div>
              </Terminal>
            </div>

            {/* right: hero copy */}
            <div className="order-1 lg:order-2 text-center lg:text-left">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-dark leading-tight mb-6 font-display">
                claude larp agent
              </h1>

              <p className="text-xl md:text-2xl text-slate-light mb-4">
                "i'll build your revolutionary infrastructure"
              </p>
              <p className="text-lg text-danger-orange font-mono mb-8 font-bold">
                (lmao no)
              </p>

              <p className="text-slate-light mb-8 max-w-md">
                chatgpt wrapper + cron job + vc money = "ai agent."
                you bought the top. again. absolute clown behavior.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-8">
                <div className="relative">
                  <button className="btn-primary relative overflow-hidden group" onClick={(e) => {
                    const btn = e.currentTarget;
                    btn.classList.add('animate-[glitch_0.05s_ease-in-out_5]');
                    setTimeout(() => btn.classList.remove('animate-[glitch_0.05s_ease-in-out_5]'), 300);
                    setShowSmoke(true);
                    setTimeout(() => setShowSmoke(false), 800);
                  }}>
                    <span className="group-active:opacity-0 transition-opacity">view roadmap</span>
                    <span className="absolute inset-0 flex items-center justify-center opacity-0 group-active:opacity-100 text-black font-mono text-xs tracking-widest">░░░░░░░</span>
                  </button>
                  {showSmoke && (
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                      <span className="absolute smoke-particle smoke-1 text-slate-dark/70 font-mono text-sm">░░</span>
                      <span className="absolute smoke-particle smoke-2 text-slate-dark/60 font-mono text-xs">░░░</span>
                      <span className="absolute smoke-particle smoke-3 text-danger-orange/50 font-mono text-sm">░</span>
                      <span className="absolute smoke-particle smoke-4 text-slate-dark/50 font-mono text-xs">░░</span>
                      <span className="absolute smoke-particle smoke-5 text-danger-orange/40 font-mono text-lg">░</span>
                      <span className="absolute smoke-particle smoke-6 text-slate-dark/60 font-mono text-xs">░░░</span>
                      <span className="absolute smoke-particle smoke-7 text-slate-dark/50 font-mono text-sm">░░</span>
                    </div>
                  )}
                </div>
                <button className="btn-secondary opacity-50 cursor-not-allowed">
                  get started (never)
                </button>
              </div>

              <div className="font-mono text-sm text-slate-light">
                <span className="text-cloud-medium">ca:</span>{' '}
                <span className="text-slate-dark">soon™ (unlike your "infra")</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* stats section */}
      <section className="py-16 px-6 bg-slate-dark text-ivory-light border-y-4 border-danger-orange">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { label: 'ai16z market cap', value: '$400m', sublabel: '(for a fucking parody)' },
              { label: 'pump.fun death rate', value: '97%', sublabel: '(you\'re in this stat)' },
              { label: 'goat codebase', value: '0', sublabel: '(zero lines. $300m mc.)' },
              { label: 'zerebro "ml"', value: 'if-else', sublabel: '($180m. literally if-else.)' },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-3xl md:text-4xl font-mono font-bold text-danger-orange mb-1">
                  {stat.value}
                </div>
                <div className="text-sm font-medium text-ivory-light">{stat.label}</div>
                <div className="text-xs text-ivory-light/50">{stat.sublabel}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* products section */}
      <section id="products" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-dark mb-4 font-display">
              products that don't exist
            </h2>
            <p className="text-slate-light max-w-2xl mx-auto">
              same as everything else you've aped into.
              at least these names slap harder than your -90% bags.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {PRODUCTS.map((product, i) => (
              <ProductCard
                key={i}
                {...product}
                delay={i * 150}
              />
            ))}
          </div>
        </div>
      </section>

      {/* mascot section */}
      <section className="py-24 px-6 bg-slate-dark text-ivory-light overflow-hidden relative">
        <div className="construction-stripe h-1 absolute top-0 left-0 right-0" />
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="badge badge-error mb-6">the mascot</span>
              <h2 className="text-3xl md:text-4xl font-bold mb-6 font-display">
                meet <span className="text-danger-orange">clawd</span>
              </h2>
              <p className="text-ivory-light/70 mb-6">
                broken, confused, perpetually under construction.
                still outperforming your portfolio.
              </p>
              <ul className="space-y-3 mb-8">
                {[
                  'shipped exactly as much as ai16z (nothing)',
                  'virtuals "on-chain agents" = aws + cope',
                  'arc framework: "few if any independent builders"',
                  'empty repo. full send. ngmi.',
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-ivory-light/80">
                    <span className="text-danger-orange">▸</span>
                    {item}
                  </li>
                ))}
              </ul>
              <button className="btn-outline">read whitepaper (it's blank)</button>
            </div>
            <div className="flex justify-center">
              <Mascot />
            </div>
          </div>
        </div>
        <div className="construction-stripe h-1 absolute bottom-0 left-0 right-0" />
      </section>

      {/* documentation section */}
      <section id="docs" className="py-24 px-6">
        <DocsSection />
      </section>

      {/* roadmap section */}
      <section id="victims" className="py-24 px-6 bg-ivory-medium border-y-2 border-slate-dark">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <span className="badge badge-error mb-4">roadmap</span>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-dark mb-4 font-display">
              roadmap to absolutely nothing
            </h2>
            <p className="text-slate-light">
              still more detailed than whatever you're bagholding.
            </p>
          </div>

          <div className="space-y-6">
            {[
              { phase: 'q1 2025', title: 'genesis (theft)', items: ['ctrl+c ai16z. call it innovation.', 'change 3 colors. "original vision."', '"stealth mode" = nothing exists'], status: 'complete' },
              { phase: 'q2 2025', title: 'grift escalation', items: ['tweet "gm" until brain damage', 'spaces with fellow scammers', '"ecosystem" = telegram group'], status: 'current' },
              { phase: 'q3 2025', title: 'hopium distribution', items: ['"big news soon" (nothing)', 'rebrand after getting called out', 'community call (mute the fud)'], status: 'upcoming' },
              { phase: 'q∞', title: 'ship anything', items: ['lmfao', 'absolutely not', 'you\'ll ape anyway'], status: 'never' },
            ].map((phase, i) => (
              <div
                key={i}
                className={`p-6 border-2 ${
                  phase.status === 'complete'
                    ? 'bg-larp-green/5 border-larp-green'
                    : phase.status === 'current'
                    ? 'bg-danger-orange/5 border-danger-orange'
                    : phase.status === 'never'
                    ? 'bg-larp-red/5 border-larp-red'
                    : 'bg-ivory-light border-slate-dark'
                }`}
                style={{ boxShadow: '4px 4px 0 var(--slate-dark)' }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <span className="text-xs font-mono text-slate-light">{phase.phase}</span>
                    <h3 className="text-xl font-bold text-slate-dark">{phase.title}</h3>
                  </div>
                  <Badge
                    variant={
                      phase.status === 'complete' ? 'success' :
                      phase.status === 'current' ? 'warning' :
                      phase.status === 'never' ? 'error' : 'default'
                    }
                  >
                    {phase.status === 'complete' ? 'done' :
                     phase.status === 'current' ? 'larping' :
                     phase.status === 'never' ? 'never' : 'copium'}
                  </Badge>
                </div>
                <ul className="space-y-2">
                  {phase.items.map((item, j) => (
                    <li key={j} className="flex items-center gap-2 text-slate-light">
                      <span className={
                        phase.status === 'complete' ? 'text-larp-green' :
                        phase.status === 'never' ? 'text-larp-red' : 'text-cloud-medium'
                      }>
                        {phase.status === 'complete' ? '✓' : phase.status === 'never' ? '✗' : '○'}
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
                {phase.status === 'current' && (
                  <div className="mt-4">
                    <ProgressBar progress={99} label="progress (perpetually stuck)" showPercent />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* cta section */}
      <section className="py-24 px-6 relative">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-dark mb-6 font-display">
            ngmi
          </h2>
          <p className="text-xl text-slate-light mb-4">
            claude + cron job + vc money = "ai agent"
          </p>
          <p className="text-lg text-danger-orange mb-8 font-mono font-bold">
            you know it. you'll ape anyway. clown.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="btn-primary">
              ape in (ngmi)
            </button>
            <button className="btn-secondary">
              follow the cope
            </button>
          </div>
        </div>
      </section>

      <Footer />

      {/* wallet modal */}
      {showWalletModal && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center"
          onClick={() => setShowWalletModal(false)}
        >
          {/* backdrop */}
          <div className="absolute inset-0 bg-slate-dark/90 backdrop-blur-sm" />

          {/* modal */}
          <div
            className="relative bg-ivory-light border-4 border-danger-orange p-8 max-w-md w-full mx-4 animate-[glitch_0.1s_ease-in-out_3]"
            style={{ boxShadow: '8px 8px 0 #0a0a09, 12px 12px 0 #FF6B35' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* danger stripe top */}
            <div className="construction-stripe h-2 absolute -top-2 left-0 right-0" />

            {/* close button */}
            <button
              className="absolute -top-4 -right-4 w-10 h-10 bg-larp-red text-black font-mono font-bold text-xl flex items-center justify-center border-2 border-black hover:bg-danger-orange transition-colors"
              style={{ boxShadow: '3px 3px 0 black' }}
              onClick={() => setShowWalletModal(false)}
            >
              ✗
            </button>

            {/* content */}
            <div className="text-center">
              <div className="text-5xl mb-4 font-mono text-danger-orange font-bold">?!</div>
              <h3 className="text-4xl md:text-5xl font-bold text-slate-dark mb-4 font-mono">
                seriously?
              </h3>
              <p className="text-slate-light mb-6 font-mono text-sm">
                you saw all this and still tried to connect?
              </p>
              <div className="space-y-3">
                <button
                  className="w-full btn-primary"
                  onClick={() => setShowWalletModal(false)}
                >
                  close
                </button>
                <p className="text-xs text-slate-light/60 font-mono">
                  there's nothing to connect to. go outside.
                </p>
              </div>
            </div>

            {/* danger stripe bottom */}
            <div className="construction-stripe h-2 absolute -bottom-2 left-0 right-0" />
          </div>
        </div>
      )}
    </main>
  );
}
