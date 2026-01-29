import {
  AbsoluteFill,
  Sequence,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  Easing,
  staticFile,
  Img,
} from 'remotion';
import { Audio } from '@remotion/media';

// ─── Design Tokens ───────────────────────────────────────────────
const c = {
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
};

const mono = '"JetBrains Mono", "SF Mono", "Fira Code", monospace';
const sans = '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, sans-serif';

// ─── Helpers ─────────────────────────────────────────────────────
const staggerSpring = (
  frame: number,
  fps: number,
  index: number,
  config = { damping: 18, stiffness: 180 },
) =>
  spring({
    frame: frame - index * 4,
    fps,
    config,
  });

// Shared macOS window chrome
const WindowChrome = ({ title, accentColor }: { title: string; accentColor?: string }) => (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      padding: '18px 24px',
      backgroundColor: c.surfaceLight,
      gap: 14,
    }}
  >
    <div style={{ display: 'flex', gap: 10 }}>
      <div style={{ width: 16, height: 16, borderRadius: '50%', backgroundColor: '#ff5f57' }} />
      <div style={{ width: 16, height: 16, borderRadius: '50%', backgroundColor: '#febc2e' }} />
      <div style={{ width: 16, height: 16, borderRadius: '50%', backgroundColor: '#28c840' }} />
    </div>
    <div style={{ flex: 1 }} />
    <span style={{ fontFamily: mono, fontSize: 16, color: accentColor || c.slate }}>
      {title}
    </span>
  </div>
);

// ─── Scene 1: Hook — Search bar types query (0–3s) ──────────────
const SearchHook = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Container entrance
  const containerIn = spring({
    frame,
    fps,
    config: { damping: 14, stiffness: 140 },
  });

  // Headline springs
  const headIn = spring({ frame, fps, config: { damping: 16, stiffness: 180 } });
  const subIn = spring({ frame: frame - 8, fps, config: { damping: 18, stiffness: 200 } });

  // Search bar appears
  const searchIn = spring({
    frame: frame - 14,
    fps,
    config: { damping: 12, stiffness: 140 },
  });

  // Type the query into search bar
  const query = '$ZERA';
  const typeStart = 0.25 * fps;
  const typeEnd = 1.05 * fps;
  const typingProgress = interpolate(frame, [typeStart, typeEnd], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const visibleChars = Math.floor(typingProgress * query.length);
  const typed = query.slice(0, visibleChars);

  // Scan button pulse after typing
  const scanReady = typingProgress >= 1;
  const btnPulse = scanReady
    ? interpolate(Math.sin((frame - typeEnd) * 0.15), [-1, 1], [0.95, 1.05])
    : 1;
  const btnGlow = scanReady
    ? interpolate(Math.sin((frame - typeEnd) * 0.12), [-1, 1], [0.2, 0.5])
    : 0;

  // Flash on "enter" at end
  const flashIn = interpolate(frame, [2.5 * fps, 2.7 * fps], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const flashOut = interpolate(frame, [2.7 * fps, 3 * fps], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const flash = flashIn * flashOut;

  // 3D
  const rotY = interpolate(frame, [0, 3 * fps], [4, -3], { extrapolateRight: 'clamp' });
  const floatY = Math.sin(frame * 0.05) * 3;

  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(ellipse at 50% 60%, #4a2a18 0%, #2a1610 35%, ${c.bg} 85%)`,
        justifyContent: 'center',
        alignItems: 'center',
        perspective: 1200,
      }}
    >
      {/* Flash overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundColor: c.terracotta,
          opacity: flash * 0.15,
          zIndex: 10,
        }}
      />

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 50,
          transform: `rotateY(${rotY}deg) translateY(${floatY}px) scale(${containerIn})`,
          transformStyle: 'preserve-3d',
          opacity: containerIn,
        }}
      >
        {/* Headline */}
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              fontFamily: sans,
              fontSize: 82,
              fontWeight: 800,
              color: c.ivory,
              letterSpacing: -2,
              lineHeight: 1.15,
              transform: `translateY(${interpolate(headIn, [0, 1], [24, 0])}px)`,
              opacity: headIn,
            }}
          >
            rug or real?
            <br />
            know before you ape.
          </div>
          <div
            style={{
              fontFamily: mono,
              fontSize: 26,
              color: c.slate,
              marginTop: 18,
              transform: `translateY(${interpolate(subIn, [0, 1], [16, 0])}px)`,
              opacity: subIn,
            }}
          >
            ai-powered research in seconds. not hours.
          </div>
        </div>

        {/* Search bar */}
        <div
          style={{
            transform: `scale(${searchIn}) translateY(${interpolate(searchIn, [0, 1], [20, 0])}px)`,
            opacity: searchIn,
            width: 900,
          }}
        >
          <div
            style={{
              backgroundColor: c.surface,
              border: `2px solid ${scanReady ? c.terracotta : c.slateDim}`,
              borderRadius: 18,
              padding: '22px 28px',
              display: 'flex',
              alignItems: 'center',
              gap: 18,
              boxShadow: scanReady
                ? `0 0 30px ${c.terracotta}30, 0 20px 60px rgba(0,0,0,0.6)`
                : `0 20px 60px rgba(0,0,0,0.6)`,
            }}
          >
            {/* Search icon */}
            <div
              style={{
                fontFamily: mono,
                fontSize: 24,
                color: c.terracotta,
                flexShrink: 0,
              }}
            >
              {'\u{1F50D}'}
            </div>

            {/* Input area */}
            <div style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
              <span
                style={{
                  fontFamily: mono,
                  fontSize: 24,
                  color: visibleChars > 0 ? c.ivory : c.slate,
                }}
              >
                {visibleChars > 0 ? typed : 'token, @handle, or url...'}
              </span>
              {typingProgress < 1 && visibleChars > 0 && (
                <span
                  style={{
                    width: 3,
                    height: 26,
                    backgroundColor: c.terracotta,
                    display: 'inline-block',
                    marginLeft: 2,
                    opacity: Math.sin(frame * 0.3) > 0 ? 1 : 0,
                  }}
                />
              )}
            </div>

            {/* Scan button */}
            <div
              style={{
                fontFamily: mono,
                fontSize: 18,
                fontWeight: 700,
                color: c.bg,
                backgroundColor: scanReady ? c.terracotta : c.slateDim,
                padding: '12px 26px',
                borderRadius: 10,
                transform: `scale(${btnPulse})`,
                boxShadow: scanReady ? `0 0 ${20 * btnGlow}px ${c.terracotta}` : 'none',
                letterSpacing: 0.5,
              }}
            >
              SCAN
            </div>
          </div>

          {/* Input types hint */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              gap: 20,
              marginTop: 16,
              opacity: interpolate(searchIn, [0.5, 1], [0, 0.6], {
                extrapolateLeft: 'clamp',
                extrapolateRight: 'clamp',
              }),
            }}
          >
            {['token address', 'x handle', 'website', 'github url'].map((hint, i) => (
              <span
                key={i}
                style={{
                  fontFamily: mono,
                  fontSize: 15,
                  color: c.slate,
                  padding: '5px 12px',
                  borderRadius: 6,
                  backgroundColor: `${c.slateDim}40`,
                }}
              >
                {hint}
              </span>
            ))}
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ─── Scene 2: OSINT Scan Pipeline (3–7.5s) ──────────────────────
const OsintScanPipeline = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Card entrance
  const cardIn = spring({ frame, fps, config: { damping: 13, stiffness: 110 } });

  // 5-step scanning pipeline (matches actual app)
  const steps = [
    { num: 1, label: 'identifying entity', detail: 'resolving token address...', source: '$ZERA \u{2192} 8avj...wZERA' },
    { num: 2, label: 'gathering osint data', detail: 'querying RugCheck, DexScreener...', source: 'FREE' },
    { num: 3, label: 'discovering social links', detail: 'crawling zeralabs.org, finding socials...', source: 'FREE' },
    { num: 4, label: 'ai analysis', detail: 'grok analyzing @zeralabs activity...', source: 'GROK' },
    { num: 5, label: 'building trust report', detail: 'calculating trust score...', source: '' },
  ];

  // Each step takes ~0.7s, staggered
  const stepDuration = 0.65 * fps;
  const stepStart = 0.3 * fps;

  // Overall progress bar
  const totalProgress = interpolate(
    frame,
    [stepStart, stepStart + steps.length * stepDuration],
    [0, 100],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.quad) },
  );

  // "SCANNING" badge blink
  const scanningDot = Math.sin(frame * 0.2) > 0 ? 1 : 0.3;

  // Corner accent lines
  const cornerSize = 24;
  const cornerThick = 3;

  // Status text at bottom of scan box
  const isComplete = totalProgress >= 99;
  const completeIn = spring({
    frame: frame - (stepStart + steps.length * stepDuration) / 1,
    fps,
    config: { damping: 20, stiffness: 200 },
  });

  // Background color transition: orange → green on complete
  const completeProgress = interpolate(
    totalProgress,
    [85, 100],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
  );

  // Headline springs
  const headIn = spring({ frame, fps, config: { damping: 16, stiffness: 180 } });
  const subIn = spring({ frame: frame - 6, fps, config: { damping: 18, stiffness: 200 } });

  // 3D
  const rotY = interpolate(frame, [0, 4.5 * fps], [-4, 4], { extrapolateRight: 'clamp' });
  const floatY = Math.sin(frame * 0.04) * 5;

  return (
    <AbsoluteFill
      style={{
        justifyContent: 'center',
        alignItems: 'center',
        perspective: 1400,
      }}
    >
      {/* Orange background (fades out) */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `radial-gradient(ellipse at 50% 50%, #4a2005 0%, #2a1408 35%, ${c.bg} 85%)`,
          opacity: 1 - completeProgress,
        }}
      />
      {/* Green background (fades in) */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `radial-gradient(ellipse at 50% 50%, #0a4a1a 0%, #081a0e 35%, ${c.bg} 85%)`,
          opacity: completeProgress,
        }}
      />
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 30,
        }}
      >
        {/* Headline */}
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              fontFamily: sans,
              fontSize: 60,
              fontWeight: 800,
              color: c.ivory,
              letterSpacing: -1.5,
              transform: `translateY(${interpolate(headIn, [0, 1], [24, 0])}px)`,
              opacity: headIn,
            }}
          >
            scanning $ZERA...
          </div>
          <div
            style={{
              fontFamily: mono,
              fontSize: 22,
              color: c.slate,
              marginTop: 10,
              transform: `translateY(${interpolate(subIn, [0, 1], [16, 0])}px)`,
              opacity: subIn,
            }}
          >
            ai does the research. you make the call.
          </div>
        </div>

        <div
          style={{
            transform: `scale(${cardIn}) rotateY(${rotY}deg) translateY(${floatY}px)`,
            transformStyle: 'preserve-3d',
            opacity: cardIn,
            width: 960,
          }}
        >
        {/* Scan container - matches actual app's square scan box */}
        <div
          style={{
            backgroundColor: `${c.surface}dd`,
            border: `2px solid ${isComplete ? c.success : c.dangerOrange}50`,
            borderRadius: 22,
            overflow: 'hidden',
            boxShadow: `0 40px 100px rgba(0,0,0,0.8), 0 0 ${isComplete ? 30 : 20}px ${isComplete ? c.success : c.dangerOrange}15`,
            position: 'relative',
          }}
        >
          {/* Corner accents (top-left, top-right, bottom-left, bottom-right) */}
          {[
            { top: -1, left: -1 },
            { top: -1, right: -1 },
            { bottom: -1, left: -1 },
            { bottom: -1, right: -1 },
          ].map((pos, i) => (
            <div key={i} style={{ position: 'absolute', ...pos, width: cornerSize, height: cornerSize, zIndex: 2 }}>
              <div
                style={{
                  position: 'absolute',
                  [pos.top !== undefined ? 'top' : 'bottom']: 0,
                  [pos.left !== undefined ? 'left' : 'right']: 0,
                  width: cornerSize,
                  height: cornerThick,
                  backgroundColor: isComplete ? c.success : c.dangerOrange,
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  [pos.top !== undefined ? 'top' : 'bottom']: 0,
                  [pos.left !== undefined ? 'left' : 'right']: 0,
                  width: cornerThick,
                  height: cornerSize,
                  backgroundColor: isComplete ? c.success : c.dangerOrange,
                }}
              />
            </div>
          ))}

          {/* Scanline overlay */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: `repeating-linear-gradient(0deg, transparent, transparent 3px, ${c.ivory}02 3px, ${c.ivory}02 4px)`,
              pointerEvents: 'none',
              zIndex: 1,
            }}
          />

          {/* Header */}
          <div
            style={{
              padding: '24px 30px 0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            {/* Status badge */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                fontFamily: mono,
                fontSize: 16,
                fontWeight: 700,
                letterSpacing: 1.5,
                color: isComplete ? c.success : c.dangerOrange,
                textTransform: 'uppercase' as const,
              }}
            >
              <div
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: '50%',
                  backgroundColor: isComplete ? c.success : c.dangerOrange,
                  opacity: isComplete ? 1 : scanningDot,
                }}
              />
              {isComplete ? 'COMPLETE' : 'SCANNING'}
            </div>

            {/* Query */}
            <div
              style={{
                fontFamily: mono,
                fontSize: 20,
                color: c.ivory,
              }}
            >
              <span style={{ color: c.dangerOrange }}>$</span>ZERA
            </div>
          </div>

          {/* Steps */}
          <div style={{ padding: '28px 30px', display: 'flex', flexDirection: 'column', gap: 16 }}>
            {steps.map((step, i) => {
              const sStart = stepStart + i * stepDuration;
              const sEnd = sStart + stepDuration;
              const stepProgress = interpolate(frame, [sStart, sEnd], [0, 1], {
                extrapolateLeft: 'clamp',
                extrapolateRight: 'clamp',
              });
              const isDone = stepProgress >= 0.95;
              const isActive = stepProgress > 0 && !isDone;
              const isPending = stepProgress <= 0;

              // Step box entrance
              const stepIn = spring({
                frame: frame - sStart,
                fps,
                config: { damping: 20, stiffness: 200 },
              });

              return (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 18,
                    opacity: isPending ? 0.3 : interpolate(stepIn, [0, 1], [0.3, 1]),
                  }}
                >
                  {/* Step number box */}
                  <div
                    style={{
                      width: 42,
                      height: 42,
                      borderRadius: 10,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontFamily: mono,
                      fontSize: 18,
                      fontWeight: 700,
                      flexShrink: 0,
                      backgroundColor: isDone
                        ? `${c.success}20`
                        : isActive
                          ? `${c.dangerOrange}20`
                          : `${c.slateDim}40`,
                      color: isDone ? c.success : isActive ? c.dangerOrange : c.slate,
                      border: `1px solid ${isDone ? c.success : isActive ? c.dangerOrange : c.slateDim}40`,
                    }}
                  >
                    {isDone ? '\u2713' : step.num}
                  </div>

                  {/* Step content */}
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        fontFamily: mono,
                        fontSize: 20,
                        color: isDone ? c.ivory : isActive ? c.ivory : c.slate,
                        fontWeight: isActive ? 600 : 400,
                      }}
                    >
                      {step.label}
                    </div>
                    {isActive && (
                      <div
                        style={{
                          fontFamily: mono,
                          fontSize: 15,
                          color: c.dangerOrange,
                          marginTop: 4,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6,
                        }}
                      >
                        <div
                          style={{
                            width: 6,
                            height: 6,
                            borderRadius: '50%',
                            backgroundColor: c.dangerOrange,
                          }}
                        />
                        {step.detail}
                      </div>
                    )}
                    {isDone && step.source && (
                      <div
                        style={{
                          fontFamily: mono,
                          fontSize: 15,
                          color: step.source === 'GROK' ? c.larp : c.slate,
                          marginTop: 3,
                        }}
                      >
                        {step.source === 'GROK' ? (
                          <span>
                            <span style={{ color: c.larp }}>{'\u{2728}'}</span> grok-4-1-fast &middot; x_search
                          </span>
                        ) : step.source === 'FREE' ? (
                          <span style={{ color: c.success }}>{'\u2713'} free osint sources</span>
                        ) : (
                          step.source
                        )}
                      </div>
                    )}
                  </div>

                  {/* Right indicator */}
                  {isDone && (
                    <span style={{ fontFamily: mono, fontSize: 15, color: c.success }}>done</span>
                  )}
                  {isActive && (
                    <div
                      style={{
                        width: 22,
                        height: 22,
                        borderRadius: '50%',
                        border: `2px solid ${c.dangerOrange}`,
                        borderTopColor: 'transparent',
                        transform: `rotate(${frame * 8}deg)`,
                      }}
                    />
                  )}
                </div>
              );
            })}

            {/* Progress bar */}
            <div
              style={{
                height: 5,
                backgroundColor: `${c.slate}25`,
                borderRadius: 3,
                overflow: 'hidden',
                marginTop: 10,
              }}
            >
              <div
                style={{
                  width: `${totalProgress}%`,
                  height: '100%',
                  backgroundColor: isComplete ? c.success : c.dangerOrange,
                  borderRadius: 2,
                }}
              />
            </div>

            {/* Complete message */}
            {isComplete && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  fontFamily: mono,
                  fontSize: 18,
                  color: c.success,
                  opacity: completeIn,
                  transform: `translateY(${interpolate(completeIn, [0, 1], [8, 0])}px)`,
                  marginTop: 4,
                }}
              >
                {'\u2713'} analysis complete &middot; redirecting...
              </div>
            )}
          </div>

          {/* Footer */}
          <div
            style={{
              padding: '14px 30px 20px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <span style={{ fontFamily: mono, fontSize: 14, color: c.slateDim }}>
              ai-powered analysis
            </span>
            {!isComplete && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    backgroundColor: c.dangerOrange,
                    opacity: scanningDot,
                  }}
                />
                <span style={{ fontFamily: mono, fontSize: 14, color: c.slate }}>processing</span>
              </div>
            )}
          </div>
        </div>
      </div>
      </div>
    </AbsoluteFill>
  );
};

// ZERA avatar from DexScreener
const ZERA_AVATAR = 'https://cdn.dexscreener.com/cms/images/7f04cf532eabbae6fbd5761288737255678e4dc77a2d39d16f91f92fe1c7e551?width=800&height=800&quality=90';

// ─── Scene 3: Project Results — Trust Report (7.5–11s) ──────────
const ProjectResults = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const cardIn = spring({ frame, fps, config: { damping: 12, stiffness: 110 } });

  // Score counter (ZERA = 100, verified)
  const scoreTarget = 100;
  const scoreCount = interpolate(frame, [0.4 * fps, 1.2 * fps], [0, scoreTarget], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const scoreBar = interpolate(frame, [0.4 * fps, 1.4 * fps], [0, scoreTarget], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.quad),
  });

  // Tab navigation
  const tabsIn = spring({ frame: frame - 8, fps, config: { damping: 18, stiffness: 180 } });
  const tabs = [
    { label: 'Overview', active: false },
    { label: 'Security', active: true },
    { label: 'Market', active: false },
    { label: 'Intel', active: false },
    { label: 'Dev', active: false },
  ];

  // OSINT findings — real ZERA security data from RugCheck
  const securityRows = [
    { label: 'Mint', value: 'DISABLED', good: true },
    { label: 'Freeze', value: 'DISABLED', good: true },
    { label: 'LP Status', value: 'LOCKED 100%', good: true },
    { label: 'Holders', value: '7,824', good: true },
  ];

  // Real Grok X Evidence for ZERA (positive/neutral findings)
  const evidence = [
    { excerpt: 'open-sourced Offline Cash Desktop Application', label: 'neutral', color: c.success },
    { excerpt: 'prev USAA, MetaMask... doxxed ex-MetaMask dev', label: 'neutral', color: c.success },
    { excerpt: 'Zera Labs x @PorzioLaw — legal counsel for AML/OFAC', label: 'neutral', color: c.success },
  ];

  // Real behavior metrics from Grok for ZERA
  const metrics = [
    { label: 'serial shill', score: 13, color: c.success },
    { label: 'hype', score: 7, color: c.success },
    { label: 'toxicity', score: 2, color: c.success },
    { label: 'consistency', score: 94, color: c.success },
  ];

  // Section reveals
  const secIn = spring({ frame: frame - 18, fps, config: { damping: 16, stiffness: 160 } });
  const evidIn = spring({ frame: frame - 28, fps, config: { damping: 16, stiffness: 160 } });
  const metIn = spring({ frame: frame - 40, fps, config: { damping: 16, stiffness: 160 } });

  // Headline springs
  const headIn = spring({ frame, fps, config: { damping: 16, stiffness: 180 } });
  const subHeadIn = spring({ frame: frame - 6, fps, config: { damping: 18, stiffness: 200 } });

  // 3D
  const rotY = interpolate(frame, [0, 3.5 * fps], [-3, 3], { extrapolateRight: 'clamp' });
  const floatY = Math.sin(frame * 0.035) * 4;

  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(ellipse at 50% 40%, #0a4a1a 0%, #081a0e 35%, ${c.bg} 85%)`,
        justifyContent: 'center',
        alignItems: 'center',
        perspective: 1400,
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 24,
        }}
      >
        {/* Headline */}
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              fontFamily: sans,
              fontSize: 60,
              fontWeight: 800,
              color: c.ivory,
              letterSpacing: -1.5,
              transform: `translateY(${interpolate(headIn, [0, 1], [24, 0])}px)`,
              opacity: headIn,
            }}
          >
            verdict: legit.
          </div>
          <div
            style={{
              fontFamily: mono,
              fontSize: 22,
              color: c.slate,
              marginTop: 10,
              transform: `translateY(${interpolate(subHeadIn, [0, 1], [16, 0])}px)`,
              opacity: subHeadIn,
            }}
          >
            receipts, not rumors.
          </div>
        </div>

        <div
          style={{
            transform: `scale(${cardIn}) rotateY(${rotY}deg) translateY(${floatY}px)`,
            transformStyle: 'preserve-3d',
            opacity: cardIn,
            width: 1050,
          }}
        >
        <div
          style={{
            backgroundColor: c.surface,
            borderRadius: 16,
            overflow: 'hidden',
            boxShadow: `0 40px 100px rgba(0,0,0,0.8), 0 0 0 1px ${c.slateDim}40`,
          }}
        >
          <WindowChrome title="CLARP Terminal" accentColor={c.terracotta} />

          <div style={{ padding: '24px 30px', display: 'flex', flexDirection: 'column', gap: 18 }}>
            {/* Entity header — ZERA */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
              {/* ZERA logo from DexScreener */}
              <Img
                src={ZERA_AVATAR}
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: 14,
                  flexShrink: 0,
                  objectFit: 'cover',
                }}
              />
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontFamily: sans, fontSize: 26, fontWeight: 700, color: c.ivory }}>
                    ZERA
                  </span>
                  <span
                    style={{
                      fontFamily: mono,
                      fontSize: 14,
                      fontWeight: 700,
                      color: c.dangerOrange,
                      padding: '3px 10px',
                      borderRadius: 6,
                      backgroundColor: `${c.dangerOrange}20`,
                      border: `1px solid ${c.dangerOrange}30`,
                    }}
                  >
                    Project
                  </span>
                  <span
                    style={{
                      fontFamily: mono,
                      fontSize: 14,
                      fontWeight: 700,
                      color: c.success,
                      padding: '3px 10px',
                      borderRadius: 6,
                      backgroundColor: `${c.success}20`,
                      border: `1px solid ${c.success}30`,
                    }}
                  >
                    {'\u2713'} Verified
                  </span>
                </div>
                <div style={{ fontFamily: mono, fontSize: 16, color: c.dangerOrange, marginTop: 4 }}>
                  @zeralabs &middot; $ZERA
                </div>
              </div>

              {/* Score */}
              <div style={{ textAlign: 'right' }}>
                <div
                  style={{
                    fontFamily: sans,
                    fontSize: 52,
                    fontWeight: 800,
                    color: c.success,
                    lineHeight: 1,
                  }}
                >
                  {Math.round(scoreCount)}
                </div>
                <div
                  style={{
                    fontFamily: mono,
                    fontSize: 14,
                    color: c.success,
                    fontWeight: 700,
                    letterSpacing: 0.5,
                  }}
                >
                  VERIFIED
                </div>
              </div>
            </div>

            {/* Trust bar */}
            <div
              style={{
                height: 7,
                backgroundColor: `${c.slate}20`,
                borderRadius: 4,
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  width: `${scoreBar}%`,
                  height: '100%',
                  backgroundColor: c.success,
                  borderRadius: 4,
                }}
              />
            </div>

            {/* Tab nav */}
            <div
              style={{
                display: 'flex',
                gap: 6,
                opacity: tabsIn,
                transform: `translateY(${interpolate(tabsIn, [0, 1], [8, 0])}px)`,
              }}
            >
              {tabs.map((tab, i) => (
                <div
                  key={i}
                  style={{
                    fontFamily: mono,
                    fontSize: 15,
                    fontWeight: tab.active ? 700 : 400,
                    color: tab.active ? c.terracotta : c.slate,
                    padding: '7px 14px',
                    borderRadius: 8,
                    backgroundColor: tab.active ? `${c.terracotta}15` : 'transparent',
                    border: tab.active ? `1px solid ${c.terracotta}30` : '1px solid transparent',
                  }}
                >
                  {tab.label}
                </div>
              ))}
            </div>

            {/* OSINT Security row */}
            <div
              style={{
                opacity: secIn,
                transform: `translateY(${interpolate(secIn, [0, 1], [12, 0])}px)`,
              }}
            >
              <div
                style={{
                  fontFamily: mono,
                  fontSize: 14,
                  color: c.slate,
                  textTransform: 'uppercase' as const,
                  letterSpacing: 1.2,
                  marginBottom: 10,
                }}
              >
                OSINT &middot; Security Intel
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                {securityRows.map((row, i) => {
                  const rIn = staggerSpring(frame - 22, fps, i);
                  return (
                    <div
                      key={i}
                      style={{
                        flex: 1,
                        backgroundColor: `${row.good ? c.success : c.error}08`,
                        border: `1px solid ${row.good ? c.success : c.error}20`,
                        borderRadius: 10,
                        padding: '12px 14px',
                        opacity: rIn,
                        transform: `translateY(${interpolate(rIn, [0, 1], [8, 0])}px)`,
                      }}
                    >
                      <div style={{ fontFamily: mono, fontSize: 14, color: c.slate }}>{row.label}</div>
                      <div
                        style={{
                          fontFamily: mono,
                          fontSize: 16,
                          fontWeight: 700,
                          color: row.good ? c.success : c.error,
                          marginTop: 4,
                        }}
                      >
                        {row.value}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* X Intel evidence */}
            <div
              style={{
                opacity: evidIn,
                transform: `translateY(${interpolate(evidIn, [0, 1], [12, 0])}px)`,
              }}
            >
              <div
                style={{
                  fontFamily: mono,
                  fontSize: 14,
                  color: c.slate,
                  textTransform: 'uppercase' as const,
                  letterSpacing: 1.2,
                  marginBottom: 10,
                }}
              >
                {'\u{2728}'} Grok &middot; @zeralabs Evidence
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {evidence.map((ev, i) => {
                  const eIn = staggerSpring(frame - 32, fps, i);
                  return (
                    <div
                      key={i}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        backgroundColor: `${ev.color}08`,
                        border: `1px solid ${ev.color}20`,
                        borderRadius: 10,
                        padding: '12px 16px',
                        opacity: eIn,
                        transform: `translateX(${interpolate(eIn, [0, 1], [10, 0])}px)`,
                      }}
                    >
                      <div
                        style={{
                          fontFamily: mono,
                          fontSize: 16,
                          color: c.cloud,
                          flex: 1,
                          fontStyle: 'italic',
                        }}
                      >
                        {ev.excerpt}
                      </div>
                      <span
                        style={{
                          fontFamily: mono,
                          fontSize: 14,
                          fontWeight: 700,
                          color: ev.color,
                          backgroundColor: `${ev.color}20`,
                          padding: '4px 10px',
                          borderRadius: 4,
                          flexShrink: 0,
                        }}
                      >
                        {ev.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Behavior metrics */}
            <div
              style={{
                opacity: metIn,
                transform: `translateY(${interpolate(metIn, [0, 1], [12, 0])}px)`,
              }}
            >
              <div
                style={{
                  fontFamily: mono,
                  fontSize: 14,
                  color: c.slate,
                  textTransform: 'uppercase' as const,
                  letterSpacing: 1.2,
                  marginBottom: 10,
                }}
              >
                Behavior Analysis
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                {metrics.map((m, i) => {
                  const mIn = staggerSpring(frame - 44, fps, i);
                  const barW = interpolate(frame, [1.8 * fps + i * 4, 2.4 * fps + i * 4], [0, m.score], {
                    extrapolateLeft: 'clamp',
                    extrapolateRight: 'clamp',
                    easing: Easing.out(Easing.quad),
                  });
                  return (
                    <div
                      key={i}
                      style={{
                        flex: 1,
                        opacity: mIn,
                        transform: `translateY(${interpolate(mIn, [0, 1], [6, 0])}px)`,
                      }}
                    >
                      <div
                        style={{
                          fontFamily: mono,
                          fontSize: 14,
                          color: c.slate,
                          marginBottom: 6,
                        }}
                      >
                        {m.label}
                      </div>
                      <div
                        style={{
                          height: 6,
                          backgroundColor: `${c.slate}20`,
                          borderRadius: 3,
                          overflow: 'hidden',
                        }}
                      >
                        <div
                          style={{
                            width: `${barW}%`,
                            height: '100%',
                            backgroundColor: m.color,
                            borderRadius: 2,
                          }}
                        />
                      </div>
                      <div
                        style={{
                          fontFamily: mono,
                          fontSize: 15,
                          fontWeight: 700,
                          color: m.color,
                          marginTop: 5,
                        }}
                      >
                        {Math.round(barW)}/100
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>
    </AbsoluteFill>
  );
};

// ─── Scene 4: OSINT Sources Reveal (11–13s) ─────────────────────
const OsintSources = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const containerIn = spring({ frame, fps, config: { damping: 14, stiffness: 130 } });

  const sources = [
    { name: 'RugCheck', type: 'security', desc: 'mint, freeze, LP lock, holders', free: true },
    { name: 'DexScreener', type: 'market', desc: 'price, volume, liquidity', free: true },
    { name: 'Birdeye', type: 'market', desc: 'market cap, trading activity', free: true },
    { name: 'RDAP/WHOIS', type: 'domain', desc: 'domain age, registrar, privacy', free: true },
    { name: 'GitHub API', type: 'code', desc: 'commits, stars, contributors, tests', free: true },
    { name: 'Grok (xAI)', type: 'ai', desc: 'x_search, behavior analysis, evidence', free: false },
  ];

  const headerIn = spring({ frame: frame - 4, fps, config: { damping: 18, stiffness: 200 } });
  const rotY = interpolate(frame, [0, 2 * fps], [3, -3], { extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(ellipse at 50% 50%, #2a1440 0%, #180c28 35%, ${c.bg} 85%)`,
        justifyContent: 'center',
        alignItems: 'center',
        perspective: 1200,
      }}
    >
      <div
        style={{
          transform: `scale(${containerIn}) rotateY(${rotY}deg)`,
          transformStyle: 'preserve-3d',
          opacity: containerIn,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 40,
          width: 1100,
        }}
      >
        {/* Header */}
        <div
          style={{
            textAlign: 'center',
            opacity: headerIn,
            transform: `translateY(${interpolate(headerIn, [0, 1], [16, 0])}px)`,
          }}
        >
          <div
            style={{
              fontFamily: sans,
              fontSize: 60,
              fontWeight: 800,
              color: c.ivory,
              letterSpacing: -1.5,
            }}
          >
            6 sources. zero trust.
          </div>
          <div
            style={{
              fontFamily: mono,
              fontSize: 22,
              color: c.slate,
              marginTop: 12,
            }}
          >
            free intel + grok ai. every claim checked.
          </div>
        </div>

        {/* Source cards grid */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 16,
            justifyContent: 'center',
          }}
        >
          {sources.map((src, i) => {
            const sIn = staggerSpring(frame - 10, fps, i, { damping: 14, stiffness: 140 });
            const isGrok = src.name === 'Grok (xAI)';
            const accentColor = isGrok ? c.larp : c.terracotta;

            return (
              <div
                key={i}
                style={{
                  width: 340,
                  backgroundColor: c.surface,
                  border: `1px solid ${isGrok ? c.larp : c.slateDim}40`,
                  borderRadius: 14,
                  padding: '20px 22px',
                  opacity: sIn,
                  transform: `translateY(${interpolate(sIn, [0, 1], [16, 0])}px) scale(${interpolate(sIn, [0, 1], [0.9, 1])})`,
                  boxShadow: isGrok
                    ? `0 8px 30px ${c.larp}20`
                    : '0 8px 30px rgba(0,0,0,0.4)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  <div
                    style={{
                      fontFamily: sans,
                      fontSize: 20,
                      fontWeight: 700,
                      color: accentColor,
                    }}
                  >
                    {src.name}
                  </div>
                  <span
                    style={{
                      fontFamily: mono,
                      fontSize: 13,
                      fontWeight: 700,
                      color: src.free ? c.success : c.larp,
                      backgroundColor: src.free ? `${c.success}15` : `${c.larp}15`,
                      padding: '3px 8px',
                      borderRadius: 4,
                      marginLeft: 'auto',
                    }}
                  >
                    {src.free ? 'FREE' : 'AI'}
                  </span>
                </div>
                <div
                  style={{
                    fontFamily: mono,
                    fontSize: 16,
                    color: c.cloud,
                    lineHeight: 1.4,
                  }}
                >
                  {src.desc}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ─── Scene 5: CTA Closing (13–15s) ──────────────────────────────
const CtaClosing = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const mascotIn = spring({ frame, fps, config: { damping: 10, stiffness: 130 } });
  const logoIn = spring({ frame: frame - 8, fps, config: { damping: 14, stiffness: 160 } });
  const taglineIn = spring({ frame: frame - 16, fps, config: { damping: 18, stiffness: 180 } });
  const urlIn = spring({ frame: frame - 24, fps, config: { damping: 20, stiffness: 200 } });

  const glowIntensity = interpolate(Math.sin(frame * 0.12), [-1, 1], [0.3, 0.7]);
  const mascotFloat = Math.sin(frame * 0.07) * 5;
  const containerRotY = Math.sin(frame * 0.025) * 3;

  // Orbiting particles
  const dots = Array.from({ length: 12 }, (_, i) => {
    const angle = (i / 12) * Math.PI * 2 + frame * 0.01;
    const radius = 450 + Math.sin(frame * 0.03 + i) * 35;
    return {
      x: Math.cos(angle) * radius,
      y: Math.sin(angle) * radius * 0.5,
      opacity: interpolate(Math.sin(frame * 0.05 + i * 0.8), [-1, 1], [0.08, 0.35]),
      size: 5 + Math.sin(i * 1.2) * 3,
    };
  });

  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(ellipse at 50% 55%, #4a2a18 0%, #2a1610 35%, ${c.bg} 85%)`,
        justifyContent: 'center',
        alignItems: 'center',
        perspective: 1200,
        overflow: 'hidden',
      }}
    >
      {/* Particles */}
      {dots.map((dot, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            width: dot.size,
            height: dot.size,
            borderRadius: '50%',
            backgroundColor: c.terracotta,
            opacity: dot.opacity,
            transform: `translate(${dot.x}px, ${dot.y}px)`,
          }}
        />
      ))}

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 36,
          transform: `rotateY(${containerRotY}deg)`,
          transformStyle: 'preserve-3d',
        }}
      >
        {/* Mascot */}
        <div
          style={{
            transform: `scale(${mascotIn}) translateY(${interpolate(mascotIn, [0, 1], [-40, 0]) + mascotFloat}px)`,
            opacity: mascotIn,
          }}
        >
          <Img
            src={staticFile('clarp-mascot.svg')}
            style={{
              width: 200,
              height: 200,
              borderRadius: 32,
              boxShadow: `0 30px 70px ${c.terracotta}40`,
            }}
          />
        </div>

        {/* Logo */}
        <div
          style={{
            fontFamily: sans,
            fontSize: 120,
            fontWeight: 800,
            color: c.terracotta,
            lineHeight: 1,
            transform: `scale(${logoIn})`,
            opacity: logoIn,
            textShadow: `0 0 ${50 * glowIntensity}px ${c.terracotta}`,
            letterSpacing: -2,
          }}
        >
          $CLARP
        </div>

        {/* Tagline */}
        <div
          style={{
            fontFamily: sans,
            fontSize: 34,
            fontWeight: 500,
            color: c.ivory,
            transform: `translateY(${interpolate(taglineIn, [0, 1], [16, 0])}px)`,
            opacity: taglineIn,
            textAlign: 'center',
            lineHeight: 1.4,
          }}
        >
          stop getting rugged.
          <br />
          <span style={{ color: c.slate }}>receipts over vibes.</span>
        </div>

        {/* CTA */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 10,
            opacity: urlIn,
            transform: `translateY(${interpolate(urlIn, [0, 1], [14, 0])}px)`,
          }}
        >
          <div
            style={{
              fontFamily: mono,
              fontSize: 26,
              color: c.terracotta,
              fontWeight: 600,
              padding: '16px 36px',
              borderRadius: 14,
              border: `2px solid ${c.terracotta}`,
              backgroundColor: `${c.terracotta}12`,
            }}
          >
            clarp.xyz/terminal
          </div>
          <div style={{ fontFamily: mono, fontSize: 18, color: c.slateDim }}>
            solana &middot; $CLARP &middot; live now
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ─── Audio File References ───────────────────────────────────────
// Drop these files into public/audio/ before rendering.
// See public/audio/README.md for specs and sourcing suggestions.
const audio = {
  /** Background music — dark electronic/trap beat, 17s+ loop */
  bgMusic: 'audio/bg-music.mp3',
  /** Keyboard typing clicks — plays during search bar typing (0.8–1.6s) */
  typeClick: 'audio/sfx-type.mp3',
  /** Scan initiated — woosh/launch sound on enter (2.5s) */
  scanStart: 'audio/sfx-scan-start.mp3',
  /** Step complete — subtle tick/ping per scan step */
  stepTick: 'audio/sfx-step-tick.mp3',
  /** Scan complete — success chime when pipeline finishes (~6.5s) */
  scanComplete: 'audio/sfx-scan-complete.mp3',
  /** Scene transition — quick whoosh between scenes */
  whoosh: 'audio/sfx-whoosh.mp3',
};

// ─── Main Composition ────────────────────────────────────────────
export const ClarpSaasPromo = () => {
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill style={{ backgroundColor: c.bg }}>
      {/* ── Audio Layer ─────────────────────────────────────────── */}

      {/* Background music — full duration, fade in + fade out */}
      <Audio
        src={staticFile(audio.bgMusic)}
        volume={(f) => {
          const fadeIn = interpolate(f, [0, fps], [0, 0.4], { extrapolateRight: 'clamp' });
          const fadeOut = interpolate(f, [15 * fps, 17 * fps], [0.4, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
          return Math.min(fadeIn, fadeOut);
        }}
      />

      {/* Typing SFX — during search bar typing (0.25–1.05s) */}
      <Sequence from={Math.round(0.25 * fps)} durationInFrames={Math.round(0.8 * fps)}>
        <Audio src={staticFile(audio.typeClick)} volume={0.6} />
      </Sequence>

      {/* Scan start woosh — when user hits enter (2.5s) */}
      <Sequence from={Math.round(2.5 * fps)} durationInFrames={Math.round(0.5 * fps)}>
        <Audio src={staticFile(audio.scanStart)} volume={0.7} />
      </Sequence>

      {/* Scene 2 transition whoosh (2.5s) — 1.73s file */}
      <Sequence from={Math.round(2.5 * fps)} durationInFrames={Math.round(1.73 * fps)}>
        <Audio src={staticFile(audio.whoosh)} volume={0.5} />
      </Sequence>

      {/* Step tick SFX — one per scan step — 0.13s file */}
      {[0, 1, 2, 3, 4].map((i) => {
        const stepDuration = 0.65 * fps;
        const stepStart = 3 * fps + 0.3 * fps + i * stepDuration;
        return (
          <Sequence key={`tick-${i}`} from={Math.round(stepStart + stepDuration * 0.9)} durationInFrames={Math.round(0.3 * fps)}>
            <Audio src={staticFile(audio.stepTick)} volume={0.4} />
          </Sequence>
        );
      })}

      {/* Scan complete chime (~6.5s) */}
      <Sequence from={Math.round(6.5 * fps)} durationInFrames={Math.round(1 * fps)}>
        <Audio src={staticFile(audio.scanComplete)} volume={0.7} />
      </Sequence>

      {/* Scene 3 transition whoosh (7s) — 1.73s file */}
      <Sequence from={Math.round(7 * fps)} durationInFrames={Math.round(1.73 * fps)}>
        <Audio src={staticFile(audio.whoosh)} volume={0.5} />
      </Sequence>

      {/* Scene 4 transition whoosh (10.5s) — 1.73s file */}
      <Sequence from={Math.round(10.5 * fps)} durationInFrames={Math.round(1.73 * fps)}>
        <Audio src={staticFile(audio.whoosh)} volume={0.5} />
      </Sequence>

      {/* Scene 5 transition whoosh (12.5s) — 1.73s file */}
      <Sequence from={Math.round(12.5 * fps)} durationInFrames={Math.round(1.73 * fps)}>
        <Audio src={staticFile(audio.whoosh)} volume={0.5} />
      </Sequence>

      {/* ── Visual Scenes ───────────────────────────────────────── */}

      {/* Scene 1: Search hook — type query (0–3s) */}
      <Sequence from={0} durationInFrames={Math.round(3 * fps)} premountFor={fps}>
        <SearchHook />
      </Sequence>

      {/* Scene 2: OSINT scan pipeline — 5 steps (3–7.5s) */}
      <Sequence from={Math.round(3 * fps)} durationInFrames={Math.round(4.5 * fps)} premountFor={fps}>
        <OsintScanPipeline />
      </Sequence>

      {/* Scene 3: Project results — trust report (7.5–11s) */}
      <Sequence from={Math.round(7.5 * fps)} durationInFrames={Math.round(3.5 * fps)} premountFor={fps}>
        <ProjectResults />
      </Sequence>

      {/* Scene 4: OSINT sources reveal (11–13s) */}
      <Sequence from={Math.round(11 * fps)} durationInFrames={Math.round(2 * fps)} premountFor={fps}>
        <OsintSources />
      </Sequence>

      {/* Scene 5: CTA closing (13–17s) */}
      <Sequence from={Math.round(13 * fps)} durationInFrames={Math.round(4 * fps)} premountFor={fps}>
        <CtaClosing />
      </Sequence>
    </AbsoluteFill>
  );
};
