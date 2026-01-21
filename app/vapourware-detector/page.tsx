'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import WarningTicker from '@/components/WarningTicker';
import Footer from '@/components/Footer';
import { Skull, AlertTriangle, AlertCircle, CheckCircle, Sparkles, Bot, FileText, Ghost, ClipboardCopy, Users, FlaskConical } from 'lucide-react';

// Fake scan results for the mockup
const SCAN_VERDICTS = [
  { score: 97, verdict: 'CONFIRMED VAPOURWARE', color: 'larp-red', icon: 'skull' },
  { score: 84, verdict: 'LIKELY RUGPULL', color: 'larp-red', icon: 'alert-triangle' },
  { score: 72, verdict: 'SUSPICIOUS AF', color: 'larp-yellow', icon: 'alert-circle' },
  { score: 45, verdict: 'PROBABLY FINE', color: 'larp-green', icon: 'check-circle' },
  { score: 12, verdict: 'SOMEHOW REAL', color: 'larp-green', icon: 'sparkles' },
];

const SCAN_FINDINGS = [
  { label: 'ai-generated code', value: '94%', bad: true },
  { label: 'meaningful commits', value: '3', bad: true },
  { label: 'actual functions', value: '12', bad: true },
  { label: 'readme-to-code ratio', value: '47:1', bad: true },
  { label: 'console.log statements', value: '847', bad: true },
  { label: 'todo: fix later', value: '156', bad: true },
  { label: 'copy-pasted from stack overflow', value: '67%', bad: true },
  { label: 'last real commit', value: '4 months ago', bad: true },
  { label: 'contributor wallets', value: 'all same person', bad: true },
  { label: 'test coverage', value: '0%', bad: true },
];

const FAKE_REPOS = [
  { name: 'ai-agent-pro-max', verdict: 97, tag: 'vapourware' },
  { name: 'defi-yield-optimizer', verdict: 89, tag: 'rugpull' },
  { name: 'quantum-blockchain-ai', verdict: 96, tag: 'buzzword soup' },
  { name: 'gpt-wrapper-saas', verdict: 78, tag: 'chatgpt with extra steps' },
  { name: 'web3-social-protocol', verdict: 91, tag: 'just a readme' },
];

const TICKER_MESSAGES = [
  'ai recognizes ai',
  'scanning github repos since never',
  'detecting vapourware professionally',
  'trust no readme',
  'your portfolio is a warning sign',
  'due diligence is cope',
];

const VerdictIcon = ({ icon, className = '' }: { icon: string; className?: string }) => {
  const iconProps = { size: 24, className };
  switch (icon) {
    case 'skull': return <Skull {...iconProps} />;
    case 'alert-triangle': return <AlertTriangle {...iconProps} />;
    case 'alert-circle': return <AlertCircle {...iconProps} />;
    case 'check-circle': return <CheckCircle {...iconProps} />;
    case 'sparkles': return <Sparkles {...iconProps} />;
    default: return <AlertCircle {...iconProps} />;
  }
};

const DetectionIcon = ({ icon, className = '' }: { icon: string; className?: string }) => {
  const iconProps = { size: 32, className };
  switch (icon) {
    case 'bot': return <Bot {...iconProps} />;
    case 'file-text': return <FileText {...iconProps} />;
    case 'ghost': return <Ghost {...iconProps} />;
    case 'clipboard-copy': return <ClipboardCopy {...iconProps} />;
    case 'users': return <Users {...iconProps} />;
    case 'flask': return <FlaskConical {...iconProps} />;
    default: return <AlertCircle {...iconProps} />;
  }
};

export default function VapourwareDetector() {
  const [mounted, setMounted] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [scanComplete, setScanComplete] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [currentScanStep, setCurrentScanStep] = useState('');
  const [selectedVerdict, setSelectedVerdict] = useState(SCAN_VERDICTS[0]);
  const [inputValue, setInputValue] = useState('');
  const [tweetCopied, setTweetCopied] = useState(false);
  const [demoClicks, setDemoClicks] = useState(0);
  const terminalRef = useRef<HTMLDivElement>(null);

  const SCAN_STEPS = [
    'connecting to github api...',
    'downloading repository...',
    'analyzing commit history...',
    'detecting ai-generated patterns...',
    'counting meaningful code...',
    'checking for actual tests...',
    'scanning for copy-paste signatures...',
    'evaluating readme bloat...',
    'cross-referencing kol wallets...',
    'calculating vapourware score...',
    'generating verdict...',
  ];

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [currentScanStep, scanProgress]);

  const runFakeScan = () => {
    if (isScanning) return;

    setIsScanning(true);
    setScanComplete(false);
    setScanProgress(0);
    setCurrentScanStep('');

    // Pick a random verdict
    const verdict = SCAN_VERDICTS[Math.floor(Math.random() * SCAN_VERDICTS.length)];
    setSelectedVerdict(verdict);

    let stepIndex = 0;
    const stepInterval = setInterval(() => {
      if (stepIndex < SCAN_STEPS.length) {
        setCurrentScanStep(SCAN_STEPS[stepIndex]);
        setScanProgress(Math.min(((stepIndex + 1) / SCAN_STEPS.length) * 100, 99));
        stepIndex++;
      } else {
        clearInterval(stepInterval);
        setScanProgress(100);
        setCurrentScanStep('scan complete.');
        setTimeout(() => {
          setIsScanning(false);
          setScanComplete(true);
        }, 500);
      }
    }, 400);
  };

  const copyTweet = () => {
    const tweet = `@CLARP_bot scan https://github.com/example/repo`;
    navigator.clipboard.writeText(tweet);
    setTweetCopied(true);
    setTimeout(() => setTweetCopied(false), 2000);
  };

  if (!mounted) return null;

  return (
    <main className="min-h-screen overflow-x-hidden">
      <Navbar />

      {/* back button */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-4 py-2 bg-slate-dark text-ivory-light font-mono text-sm border-2 border-slate-dark hover:bg-danger-orange hover:border-danger-orange hover:text-slate-dark transition-colors"
          style={{ boxShadow: '3px 3px 0 #1a1a2e' }}
        >
          <span>←</span>
          <span>back to main</span>
        </Link>
      </div>

      {/* hero section */}
      <section className="relative py-12 sm:py-20 px-4 sm:px-6 overflow-hidden">
        <div className="absolute inset-0 bg-grid bg-grid opacity-30" />

        <div className="max-w-4xl mx-auto relative text-center">
          {/* badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-larp-red/10 border border-larp-red/30 text-larp-red font-mono text-xs mb-6">
            <span className="animate-pulse">●</span>
            coming q2 (the eternal q2)
          </div>

          {/* title */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-slate-dark leading-tight mb-6 font-display">
            vapourware
            <br />
            <span className="text-danger-orange">detector</span>
          </h1>

          {/* tagline */}
          <p className="text-xl sm:text-2xl text-slate-light mb-4 font-mono">
            ai recognizes ai.
          </p>
          <p className="text-base sm:text-lg text-danger-orange font-mono font-bold mb-8">
            scan any github repo. expose the slop.
          </p>

          <p className="text-sm sm:text-base text-slate-light max-w-2xl mx-auto mb-12">
            tag <span className="text-danger-orange font-bold">@CLARP</span> on x with any github repo link.
            our ai will scan the codebase and tell you if it's real or just another
            <span className="text-larp-red"> chatgpt wrapper with extra steps</span>.
          </p>

          {/* how it works preview */}
          <div className="bg-slate-dark border-2 border-danger-orange p-6 sm:p-8 text-left max-w-xl mx-auto mb-12" style={{ boxShadow: '6px 6px 0 #FF6B35' }}>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-danger-orange">$</span>
              <span className="text-ivory-light font-mono text-sm">how to use</span>
            </div>
            <div className="space-y-3 font-mono text-sm">
              <div className="flex items-start gap-3">
                <span className="text-larp-green shrink-0">1.</span>
                <span className="text-ivory-light/80">find suspicious repo on github</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-larp-green shrink-0">2.</span>
                <span className="text-ivory-light/80">tweet: <span className="text-danger-orange">@CLARP scan [github url]</span></span>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-larp-green shrink-0">3.</span>
                <span className="text-ivory-light/80">receive verdict. lose faith in humanity.</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ticker */}
      <WarningTicker messages={TICKER_MESSAGES} direction="left" />

      {/* what we detect section */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 bg-slate-dark text-ivory-light">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <span className="badge badge-error mb-4">detection matrix</span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 font-display">
              what we <span className="text-danger-orange">detect</span>
            </h2>
            <p className="text-sm sm:text-base text-ivory-light/60 max-w-2xl mx-auto">
              our ai has been trained on thousands of failed projects. it knows the signs.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {[
              { icon: 'bot', title: 'ai-generated code', desc: 'detects claude/gpt patterns. the "helpful assistant" energy is unmistakable.' },
              { icon: 'file-text', title: 'readme bloat', desc: 'when the readme is longer than the actual code, that\'s a red flag.' },
              { icon: 'ghost', title: 'ghost commits', desc: 'bulk commits at 3am. "initial commit" with 10k lines. sus.' },
              { icon: 'clipboard-copy', title: 'copy-paste signatures', desc: 'we know that stack overflow code. we\'ve seen it 47,000 times.' },
              { icon: 'users', title: 'fake contributors', desc: 'all commits from the same wallet? "team of 12" with 1 actual dev?' },
              { icon: 'flask', title: 'test coverage: 0%', desc: 'no tests = no product = no point. next.' },
            ].map((item, i) => (
              <div
                key={i}
                className="bg-ivory-light/5 border border-ivory-light/10 p-6 hover:border-danger-orange/50 transition-colors group"
              >
                <div className="mb-4 text-ivory-light/60 group-hover:text-danger-orange group-hover:animate-pulse transition-colors">
                  <DetectionIcon icon={item.icon} />
                </div>
                <h3 className="text-lg font-bold mb-2 text-danger-orange font-mono">{item.title}</h3>
                <p className="text-sm text-ivory-light/60">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ticker */}
      <WarningTicker messages={['scanning for truth in a sea of lies', 'your due diligence starts here', 'ai vs ai: the final boss']} direction="right" />

      {/* live demo section */}
      <section className="py-16 sm:py-24 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <span className="badge badge-warning mb-4">interactive demo</span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-dark mb-4 font-display">
              try it <span className="text-danger-orange">yourself</span>
            </h2>
            <p className="text-sm sm:text-base text-slate-light">
              paste any github url. watch the magic. (it's fake but the vibes are real)
            </p>
          </div>

          {/* input terminal */}
          <div className="terminal mb-8">
            <div className="terminal-header">
              <div className="terminal-dot bg-larp-red opacity-50" />
              <div className="terminal-dot bg-larp-yellow opacity-50" />
              <div className="terminal-dot bg-larp-green opacity-50" />
              <span className="ml-3 text-xs text-ivory-light/50 font-mono">vapourware-detector v0.0.1</span>
            </div>
            <div ref={terminalRef} className="terminal-body min-h-[200px] max-h-[400px] overflow-y-auto">
              {/* input row */}
              <div className="flex items-center gap-2 mb-4">
                <span className="text-danger-orange shrink-0">$</span>
                <span className="text-larp-green shrink-0">scan</span>
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="https://github.com/example/repo"
                  className="flex-1 bg-transparent border-none outline-none text-ivory-light font-mono text-sm placeholder:text-ivory-light/30"
                  onKeyDown={(e) => e.key === 'Enter' && runFakeScan()}
                  disabled={isScanning}
                />
              </div>

              {/* scan output */}
              {(isScanning || scanComplete) && (
                <div className="space-y-2 font-mono text-sm">
                  {isScanning && (
                    <>
                      <div className="text-ivory-light/60">{currentScanStep}</div>
                      <div className="w-full bg-slate-medium h-2 overflow-hidden">
                        <div
                          className="h-full bg-danger-orange transition-all duration-300"
                          style={{ width: `${scanProgress}%` }}
                        />
                      </div>
                      <div className="text-ivory-light/40 text-xs">{Math.floor(scanProgress)}% complete</div>
                    </>
                  )}

                  {scanComplete && (
                    <div className="animate-fade-in">
                      <div className="border-t border-ivory-light/20 pt-4 mt-4">
                        <div className="flex items-center gap-3 mb-4">
                          <VerdictIcon icon={selectedVerdict.icon} className={`text-${selectedVerdict.color}`} />
                          <div>
                            <div className={`text-${selectedVerdict.color} font-bold text-lg`}>
                              {selectedVerdict.verdict}
                            </div>
                            <div className="text-ivory-light/40 text-xs">
                              vapourware score: {selectedVerdict.score}/100
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-xs">
                          {SCAN_FINDINGS.slice(0, 6).map((finding, i) => (
                            <div key={i} className="flex justify-between items-center py-1 border-b border-ivory-light/10">
                              <span className="text-ivory-light/60">{finding.label}</span>
                              <span className={finding.bad ? 'text-larp-red' : 'text-larp-green'}>{finding.value}</span>
                            </div>
                          ))}
                        </div>

                        <div className="mt-4 pt-4 border-t border-ivory-light/20">
                          <div className="text-danger-orange text-xs">recommendation:</div>
                          <div className="text-ivory-light/80 text-sm mt-1">
                            {selectedVerdict.score > 70
                              ? 'do not invest. this is literally nothing wrapped in a readme.'
                              : selectedVerdict.score > 40
                              ? 'proceed with extreme caution. probably fine. probably.'
                              : 'somehow this appears to be a real project. rare.'}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* cursor */}
              {!isScanning && !scanComplete && (
                <div className="flex items-center gap-2">
                  <span className="inline-block w-2 h-4 bg-danger-orange animate-blink" />
                </div>
              )}
            </div>
          </div>

          {/* action buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => {
                setDemoClicks(prev => prev + 1);
                runFakeScan();
              }}
              disabled={isScanning}
              className={`btn-primary ${isScanning ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isScanning ? 'scanning...' : demoClicks > 3 ? 'you love this' : 'run scan'}
            </button>
            <button
              onClick={() => {
                setScanComplete(false);
                setInputValue('');
                setScanProgress(0);
              }}
              className="btn-secondary"
            >
              clear
            </button>
          </div>

          {demoClicks > 5 && (
            <p className="text-center text-xs text-slate-light/50 mt-4 font-mono">
              you've run {demoClicks} scans. on a demo. that does nothing.
            </p>
          )}
        </div>
      </section>

      {/* ticker */}
      <WarningTicker messages={['recent scans: 47,832 repos analyzed', '94% confirmed vapourware', 'the other 6% were forks of vapourware']} direction="left" />

      {/* recent scans mockup */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 bg-slate-dark text-ivory-light">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <span className="badge badge-error mb-4">live feed</span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 font-display">
              recent <span className="text-danger-orange">scans</span>
            </h2>
            <p className="text-sm sm:text-base text-ivory-light/60">
              a sample of repos our users have exposed. names changed to protect the guilty.
            </p>
          </div>

          <div className="space-y-3">
            {FAKE_REPOS.map((repo, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-4 bg-ivory-light/5 border border-ivory-light/10 hover:border-danger-orange/30 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-danger-orange">▸</span>
                  <span className="font-mono text-sm">{repo.name}</span>
                  <span className="text-xs px-2 py-0.5 bg-larp-red/20 text-larp-red border border-larp-red/30">
                    {repo.tag}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-ivory-light/40">score:</span>
                  <span className={`font-mono font-bold ${repo.verdict > 80 ? 'text-larp-red' : repo.verdict > 50 ? 'text-larp-yellow' : 'text-larp-green'}`}>
                    {repo.verdict}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-8">
            <p className="text-xs text-ivory-light/30 font-mono">
              refreshing never. this is a static mockup. like their products.
            </p>
          </div>
        </div>
      </section>

      {/* cta section */}
      <section className="py-16 sm:py-24 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-dark mb-6 font-display">
            ready to expose <span className="text-danger-orange">vapourware</span>?
          </h2>
          <p className="text-base sm:text-lg text-slate-light mb-8">
            follow <span className="text-danger-orange font-bold">@CLARP</span> on x. tag us with any repo.
            we'll do the rest. (when we build it) (q2)
          </p>

          {/* tweet template */}
          <div className="bg-slate-dark border-2 border-danger-orange p-6 text-left max-w-md mx-auto mb-8" style={{ boxShadow: '4px 4px 0 #FF6B35' }}>
            <div className="text-xs text-ivory-light/40 mb-2 font-mono">copy this tweet:</div>
            <div className="font-mono text-sm text-ivory-light mb-4">
              <span className="text-danger-orange">@CLARP_bot</span> scan https://github.com/example/repo
            </div>
            <button
              onClick={copyTweet}
              className="btn-outline text-xs w-full"
            >
              {tweetCopied ? 'copied!' : 'copy to clipboard'}
            </button>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="https://x.com/i/communities/2013904367188132011"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary"
            >
              join $CLARP on x
            </a>
            <Link href="/" className="btn-secondary">
              back to main site
            </Link>
          </div>

          <p className="text-xs text-slate-light/50 mt-8 font-mono">
            disclaimer: this feature doesn't exist yet. like 94% of crypto projects.
          </p>
        </div>
      </section>

      {/* final ticker */}
      <WarningTicker messages={['ai recognizes ai', 'trust no readme', 'dyor means nothing if the code is fake', 'vapourware detector: shipping q2']} direction="right" />

      <Footer />
    </main>
  );
}
