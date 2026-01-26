'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Clock,
  Users,
  Calendar,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  MessageSquare,
  Link2,
  Network,
  ChevronRight,
  Share2,
  ExternalLink,
} from 'lucide-react';
import RiskBadge from '@/components/terminal/xintel/RiskBadge';
import ShillCard, { ShillTableHeader } from '@/components/terminal/xintel/ShillCard';
import BacklashCard from '@/components/terminal/xintel/BacklashCard';
import BehaviorGauge from '@/components/terminal/xintel/BehaviorGauge';
import EntityList from '@/components/terminal/xintel/EntityList';
import EvidenceDrawer from '@/components/terminal/xintel/EvidenceDrawer';
import ShareButton from '@/components/terminal/xintel/ShareButton';
import { XIntelReport, XIntelEvidence, KeyFinding, getScoreColor, getScoreLabel, getRiskLevelColor, SCORE_FACTOR_CONFIG } from '@/types/xintel';

type TabId = 'shills' | 'backlash' | 'behavior' | 'network' | 'entities';

const TABS: { id: TabId; label: string; icon: React.ReactNode; countKey?: string }[] = [
  { id: 'shills', label: 'Shills', icon: <MessageSquare size={14} />, countKey: 'shilledEntities' },
  { id: 'backlash', label: 'Backlash', icon: <AlertTriangle size={14} />, countKey: 'backlashEvents' },
  { id: 'behavior', label: 'Behavior', icon: <Users size={14} /> },
  { id: 'network', label: 'Network', icon: <Network size={14} /> },
  { id: 'entities', label: 'Entities', icon: <Link2 size={14} />, countKey: 'linkedEntities' },
];

interface PageProps {
  params: Promise<{ handle: string }>;
}

export default function XIntelReportPage({ params }: PageProps) {
  const { handle } = use(params);
  const [report, setReport] = useState<XIntelReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<TabId>('shills');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerTitle, setDrawerTitle] = useState('');
  const [drawerEvidence, setDrawerEvidence] = useState<XIntelEvidence[]>([]);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const response = await fetch(`/api/xintel/report/${handle}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to load report');
        }

        // Token data is now enriched server-side
        setReport(data.report);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load report');
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [handle]);

  const openEvidence = (title: string, evidenceIds: string[]) => {
    if (!report) return;
    const evidence = report.evidence.filter(e => evidenceIds.includes(e.id));
    setDrawerTitle(title);
    setDrawerEvidence(evidence.length > 0 ? evidence : report.evidence.slice(0, 5));
    setDrawerOpen(true);
  };

  const handleFindingClick = (finding: KeyFinding) => {
    openEvidence(finding.title, finding.evidenceIds);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-danger-orange border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="font-mono text-ivory-light/60">Loading report...</p>
        </div>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="max-w-lg mx-auto text-center py-12">
        <AlertTriangle size={48} className="text-larp-red mx-auto mb-4" />
        <h2 className="font-mono font-bold text-ivory-light text-xl mb-2">
          Report Not Found
        </h2>
        <p className="font-mono text-ivory-light/60 mb-6">
          {error || 'This profile has not been scanned yet.'}
        </p>
        <Link
          href="/terminal/xintel"
          className="inline-flex items-center gap-2 px-6 py-3 bg-danger-orange text-black font-mono font-bold border-2 border-black"
          style={{ boxShadow: '4px 4px 0 black' }}
        >
          <ArrowLeft size={18} />
          Scan a Profile
        </Link>
      </div>
    );
  }

  const { profile, score, keyFindings, shilledEntities, backlashEvents, behaviorMetrics, networkMetrics, linkedEntities } = report;

  // Get active risk factors
  const activeFactors = score.factors
    .filter(f => f.points > 0)
    .sort((a, b) => b.points - a.points);

  const scoreColor = getScoreColor(score.overall);
  const riskColor = getRiskLevelColor(score.riskLevel);

  // Check if finding is positive
  const isPositiveFinding = (finding: KeyFinding): boolean => {
    const text = (finding.title + ' ' + finding.description).toLowerCase();
    const positiveKeywords = [
      'doxxed', 'verified', 'established', 'active github', 'real product',
      'organic engagement', 'consistent history', 'credible', 'trustworthy',
      'clean history', 'legitimate', 'transparent', 'professional',
      'year-old account', 'years-old account', 'year old account',
      'blue verified', 'no scam', 'no rug', 'no fraud', 'good standing'
    ];
    return positiveKeywords.some(keyword => text.includes(keyword));
  };

  // Tab counts
  const getTabCount = (tabId: TabId): number | null => {
    switch (tabId) {
      case 'shills': return shilledEntities.length;
      case 'backlash': return backlashEvents.length;
      case 'entities': return linkedEntities.length;
      default: return null;
    }
  };

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col">
      {/* Compact Header Bar */}
      <div className="flex items-center justify-between gap-4 pb-3 border-b border-ivory-light/10 shrink-0">
        <div className="flex items-center gap-4 min-w-0">
          <Link
            href="/terminal/xintel"
            className="text-ivory-light/40 hover:text-ivory-light transition-colors shrink-0"
          >
            <ArrowLeft size={18} />
          </Link>

          <div className="flex items-center gap-3 min-w-0">
            <h1 className="text-xl font-mono font-bold text-ivory-light truncate">
              @{profile.handle}
            </h1>
            {profile.verified && (
              <CheckCircle size={16} className="text-larp-green shrink-0" />
            )}
            <RiskBadge level={score.riskLevel} />
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="hidden lg:inline text-[9px] font-mono text-ivory-light/25 max-w-[200px] truncate" title={report.disclaimer}>
            {report.disclaimer}
          </span>
          <div className="flex items-center gap-1.5 text-[10px] font-mono text-ivory-light/40">
            <Clock size={11} />
            <span className="hidden sm:inline">{formatDate(report.scanTime)}</span>
          </div>
          <ShareButton handle={profile.handle} score={score.overall} />
        </div>
      </div>

      {/* Main Dashboard Grid */}
      <div className="flex-1 grid grid-cols-12 gap-3 pt-3 min-h-0 overflow-hidden">

        {/* Left Column - Profile + Score + Findings */}
        <div className="col-span-12 lg:col-span-4 xl:col-span-3 flex flex-col gap-2 overflow-y-auto pr-1">
          {/* Profile Card */}
          <div className="p-2 border border-ivory-light/10 bg-ivory-light/[0.02]">
            {profile.displayName && (
              <p className="font-mono text-ivory-light/70 text-xs mb-0.5">{profile.displayName}</p>
            )}
            {profile.bio && (
              <p className="font-mono text-ivory-light/40 text-[10px] mb-1.5 line-clamp-2">{profile.bio}</p>
            )}
            <div className="flex items-center gap-3 text-[10px] font-mono text-ivory-light/40">
              {profile.followers && (
                <span className="flex items-center gap-1">
                  <Users size={10} />
                  {profile.followers.toLocaleString()}
                </span>
              )}
              {profile.createdAt && (
                <span className="flex items-center gap-1">
                  <Calendar size={10} />
                  {new Date(profile.createdAt).getFullYear()}
                </span>
              )}
            </div>
          </div>

          {/* Score Display */}
          <div className="p-2 border border-ivory-light/10 bg-ivory-light/[0.02]">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-baseline gap-1.5">
                <span
                  className="font-mono font-bold text-3xl"
                  style={{ color: scoreColor, textShadow: `0 0 15px ${scoreColor}30` }}
                >
                  {score.overall}
                </span>
                <span className="text-ivory-light/30 font-mono text-xs">/100</span>
              </div>
              <span
                className="font-mono text-[9px] px-1.5 py-0.5 border"
                style={{ borderColor: riskColor, color: riskColor, backgroundColor: `${riskColor}15` }}
              >
                {score.confidence}
              </span>
            </div>
            <p className="font-mono text-[10px] text-ivory-light/50 mb-2">{getScoreLabel(score.overall)}</p>

            {/* Risk Factors Mini */}
            {activeFactors.length > 0 && (
              <div className="pt-2 border-t border-ivory-light/10 space-y-1">
                {activeFactors.slice(0, 3).map((factor) => {
                  const config = SCORE_FACTOR_CONFIG[factor.type];
                  return (
                    <div key={factor.type} className="flex items-center justify-between text-[10px] font-mono">
                      <span className="text-ivory-light/50 truncate">{config.label}</span>
                      <span className="text-danger-orange shrink-0">-{factor.points}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Key Findings */}
          <div className="p-2 border border-ivory-light/10 bg-ivory-light/[0.02]">
            <h3 className="font-mono text-[10px] text-ivory-light/40 uppercase tracking-wider mb-1.5 flex items-center gap-1">
              <AlertTriangle size={10} className="text-danger-orange" />
              Findings
            </h3>
            {keyFindings.length === 0 ? (
              <p className="font-mono text-[10px] text-larp-green">No major concerns</p>
            ) : (
              <div className="space-y-1">
                {keyFindings.slice(0, 3).map((finding) => {
                  const isPositive = isPositiveFinding(finding);
                  const color = isPositive ? '#22c55e' : finding.severity === 'critical' ? '#dc2626' : '#f97316';
                  return (
                    <button
                      key={finding.id}
                      onClick={() => handleFindingClick(finding)}
                      className="w-full text-left p-1.5 bg-ivory-light/[0.03] hover:bg-ivory-light/[0.06] border border-ivory-light/5 hover:border-ivory-light/10 transition-all group"
                    >
                      <div className="flex items-center gap-1.5">
                        <div className="w-1 h-1 rounded-full shrink-0" style={{ backgroundColor: color }} />
                        <p className="font-mono text-[10px] text-ivory-light/70 truncate flex-1">{finding.title}</p>
                        <ChevronRight size={10} className="text-ivory-light/20 group-hover:text-danger-orange shrink-0" />
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Quick Stats */}
          <div className="flex gap-2">
            <div className="flex-1 p-1.5 border border-ivory-light/10 bg-ivory-light/[0.02] text-center">
              <p className="font-mono text-sm text-ivory-light">{report.postsAnalyzed}</p>
              <p className="font-mono text-[9px] text-ivory-light/40">posts</p>
            </div>
            <div className="flex-1 p-1.5 border border-ivory-light/10 bg-ivory-light/[0.02] text-center">
              <p className="font-mono text-sm text-ivory-light">{shilledEntities.length}</p>
              <p className="font-mono text-[9px] text-ivory-light/40">tokens</p>
            </div>
            <div className="flex-1 p-1.5 border border-ivory-light/10 bg-ivory-light/[0.02] text-center">
              <p className="font-mono text-sm text-ivory-light">{backlashEvents.length}</p>
              <p className="font-mono text-[9px] text-ivory-light/40">backlash</p>
            </div>
          </div>
        </div>

        {/* Right Column - Tabs + Content */}
        <div className="col-span-12 lg:col-span-8 xl:col-span-9 flex flex-col min-h-0 overflow-hidden">
          {/* Compact Tabs */}
          <div className="flex items-center gap-1 pb-2 border-b border-ivory-light/10 shrink-0 overflow-x-auto">
            {TABS.map((tab) => {
              const count = getTabCount(tab.id);
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 font-mono text-xs whitespace-nowrap border transition-all ${
                    activeTab === tab.id
                      ? 'text-danger-orange border-danger-orange bg-danger-orange/10'
                      : 'text-ivory-light/50 border-ivory-light/10 hover:border-ivory-light/20 hover:text-ivory-light/70'
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                  {count !== null && (
                    <span className={`px-1.5 py-0.5 text-[10px] ${
                      activeTab === tab.id ? 'bg-danger-orange/20' : 'bg-ivory-light/10'
                    }`}>
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Tab Content - Scrollable */}
          <div className="flex-1 overflow-y-auto pt-2">
                {activeTab === 'shills' && (
              <div>
                {shilledEntities.length === 0 ? (
                  <div className="p-4 border border-ivory-light/10 bg-ivory-light/[0.02] text-center">
                    <p className="font-mono text-xs text-ivory-light/50">No promotional activity detected</p>
                  </div>
                ) : (
                  <div className="border border-ivory-light/10">
                    <ShillTableHeader />
                    {shilledEntities.map((entity, i) => (
                      <ShillCard
                        key={entity.id}
                        entity={entity}
                        rank={i + 1}
                        onClick={() => openEvidence(`${entity.entityName} Promotions`, entity.evidenceIds)}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'backlash' && (
              <div>
                {backlashEvents.length === 0 ? (
                  <div className="p-4 border border-larp-green/20 bg-larp-green/5 text-center">
                    <p className="font-mono text-xs text-larp-green">No strong backlash signals detected</p>
                  </div>
                ) : (
                  <div className="grid gap-2 sm:grid-cols-2">
                    {backlashEvents.map((event) => (
                      <BacklashCard
                        key={event.id}
                        event={event}
                        onClick={() => openEvidence(event.summary, event.evidenceIds)}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'behavior' && (
              <div className="grid grid-cols-2 xl:grid-cols-4 gap-2">
                <BehaviorGauge
                  label="Toxicity"
                  score={behaviorMetrics.toxicity.score}
                  examples={behaviorMetrics.toxicity.examples}
                  description="Profanity and hostile language"
                  onExampleClick={() => openEvidence('Toxicity Examples', [])}
                  compact
                />
                <BehaviorGauge
                  label="Hype Intensity"
                  score={behaviorMetrics.hype.score}
                  examples={behaviorMetrics.hype.examples}
                  keywords={behaviorMetrics.hype.keywords}
                  description='"100x", "ape now" patterns'
                  onExampleClick={() => openEvidence('Hype Examples', [])}
                  compact
                />
                <BehaviorGauge
                  label="Aggression"
                  score={behaviorMetrics.aggression.score}
                  examples={behaviorMetrics.aggression.examples}
                  description="Harassment patterns"
                  onExampleClick={() => openEvidence('Aggression Examples', [])}
                  compact
                />
                <BehaviorGauge
                  label="Consistency"
                  score={behaviorMetrics.consistency.score}
                  invertColor
                  description={`Drift: ${behaviorMetrics.consistency.topicDrift}%`}
                  examples={behaviorMetrics.consistency.contradictions}
                  onExampleClick={() => openEvidence('Consistency Issues', [])}
                  compact
                />
              </div>
            )}

            {activeTab === 'network' && (
              <div className="grid lg:grid-cols-2 gap-4">
                {/* Top Interactions */}
                <div>
                  <h4 className="font-mono text-xs text-ivory-light/40 uppercase tracking-wider mb-2">Top Interactions</h4>
                  {networkMetrics.topInteractions.length === 0 ? (
                    <div className="p-3 border border-ivory-light/10 bg-ivory-light/[0.02] text-center">
                      <p className="font-mono text-xs text-ivory-light/50">No significant interactions</p>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {networkMetrics.topInteractions.slice(0, 6).map((account, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between p-2 border border-ivory-light/10 bg-ivory-light/[0.02] hover:bg-ivory-light/[0.04] transition-colors"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="font-mono text-xs text-danger-orange shrink-0">#{i + 1}</span>
                            <span className="font-mono text-xs text-ivory-light truncate">@{account.handle}</span>
                          </div>
                          <div className="flex items-center gap-2 text-[10px] font-mono shrink-0">
                            <span className="text-ivory-light/40">{account.followers?.toLocaleString()}</span>
                            <span className="text-danger-orange">{account.interactionCount}×</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Suspicious Patterns */}
                <div>
                  <h4 className="font-mono text-xs text-ivory-light/40 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <AlertTriangle size={11} className="text-danger-orange" />
                    Suspicious Patterns
                  </h4>
                  {networkMetrics.engagementHeuristics.suspiciousPatterns.length === 0 ? (
                    <div className="p-3 border border-larp-green/20 bg-larp-green/5 text-center">
                      <p className="font-mono text-xs text-larp-green">No suspicious patterns detected</p>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {networkMetrics.engagementHeuristics.suspiciousPatterns.map((pattern, i) => (
                        <div
                          key={i}
                          className="p-2 border border-danger-orange/20 bg-danger-orange/5 font-mono text-xs text-danger-orange"
                        >
                          {pattern}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'entities' && (
              <EntityList entities={linkedEntities} />
            )}
          </div>
        </div>
      </div>

      {/* Evidence Drawer */}
      <EvidenceDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={drawerTitle}
        evidence={drawerEvidence}
      />
    </div>
  );
}
