'use client';

export default function Footer() {
  return (
    <footer className="bg-slate-dark text-ivory-light">
      {/* Construction stripe */}
      <div className="construction-stripe h-1" />

      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="font-mono text-2xl font-bold mb-4">
              <span className="text-danger-orange">$</span>cla
            </div>
            <p className="text-ivory-light/60 mb-6 max-w-sm">
              the only ai agent honest about being bullshit.
              a middle finger to the vaporware industrial complex.
            </p>
            <div className="flex gap-4">
              <a
                href="#"
                className="w-10 h-10 bg-slate-medium flex items-center justify-center text-ivory-light/60 hover:text-danger-orange hover:bg-slate-light/20 transition-colors border border-slate-light/20"
              >
                <span className="text-lg">𝕏</span>
              </a>
              <a
                href="#"
                className="w-10 h-10 bg-slate-medium flex items-center justify-center text-ivory-light/60 hover:text-danger-orange hover:bg-slate-light/20 transition-colors border border-slate-light/20"
              >
                <span className="text-lg">◆</span>
              </a>
              <a
                href="#"
                className="w-10 h-10 bg-slate-medium flex items-center justify-center text-ivory-light/60 hover:text-danger-orange hover:bg-slate-light/20 transition-colors border border-slate-light/20"
              >
                <span className="text-lg">⌘</span>
              </a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-mono text-sm text-danger-orange mb-4">vaporware</h4>
            <ul className="space-y-3">
              {[
                { name: 'cla terminal', note: 'never' },
                { name: 'larpscan', note: 'lol no' },
                { name: 'cla x402', note: 'cope' },
                { name: 'larp academy', note: 'youtube exists' },
              ].map(item => (
                <li key={item.name}>
                  <a
                    href="#"
                    className="text-sm text-ivory-light/60 hover:text-ivory-light transition-colors flex items-center gap-2"
                  >
                    {item.name}
                    <span className="text-[10px] text-larp-red">({item.note})</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-mono text-sm text-danger-orange mb-4">honesty</h4>
            <ul className="space-y-3">
              {[
                { label: 'docs', note: 'you\'re looking at it' },
                { label: 'whitepaper', note: 'blank like ai16z\'s' },
                { label: 'github', note: 'empty like goat\'s' },
                { label: 'audit', note: '"gpt said it\'s fine"' },
              ].map(item => (
                <li key={item.label}>
                  <a
                    href="#"
                    className="text-sm text-ivory-light/60 hover:text-ivory-light transition-colors flex items-center gap-2"
                  >
                    {item.label}
                    <span className="text-[10px] text-slate-light">({item.note})</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="pt-8 border-t border-slate-light/20">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs text-ivory-light/40 text-center md:text-left">
              © 2025 claude larp agent. no rights reserved. it's a shitpost.
            </p>
            <p className="text-xs text-ivory-light/40 font-mono">
              <span className="text-larp-red">⚠</span> not financial advice. don't buy this. you'll lose it all anyway.
            </p>
          </div>
        </div>

        {/* Easter egg */}
        <div className="mt-12 text-center">
          <pre className="inline-block text-[8px] text-ivory-light/20 font-mono leading-tight">
{`
    ╭───────────────────────────────────────╮
    │  you scrolled all the way down?       │
    │  just like checking "ai agent" repos  │
    │  and finding nothing but readmes.     │
    │                                       │
    │  wagmi                                │
    │  (we're absolutely fucking not)       │
    ╰───────────────────────────────────────╯
`}
          </pre>
        </div>
      </div>
    </footer>
  );
}
