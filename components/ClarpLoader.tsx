'use client';

/**
 * ClarpLoader — Animated CLARP mascot loader.
 *
 * Uses the exact mascot silhouette from marketing-assets/twitter-pfp.svg.
 * The terracotta eye holes move left/right, blink twice, and ears perk.
 *
 * Variants:
 *  - "dark"  (default): black body, terracotta eyes — for light/terracotta backgrounds
 *  - "light": terracotta/orange body, dark eyes — for dark/black backgrounds
 */

interface ClarpLoaderProps {
  /** Pixel width of the loader. Height scales proportionally. */
  size?: number;
  /** Optional label shown below the mascot */
  label?: string;
  /** Color variant. "dark" = black body (default), "light" = orange body for dark backgrounds */
  variant?: 'dark' | 'light';
  className?: string;
}

const COLORS = {
  dark: { body: '#0a0a09', eye: '#D97757' },
  light: { body: '#D97757', eye: '#0a0a09' },
} as const;

export default function ClarpLoader({ size = 64, label, variant = 'dark', className = '' }: ClarpLoaderProps) {
  // Cropped viewBox from the original 400x400 SVG:
  // x: 32 (left ear) to 368 (right ear end) → width 336
  // y: 68 (body top) to 332 (leg bottom)   → height 264
  const vw = 336;
  const vh = 264;
  const { body, eye } = COLORS[variant];

  return (
    <div className={`flex flex-col items-center gap-3 ${className}`}>
      <svg
        width={size}
        height={size * (vh / vw)}
        viewBox={`32 68 ${vw} ${vh}`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="Loading"
        role="img"
      >
        {/* ---- Exact mascot shapes from twitter-pfp.svg ---- */}

        {/* Body void */}
        <rect x="60" y="68" width="280" height="168" fill={body} />

        {/* Left ear void */}
        <rect className="clarp-ear" x="32" y="104" width="28" height="42" fill={body} />

        {/* Right ear void */}
        <rect className="clarp-ear" x="340" y="104" width="28" height="42" fill={body} />

        {/* Left eye — the whole hole moves */}
        <rect className="clarp-eye" x="116" y="124" width="42" height="70" fill={eye} />

        {/* Right eye — the whole hole moves */}
        <rect className="clarp-eye" x="242" y="124" width="42" height="70" fill={eye} />

        {/* Left leg void */}
        <rect x="74" y="236" width="56" height="96" fill={body} />

        {/* Middle-left leg void */}
        <rect x="158" y="236" width="42" height="96" fill={body} />

        {/* Middle-right leg void */}
        <rect x="200" y="236" width="42" height="96" fill={body} />

        {/* Right leg void */}
        <rect x="270" y="236" width="56" height="96" fill={body} />

        <style>{`
          .clarp-eye {
            transform-box: fill-box;
            transform-origin: center center;
            animation: clarp-look 4.8s ease-in-out infinite;
          }

          @keyframes clarp-look {
            /* center */
            0%, 4% { transform: translateX(0) scaleY(1); }
            /* move left */
            8% { transform: translateX(-10px) scaleY(1); }
            /* hold left */
            16% { transform: translateX(-10px) scaleY(1); }
            /* back to center */
            22% { transform: translateX(0) scaleY(1); }
            /* hold center */
            26% { transform: translateX(0) scaleY(1); }
            /* move right */
            30% { transform: translateX(10px) scaleY(1); }
            /* hold right */
            38% { transform: translateX(10px) scaleY(1); }
            /* back to center */
            44% { transform: translateX(0) scaleY(1); }
            /* hold before blink 1 */
            50% { transform: translateX(0) scaleY(1); }
            /* blink 1 close */
            54% { transform: translateX(0) scaleY(0.08); }
            /* blink 1 open */
            58% { transform: translateX(0) scaleY(1); }
            /* pause */
            62% { transform: translateX(0) scaleY(1); }
            /* blink 2 close */
            66% { transform: translateX(0) scaleY(0.08); }
            /* blink 2 open */
            70% { transform: translateX(0) scaleY(1); }
            /* idle to end */
            100% { transform: translateX(0) scaleY(1); }
          }

          .clarp-ear {
            transform-box: fill-box;
            transform-origin: center bottom;
            animation: clarp-ear 4.8s ease-in-out infinite;
          }

          @keyframes clarp-ear {
            0%, 48% { transform: translateY(0); }
            /* perk up with blink 1 */
            52% { transform: translateY(-6px); }
            56% { transform: translateY(0); }
            /* perk up with blink 2 */
            64% { transform: translateY(-6px); }
            68% { transform: translateY(0); }
            100% { transform: translateY(0); }
          }
        `}</style>
      </svg>

      {label && (
        <span className="font-mono text-xs text-ivory-light/40 animate-pulse">
          {label}
        </span>
      )}
    </div>
  );
}
