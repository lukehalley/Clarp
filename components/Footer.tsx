'use client';

import { useState } from 'react';

const LINK_MESSAGES = [
  'this feature is coming. check the roadmap.',
  'building. check the roadmap.',
  'CLARP spots LARP. soon you will too.',
  'scanning for rugs...',
  'token gate shipping soon.',
  'staking program in development.',
  'trust intelligence loading...',
  'rebrand detection: coming soon',
];

export default function Footer() {
  const [clickedLink, setClickedLink] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [copyrightClicks, setCopyrightClicks] = useState(0);

  const handleLinkClick = (e: React.MouseEvent, linkName: string) => {
    e.preventDefault();
    const msg = LINK_MESSAGES[Math.floor(Math.random() * LINK_MESSAGES.length)];
    setMessage(msg);
    setClickedLink(linkName);
    setTimeout(() => setClickedLink(null), 2000);
  };

  const handleCopyrightClick = () => {
    setCopyrightClicks(prev => prev + 1);
  };

  const getCopyrightText = () => {
    if (copyrightClicks >= 10) return '© 2025 clarp. you clicked the copyright 10 times. seek help.';
    if (copyrightClicks >= 5) return '© 2025 clarp. stop clicking this.';
    if (copyrightClicks >= 3) return '© 2025 clarp. why are you clicking the copyright?';
    if (copyrightClicks >= 1) return '© 2025 clarp. yes, you clicked the copyright.';
    return '© 2025 clarp. all rights reserved.';
  };

  return (
    <footer className="bg-slate-dark text-ivory-light">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-12 mb-8 sm:mb-12 items-start">
          {/* Brand */}
          <div className="sm:col-span-2">
            <div className="font-mono text-xl sm:text-2xl font-bold mb-3 sm:mb-4">
              <span className="text-danger-orange">$</span>clarp
            </div>
            <p className="text-sm sm:text-base text-ivory-light/60 mb-4 sm:mb-6 max-w-sm">
              trust intelligence for crypto. scan projects. scan people.
            </p>
            <div className="flex gap-3 sm:gap-4">
              <a
                href="https://x.com/i/communities/2013904367188132011"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-slate-medium flex items-center justify-center text-ivory-light/60 hover:text-danger-orange hover:bg-slate-light/20 transition-colors border border-slate-light/20"
                title="x community"
              >
                <span className="text-lg">𝕏</span>
              </a>
              <a
                href="https://t.me/CLARPTG"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-slate-medium flex items-center justify-center text-ivory-light/60 hover:text-danger-orange hover:bg-slate-light/20 transition-colors border border-slate-light/20"
                title="telegram"
              >
                <span className="text-lg">✈</span>
              </a>
              <a
                href="https://github.com/lukehalley/Clarp"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-slate-medium flex items-center justify-center text-ivory-light/60 hover:text-danger-orange hover:bg-slate-light/20 transition-colors border border-slate-light/20"
                title="github"
              >
                <span className="text-lg">◈</span>
              </a>
              <a
                href="https://dexscreener.com/solana/6c71mun334bafcuvn3cwajfqnk6skztzk9vfzrthstwj"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-slate-medium flex items-center justify-center text-ivory-light/60 hover:text-danger-orange hover:bg-slate-light/20 transition-colors border border-slate-light/20"
                title="dexscreener"
              >
                <img src="/dexscreener-icon.svg" alt="dexscreener" className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Links - two columns that should align */}
          <div className="h-full">
            <h4 className="font-mono text-xs sm:text-sm text-danger-orange mb-3 sm:mb-4 h-5">coming soon</h4>
            <ul className="space-y-2 sm:space-y-3">
              {[
                { name: 'token-gated access', note: 'building' },
                { name: 'daily CLARP burn', note: 'building' },
                { name: 'staking program', note: 'planned' },
                { name: 'rebrand detector', note: 'planned' },
              ].map(item => (
                <li key={item.name} className="min-h-[24px] flex items-center">
                  <button
                    onClick={(e) => handleLinkClick(e, item.name)}
                    className={`text-sm text-left transition-colors flex items-center gap-2 ${
                      clickedLink === item.name ? 'text-danger-orange' : 'text-ivory-light/60 hover:text-ivory-light'
                    }`}
                  >
                    {clickedLink === item.name ? '▸ ' : ''}{item.name}
                    <span className="text-[10px] text-danger-orange shrink-0">({item.note})</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="h-full">
            <h4 className="font-mono text-xs sm:text-sm text-danger-orange mb-3 sm:mb-4 h-5">links</h4>
            <ul className="space-y-2 sm:space-y-3">
              {[
                { label: 'terminal', note: 'live', href: '/terminal' },
                { label: 'github', note: 'open source', href: 'https://github.com/lukehalley/Clarp' },
                { label: 'dexscreener', note: '$CLARP', href: 'https://dexscreener.com/solana/6c71mun334bafcuvn3cwajfqnk6skztzk9vfzrthstwj' },
                { label: 'bags.fm', note: 'trade', href: 'https://bags.fm/token/GtwMkjRY8Vi5oGaLaEsd1xnsr3AkZ6ZYBqsG5ipTBAGS' },
              ].map(item => (
                <li key={item.label} className="min-h-[24px] flex items-center">
                  <a
                    href={item.href}
                    target={item.href.startsWith('http') ? '_blank' : undefined}
                    rel={item.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                    className="text-sm text-left transition-colors flex items-center gap-2 text-ivory-light/60 hover:text-danger-orange"
                  >
                    {item.label}
                    <span className="text-[10px] text-larp-green shrink-0">({item.note})</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Message toast - fixed height container to prevent layout shift */}
        <div className="h-[52px] mb-6">
          <div
            className={`p-3 bg-larp-red/10 border border-larp-red/30 text-sm font-mono text-ivory-light/80 transition-all duration-300 ${
              clickedLink ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2 invisible'
            }`}
          >
            <span className="text-larp-red">error:</span> {message}
          </div>
        </div>

        {/* Bottom */}
        <div className="pt-6 sm:pt-8 border-t border-slate-light/20">
          <div className="flex flex-col md:flex-row items-center justify-between gap-3 sm:gap-4">
            <p
              className="text-[10px] sm:text-xs text-ivory-light/40 text-center md:text-left cursor-pointer hover:text-ivory-light/60 transition-colors"
              onClick={handleCopyrightClick}
            >
              {getCopyrightText()}
            </p>
          </div>
        </div>

        {/* Easter egg - hidden on mobile */}
        <div className="mt-8 sm:mt-12 text-center hidden sm:block">
          <pre className="inline-block text-[6px] sm:text-[8px] text-ivory-light/20 font-mono leading-tight hover:text-ivory-light/40 transition-colors cursor-help">
{`
    ╭───────────────────────────────────────╮
    │  you scrolled all the way down?       │
    │  just like checking "ai agent" repos  │
    │  and finding nothing but readmes.     │
    │                                       │
    │  anyway                               │
    │                                       │
    ╰───────────────────────────────────────╯
`}
          </pre>
        </div>
      </div>
    </footer>
  );
}
