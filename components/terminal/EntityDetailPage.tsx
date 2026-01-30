'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useTerminalNav } from '@/contexts/TerminalNavContext';
import type { SectionGroupId } from '@/contexts/TerminalNavContext';
import Image from 'next/image';
import {
  ArrowLeft,
  ExternalLink,
  Users,
  Shield,
  ShieldAlert,
  ShieldCheck,
  ShieldX,
  AlertTriangle,
  AlertOctagon,
  Loader2,
  Twitter,
  Share2,
  ChevronDown,
  ChevronUp,
  Star,
  GitFork,
  TrendingUp,
  TrendingDown,
  DollarSign,
  BarChart3,
  Clock,
  Building2,
  Award,
  Coins,
  Flame,
  Lock,
  Unlock,
  Target,
  CheckCircle2,
  Circle,
  XCircle,
  Cpu,
  Wifi,
  WifiOff,
  HardDrive,
  FileSearch,
  Calendar,
  GitCommit,
  Eye,
  CircleDot,
  Globe,
  MessageCircle,
  Send,
  Package,
  Snowflake,
  UserX,
  ThumbsUp,
  ThumbsDown,
  User,
  Boxes,
  Activity,
  Database,
  Link2,
  Hash,
} from 'lucide-react';
import ContractAvatar from '@/components/ContractAvatar';
import ClarpLoader from '@/components/ClarpLoader';
import type {
  Project,
  EntityType,
  LegalEntity,
  Affiliation,
  Tokenomics,
  LiquidityInfo,
  RoadmapMilestone,
  AuditInfo,
  TechStack,
  SecurityIntel,
  ShippingMilestone,
  SourceAttribution,
  SourceConflict,
  SourceFieldInfo,
  DataSourceId,
} from '@/types/project';

// ============================================================================
// PROPS
// ============================================================================

interface EntityDetailPageProps {
  project: Project | null;
  isLoading: boolean;
  expectedEntityType?: EntityType;
}

// ============================================================================
// UTILITIES
// ============================================================================

function getTrustColor(score: number): string {
  if (score >= 85) return '#22c55e';
  if (score >= 70) return '#84cc16';
  if (score >= 50) return '#6b7280';
  if (score >= 30) return '#f97316';
  return '#dc2626';
}

function getTrustLabel(score: number): string {
  if (score >= 85) return 'VERIFIED';
  if (score >= 70) return 'TRUSTED';
  if (score >= 50) return 'NEUTRAL';
  if (score >= 30) return 'CAUTION';
  return 'AVOID';
}

function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function formatNumber(num: number | undefined): string {
  if (!num) return '0';
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
  return num.toString();
}

function formatCurrency(num: number | undefined | null): string {
  if (!num) return '$0';
  if (num >= 1_000_000_000) return `$${(num / 1_000_000_000).toFixed(2)}B`;
  if (num >= 1_000_000) return `$${(num / 1_000_000).toFixed(2)}M`;
  if (num >= 1_000) return `$${(num / 1_000).toFixed(2)}K`;
  return `$${num.toFixed(2)}`;
}

function formatPrice(num: number | undefined): string {
  if (!num) return '$0.00';
  if (num < 0.0001) return `$${num.toExponential(2)}`;
  if (num < 1) return `$${num.toFixed(6)}`;
  return `$${num.toFixed(2)}`;
}

function formatSupply(val: number | string | undefined | null): string {
  if (!val) return '\u2014';
  const num = typeof val === 'string' ? parseFloat(val) : val;
  if (isNaN(num)) return String(val);
  if (num >= 1_000_000_000) return `${(num / 1_000_000_000).toFixed(2)}B`;
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(2)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(2)}K`;
  return num.toLocaleString();
}

function formatPercent(num: number | undefined | null): string {
  if (num === undefined || num === null) return '\u2014';
  return `${num.toFixed(1)}%`;
}

function getEntityTypeStyle(entityType?: EntityType) {
  switch (entityType) {
    case 'person':
      return {
        color: '#9B59B6',
        bgColor: 'bg-larp-purple/10',
        borderColor: 'border-larp-purple/30',
        icon: <User size={14} />,
        label: 'Person',
      };
    case 'organization':
      return {
        color: '#FFD93D',
        bgColor: 'bg-larp-yellow/10',
        borderColor: 'border-larp-yellow/30',
        icon: <Building2 size={14} />,
        label: 'Organization',
      };
    default:
      return {
        color: '#FF6B35',
        bgColor: 'bg-danger-orange/10',
        borderColor: 'border-danger-orange/30',
        icon: <Boxes size={14} />,
        label: 'Project',
      };
  }
}

// ============================================================================
// ICONS
// ============================================================================

function GithubIcon({ size = 24, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
    </svg>
  );
}

// ============================================================================
// DESIGN SYSTEM COMPONENTS
// ============================================================================

function Card({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`bg-slate-dark border border-ivory-light/10 h-full flex flex-col ${className}`}>
      {children}
    </div>
  );
}

function CardHeader({
  title,
  icon: Icon,
  accentColor = '#f97316',
  action,
}: {
  title: string;
  icon: React.ElementType;
  accentColor?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between px-4 py-3 border-b border-ivory-light/5 shrink-0">
      <div className="flex items-center gap-2">
        <Icon size={14} style={{ color: accentColor }} />
        <h3 className="text-xs font-mono uppercase tracking-wider text-ivory-light/70">{title}</h3>
      </div>
      {action}
    </div>
  );
}

function CardBody({ children, className = '', scrollable = false }: { children: React.ReactNode; className?: string; scrollable?: boolean }) {
  return (
    <div className={`p-4 flex-1 ${scrollable ? 'overflow-y-auto max-h-[320px]' : ''} ${className}`}>
      {children}
    </div>
  );
}

function Badge({
  children,
  variant = 'default',
}: {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
}) {
  const styles = {
    default: 'bg-ivory-light/5 border-ivory-light/10 text-ivory-light/60',
    success: 'bg-larp-green/10 border-larp-green/20 text-larp-green',
    warning: 'bg-larp-yellow/10 border-larp-yellow/20 text-larp-yellow',
    danger: 'bg-larp-red/10 border-larp-red/20 text-larp-red',
    info: 'bg-blue-500/10 border-blue-500/20 text-blue-400',
  };

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-mono border ${styles[variant]}`}>
      {children}
    </span>
  );
}

function DataRow({
  label,
  value,
  link,
  mono = true,
}: {
  label: string;
  value: React.ReactNode;
  link?: string;
  mono?: boolean;
}) {
  const content = (
    <div className="flex items-center justify-between py-2 group border-b border-ivory-light/5 last:border-0">
      <span className="text-xs text-ivory-light/40">{label}</span>
      <span className={`${mono ? 'font-mono' : ''} text-xs text-ivory-light ${link ? 'group-hover:text-danger-orange transition-colors' : ''}`}>
        {value}
        {link && <ExternalLink size={9} className="inline ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />}
      </span>
    </div>
  );

  if (link) {
    return (
      <a href={link} target="_blank" rel="noopener noreferrer" className="block hover:bg-ivory-light/[0.02] transition-colors">
        {content}
      </a>
    );
  }

  return content;
}

/** Placeholder data row for empty states — shows label with dash value */
function PlaceholderRow({ label }: { label: string }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-ivory-light/5 last:border-0">
      <span className="text-xs text-ivory-light/25">{label}</span>
      <span className="font-mono text-xs text-ivory-light/15">&mdash;</span>
    </div>
  );
}

function SourceBadge({ source }: { source: DataSourceId }) {
  const styles: Record<DataSourceId, { bg: string; text: string; label: string }> = {
    osint: { bg: 'bg-blue-500/10 border-blue-500/20', text: 'text-blue-400', label: 'OSINT' },
    grok: { bg: 'bg-larp-purple/10 border-larp-purple/20', text: 'text-larp-purple', label: 'GROK' },
    perplexity: { bg: 'bg-larp-green/10 border-larp-green/20', text: 'text-larp-green', label: 'PPLX' },
  };
  const s = styles[source] || styles.osint;
  return (
    <span className={`inline-flex items-center px-1.5 py-0.5 text-[9px] font-mono border ${s.bg} ${s.text}`}>
      {s.label}
    </span>
  );
}

function ConfidenceDot({ confidence }: { confidence: 'low' | 'medium' | 'high' }) {
  const colors = { low: '#dc2626', medium: '#f59e0b', high: '#22c55e' };
  return (
    <span className="flex items-center gap-1">
      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: colors[confidence] }} />
      <span className="text-[10px] text-ivory-light/40 capitalize">{confidence}</span>
    </span>
  );
}

// ============================================================================
// SECTION NAV (Sticky horizontal scroll-spy)
// ============================================================================

const SECTION_GROUPS: { id: SectionGroupId; label: string; icon: React.ElementType }[] = [
  { id: 'overview', label: 'Overview', icon: Eye },
  { id: 'trust', label: 'Trust', icon: Shield },
  { id: 'security', label: 'Security', icon: ShieldCheck },
  { id: 'market', label: 'Market', icon: BarChart3 },
  { id: 'tokenomics', label: 'Tokenomics', icon: Coins },
  { id: 'intel', label: 'Intel', icon: Globe },
  { id: 'development', label: 'Development', icon: GithubIcon },
  { id: 'sources', label: 'Sources', icon: Database },
];

function SectionNav({
  activeGroup,
  onGroupClick,
}: {
  activeGroup: SectionGroupId;
  onGroupClick: (id: SectionGroupId) => void;
}) {
  return (
    <div className="overflow-x-auto scrollbar-hide">
      <div className="flex items-center gap-0.5 min-w-max">
        {SECTION_GROUPS.map((group) => {
          const Icon = group.icon;
          const isActive = activeGroup === group.id;
          return (
            <button
              key={group.id}
              onClick={() => onGroupClick(group.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-mono transition-all whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'text-danger-orange border-b-2 border-danger-orange'
                  : 'text-ivory-light/40 hover:text-ivory-light/70 border-b-2 border-transparent'
              }`}
            >
              <Icon size={12} />
              <span>{group.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ============================================================================
// GROUP HEADING
// ============================================================================

function GroupHeading({ id, label, icon: Icon }: { id: string; label: string; icon: React.ElementType }) {
  return (
    <div id={`group-${id}`} className="flex items-center gap-2 pt-8 pb-3 scroll-mt-28">
      <div className="w-6 h-px bg-danger-orange/40" />
      <Icon size={14} className="text-danger-orange/70" />
      <h2 className="text-xs font-mono uppercase tracking-[0.2em] text-ivory-light/50">{label}</h2>
      <div className="flex-1 h-px bg-ivory-light/5" />
    </div>
  );
}

// ============================================================================
// SECTION COMPONENTS — All always render, with skeleton empty states
// ============================================================================

// -- ABOUT --
function AboutSection({ project }: { project: Project }) {
  const content = project.theStory || project.description || project.aiSummary;
  return (
    <Card>
      <CardHeader title="About" icon={Eye} accentColor="#f97316" />
      <CardBody>
        {content ? (
          <p className="text-sm text-ivory-light/70 leading-relaxed">{content}</p>
        ) : (
          <div className="space-y-0">
            <PlaceholderRow label="Narrative" />
            <PlaceholderRow label="Description" />
            <PlaceholderRow label="AI Summary" />
          </div>
        )}
      </CardBody>
    </Card>
  );
}

// -- KEY FINDINGS --
function KeyFindingsSection({ findings }: { findings?: string[] | null }) {
  return (
    <Card>
      <CardHeader title="Key Findings" icon={Eye} accentColor="#f97316" />
      <CardBody scrollable>
        {findings && findings.length > 0 ? (
          <ul className="space-y-2">
            {findings.map((finding, idx) => (
              <li key={idx} className="flex items-start gap-2 text-sm text-ivory-light/70">
                <span className="text-danger-orange mt-0.5 shrink-0">&#8226;</span>
                <span>{finding}</span>
              </li>
            ))}
          </ul>
        ) : (
          <div className="space-y-0">
            <PlaceholderRow label="Finding 1" />
            <PlaceholderRow label="Finding 2" />
            <PlaceholderRow label="Finding 3" />
          </div>
        )}
      </CardBody>
    </Card>
  );
}

// -- TAGS --
function TagsSection({ tags }: { tags?: string[] | null }) {
  return (
    <Card>
      <CardHeader title="Tags" icon={Target} accentColor="#6b7280" />
      <CardBody>
        {tags && tags.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {tags.map((tag) => (
              <Badge key={tag}>{tag}</Badge>
            ))}
          </div>
        ) : (
          <div className="space-y-0">
            <PlaceholderRow label="Category" />
            <PlaceholderRow label="Sector" />
            <PlaceholderRow label="Chain" />
          </div>
        )}
      </CardBody>
    </Card>
  );
}

// -- SOCIAL METRICS (NEW) --
function SocialMetricsSection({ metrics }: { metrics?: Project['socialMetrics'] }) {
  return (
    <Card>
      <CardHeader title="Social Metrics" icon={Activity} accentColor="#3b82f6" />
      <CardBody>
        <div className="space-y-0">
          <DataRow
            label="Followers"
            value={metrics?.followers !== undefined ? formatNumber(metrics.followers) : '\u2014'}
          />
          <DataRow
            label="Engagement Rate"
            value={metrics?.engagement !== undefined ? `${metrics.engagement.toFixed(2)}%` : '\u2014'}
          />
          <DataRow
            label="Posts / Week"
            value={metrics?.postsPerWeek !== undefined ? metrics.postsPerWeek.toFixed(1) : '\u2014'}
          />
        </div>
      </CardBody>
    </Card>
  );
}

// -- TRUST SIGNALS --
function TrustSignalsSection({ project }: { project: Project }) {
  const pos = project.positiveIndicators;
  const neg = project.negativeIndicators;

  // Positive signal entries — always show all fields
  const positiveFields: Array<{ label: string; active: boolean; detail?: string | null }> = [
    { label: 'Team Doxxed', active: !!pos?.isDoxxed, detail: pos?.doxxedDetails },
    { label: 'Active GitHub', active: !!pos?.hasActiveGithub, detail: pos?.githubActivity },
    { label: 'Real Product', active: !!pos?.hasRealProduct, detail: pos?.productDetails },
    { label: 'Consistent History', active: !!pos?.hasConsistentHistory },
    { label: 'Organic Engagement', active: !!pos?.hasOrganicEngagement },
    { label: 'Credible Backers', active: !!pos?.hasCredibleBackers, detail: pos?.backersDetails },
    { label: `Account Age: ${pos?.accountAgeDays ? Math.floor(pos.accountAgeDays / 365) + '+ yrs' : '\u2014'}`, active: pos ? pos.accountAgeDays > 365 : false },
  ];

  // Negative signal entries — always show all fields
  const negativeFields: Array<{ label: string; active: boolean; detail?: string | null; severity: 'high' | 'medium' | 'low' }> = [
    { label: 'Scam Allegations', active: !!neg?.hasScamAllegations, detail: neg?.scamDetails, severity: 'high' },
    { label: 'Rug History', active: !!neg?.hasRugHistory, detail: neg?.rugDetails, severity: 'high' },
    { label: 'Anonymous Team', active: !!neg?.isAnonymousTeam, severity: 'medium' },
    { label: 'Suspicious Followers', active: !!neg?.hasSuspiciousFollowers, detail: neg?.suspiciousDetails, severity: 'medium' },
    { label: 'Previous Rebrand', active: !!neg?.hasPreviousRebrand, detail: neg?.rebrandDetails, severity: 'low' },
    { label: 'Hype Language', active: !!neg?.hasHypeLanguage, severity: 'low' },
    { label: 'Aggressive Promotion', active: !!neg?.hasAggressivePromotion, detail: neg?.promotionDetails, severity: 'low' },
    { label: 'No Public Audit', active: !!neg?.noPublicAudit, severity: 'medium' },
    { label: 'Low Liquidity', active: !!neg?.lowLiquidity, severity: 'medium' },
    { label: 'Unverified Legal Entity', active: !!neg?.unverifiedLegalEntity, severity: 'low' },
  ];

  const activePositive = positiveFields.filter(f => f.active).length;
  const activeNegative = negativeFields.filter(f => f.active).length;

  return (
    <Card>
      <CardHeader
        title="Trust Signals"
        icon={Shield}
        accentColor={activeNegative > 0 && negativeFields.some(s => s.active && s.severity === 'high') ? '#dc2626' : activePositive > activeNegative ? '#22c55e' : '#f97316'}
      />
      <CardBody scrollable className="space-y-4">
        {/* Positive */}
        <div>
          <div className="flex items-center gap-1 text-xs text-larp-green mb-2">
            <ThumbsUp size={12} />
            <span className="font-medium">Positive ({activePositive})</span>
          </div>
          <div className="space-y-1">
            {positiveFields.map((signal, idx) => (
              <div key={idx} className={`flex items-start gap-2 p-2 border ${
                signal.active
                  ? 'bg-larp-green/5 border-larp-green/10'
                  : 'bg-ivory-light/[0.01] border-ivory-light/5'
              }`}>
                {signal.active ? (
                  <CheckCircle2 size={12} className="text-larp-green mt-0.5 shrink-0" />
                ) : (
                  <Circle size={12} className="text-ivory-light/15 mt-0.5 shrink-0" />
                )}
                <div className="min-w-0">
                  <span className={`text-xs ${signal.active ? 'text-ivory-light' : 'text-ivory-light/25'}`}>
                    {signal.label}
                  </span>
                  {signal.active && signal.detail && (
                    <p className="text-[10px] text-ivory-light/50 mt-0.5">{signal.detail}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Negative */}
        <div>
          <div className="flex items-center gap-1 text-xs text-larp-red mb-2">
            <ThumbsDown size={12} />
            <span className="font-medium">Risk Signals ({activeNegative})</span>
          </div>
          <div className="space-y-1">
            {negativeFields.map((signal, idx) => (
              <div
                key={idx}
                className={`flex items-start gap-2 p-2 border ${
                  signal.active
                    ? signal.severity === 'high'
                      ? 'bg-larp-red/10 border-larp-red/30'
                      : signal.severity === 'medium'
                      ? 'bg-larp-yellow/5 border-larp-yellow/20'
                      : 'bg-ivory-light/[0.02] border-ivory-light/10'
                    : 'bg-ivory-light/[0.01] border-ivory-light/5'
                }`}
              >
                {signal.active ? (
                  <XCircle
                    size={12}
                    className={`mt-0.5 shrink-0 ${
                      signal.severity === 'high' ? 'text-larp-red' : signal.severity === 'medium' ? 'text-larp-yellow' : 'text-ivory-light/40'
                    }`}
                  />
                ) : (
                  <Circle size={12} className="text-ivory-light/15 mt-0.5 shrink-0" />
                )}
                <div className="min-w-0">
                  <span className={`text-xs ${
                    signal.active
                      ? signal.severity === 'high' ? 'text-larp-red' : 'text-ivory-light'
                      : 'text-ivory-light/25'
                  }`}>
                    {signal.label}
                  </span>
                  {signal.active && signal.detail && (
                    <p className="text-[10px] text-ivory-light/50 mt-0.5">{signal.detail}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardBody>
    </Card>
  );
}

// -- CONTROVERSIES --
function ControversiesSection({ controversies }: { controversies?: string[] | null }) {
  return (
    <Card>
      <CardHeader
        title="Controversies"
        icon={AlertOctagon}
        accentColor={controversies && controversies.length > 0 ? '#dc2626' : '#22c55e'}
      />
      <CardBody scrollable>
        {controversies && controversies.length > 0 ? (
          <div className="space-y-2">
            {controversies.map((item, idx) => (
              <div key={idx} className="flex items-start gap-2 p-3 bg-larp-red/5 border border-larp-red/10">
                <AlertTriangle size={12} className="text-larp-red mt-0.5 shrink-0" />
                <span className="text-xs text-ivory-light/70">{item}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-4 bg-larp-green/5 border border-larp-green/20 text-center">
            <CheckCircle2 size={20} className="mx-auto mb-1 text-larp-green" />
            <p className="text-xs text-larp-green font-mono">No controversies found</p>
          </div>
        )}
      </CardBody>
    </Card>
  );
}

// -- SECURITY INTEL --
function SecurityIntelSection({ security }: { security?: SecurityIntel | null }) {
  return (
    <Card>
      <CardHeader
        title="Security Intel"
        icon={security && !security.mintAuthorityEnabled && !security.freezeAuthorityEnabled && security.lpLocked ? ShieldCheck : ShieldAlert}
        accentColor={security && !security.mintAuthorityEnabled && !security.freezeAuthorityEnabled && security.lpLocked && (!security.risks || security.risks.length === 0) ? '#22c55e' : '#f97316'}
      />
      <CardBody scrollable className="space-y-4">
        {/* Authority Grid — always show */}
        <div className="grid grid-cols-2 gap-2">
          <div className={`flex items-center gap-2 p-3 border ${
            security
              ? !security.mintAuthorityEnabled ? 'border-larp-green/20 bg-larp-green/5' : 'border-larp-red/20 bg-larp-red/5'
              : 'border-ivory-light/5 bg-ivory-light/[0.01]'
          }`}>
            {security ? (
              !security.mintAuthorityEnabled
                ? <Lock size={14} className="text-larp-green shrink-0" />
                : <Unlock size={14} className="text-larp-red shrink-0" />
            ) : (
              <Lock size={14} className="text-ivory-light/15 shrink-0" />
            )}
            <div className="min-w-0">
              <div className="text-[10px] text-ivory-light/40 uppercase">Mint</div>
              <div className={`text-xs font-mono truncate ${
                security
                  ? security.mintAuthorityEnabled ? 'text-larp-red' : 'text-larp-green'
                  : 'text-ivory-light/15'
              }`}>
                {security ? (security.mintAuthorityEnabled ? 'ENABLED' : 'DISABLED') : '\u2014'}
              </div>
            </div>
          </div>

          <div className={`flex items-center gap-2 p-3 border ${
            security
              ? !security.freezeAuthorityEnabled ? 'border-larp-green/20 bg-larp-green/5' : 'border-larp-red/20 bg-larp-red/5'
              : 'border-ivory-light/5 bg-ivory-light/[0.01]'
          }`}>
            {security ? (
              !security.freezeAuthorityEnabled
                ? <ShieldCheck size={14} className="text-larp-green shrink-0" />
                : <Snowflake size={14} className="text-larp-red shrink-0" />
            ) : (
              <ShieldCheck size={14} className="text-ivory-light/15 shrink-0" />
            )}
            <div className="min-w-0">
              <div className="text-[10px] text-ivory-light/40 uppercase">Freeze</div>
              <div className={`text-xs font-mono truncate ${
                security
                  ? security.freezeAuthorityEnabled ? 'text-larp-red' : 'text-larp-green'
                  : 'text-ivory-light/15'
              }`}>
                {security ? (security.freezeAuthorityEnabled ? 'ENABLED' : 'DISABLED') : '\u2014'}
              </div>
            </div>
          </div>

          <div className={`flex items-center gap-2 p-3 border ${
            security
              ? security.lpLocked ? 'border-larp-green/20 bg-larp-green/5' : 'border-larp-yellow/20 bg-larp-yellow/5'
              : 'border-ivory-light/5 bg-ivory-light/[0.01]'
          }`}>
            {security ? (
              security.lpLocked
                ? <Lock size={14} className="text-larp-green shrink-0" />
                : <Unlock size={14} className="text-larp-yellow shrink-0" />
            ) : (
              <Lock size={14} className="text-ivory-light/15 shrink-0" />
            )}
            <div className="min-w-0">
              <div className="text-[10px] text-ivory-light/40 uppercase">LP Status</div>
              <div className={`text-xs font-mono truncate ${
                security
                  ? security.lpLocked ? 'text-larp-green' : 'text-larp-yellow'
                  : 'text-ivory-light/15'
              }`}>
                {security ? (security.lpLocked ? `LOCKED${security.lpLockedPercent ? ` ${security.lpLockedPercent}%` : ''}` : 'UNLOCKED') : '\u2014'}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 p-3 border border-ivory-light/5 bg-ivory-light/[0.01]">
            <Users size={14} className={security?.holdersCount ? 'text-ivory-light/50' : 'text-ivory-light/15'} />
            <div className="min-w-0">
              <div className="text-[10px] text-ivory-light/40 uppercase">Holders</div>
              <div className={`text-xs font-mono truncate ${security?.holdersCount ? 'text-ivory-light' : 'text-ivory-light/15'}`}>
                {security?.holdersCount ? formatNumber(security.holdersCount) : '\u2014'}
              </div>
            </div>
          </div>
        </div>

        {/* Additional fields */}
        <div className="space-y-0">
          <DataRow label="Top 10 Holders %" value={formatPercent(security?.top10HoldersPercent)} />
          <DataRow label="Domain Age" value={security?.domainAgeDays !== undefined ? (
            <span style={{ color: security.domainAgeDays > 365 ? '#22c55e' : security.domainAgeDays < 30 ? '#dc2626' : undefined }}>
              {security.domainAgeDays} days
            </span>
          ) : '\u2014'} />
          <DataRow label="Registrar" value={security?.domainRegistrar || '\u2014'} />
        </div>

        {/* Risk Flags */}
        {security?.risks && security.risks.length > 0 ? (
          <div className="p-3 bg-larp-red/5 border border-larp-red/20">
            <div className="flex items-center gap-2 text-xs text-larp-red font-medium mb-2">
              <AlertOctagon size={12} />
              RISK FLAGS ({security.risks.length})
            </div>
            <ul className="space-y-1.5">
              {security.risks.map((risk, idx) => (
                <li key={idx} className="flex items-start gap-2 text-xs text-ivory-light/60">
                  <XCircle size={10} className="text-larp-red mt-0.5 shrink-0" />
                  {risk}
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="p-3 border border-ivory-light/5">
            <div className="flex items-center gap-2 text-xs text-ivory-light/25 font-medium">
              <AlertOctagon size={12} />
              Risk Flags: {security ? 'None detected' : '\u2014'}
            </div>
          </div>
        )}
      </CardBody>
    </Card>
  );
}

// -- AUDIT --
function AuditSection({ audit }: { audit?: AuditInfo | null }) {
  const auditColor = audit?.auditStatus === 'completed' ? '#22c55e' :
                     audit?.auditStatus === 'pending' ? '#f59e0b' : '#6b7280';
  return (
    <Card>
      <CardHeader title="Security Audit" icon={FileSearch} accentColor={auditColor} />
      <CardBody>
        <div className="space-y-0">
          <DataRow
            label="Status"
            value={
              audit?.hasAudit ? (
                <Badge variant="success">Audited</Badge>
              ) : audit?.auditStatus === 'pending' ? (
                <Badge variant="warning">Pending</Badge>
              ) : (
                <Badge variant="danger">No Audit</Badge>
              )
            }
          />
          <DataRow label="Auditor" value={audit?.auditor || '\u2014'} />
          <DataRow label="Date" value={audit?.auditDate || '\u2014'} />
          {audit?.auditUrl ? (
            <DataRow label="Report" value="View Report" link={audit.auditUrl} />
          ) : (
            <PlaceholderRow label="Report" />
          )}
        </div>
      </CardBody>
    </Card>
  );
}

// -- MARKET DATA --
function MarketSection({ project }: { project: Project }) {
  const market = project.marketData;
  const priceUp = (market?.priceChange24h ?? 0) >= 0;

  return (
    <Card>
      <CardHeader
        title="Market Data"
        icon={BarChart3}
        accentColor={market ? (priceUp ? '#22c55e' : '#dc2626') : '#6b7280'}
        action={
          project.tokenAddress && (
            <a
              href={`https://dexscreener.com/solana/${project.tokenAddress}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[10px] text-ivory-light/30 hover:text-danger-orange transition-colors flex items-center gap-1"
            >
              DexScreener <ExternalLink size={10} />
            </a>
          )
        }
      />
      <CardBody>
        {/* Price Hero */}
        <div className="mb-4 pb-4 border-b border-ivory-light/5">
          <div className="flex items-baseline gap-3">
            <span className={`text-2xl font-mono font-bold ${market ? 'text-ivory-light' : 'text-ivory-light/15'}`}>
              {market ? formatPrice(market.price) : '$\u2014'}
            </span>
            {market && market.priceChange24h !== undefined && (
              <span className={`flex items-center gap-0.5 text-sm font-mono ${priceUp ? 'text-larp-green' : 'text-larp-red'}`}>
                {priceUp ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                {priceUp ? '+' : ''}{market.priceChange24h.toFixed(2)}%
              </span>
            )}
          </div>
        </div>

        <div className="space-y-0">
          <DataRow label="Market Cap" value={market?.marketCap ? formatCurrency(market.marketCap) : '\u2014'} />
          <DataRow label="24h Volume" value={market?.volume24h ? formatCurrency(market.volume24h) : '\u2014'} />
          <DataRow label="Liquidity" value={market?.liquidity ? formatCurrency(market.liquidity) : '\u2014'} />
        </div>
      </CardBody>
    </Card>
  );
}

// -- LIQUIDITY --
function LiquiditySection({ liquidity }: { liquidity?: LiquidityInfo | null }) {
  return (
    <Card>
      <CardHeader
        title="Liquidity"
        icon={DollarSign}
        accentColor={liquidity ? (liquidity.liquidityLocked ? '#22c55e' : '#f97316') : '#6b7280'}
      />
      <CardBody>
        <div className="space-y-0">
          <DataRow label="Primary DEX" value={liquidity?.primaryDex || '\u2014'} />
          <DataRow label="Pool Type" value={liquidity?.poolType || '\u2014'} />
          <DataRow
            label="Liquidity USD"
            value={
              liquidity?.liquidityUsd ? (
                <span style={{
                  color: liquidity.liquidityUsd > 100000 ? '#22c55e' :
                         liquidity.liquidityUsd < 10000 ? '#dc2626' : undefined
                }}>
                  {formatCurrency(liquidity.liquidityUsd)}
                </span>
              ) : '\u2014'
            }
          />
          <DataRow
            label="Lock Status"
            value={
              liquidity ? (
                liquidity.liquidityLocked ? (
                  <span className="flex items-center gap-1 text-larp-green">
                    <Lock size={12} /> Locked
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-danger-orange">
                    <Unlock size={12} /> Unlocked
                  </span>
                )
              ) : '\u2014'
            }
          />
          <DataRow label="Lock Duration" value={liquidity?.lockDuration || '\u2014'} />
        </div>
      </CardBody>
    </Card>
  );
}

// -- TOKENOMICS --
function TokenomicsSection({ tokenomics }: { tokenomics?: Tokenomics | null }) {
  return (
    <Card>
      <CardHeader title="Tokenomics" icon={Coins} accentColor={tokenomics ? '#f59e0b' : '#6b7280'} />
      <CardBody>
        <div className="space-y-0">
          <DataRow label="Total Supply" value={tokenomics?.totalSupply ? formatSupply(tokenomics.totalSupply) : '\u2014'} />
          <DataRow label="Circulating" value={tokenomics?.circulatingSupply ? formatSupply(tokenomics.circulatingSupply) : '\u2014'} />
          <DataRow
            label="Deflationary"
            value={
              tokenomics ? (
                tokenomics.isDeflationary ? (
                  <span className="flex items-center gap-1 text-danger-orange">
                    <Flame size={12} /> Yes
                  </span>
                ) : 'No'
              ) : '\u2014'
            }
          />
          <DataRow label="Vesting" value={tokenomics?.vestingSchedule || '\u2014'} mono={false} />
          <DataRow label="Burn Rate" value={tokenomics?.burnRate || '\u2014'} />
        </div>
        {tokenomics?.burnMechanism ? (
          <div className="mt-4 p-3 bg-danger-orange/5 border-l-2 border-danger-orange/30">
            <div className="flex items-center gap-1 text-xs text-danger-orange mb-1">
              <Flame size={10} /> Burn Mechanism
            </div>
            <p className="text-xs text-ivory-light/60">{tokenomics.burnMechanism}</p>
          </div>
        ) : (
          <div className="mt-4 p-3 border-l-2 border-ivory-light/5">
            <div className="flex items-center gap-1 text-xs text-ivory-light/20 mb-1">
              <Flame size={10} /> Burn Mechanism
            </div>
            <p className="text-xs text-ivory-light/15">&mdash;</p>
          </div>
        )}
      </CardBody>
    </Card>
  );
}

// -- TECH STACK --
function TechStackSection({ techStack }: { techStack?: TechStack | null }) {
  return (
    <Card>
      <CardHeader title="Tech Stack" icon={Cpu} accentColor={techStack?.zkTech ? '#a855f7' : techStack ? '#6366f1' : '#6b7280'} />
      <CardBody>
        <div className="space-y-0">
          <DataRow label="Blockchain" value={techStack?.blockchain || '\u2014'} />
          <DataRow
            label="ZK Technology"
            value={techStack?.zkTech ? <span className="text-purple-400">{techStack.zkTech}</span> : '\u2014'}
          />
          <DataRow
            label="Offline Capable"
            value={
              techStack ? (
                techStack.offlineCapability ? (
                  <span className="flex items-center gap-1 text-larp-green">
                    <Wifi size={12} /> Yes
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-ivory-light/40">
                    <WifiOff size={12} /> No
                  </span>
                )
              ) : '\u2014'
            }
          />
        </div>
        <div className="mt-4 pt-4 border-t border-ivory-light/5">
          <div className="text-[10px] text-ivory-light/40 uppercase tracking-wider mb-2 flex items-center gap-1">
            <HardDrive size={10} /> Hardware Products
          </div>
          {techStack?.hardwareProducts && techStack.hardwareProducts.length > 0 ? (
            <div className="flex flex-wrap gap-1">
              {techStack.hardwareProducts.map((product, idx) => (
                <Badge key={idx}>{product}</Badge>
              ))}
            </div>
          ) : (
            <span className="text-xs text-ivory-light/15 font-mono">&mdash;</span>
          )}
        </div>
      </CardBody>
    </Card>
  );
}

// -- WEBSITE INTEL --
function WebsiteIntelSection({ intel, websiteUrl }: { intel?: Project['websiteIntel']; websiteUrl?: string }) {
  const qualityColors: Record<string, string> = {
    professional: '#22c55e',
    basic: '#6b7280',
    suspicious: '#dc2626',
    unknown: '#6b7280',
  };

  const checkItems = [
    { key: 'isLive', label: 'Website Live', value: intel?.isLive },
    { key: 'hasDocumentation', label: 'Documentation', value: intel?.hasDocumentation },
    { key: 'hasRoadmap', label: 'Roadmap Page', value: intel?.hasRoadmap },
    { key: 'hasTokenomics', label: 'Tokenomics Page', value: intel?.hasTokenomics },
    { key: 'hasTeamPage', label: 'Team Page', value: intel?.hasTeamPage },
    { key: 'hasAuditInfo', label: 'Audit Info', value: intel?.hasAuditInfo },
  ];

  return (
    <Card>
      <CardHeader
        title="Website Intel"
        icon={Globe}
        accentColor={intel ? (qualityColors[intel.websiteQuality] || '#6b7280') : '#6b7280'}
        action={
          websiteUrl && (
            <a
              href={websiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[10px] text-ivory-light/30 hover:text-danger-orange transition-colors flex items-center gap-1"
            >
              Visit <ExternalLink size={10} />
            </a>
          )
        }
      />
      <CardBody>
        {/* Quality Score */}
        <div className="flex items-center justify-between mb-4 p-3 bg-ivory-light/[0.02] border border-ivory-light/10">
          <div>
            <div className="text-[10px] text-ivory-light/40 uppercase">Quality</div>
            <div className="text-sm font-mono font-medium capitalize"
              style={{ color: intel ? (qualityColors[intel.websiteQuality] || '#6b7280') : undefined }}>
              {intel?.websiteQuality || '\u2014'}
            </div>
          </div>
          <div className="text-right">
            <div className="text-[10px] text-ivory-light/40 uppercase">Score</div>
            <div className="text-sm font-mono font-bold"
              style={{ color: intel ? (qualityColors[intel.websiteQuality] || '#6b7280') : undefined }}>
              {intel?.qualityScore !== undefined ? `${intel.qualityScore}/100` : '\u2014'}
            </div>
          </div>
        </div>

        {/* Checklist */}
        <div className="grid grid-cols-2 gap-1 mb-4">
          {checkItems.map((item) => (
            <div key={item.key} className="flex items-center gap-2 py-1.5">
              {item.value ? (
                <CheckCircle2 size={12} className="text-larp-green shrink-0" />
              ) : (
                <XCircle size={12} className="text-ivory-light/15 shrink-0" />
              )}
              <span className={`text-xs ${item.value ? 'text-ivory-light/70' : 'text-ivory-light/25'}`}>
                {item.label}
              </span>
            </div>
          ))}
        </div>

        {/* Trust Indicators */}
        <div className="mb-3">
          <div className="text-[10px] text-larp-green/70 mb-2 flex items-center gap-1 uppercase tracking-wider">
            <ThumbsUp size={10} /> Trust Indicators
          </div>
          {intel?.trustIndicators && intel.trustIndicators.length > 0 ? (
            <div className="flex flex-wrap gap-1">
              {intel.trustIndicators.map((indicator, idx) => (
                <Badge key={idx} variant="success">{indicator}</Badge>
              ))}
            </div>
          ) : (
            <span className="text-xs text-ivory-light/15 font-mono">&mdash;</span>
          )}
        </div>

        {/* Red Flags */}
        <div>
          <div className="text-[10px] text-larp-red/70 mb-2 flex items-center gap-1 uppercase tracking-wider">
            <AlertTriangle size={10} /> Red Flags
          </div>
          {intel?.redFlags && intel.redFlags.length > 0 ? (
            <div className="flex flex-wrap gap-1">
              {intel.redFlags.map((flag, idx) => (
                <Badge key={idx} variant="danger">{flag}</Badge>
              ))}
            </div>
          ) : (
            <span className="text-xs text-ivory-light/15 font-mono">&mdash;</span>
          )}
        </div>
      </CardBody>
    </Card>
  );
}

// -- LEGAL ENTITY --
function LegalSection({ entity }: { entity?: LegalEntity | null }) {
  return (
    <Card>
      <CardHeader
        title="Legal Entity"
        icon={Building2}
        accentColor={entity?.isRegistered ? '#22c55e' : '#6b7280'}
      />
      <CardBody>
        <div className="space-y-0">
          <DataRow label="Company" value={entity?.companyName || '\u2014'} />
          <DataRow label="Jurisdiction" value={entity?.jurisdiction || '\u2014'} />
          <DataRow
            label="Status"
            value={
              entity?.isRegistered ? (
                <Badge variant="success">Verified</Badge>
              ) : entity ? (
                <Badge variant="default">Unverified</Badge>
              ) : (
                '\u2014'
              )
            }
          />
          <DataRow label="Details" value={entity?.registrationDetails || '\u2014'} mono={false} />
        </div>
      </CardBody>
    </Card>
  );
}

// -- AFFILIATIONS --
function AffiliationsSection({ affiliations }: { affiliations?: Affiliation[] | null }) {
  const typeColors: Record<string, string> = {
    council: 'text-blue-400',
    accelerator: 'text-larp-yellow',
    vc: 'text-larp-green',
    exchange: 'text-purple-400',
    regulatory: 'text-cyan-400',
    other: 'text-ivory-light/50',
  };

  return (
    <Card>
      <CardHeader title="Affiliations" icon={Award} accentColor={affiliations && affiliations.length > 0 ? '#8b5cf6' : '#6b7280'} />
      <CardBody scrollable>
        {affiliations && affiliations.length > 0 ? (
          <div className="space-y-2">
            {affiliations.map((aff, idx) => (
              <div key={idx} className="flex items-center gap-3 p-2 bg-ivory-light/[0.02] border border-ivory-light/5">
                <span className={`text-[10px] font-mono uppercase ${typeColors[aff.type] || typeColors.other}`}>
                  {aff.type}
                </span>
                <span className="text-sm text-ivory-light">{aff.name}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-0">
            <PlaceholderRow label="Councils" />
            <PlaceholderRow label="Accelerators" />
            <PlaceholderRow label="VCs" />
            <PlaceholderRow label="Exchanges" />
          </div>
        )}
      </CardBody>
    </Card>
  );
}

// -- GITHUB INTEL --
function GitHubSection({ project }: { project: Project }) {
  const intel = project.githubIntel;

  return (
    <Card>
      <CardHeader
        title="Development"
        icon={GithubIcon}
        accentColor={intel ? '#22c55e' : '#6b7280'}
        action={
          project.githubUrl && (
            <a
              href={project.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[10px] text-ivory-light/30 hover:text-larp-green transition-colors flex items-center gap-1"
            >
              GitHub <ExternalLink size={10} />
            </a>
          )
        }
      />
      <CardBody>
        {/* Stats Row */}
        <div className="flex items-center gap-4 mb-4 pb-4 border-b border-ivory-light/5 flex-wrap">
          <span className="flex items-center gap-1 text-xs">
            <Star size={12} className={intel ? 'text-larp-yellow' : 'text-ivory-light/15'} />
            <span className={`font-mono ${intel ? 'text-ivory-light' : 'text-ivory-light/15'}`}>{intel ? formatNumber(intel.stars) : '\u2014'}</span>
          </span>
          <span className="flex items-center gap-1 text-xs">
            <GitFork size={12} className={intel ? 'text-ivory-light/60' : 'text-ivory-light/15'} />
            <span className={intel ? 'text-ivory-light/60' : 'text-ivory-light/15'}>{intel ? formatNumber(intel.forks) : '\u2014'}</span>
          </span>
          <span className="flex items-center gap-1 text-xs">
            <Users size={12} className={intel ? 'text-ivory-light/60' : 'text-ivory-light/15'} />
            <span className={intel ? 'text-ivory-light/60' : 'text-ivory-light/15'}>{intel?.contributorsCount ?? '\u2014'}</span>
          </span>
          <span className="flex items-center gap-1 text-xs">
            <GitCommit size={12} className={intel ? 'text-larp-green' : 'text-ivory-light/15'} />
            <span className={intel ? 'text-larp-green' : 'text-ivory-light/15'}>{intel?.commitsLast30d ?? '\u2014'}</span>
            <span className="text-ivory-light/40">in 30d</span>
          </span>
        </div>

        <div className="space-y-0">
          <DataRow label="Language" value={intel?.primaryLanguage || '\u2014'} />
          <DataRow label="License" value={intel?.license || '\u2014'} />
          <DataRow label="Last Commit" value={intel?.lastCommitDate ? formatDate(intel.lastCommitDate) : '\u2014'} />
          <DataRow label="Open Issues" value={intel?.openIssues !== undefined ? String(intel.openIssues) : '\u2014'} />
          <DataRow label="Watchers" value={intel?.watchers !== undefined ? formatNumber(intel.watchers) : '\u2014'} />
          <DataRow label="Archived" value={intel ? (intel.isArchived ? 'Yes' : 'No') : '\u2014'} />
          <DataRow
            label="Health Score"
            value={
              intel ? (
                <span style={{ color: intel.healthScore >= 70 ? '#22c55e' : intel.healthScore >= 50 ? '#f97316' : '#dc2626' }}>
                  {intel.healthScore}/100
                </span>
              ) : '\u2014'
            }
          />
        </div>
      </CardBody>
    </Card>
  );
}

// -- TEAM --
function TeamSection({ project }: { project: Project }) {
  const team = project.team || [];

  return (
    <Card>
      <CardHeader title="Team" icon={Users} accentColor={team.length > 0 ? '#3b82f6' : '#6b7280'} />
      <CardBody scrollable>
        {team.length > 0 ? (
          <div className="space-y-2">
            {team.map((member, idx) => (
              <div key={idx} className="flex items-center gap-3 p-3 bg-ivory-light/[0.02] border border-ivory-light/5">
                {member.avatarUrl ? (
                  <Image src={member.avatarUrl} alt={member.displayName || member.handle} width={36} height={36} className="rounded shrink-0" />
                ) : (
                  <div className="w-9 h-9 rounded bg-ivory-light/10 flex items-center justify-center shrink-0">
                    <Users size={14} className="text-ivory-light/30" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-ivory-light truncate">
                      {member.realName || member.displayName || member.handle}
                    </span>
                    {member.isDoxxed && <Badge variant="success">Doxxed</Badge>}
                  </div>
                  {member.role && (
                    <span className="text-xs text-danger-orange/70">{member.role}</span>
                  )}
                  {member.previousEmployers && member.previousEmployers.length > 0 && (
                    <div className="text-[10px] text-ivory-light/40 mt-0.5">
                      Ex: {member.previousEmployers.slice(0, 2).join(', ')}
                    </div>
                  )}
                </div>
                {member.handle && (
                  <a
                    href={`https://x.com/${member.handle}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-ivory-light/30 hover:text-ivory-light/60 transition-colors shrink-0"
                  >
                    <Twitter size={14} />
                  </a>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-0">
            <PlaceholderRow label="Founder" />
            <PlaceholderRow label="CTO" />
            <PlaceholderRow label="Team Members" />
            <PlaceholderRow label="Doxxed Status" />
          </div>
        )}
      </CardBody>
    </Card>
  );
}

// -- ROADMAP --
function RoadmapSection({ roadmap }: { roadmap?: RoadmapMilestone[] | null }) {
  const statusIcons = {
    completed: <CheckCircle2 size={14} className="text-larp-green" />,
    'in-progress': <CircleDot size={14} className="text-larp-yellow" />,
    planned: <Circle size={14} className="text-ivory-light/30" />,
  };

  return (
    <Card>
      <CardHeader title="Roadmap" icon={Target} accentColor={roadmap && roadmap.length > 0 ? '#06b6d4' : '#6b7280'} />
      <CardBody scrollable>
        {roadmap && roadmap.length > 0 ? (
          <div className="space-y-2">
            {roadmap.map((item, idx) => (
              <div key={idx} className="flex items-start gap-3 p-3 bg-ivory-light/[0.02] border border-ivory-light/5">
                <div className="mt-0.5 shrink-0">{statusIcons[item.status]}</div>
                <div className="min-w-0">
                  <div className="text-sm text-ivory-light">{item.milestone}</div>
                  {item.targetDate && (
                    <div className="text-xs text-ivory-light/40 flex items-center gap-1 mt-1">
                      <Calendar size={10} /> {item.targetDate}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-0">
            <PlaceholderRow label="Milestone 1" />
            <PlaceholderRow label="Milestone 2" />
            <PlaceholderRow label="Milestone 3" />
            <PlaceholderRow label="Target Dates" />
          </div>
        )}
      </CardBody>
    </Card>
  );
}

// -- SHIPPING HISTORY --
function ShippingHistorySection({ history }: { history?: ShippingMilestone[] | null }) {
  return (
    <Card>
      <CardHeader title="Shipping History" icon={Package} accentColor={history && history.length > 0 ? '#06b6d4' : '#6b7280'} />
      <CardBody scrollable>
        {history && history.length > 0 ? (
          <div className="relative">
            <div className="absolute left-[5px] top-3 bottom-3 w-px bg-ivory-light/10" />
            <div className="space-y-4">
              {history.map((item, idx) => (
                <div key={idx} className="flex items-start gap-3 relative">
                  <div className="w-[11px] h-[11px] rounded-full bg-cyan-500 border-2 border-slate-dark shrink-0 z-10" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-mono text-cyan-400">{item.date}</span>
                      {item.evidenceUrl && (
                        <a href={item.evidenceUrl} target="_blank" rel="noopener noreferrer" className="text-ivory-light/30 hover:text-ivory-light/60 transition-colors">
                          <ExternalLink size={10} />
                        </a>
                      )}
                    </div>
                    <div className="text-sm text-ivory-light">{item.milestone}</div>
                    {item.details && (
                      <p className="text-xs text-ivory-light/50 mt-1">{item.details}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-0">
            <PlaceholderRow label="Release 1" />
            <PlaceholderRow label="Release 2" />
            <PlaceholderRow label="Evidence URLs" />
          </div>
        )}
      </CardBody>
    </Card>
  );
}

// -- SOURCE ATTRIBUTION (NEW) --
function SourceAttributionSection({ attribution }: { attribution?: SourceAttribution | null }) {
  const fieldEntries = attribution?.fieldSources ? Object.entries(attribution.fieldSources) : [];
  const conflicts = attribution?.conflicts || [];

  return (
    <Card>
      <CardHeader title="Source Attribution" icon={Database} accentColor={attribution ? '#8b5cf6' : '#6b7280'} />
      <CardBody scrollable>
        {fieldEntries.length > 0 ? (
          <div className="space-y-4">
            {/* Field Sources Table */}
            <div>
              <div className="grid grid-cols-[1fr_auto_auto] gap-x-3 gap-y-1 text-[10px] text-ivory-light/40 uppercase tracking-wider pb-2 border-b border-ivory-light/10 mb-2">
                <span>Field</span>
                <span>Source</span>
                <span>Confidence</span>
              </div>
              <div className="space-y-0.5">
                {fieldEntries.slice(0, 20).map(([field, info]) => (
                  <div key={field} className="grid grid-cols-[1fr_auto_auto] gap-x-3 items-center py-1.5 border-b border-ivory-light/5">
                    <span className="text-xs text-ivory-light/60 truncate">{field}</span>
                    <SourceBadge source={info.source} />
                    <ConfidenceDot confidence={info.confidence} />
                  </div>
                ))}
                {fieldEntries.length > 20 && (
                  <div className="text-[10px] text-ivory-light/30 text-center py-2">
                    +{fieldEntries.length - 20} more fields
                  </div>
                )}
              </div>
            </div>

            {/* Conflicts */}
            {conflicts.length > 0 && (
              <div>
                <div className="flex items-center gap-1 text-xs text-larp-yellow mb-2">
                  <AlertTriangle size={12} />
                  <span className="font-medium">Source Conflicts ({conflicts.length})</span>
                </div>
                <div className="space-y-2">
                  {conflicts.map((conflict, idx) => (
                    <div key={idx} className="p-3 bg-larp-yellow/5 border border-larp-yellow/20">
                      <div className="text-xs text-ivory-light font-medium mb-1">{conflict.field}</div>
                      <div className="space-y-1">
                        {conflict.sources.map((src, sidx) => (
                          <div key={sidx} className="flex items-center gap-2 text-[10px]">
                            <SourceBadge source={src.source} />
                            <span className="text-ivory-light/60 truncate">{src.value}</span>
                          </div>
                        ))}
                      </div>
                      <div className="text-[10px] text-ivory-light/40 mt-1">
                        Resolution: <span className="text-ivory-light/60">{conflict.resolution.replace('_', ' ')}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-0">
            <PlaceholderRow label="Field Sources" />
            <PlaceholderRow label="Source Conflicts" />
            <PlaceholderRow label="Confidence Levels" />
          </div>
        )}
      </CardBody>
    </Card>
  );
}

// -- PERPLEXITY CITATIONS (NEW) --
function PerplexityCitationsSection({ citations }: { citations?: Array<{ url: string; title?: string }> | null }) {
  return (
    <Card>
      <CardHeader title="Research Citations" icon={Link2} accentColor={citations && citations.length > 0 ? '#22c55e' : '#6b7280'} />
      <CardBody scrollable>
        {citations && citations.length > 0 ? (
          <div className="space-y-1.5">
            {citations.map((cite, idx) => (
              <a
                key={idx}
                href={cite.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-2 p-2 bg-ivory-light/[0.02] border border-ivory-light/5 hover:border-ivory-light/15 hover:bg-ivory-light/[0.04] transition-all group"
              >
                <span className="text-[10px] font-mono text-ivory-light/30 mt-0.5 shrink-0">[{idx + 1}]</span>
                <div className="min-w-0">
                  <div className="text-xs text-ivory-light group-hover:text-danger-orange transition-colors truncate">
                    {cite.title || cite.url}
                  </div>
                  <div className="text-[10px] text-ivory-light/30 truncate mt-0.5">
                    {cite.url}
                  </div>
                </div>
                <ExternalLink size={10} className="text-ivory-light/20 group-hover:text-ivory-light/50 shrink-0 mt-1" />
              </a>
            ))}
          </div>
        ) : (
          <div className="space-y-0">
            <PlaceholderRow label="Citation 1" />
            <PlaceholderRow label="Citation 2" />
            <PlaceholderRow label="Citation 3" />
          </div>
        )}
      </CardBody>
    </Card>
  );
}

// ============================================================================
// LOADING / NOT FOUND STATES
// ============================================================================

function LoadingState() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <ClarpLoader size={96} variant="light" label="loading..." />
    </div>
  );
}

function NotFoundState() {
  const router = useRouter();

  return (
    <div className="h-full flex flex-col items-center justify-center">
      <div className="font-mono text-6xl text-ivory-light/10 mb-2">404</div>
      <div className="font-mono text-sm text-ivory-light/40 mb-6">Entity not found</div>
      <button
        onClick={() => router.push('/terminal/projects')}
        className="font-mono text-xs text-danger-orange hover:text-danger-orange/80 transition-colors"
      >
        Back to Terminal
      </button>
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function EntityDetailPage({ project, isLoading, expectedEntityType }: EntityDetailPageProps) {
  const router = useRouter();
  const { activeSectionGroup, setActiveSectionGroup, setIsDetailPage } = useTerminalNav();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isHeaderCompact, setIsHeaderCompact] = useState(false);

  // Register as a detail page
  useEffect(() => {
    setIsDetailPage(true);
    return () => setIsDetailPage(false);
  }, [setIsDetailPage]);

  // Scroll spy: observe section group headings
  useEffect(() => {
    if (!project) return;
    const container = scrollContainerRef.current;
    if (!container) return;

    const groupIds = SECTION_GROUPS.map(g => `group-${g.id}`);
    const observer = new IntersectionObserver(
      (entries) => {
        // Find the topmost visible section
        const visible = entries
          .filter(e => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);

        if (visible.length > 0) {
          const id = visible[0].target.id.replace('group-', '') as SectionGroupId;
          setActiveSectionGroup(id);
        }
      },
      {
        root: container,
        rootMargin: '-120px 0px -70% 0px',
        threshold: 0,
      }
    );

    groupIds.forEach(id => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [project, setActiveSectionGroup]);

  // Sticky header detection
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      setIsHeaderCompact(container.scrollTop > 100);
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

  const handleGroupClick = useCallback((id: SectionGroupId) => {
    const el = document.getElementById(`group-${id}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  const handleShare = async () => {
    if (!project) return;
    const url = window.location.href;
    if (navigator.share) navigator.share({ title: project.name, url });
    else navigator.clipboard.writeText(url);
  };

  if (isLoading) return <LoadingState />;
  if (!project) return <NotFoundState />;

  const score = project.trustScore?.score ?? 50;
  const entityStyle = getEntityTypeStyle(project.entityType);

  return (
    <div className="h-full flex flex-col bg-slate-dark">
      {/* ================================================================ */}
      {/* COMPACT STICKY HEADER (visible on scroll) */}
      {/* ================================================================ */}
      <div
        className={`shrink-0 bg-slate-dark/95 backdrop-blur-sm border-b border-ivory-light/5 z-20 transition-all duration-200 ${
          isHeaderCompact ? 'opacity-100 h-auto' : 'opacity-0 h-0 overflow-hidden pointer-events-none'
        }`}
      >
        <div className="flex items-center justify-between px-4 sm:px-6 py-2 gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className={`w-7 h-7 overflow-hidden shrink-0 ${
                project.entityType === 'person' ? 'rounded-full' : 'rounded'
              } border border-ivory-light/10`}
            >
              {project.avatarUrl ? (
                <Image src={project.avatarUrl} alt={project.name} width={28} height={28} className="w-full h-full object-cover" />
              ) : (
                <ContractAvatar address={project.tokenAddress || project.id || project.name} size={28} bgColor="transparent" />
              )}
            </div>
            <span className="text-sm text-ivory-light font-bold truncate">{project.name}</span>
            {project.ticker && (
              <span className="font-mono text-xs text-danger-orange shrink-0">${project.ticker}</span>
            )}
            <div
              className="flex items-center gap-1 px-1.5 py-0.5 border shrink-0"
              style={{
                borderColor: getTrustColor(score) + '40',
                backgroundColor: getTrustColor(score) + '10',
              }}
            >
              <span className="font-mono text-xs font-bold" style={{ color: getTrustColor(score) }}>{score}</span>
              <span className="text-[9px] font-mono uppercase" style={{ color: getTrustColor(score) }}>{getTrustLabel(score)}</span>
            </div>
          </div>
          <button
            onClick={handleShare}
            className="flex items-center gap-1 px-2 py-1 text-xs text-ivory-light/50 border border-ivory-light/10 hover:border-ivory-light/20 hover:text-ivory-light transition-colors cursor-pointer shrink-0"
          >
            <Share2 size={11} />
          </button>
        </div>
      </div>

      {/* ================================================================ */}
      {/* SCROLLABLE CONTENT */}
      {/* ================================================================ */}
      <div ref={scrollContainerRef} className="flex-1 overflow-y-auto">
        {/* ============================================================ */}
        {/* FULL HEADER (scrolls away) */}
        {/* ============================================================ */}
        <div className="px-4 sm:px-6 py-4 sm:py-6 border-b border-ivory-light/5">
          {/* Entity badge + share row */}
          <div className="flex items-center justify-between mb-4 gap-2">
            <div
              className={`flex items-center gap-1.5 px-2 py-1 border text-xs font-mono ${entityStyle.bgColor} ${entityStyle.borderColor}`}
              style={{ color: entityStyle.color }}
            >
              {entityStyle.icon}
              <span>{entityStyle.label}</span>
            </div>
            <button
              onClick={handleShare}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-ivory-light/50 border border-ivory-light/10 hover:border-ivory-light/20 hover:text-ivory-light transition-colors cursor-pointer"
            >
              <Share2 size={12} />
              <span className="hidden sm:inline">Share</span>
            </button>
          </div>

          {/* Avatar + Name + Score */}
          <div className="flex items-start gap-4 sm:gap-6">
            <div className="shrink-0">
              <div
                className={`w-14 h-14 sm:w-16 sm:h-16 overflow-hidden border ${
                  project.entityType === 'person'
                    ? 'rounded-full border-larp-purple/30'
                    : project.entityType === 'organization'
                    ? 'rounded-lg border-larp-yellow/30'
                    : 'rounded-lg border-ivory-light/10'
                }`}
              >
                {project.avatarUrl ? (
                  <Image
                    src={project.avatarUrl}
                    alt={project.name}
                    width={64}
                    height={64}
                    className={`w-full h-full object-cover ${project.entityType === 'person' ? 'rounded-full' : ''}`}
                  />
                ) : project.tokenAddress ? (
                  <ContractAvatar address={project.tokenAddress} size={64} bgColor="transparent" />
                ) : (
                  <ContractAvatar address={project.id || project.name} size={64} bgColor="transparent" />
                )}
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-1 flex-wrap">
                <h1 className="text-xl text-ivory-light font-bold truncate">{project.name}</h1>
                {project.ticker && (
                  <span className="font-mono text-base text-danger-orange shrink-0">${project.ticker}</span>
                )}
                <div
                  className="flex items-center gap-1.5 px-2 py-0.5 border ml-auto shrink-0"
                  style={{
                    borderColor: getTrustColor(score) + '40',
                    backgroundColor: getTrustColor(score) + '10',
                  }}
                >
                  <span className="font-mono text-sm font-bold" style={{ color: getTrustColor(score) }}>{score}</span>
                  <span className="text-[10px] font-mono uppercase" style={{ color: getTrustColor(score) }}>{getTrustLabel(score)}</span>
                </div>
              </div>

              {/* Links */}
              <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
                {project.xHandle && (
                  <a href={`https://x.com/${project.xHandle}`} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs text-ivory-light/50 hover:text-ivory-light transition-colors">
                    <Twitter size={12} /> @{project.xHandle}
                  </a>
                )}
                {project.websiteUrl && (
                  <a href={project.websiteUrl} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs text-ivory-light/50 hover:text-ivory-light transition-colors">
                    <Globe size={12} /> <span className="hidden xs:inline">Website</span>
                  </a>
                )}
                {project.githubUrl && (
                  <a href={project.githubUrl} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs text-ivory-light/50 hover:text-ivory-light transition-colors">
                    <GithubIcon size={12} /> <span className="hidden xs:inline">GitHub</span>
                  </a>
                )}
                {project.discordUrl && (
                  <a href={project.discordUrl} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs text-ivory-light/50 hover:text-ivory-light transition-colors">
                    <MessageCircle size={12} /> <span className="hidden xs:inline">Discord</span>
                  </a>
                )}
                {project.telegramUrl && (
                  <a href={project.telegramUrl} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs text-ivory-light/50 hover:text-ivory-light transition-colors">
                    <Send size={12} /> <span className="hidden xs:inline">Telegram</span>
                  </a>
                )}
                <span className="text-[10px] text-ivory-light/30 flex items-center gap-1 sm:ml-auto">
                  <Clock size={10} />
                  Scanned {formatDate(project.lastScanAt)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ============================================================ */}
        {/* STICKY SECTION NAV */}
        {/* ============================================================ */}
        <div className="sticky top-0 z-10 bg-slate-dark/95 backdrop-blur-sm border-b border-ivory-light/10 px-4 sm:px-6">
          <SectionNav activeGroup={activeSectionGroup} onGroupClick={handleGroupClick} />
        </div>

        {/* ============================================================ */}
        {/* ALL SECTIONS — Single scrollable page */}
        {/* ============================================================ */}
        <div className="px-4 sm:px-6 pb-8">

          {/* ── OVERVIEW ── */}
          <GroupHeading id="overview" label="Overview" icon={Eye} />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <AboutSection project={project} />
            <KeyFindingsSection findings={project.keyFindings} />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
            <TagsSection tags={project.tags} />
            <SocialMetricsSection metrics={project.socialMetrics} />
          </div>

          {/* ── TRUST ── */}
          <GroupHeading id="trust" label="Trust" icon={Shield} />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <TrustSignalsSection project={project} />
            <ControversiesSection controversies={project.controversies} />
          </div>

          {/* ── SECURITY ── */}
          <GroupHeading id="security" label="Security" icon={ShieldCheck} />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <SecurityIntelSection security={project.securityIntel} />
            <AuditSection audit={project.audit} />
          </div>

          {/* ── MARKET ── */}
          <GroupHeading id="market" label="Market" icon={BarChart3} />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <MarketSection project={project} />
            <LiquiditySection liquidity={project.liquidity} />
          </div>

          {/* ── TOKENOMICS ── */}
          <GroupHeading id="tokenomics" label="Tokenomics" icon={Coins} />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <TokenomicsSection tokenomics={project.tokenomics} />
            <TechStackSection techStack={project.techStack} />
          </div>

          {/* ── INTEL ── */}
          <GroupHeading id="intel" label="Intel" icon={Globe} />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <WebsiteIntelSection intel={project.websiteIntel} websiteUrl={project.websiteUrl} />
            <LegalSection entity={project.legalEntity} />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
            <AffiliationsSection affiliations={project.affiliations} />
            {/* Empty cell for grid balance */}
            <div />
          </div>

          {/* ── DEVELOPMENT ── */}
          <GroupHeading id="development" label="Development" icon={GithubIcon} />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <GitHubSection project={project} />
            <TeamSection project={project} />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
            <RoadmapSection roadmap={project.roadmap} />
            <ShippingHistorySection history={project.shippingHistory} />
          </div>

          {/* ── SOURCES ── */}
          <GroupHeading id="sources" label="Sources" icon={Database} />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <SourceAttributionSection attribution={project.sourceAttribution} />
            <PerplexityCitationsSection citations={project.perplexityCitations} />
          </div>

          {/* Scan metadata footer */}
          <div className="mt-8 pt-4 border-t border-ivory-light/5 flex items-center justify-between text-[10px] text-ivory-light/20 font-mono">
            <span>Created {formatDate(project.createdAt)}</span>
            <span>Last scan {formatDate(project.lastScanAt)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
