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
} from 'lucide-react';
import ReputationScore from '@/components/terminal/xintel/ReputationScore';
import RiskBadge from '@/components/terminal/xintel/RiskBadge';
import KeyFindings from '@/components/terminal/xintel/KeyFindings';
import ShillCard from '@/components/terminal/xintel/ShillCard';
import BacklashCard from '@/components/terminal/xintel/BacklashCard';
import BehaviorGauge from '@/components/terminal/xintel/BehaviorGauge';
import EntityList from '@/components/terminal/xintel/EntityList';
import EvidenceDrawer from '@/components/terminal/xintel/EvidenceDrawer';
import ShareButton from '@/components/terminal/xintel/ShareButton';
import { XIntelReport, XIntelEvidence, KeyFinding } from '@/types/xintel';

type TabId = 'overview' | 'shills' | 'backlash' | 'behavior' | 'network' | 'entities';

const TABS: { id: TabId; label: string; icon: React.ReactNode }[] = [
  { id: 'overview', label: 'Overview', icon: <TrendingUp size={16} /> },
  { id: 'shills', label: 'Shills', icon: <MessageSquare size={16} /> },
  { id: 'backlash', label: 'Backlash', icon: <AlertTriangle size={16} /> },
  { id: 'behavior', label: 'Behavior', icon: <Users size={16} /> },
  { id: 'network', label: 'Network', icon: <Network size={16} /> },
  { id: 'entities', label: 'Entities', icon: <Link2 size={16} /> },
];

interface PageProps {
  params: Promise<{ handle: string }>;
}

export default function XIntelReportPage({ params }: PageProps) {
  const { handle } = use(params);
  const [report, setReport] = useState<XIntelReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<TabId>('overview');
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

  return (
    <div className="space-y-6">
      {/* Back link */}
      <Link
        href="/terminal/xintel"
        className="inline-flex items-center gap-2 text-ivory-light/60 hover:text-ivory-light font-mono text-sm transition-colors"
      >
        <ArrowLeft size={16} />
        Back to Scanner
      </Link>

      {/* Profile Header */}
      <div className="p-6 border-2 border-ivory-light/20 bg-ivory-light/5">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
          {/* Profile info */}
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <h1 className="text-2xl sm:text-3xl font-mono font-bold text-ivory-light">
                @{profile.handle}
              </h1>
              {profile.verified && (
                <CheckCircle size={20} className="text-larp-green" />
              )}
              <RiskBadge level={score.riskLevel} />
            </div>

            {profile.displayName && (
              <p className="font-mono text-ivory-light/70 text-lg mb-2">
                {profile.displayName}
              </p>
            )}

            {profile.bio && (
              <p className="font-mono text-ivory-light/50 text-sm mb-4 max-w-xl">
                {profile.bio}
              </p>
            )}

            {/* Profile stats */}
            <div className="flex flex-wrap items-center gap-4 text-sm font-mono text-ivory-light/50">
              {profile.followers && (
                <div className="flex items-center gap-1.5">
                  <Users size={14} />
                  <span>{profile.followers.toLocaleString()} followers</span>
                </div>
              )}
              {profile.createdAt && (
                <div className="flex items-center gap-1.5">
                  <Calendar size={14} />
                  <span>Joined {new Date(profile.createdAt).getFullYear()}</span>
                </div>
              )}
            </div>
          </div>

          {/* Score */}
          <div className="lg:text-right">
            <ReputationScore score={score} size="md" />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 mt-6 pt-6 border-t border-ivory-light/10">
          <ShareButton handle={profile.handle} score={score.overall} />
          <div className="flex items-center gap-2 text-xs font-mono text-ivory-light/40">
            <Clock size={14} />
            <span>Scanned {formatDate(report.scanTime)}</span>
            {report.cached && (
              <span className="px-2 py-0.5 bg-ivory-light/10 border border-ivory-light/20">
                cached
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Key Findings (always visible) */}
      <div>
        <h2 className="font-mono font-bold text-ivory-light mb-3 flex items-center gap-2">
          <AlertTriangle size={18} className="text-danger-orange" />
          Key Findings
        </h2>
        <KeyFindings findings={keyFindings} onFindingClick={handleFindingClick} />
      </div>

      {/* Tabs */}
      <div className="border-b border-ivory-light/10">
        <div className="flex overflow-x-auto scrollbar-hide -mb-px">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 font-mono text-sm whitespace-nowrap border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'text-danger-orange border-danger-orange'
                  : 'text-ivory-light/50 border-transparent hover:text-ivory-light/70'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="min-h-[300px]">
        {activeTab === 'overview' && (
          <div className="grid md:grid-cols-2 gap-6">
            {/* Score breakdown */}
            <div>
              <h3 className="font-mono font-bold text-ivory-light mb-3">Score Breakdown</h3>
              <ReputationScore score={score} size="sm" showFactors />
            </div>

            {/* Quick stats */}
            <div>
              <h3 className="font-mono font-bold text-ivory-light mb-3">Analysis Summary</h3>
              <div className="space-y-2 text-sm font-mono">
                <div className="flex justify-between p-3 bg-ivory-light/5 border border-ivory-light/10">
                  <span className="text-ivory-light/60">Posts Analyzed</span>
                  <span className="text-ivory-light">{report.postsAnalyzed}</span>
                </div>
                <div className="flex justify-between p-3 bg-ivory-light/5 border border-ivory-light/10">
                  <span className="text-ivory-light/60">Tokens Promoted</span>
                  <span className="text-ivory-light">{shilledEntities.length}</span>
                </div>
                <div className="flex justify-between p-3 bg-ivory-light/5 border border-ivory-light/10">
                  <span className="text-ivory-light/60">Backlash Events</span>
                  <span className="text-ivory-light">{backlashEvents.length}</span>
                </div>
                <div className="flex justify-between p-3 bg-ivory-light/5 border border-ivory-light/10">
                  <span className="text-ivory-light/60">Linked Entities</span>
                  <span className="text-ivory-light">{linkedEntities.length}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'shills' && (
          <div>
            <h3 className="font-mono font-bold text-ivory-light mb-4">
              Promoted Tokens/Projects ({shilledEntities.length})
            </h3>
            {shilledEntities.length === 0 ? (
              <div className="p-6 border border-ivory-light/10 bg-ivory-light/5 text-center">
                <p className="font-mono text-ivory-light/50">No promotional activity detected</p>
              </div>
            ) : (
              <div className="space-y-3">
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
            <h3 className="font-mono font-bold text-ivory-light mb-4">
              Backlash Timeline ({backlashEvents.length})
            </h3>
            {backlashEvents.length === 0 ? (
              <div className="p-6 border border-larp-green/30 bg-larp-green/5 text-center">
                <p className="font-mono text-larp-green">No strong backlash signals detected</p>
              </div>
            ) : (
              <div className="space-y-3">
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
          <div className="grid md:grid-cols-2 gap-4">
            <BehaviorGauge
              label="Toxicity"
              score={behaviorMetrics.toxicity.score}
              examples={behaviorMetrics.toxicity.examples}
              description="Profanity and hostile language patterns"
              onExampleClick={() => openEvidence('Toxicity Examples', [])}
            />
            <BehaviorGauge
              label="Hype Intensity"
              score={behaviorMetrics.hype.score}
              examples={behaviorMetrics.hype.examples}
              keywords={behaviorMetrics.hype.keywords}
              description='"100x", "guaranteed", "ape now" patterns'
              onExampleClick={() => openEvidence('Hype Examples', [])}
            />
            <BehaviorGauge
              label="Aggression"
              score={behaviorMetrics.aggression.score}
              examples={behaviorMetrics.aggression.examples}
              description="Targeted harassment and attack patterns"
              onExampleClick={() => openEvidence('Aggression Examples', [])}
            />
            <BehaviorGauge
              label="Consistency"
              score={behaviorMetrics.consistency.score}
              invertColor
              description={`Topic drift: ${behaviorMetrics.consistency.topicDrift}%`}
              examples={behaviorMetrics.consistency.contradictions}
              onExampleClick={() => openEvidence('Consistency Issues', [])}
            />
          </div>
        )}

        {activeTab === 'network' && (
          <div>
            <h3 className="font-mono font-bold text-ivory-light mb-4">Top Interactions</h3>

            {networkMetrics.topInteractions.length === 0 ? (
              <div className="p-6 border border-ivory-light/10 bg-ivory-light/5 text-center">
                <p className="font-mono text-ivory-light/50">No significant interactions detected</p>
              </div>
            ) : (
              <div className="space-y-2 mb-6">
                {networkMetrics.topInteractions.map((account, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-3 border border-ivory-light/10 bg-ivory-light/5"
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-danger-orange">#{i + 1}</span>
                      <div>
                        <span className="font-mono text-ivory-light">@{account.handle}</span>
                        {account.displayName && (
                          <span className="font-mono text-ivory-light/50 text-sm ml-2">
                            {account.displayName}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-xs font-mono">
                      <span className="text-ivory-light/50">
                        {account.followers?.toLocaleString()} followers
                      </span>
                      <span className="text-danger-orange">
                        {account.interactionCount} {account.interactionType}s
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Engagement heuristics */}
            {networkMetrics.engagementHeuristics.suspiciousPatterns.length > 0 && (
              <div className="mt-6">
                <h4 className="font-mono font-bold text-ivory-light mb-3 flex items-center gap-2">
                  <AlertTriangle size={16} className="text-danger-orange" />
                  Suspicious Patterns
                </h4>
                <div className="space-y-2">
                  {networkMetrics.engagementHeuristics.suspiciousPatterns.map((pattern, i) => (
                    <div
                      key={i}
                      className="p-3 border border-danger-orange/30 bg-danger-orange/5 font-mono text-sm text-danger-orange"
                    >
                      {pattern}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'entities' && (
          <div>
            <h3 className="font-mono font-bold text-ivory-light mb-4">
              Linked Entities ({linkedEntities.length})
            </h3>
            <EntityList entities={linkedEntities} />
          </div>
        )}
      </div>

      {/* Disclaimer */}
      <div className="p-4 border border-ivory-light/10 bg-ivory-light/5 mt-8">
        <p className="font-mono text-xs text-ivory-light/40">
          <strong className="text-ivory-light/60">Disclaimer:</strong> {report.disclaimer}
        </p>
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
