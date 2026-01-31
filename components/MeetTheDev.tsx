'use client';

import { useState } from 'react';

const DEV_FACTS = [
  { label: 'EXPERIENCE', value: '13+ years' },
  { label: 'STACK', value: 'cloud / devops / full-stack' },
  { label: 'STATUS', value: 'doxxed' },
  { label: 'CLARP', value: 'nights & weekends' },
];

const SIDE_PROJECTS = [
  'production crypto arbitrage system — 10+ microservices on AWS',
  'multi-pool price history platform',
  'full-stack platform connecting service providers across australia',
];

export default function MeetTheDev() {
  const [hoveredFact, setHoveredFact] = useState<number | null>(null);

  return (
    <section className="py-16 sm:py-24 px-4 sm:px-6 overflow-hidden bg-slate-dark">
      <div className="max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Left: Dev info */}
          <div className="text-center lg:text-left">
            <span className="badge badge-warning mb-4 sm:mb-6">doxxed dev</span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-ivory-light mb-4 sm:mb-6 font-display">
              meet the dev behind <span className="text-danger-orange">$CLARP</span>
            </h2>
            <p className="text-lg sm:text-xl text-ivory-light/90 mb-2">
              most projects hide behind anon devs and discord mods.
            </p>
            <div className="w-32 sm:w-48 h-1 bg-danger-orange mb-6 mx-auto lg:mx-0" />
            <p className="text-base sm:text-lg text-ivory-light/70 mb-6 sm:mb-8 max-w-md mx-auto lg:mx-0">
              luke halley. full-time cloud & devops engineer by day. 13+ years shipping production infrastructure at enterprise scale. AWS certified. CLARP is the nights-and-weekends project that won&apos;t leave his brain alone.
            </p>
            <ul className="space-y-2 sm:space-y-3 mb-6 sm:mb-8 text-left max-w-md mx-auto lg:mx-0">
              {[
                'moved from ireland to australia. CS degree, first class honours.',
                'been building production systems before most memecoins existed.',
                'watched people get rugged. the data to spot it was always free. nobody was stitching it together.',
                'so he built the thing. ships weekly between the day job and sleep.',
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2 sm:gap-3 text-sm sm:text-base text-ivory-light/80">
                  <span className="text-danger-orange shrink-0">▸</span>
                  {item}
                </li>
              ))}
            </ul>
            <a
              href="https://lukehalley.com"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-outline text-sm sm:text-base inline-flex items-center gap-2"
            >
              verify the dev
              <span>↗</span>
            </a>
          </div>

          {/* Right: Dev card */}
          <div className="flex justify-center order-first lg:order-last">
            <div
              className="relative bg-ivory-light border-2 sm:border-3 border-slate-dark w-full max-w-sm"
              style={{ boxShadow: '4px 4px 0 #0a0a09' }}
            >
              {/* Card header */}
              <div className="bg-slate-dark px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
                <p className="text-ivory-light font-mono text-sm sm:text-base">DEV PROFILE</p>
                <span className="inline-block bg-danger-orange text-black font-mono text-xs px-3 py-1 font-bold">
                  DOXXED
                </span>
              </div>

              {/* Card content */}
              <div className="p-4 sm:p-6 space-y-4">
                <div>
                  <p className="text-slate-light font-mono text-xs mb-1">IDENTITY:</p>
                  <p className="text-slate-dark font-mono text-lg font-bold">luke halley</p>
                </div>

                <div className="border-t border-dashed border-slate-light/30" />

                {/* Stats */}
                <div className="space-y-3">
                  {DEV_FACTS.map((fact, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between cursor-default transition-colors"
                      onMouseEnter={() => setHoveredFact(i)}
                      onMouseLeave={() => setHoveredFact(null)}
                    >
                      <span className="font-mono text-xs text-slate-light">{fact.label}:</span>
                      <span className={`font-mono text-sm font-bold transition-colors ${hoveredFact === i ? 'text-danger-orange' : 'text-slate-dark'}`}>
                        {fact.value}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="border-t border-dashed border-slate-light/30" />

                {/* Previous builds */}
                <div>
                  <p className="text-slate-light font-mono text-xs mb-2">PREVIOUS BUILDS:</p>
                  <ul className="space-y-2">
                    {SIDE_PROJECTS.map((project, i) => (
                      <li key={i} className="flex items-start gap-2 text-slate-dark font-mono text-xs">
                        <span className="text-danger-orange shrink-0 mt-0.5">▸</span>
                        <span>{project}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="border-t border-dashed border-slate-light/30" />

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-light font-mono text-xs mb-1">RUG RISK:</p>
                    <span className="inline-block bg-larp-green text-black font-mono text-xs px-3 py-1 font-bold">
                      DOXXED & BUILDING
                    </span>
                  </div>
                  <span className="text-larp-green text-3xl">✓</span>
                </div>

                <p className="text-slate-light/60 font-mono text-[10px] text-center pt-2">
                  lukehalley.com — verify for yourself
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
