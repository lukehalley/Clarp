'use client';

export default function Mascot() {
  return (
    <div className="relative">
      {/* Glow effect */}
      <div className="absolute inset-0 blur-3xl bg-larp-red/20 rounded-full" />

      {/* Mascot container */}
      <div className="relative animate-float">
        {/* ASCII Clawd mascot - broken, angry, honest */}
        <pre className="font-mono text-clay text-xs leading-tight select-none">
{`
        ┌─────────────────────────┐
        │    × SCAM DETECTED ×   │
        │   (just like yours)     │
        └─────────────────────────┘
                    │
                    ▼
             ╭────────────╮
            ╱  ×      ×    ╲
           │    (broken)    │
           │                │
           │   > WAGMI <    │
            ╲   (lies)    ╱
             ╰──┬────┬──╯
                │    │
             ╭──╯    ╰──╮
             │  404:    │
             │  CODE    │
             │  NOT     │
             │  FOUND   │
             ▼          ▼
            ███        ███
           (bundled)  (rugged)

          C  L  A  W  D
      ═══════════════════════
        "Shipped exactly as
         much as your bags"
`}
        </pre>

        {/* Glitch overlay - more aggressive */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-0 right-0 h-0.5 bg-larp-red/50 animate-pulse" />
          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-larp-red/30 animate-pulse" style={{ animationDelay: '0.3s' }} />
          <div className="absolute top-3/4 left-0 right-0 h-0.5 bg-clay/40 animate-pulse" style={{ animationDelay: '0.6s' }} />
        </div>
      </div>

      {/* Warning barriers */}
      <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 flex gap-1">
        {[...Array(7)].map((_, i) => (
          <div
            key={i}
            className="w-3 h-5 construction-stripe rounded-sm opacity-90"
          />
        ))}
      </div>
    </div>
  );
}
