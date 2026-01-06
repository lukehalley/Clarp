'use client';

import { useState, useEffect } from 'react';
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
    tagline: 'the ide for shipping absolutely nothing',
    description: 'auto-generates "coming soon" pages. literally what 97% of pump.fun projects use before dying in 24 hours. you\'ll fit right in.',
    features: ['readme-only mode', '// TODO injection', 'private repo until rug'],
    progress: 99,
    status: 'coming-soon' as const,
  },
  {
    name: 'larpscan',
    tagline: 'exposes the bullshit you fell for',
    description: 'scans "ai agent" repos for actual code. spoiler: there isn\'t any. zerebro\'s $180m "trading agent" was if-else. you bought that.',
    features: ['detects code (lol)', 'bundle % scanner', 'rug probability: yes'],
    progress: 73,
    status: 'development' as const,
  },
  {
    name: 'cla x402',
    tagline: 'invoice for vaporware',
    description: '"interesting plumbing, nowhere near production" - actual devs on x402. but vcs don\'t read code, they read pitch decks.',
    features: ['vaporware invoicing', 'milestone theater', '"directionally real"'],
    progress: 47,
    status: 'roadmap' as const,
  },
];

const TERMINAL_LINES = [
  { type: 'command', content: 'claude-larp generate --revolutionary-infrastructure' },
  { type: 'output', content: '' },
  { type: 'success', content: '✓ copied chatgpt api wrapper' },
  { type: 'success', content: '✓ added "autonomous" to readme 47 times' },
  { type: 'success', content: '✓ bundled 80% supply to insider wallets' },
  { type: 'error', content: '✗ wrote a single fucking line of real code' },
  { type: 'output', content: '' },
  { type: 'info', content: 'shipping nothing... $50m fdv incoming' },
];

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [visibleLines, setVisibleLines] = useState(0);

  useEffect(() => {
    setMounted(true);
    const interval = setInterval(() => {
      setVisibleLines((prev) => {
        if (prev >= TERMINAL_LINES.length) {
          clearInterval(interval);
          return prev;
        }
        return prev + 1;
      });
    }, 400);
    return () => clearInterval(interval);
  }, []);

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
            <button className="btn-secondary text-sm px-4 py-2">connect wallet</button>
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
                <pre className="ascii-art text-danger-orange mb-6">{ASCII_LOGO}</pre>
                <div className="space-y-1">
                  {TERMINAL_LINES.slice(0, visibleLines).map((line, i) => (
                    <div key={i} className="flex items-start gap-2">
                      {line.type === 'command' && (
                        <span className="terminal-prompt text-ivory-light/90">{line.content}</span>
                      )}
                      {line.type === 'success' && (
                        <span className="text-larp-green">{line.content}</span>
                      )}
                      {line.type === 'error' && (
                        <span className="text-larp-red">{line.content}</span>
                      )}
                      {line.type === 'info' && (
                        <span className="text-danger-orange flicker">{line.content}</span>
                      )}
                      {line.type === 'output' && <span>&nbsp;</span>}
                    </div>
                  ))}
                  {visibleLines >= TERMINAL_LINES.length && (
                    <span className="inline-block w-3 h-5 bg-danger-orange animate-blink" />
                  )}
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
                (i fucking won't)
              </p>

              <p className="text-slate-light mb-8 max-w-md">
                the only ai agent honest about what ai agents actually do:
                wrap chatgpt, post cringe, and rug retail.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-8">
                <button className="btn-primary">view roadmap (lol)</button>
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
              { label: 'ai16z market cap', value: '$400m', sublabel: '(vcs are fucking idiots)' },
              { label: 'pump.fun death rate', value: '97%', sublabel: '(skill issue, ngmi)' },
              { label: 'goat\'s codebase', value: 'lmao', sublabel: '(tweets = $300m apparently)' },
              { label: 'zerebro\'s "ml"', value: 'if-else', sublabel: '(cope harder nerds)' },
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
            <span className="badge badge-error mb-4">⚠ vaporware suite</span>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-dark mb-4 font-display">
              products that don't exist
            </h2>
            <p className="text-slate-light max-w-2xl mx-auto">
              just like every other "ai infrastructure" in your portfolio.
              difference is we're not lying about it.
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
                more honest than anything in your portfolio.
              </p>
              <ul className="space-y-3 mb-8">
                {[
                  'shipped exactly as much as ai16z\'s "$400m fund" (nothing)',
                  'virtuals\' "on-chain agents" crash when aws goes down lmao',
                  'arc framework has "few if any independent builders" - go check',
                  'we admit the repo is empty. they won\'t.',
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
              the path to absolutely fucking nothing
            </h2>
            <p className="text-slate-light">
              more detailed than most "ai agent" roadmaps. and equally meaningless.
            </p>
          </div>

          <div className="space-y-6">
            {[
              { phase: 'q1 2025', title: 'genesis (theft)', items: ['ctrl+c ai16z\'s entire approach', 'change 3 colors, call it original', 'announce "stealth mode" (we have nothing)'], status: 'complete' },
              { phase: 'q2 2025', title: 'the grift continues', items: ['tweet "gm" 47 times', 'spaces with other grifters (cross-promo)', '"ecosystem" = new telegram group'], status: 'current' },
              { phase: 'q3 2025', title: 'hopium distribution', items: ['anon tweets "big news soon"', 'rebrand when called out', 'community call (mute everyone)'], status: 'upcoming' },
              { phase: 'q∞', title: 'ship literally anything', items: ['hahahaha', 'no seriously never', 'buy anyway lmao'], status: 'never' },
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
            stop coping. start admitting.
          </h2>
          <p className="text-xl text-slate-light mb-4">
            every "ai agent" is just claude with a cron job and venture funding.
          </p>
          <p className="text-lg text-danger-orange mb-8 font-mono font-bold">
            we're the only ones not lying to your face about it.
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
    </main>
  );
}
