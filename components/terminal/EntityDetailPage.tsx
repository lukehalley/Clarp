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
        <h3 className="text-xs font-mono uppercase tracking-wider text-ivory-light">{title}</h3>
      </div>
      {action}
    </div>
  );
}

function CardBody({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`p-4 flex-1 ${className}`}>
      {children}
    </div>
  );
}

/** Expandable list: shows first `previewCount` items with a toggle to reveal all */
function ExpandableList<T>({
  items,
  previewCount = 4,
  renderItem,
  gap = 'space-y-2',
}: {
  items: T[];
  previewCount?: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  gap?: string;
}) {
  const [expanded, setExpanded] = useState(false);
  const hasMore = items.length > previewCount;
  const visible = expanded ? items : items.slice(0, previewCount);

  return (
    <div>
      <div className={gap}>
        {visible.map((item, idx) => renderItem(item, idx))}
      </div>
      {hasMore && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="mt-2 flex items-center gap-1 text-[11px] font-mono text-danger-orange hover:text-danger-orange/80 transition-colors cursor-pointer w-full justify-center py-1.5 border border-ivory-light/5 hover:border-ivory-light/10"
        >
          {expanded ? (
            <>
              <ChevronUp size={12} />
              Show less
            </>
          ) : (
            <>
              <ChevronDown size={12} />
              Show all ({items.length})
            </>
          )}
        </button>
      )}
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
    default: 'bg-ivory-light/5 border-ivory-light/10 text-ivory-light',
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
      <span className="text-xs text-ivory-light">{label}</span>
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

/** Data row that hides when value is empty and showEmpty is false */
function DataRowOptional({
  label,
  value,
  hasValue,
  showEmpty,
  link,
  mono = true,
}: {
  label: string;
  value: React.ReactNode;
  hasValue: boolean;
  showEmpty: boolean;
  link?: string;
  mono?: boolean;
}) {
  if (!hasValue && !showEmpty) return null;
  if (!hasValue) return <PlaceholderRow label={label} />;
  return <DataRow label={label} value={value} link={link} mono={mono} />;
}

/** Placeholder data row for empty states — shows label with dash value */
function PlaceholderRow({ label }: { label: string }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-ivory-light/5 last:border-0">
      <span className="text-xs text-ivory-light">{label}</span>
      <span className="font-mono text-xs text-ivory-light">&mdash;</span>
    </div>
  );
}

/** Toggle checkbox to show/hide unmatched (empty) fields */
function ShowEmptyToggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center gap-1.5 cursor-pointer select-none group">
      <span className="text-[10px] font-mono text-ivory-light group-hover:text-ivory-light transition-colors">
        All fields
      </span>
      <button
        role="checkbox"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`
          relative w-6 h-3.5 rounded-full border transition-colors cursor-pointer
          ${checked
            ? 'bg-danger-orange/20 border-danger-orange/40'
            : 'bg-ivory-light/5 border-ivory-light/10 hover:border-ivory-light/20'
          }
        `}
      >
        <span
          className={`
            absolute top-0.5 left-0.5 w-2 h-2 rounded-full transition-all
            ${checked ? 'translate-x-2.5 bg-danger-orange' : 'bg-ivory-light/30'}
          `}
        />
      </button>
    </label>
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
      <span className="text-[10px] text-ivory-light capitalize">{confidence}</span>
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
                  : 'text-ivory-light hover:text-ivory-light border-b-2 border-transparent'
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
      <h2 className="text-xs font-mono uppercase tracking-[0.2em] text-ivory-light">{label}</h2>
      <div className="flex-1 h-px bg-ivory-light/5" />
    </div>
  );
}

// ============================================================================
// SECTION COMPONENTS — All always render, with skeleton empty states
// ============================================================================

// -- ABOUT --
function AboutSection({ project }: { project: Project }) {
  const [showEmpty, setShowEmpty] = useState(false);
  const content = project.theStory || project.description || project.aiSummary;
  const hasData = !!content;
  return (
    <Card>
      <CardHeader title="About" icon={Eye} accentColor="#f97316" action={<ShowEmptyToggle checked={showEmpty} onChange={setShowEmpty} />} />
      <CardBody>
        {hasData ? (
          <p className="text-sm text-ivory-light leading-relaxed">{content}</p>
        ) : showEmpty ? (
          <div className="space-y-0">
            <PlaceholderRow label="Narrative" />
            <PlaceholderRow label="Description" />
            <PlaceholderRow label="AI Summary" />
          </div>
        ) : (
          <p className="text-xs text-ivory-light font-mono italic">No data available</p>
        )}
      </CardBody>
    </Card>
  );
}

// -- KEY FINDINGS --
function KeyFindingsSection({ findings }: { findings?: string[] | null }) {
  const [showEmpty, setShowEmpty] = useState(false);
  const hasData = !!(findings && findings.length > 0);
  return (
    <Card>
      <CardHeader title="Key Findings" icon={Eye} accentColor="#f97316" action={<ShowEmptyToggle checked={showEmpty} onChange={setShowEmpty} />} />
      <CardBody>
        {hasData ? (
          <ExpandableList
            items={findings!}
            previewCount={4}
            renderItem={(finding, idx) => (
              <li key={idx} className="flex items-start gap-2 text-sm text-ivory-light list-none">
                <span className="text-danger-orange mt-0.5 shrink-0">&#8226;</span>
                <span>{finding}</span>
              </li>
            )}
          />
        ) : showEmpty ? (
          <div className="space-y-0">
            <PlaceholderRow label="Finding 1" />
            <PlaceholderRow label="Finding 2" />
            <PlaceholderRow label="Finding 3" />
          </div>
        ) : (
          <p className="text-xs text-ivory-light font-mono italic">No data available</p>
        )}
      </CardBody>
    </Card>
  );
}

// -- TAGS --
function TagsSection({ tags }: { tags?: string[] | null }) {
  const [showEmpty, setShowEmpty] = useState(false);
  const hasData = !!(tags && tags.length > 0);
  return (
    <Card>
      <CardHeader title="Tags" icon={Target} accentColor="#6b7280" action={<ShowEmptyToggle checked={showEmpty} onChange={setShowEmpty} />} />
      <CardBody>
        {hasData ? (
          <div className="flex flex-wrap gap-1.5">
            {tags!.map((tag) => (
              <Badge key={tag}>{tag}</Badge>
            ))}
          </div>
        ) : showEmpty ? (
          <div className="space-y-0">
            <PlaceholderRow label="Category" />
            <PlaceholderRow label="Sector" />
            <PlaceholderRow label="Chain" />
          </div>
        ) : (
          <p className="text-xs text-ivory-light font-mono italic">No data available</p>
        )}
      </CardBody>
    </Card>
  );
}

// -- SOCIAL METRICS (NEW) --
function SocialMetricsSection({ metrics }: { metrics?: Project['socialMetrics'] }) {
  const [showEmpty, setShowEmpty] = useState(false);
  return (
    <Card>
      <CardHeader title="Social Metrics" icon={Activity} accentColor="#3b82f6" action={<ShowEmptyToggle checked={showEmpty} onChange={setShowEmpty} />} />
      <CardBody>
        <div className="space-y-0">
          <DataRowOptional label="Followers" value={formatNumber(metrics?.followers)} hasValue={metrics?.followers !== undefined} showEmpty={showEmpty} />
          <DataRowOptional label="Engagement Rate" value={metrics?.engagement !== undefined ? `${metrics.engagement.toFixed(2)}%` : ''} hasValue={metrics?.engagement !== undefined} showEmpty={showEmpty} />
          <DataRowOptional label="Posts / Week" value={metrics?.postsPerWeek !== undefined ? metrics.postsPerWeek.toFixed(1) : ''} hasValue={metrics?.postsPerWeek !== undefined} showEmpty={showEmpty} />
        </div>
        {!showEmpty && !metrics && <p className="text-xs text-ivory-light font-mono italic">No data available</p>}
      </CardBody>
    </Card>
  );
}

// -- TRUST SIGNALS --
function PositiveSignalsSection({ project }: { project: Project }) {
  const [showEmpty, setShowEmpty] = useState(false);
  const pos = project.positiveIndicators;

  const positiveFields: Array<{ label: string; active: boolean; detail?: string | null }> = [
    { label: 'Team Doxxed', active: !!pos?.isDoxxed, detail: pos?.doxxedDetails },
    { label: 'Active GitHub', active: !!pos?.hasActiveGithub, detail: pos?.githubActivity },
    { label: 'Real Product', active: !!pos?.hasRealProduct, detail: pos?.productDetails },
    { label: 'Consistent History', active: !!pos?.hasConsistentHistory },
    { label: 'Organic Engagement', active: !!pos?.hasOrganicEngagement },
    { label: 'Credible Backers', active: !!pos?.hasCredibleBackers, detail: pos?.backersDetails },
    { label: `Account Age: ${pos?.accountAgeDays ? Math.floor(pos.accountAgeDays / 365) + '+ yrs' : '\u2014'}`, active: pos ? pos.accountAgeDays > 365 : false },
  ];

  const activeCount = positiveFields.filter(f => f.active).length;
  const visibleFields = showEmpty ? positiveFields : positiveFields.filter(f => f.active);

  return (
    <Card>
      <CardHeader
        title="Positive Signals"
        icon={ThumbsUp}
        accentColor="#22c55e"
        action={<ShowEmptyToggle checked={showEmpty} onChange={setShowEmpty} />}
      />
      <CardBody>
        <div className="flex items-center gap-1 text-xs text-larp-green mb-2">
          <CheckCircle2 size={12} />
          <span className="font-medium">{activeCount} of {positiveFields.length} confirmed</span>
        </div>
        {visibleFields.length > 0 ? (
          <ExpandableList
            items={visibleFields}
            previewCount={5}
            gap="space-y-1"
            renderItem={(signal, idx) => (
              <div key={idx} className={`flex items-start gap-2 p-2 border ${
                signal.active
                  ? 'bg-larp-green/5 border-larp-green/10'
                  : 'bg-ivory-light/[0.01] border-ivory-light/5'
              }`}>
                {signal.active ? (
                  <CheckCircle2 size={12} className="text-larp-green mt-0.5 shrink-0" />
                ) : (
                  <Circle size={12} className="text-ivory-light mt-0.5 shrink-0" />
                )}
                <div className="min-w-0">
                  <span className={`text-xs ${signal.active ? 'text-ivory-light' : 'text-ivory-light'}`}>
                    {signal.label}
                  </span>
                  {signal.active && signal.detail && (
                    <p className="text-[10px] text-ivory-light mt-0.5">{signal.detail}</p>
                  )}
                </div>
              </div>
            )}
          />
        ) : (
          <p className="text-xs text-ivory-light font-mono italic">No signals confirmed</p>
        )}
      </CardBody>
    </Card>
  );
}

function NegativeSignalsSection({ project }: { project: Project }) {
  const [showEmpty, setShowEmpty] = useState(false);
  const neg = project.negativeIndicators;

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

  const activeCount = negativeFields.filter(f => f.active).length;
  const hasHighSeverity = negativeFields.some(s => s.active && s.severity === 'high');
  const visibleFields = showEmpty ? negativeFields : negativeFields.filter(f => f.active);

  return (
    <Card>
      <CardHeader
        title="Risk Signals"
        icon={ThumbsDown}
        accentColor={hasHighSeverity ? '#dc2626' : activeCount > 0 ? '#f97316' : '#22c55e'}
        action={<ShowEmptyToggle checked={showEmpty} onChange={setShowEmpty} />}
      />
      <CardBody>
        <div className="flex items-center gap-1 text-xs text-larp-red mb-2">
          <AlertTriangle size={12} />
          <span className="font-medium">{activeCount} risk{activeCount !== 1 ? 's' : ''} detected</span>
        </div>
        {visibleFields.length > 0 ? (
          <ExpandableList
            items={visibleFields}
            previewCount={5}
            gap="space-y-1"
            renderItem={(signal, idx) => (
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
                      signal.severity === 'high' ? 'text-larp-red' : signal.severity === 'medium' ? 'text-larp-yellow' : 'text-ivory-light'
                    }`}
                  />
                ) : (
                  <Circle size={12} className="text-ivory-light mt-0.5 shrink-0" />
                )}
                <div className="min-w-0">
                  <span className={`text-xs ${
                    signal.active
                      ? signal.severity === 'high' ? 'text-larp-red' : 'text-ivory-light'
                      : 'text-ivory-light'
                  }`}>
                    {signal.label}
                  </span>
                  {signal.active && signal.detail && (
                    <p className="text-[10px] text-ivory-light mt-0.5">{signal.detail}</p>
                  )}
                </div>
              </div>
            )}
          />
        ) : (
          <p className="text-xs text-ivory-light font-mono italic">No risks detected</p>
        )}
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
      <CardBody>
        {controversies && controversies.length > 0 ? (
          <ExpandableList
            items={controversies}
            previewCount={4}
            renderItem={(item, idx) => (
              <div key={idx} className="flex items-start gap-2 p-3 bg-larp-red/5 border border-larp-red/10">
                <AlertTriangle size={12} className="text-larp-red mt-0.5 shrink-0" />
                <span className="text-xs text-ivory-light">{item}</span>
              </div>
            )}
          />
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
  const [showEmpty, setShowEmpty] = useState(false);
  return (
    <Card>
      <CardHeader
        title="Security Intel"
        icon={security && !security.mintAuthorityEnabled && !security.freezeAuthorityEnabled && security.lpLocked ? ShieldCheck : ShieldAlert}
        accentColor={security && !security.mintAuthorityEnabled && !security.freezeAuthorityEnabled && security.lpLocked && (!security.risks || security.risks.length === 0) ? '#22c55e' : '#f97316'}
        action={<ShowEmptyToggle checked={showEmpty} onChange={setShowEmpty} />}
      />
      <CardBody className="space-y-4">
        {/* Authority Grid — show when data exists or showEmpty */}
        {(security || showEmpty) && (
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
                <Lock size={14} className="text-ivory-light shrink-0" />
              )}
              <div className="min-w-0">
                <div className="text-[10px] text-ivory-light uppercase">Mint</div>
                <div className={`text-xs font-mono truncate ${
                  security
                    ? security.mintAuthorityEnabled ? 'text-larp-red' : 'text-larp-green'
                    : 'text-ivory-light'
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
                <ShieldCheck size={14} className="text-ivory-light shrink-0" />
              )}
              <div className="min-w-0">
                <div className="text-[10px] text-ivory-light uppercase">Freeze</div>
                <div className={`text-xs font-mono truncate ${
                  security
                    ? security.freezeAuthorityEnabled ? 'text-larp-red' : 'text-larp-green'
                    : 'text-ivory-light'
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
                <Lock size={14} className="text-ivory-light shrink-0" />
              )}
              <div className="min-w-0">
                <div className="text-[10px] text-ivory-light uppercase">LP Status</div>
                <div className={`text-xs font-mono truncate ${
                  security
                    ? security.lpLocked ? 'text-larp-green' : 'text-larp-yellow'
                    : 'text-ivory-light'
                }`}>
                  {security ? (security.lpLocked ? `LOCKED${security.lpLockedPercent ? ` ${security.lpLockedPercent}%` : ''}` : 'UNLOCKED') : '\u2014'}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 p-3 border border-ivory-light/5 bg-ivory-light/[0.01]">
              <Users size={14} className={security?.holdersCount ? 'text-ivory-light' : 'text-ivory-light'} />
              <div className="min-w-0">
                <div className="text-[10px] text-ivory-light uppercase">Holders</div>
                <div className={`text-xs font-mono truncate ${security?.holdersCount ? 'text-ivory-light' : 'text-ivory-light'}`}>
                  {security?.holdersCount ? formatNumber(security.holdersCount) : '\u2014'}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Additional fields */}
        <div className="space-y-0">
          <DataRowOptional label="Top 10 Holders %" value={formatPercent(security?.top10HoldersPercent)} hasValue={security?.top10HoldersPercent !== undefined && security?.top10HoldersPercent !== null} showEmpty={showEmpty} />
          <DataRowOptional label="Domain Age" value={security?.domainAgeDays !== undefined ? (
            <span style={{ color: security!.domainAgeDays > 365 ? '#22c55e' : security!.domainAgeDays < 30 ? '#dc2626' : undefined }}>
              {security!.domainAgeDays} days
            </span>
          ) : ''} hasValue={security?.domainAgeDays !== undefined} showEmpty={showEmpty} />
          <DataRowOptional label="Registrar" value={security?.domainRegistrar || ''} hasValue={!!security?.domainRegistrar} showEmpty={showEmpty} />
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
                <li key={idx} className="flex items-start gap-2 text-xs text-ivory-light">
                  <XCircle size={10} className="text-larp-red mt-0.5 shrink-0" />
                  {risk}
                </li>
              ))}
            </ul>
          </div>
        ) : showEmpty ? (
          <div className="p-3 border border-ivory-light/5">
            <div className="flex items-center gap-2 text-xs text-ivory-light font-medium">
              <AlertOctagon size={12} />
              Risk Flags: {security ? 'None detected' : '\u2014'}
            </div>
          </div>
        ) : null}

        {!security && !showEmpty && (
          <p className="text-xs text-ivory-light font-mono italic">No data available</p>
        )}
      </CardBody>
    </Card>
  );
}

// -- AUDIT --
function AuditSection({ audit }: { audit?: AuditInfo | null }) {
  const [showEmpty, setShowEmpty] = useState(false);
  const auditColor = audit?.auditStatus === 'completed' ? '#22c55e' :
                     audit?.auditStatus === 'pending' ? '#f59e0b' : '#6b7280';
  return (
    <Card>
      <CardHeader title="Security Audit" icon={FileSearch} accentColor={auditColor} action={<ShowEmptyToggle checked={showEmpty} onChange={setShowEmpty} />} />
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
          <DataRowOptional label="Auditor" value={audit?.auditor || ''} hasValue={!!audit?.auditor} showEmpty={showEmpty} />
          <DataRowOptional label="Date" value={audit?.auditDate || ''} hasValue={!!audit?.auditDate} showEmpty={showEmpty} />
          {audit?.auditUrl ? (
            <DataRow label="Report" value="View Report" link={audit.auditUrl} />
          ) : showEmpty ? (
            <PlaceholderRow label="Report" />
          ) : null}
        </div>
      </CardBody>
    </Card>
  );
}

// -- MARKET DATA --
function MarketSection({ project }: { project: Project }) {
  const [showEmpty, setShowEmpty] = useState(false);
  const market = project.marketData;
  const priceUp = (market?.priceChange24h ?? 0) >= 0;

  return (
    <Card>
      <CardHeader
        title="Market Data"
        icon={BarChart3}
        accentColor={market ? (priceUp ? '#22c55e' : '#dc2626') : '#6b7280'}
        action={
          <div className="flex items-center gap-3">
            {project.tokenAddress && (
              <a
                href={`https://dexscreener.com/solana/${project.tokenAddress}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[10px] text-ivory-light hover:text-danger-orange transition-colors flex items-center gap-1"
              >
                DexScreener <ExternalLink size={10} />
              </a>
            )}
            <ShowEmptyToggle checked={showEmpty} onChange={setShowEmpty} />
          </div>
        }
      />
      <CardBody>
        {/* Price Hero */}
        {(market || showEmpty) && (
          <div className="mb-4 pb-4 border-b border-ivory-light/5">
            <div className="flex items-baseline gap-3">
              <span className={`text-2xl font-mono font-bold ${market ? 'text-ivory-light' : 'text-ivory-light'}`}>
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
        )}

        <div className="space-y-0">
          <DataRowOptional label="Market Cap" value={formatCurrency(market?.marketCap)} hasValue={!!market?.marketCap} showEmpty={showEmpty} />
          <DataRowOptional label="24h Volume" value={formatCurrency(market?.volume24h)} hasValue={!!market?.volume24h} showEmpty={showEmpty} />
          <DataRowOptional label="Liquidity" value={formatCurrency(market?.liquidity)} hasValue={!!market?.liquidity} showEmpty={showEmpty} />
        </div>
        {!market && !showEmpty && <p className="text-xs text-ivory-light font-mono italic">No data available</p>}
      </CardBody>
    </Card>
  );
}

// -- LIQUIDITY --
function LiquiditySection({ liquidity }: { liquidity?: LiquidityInfo | null }) {
  const [showEmpty, setShowEmpty] = useState(false);
  return (
    <Card>
      <CardHeader
        title="Liquidity"
        icon={DollarSign}
        accentColor={liquidity ? (liquidity.liquidityLocked ? '#22c55e' : '#f97316') : '#6b7280'}
        action={<ShowEmptyToggle checked={showEmpty} onChange={setShowEmpty} />}
      />
      <CardBody>
        <div className="space-y-0">
          <DataRowOptional label="Primary DEX" value={liquidity?.primaryDex || ''} hasValue={!!liquidity?.primaryDex} showEmpty={showEmpty} />
          <DataRowOptional label="Pool Type" value={liquidity?.poolType || ''} hasValue={!!liquidity?.poolType} showEmpty={showEmpty} />
          <DataRowOptional
            label="Liquidity USD"
            value={
              liquidity?.liquidityUsd ? (
                <span style={{
                  color: liquidity.liquidityUsd > 100000 ? '#22c55e' :
                         liquidity.liquidityUsd < 10000 ? '#dc2626' : undefined
                }}>
                  {formatCurrency(liquidity.liquidityUsd)}
                </span>
              ) : ''
            }
            hasValue={!!liquidity?.liquidityUsd}
            showEmpty={showEmpty}
          />
          <DataRowOptional
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
              ) : ''
            }
            hasValue={!!liquidity}
            showEmpty={showEmpty}
          />
          <DataRowOptional label="Lock Duration" value={liquidity?.lockDuration || ''} hasValue={!!liquidity?.lockDuration} showEmpty={showEmpty} />
        </div>
        {!liquidity && !showEmpty && <p className="text-xs text-ivory-light font-mono italic">No data available</p>}
      </CardBody>
    </Card>
  );
}

// -- TOKENOMICS --
function TokenomicsSection({ tokenomics }: { tokenomics?: Tokenomics | null }) {
  const [showEmpty, setShowEmpty] = useState(false);
  return (
    <Card>
      <CardHeader title="Tokenomics" icon={Coins} accentColor={tokenomics ? '#f59e0b' : '#6b7280'} action={<ShowEmptyToggle checked={showEmpty} onChange={setShowEmpty} />} />
      <CardBody>
        <div className="space-y-0">
          <DataRowOptional label="Total Supply" value={formatSupply(tokenomics?.totalSupply)} hasValue={!!tokenomics?.totalSupply} showEmpty={showEmpty} />
          <DataRowOptional label="Circulating" value={formatSupply(tokenomics?.circulatingSupply)} hasValue={!!tokenomics?.circulatingSupply} showEmpty={showEmpty} />
          <DataRowOptional
            label="Deflationary"
            value={
              tokenomics ? (
                tokenomics.isDeflationary ? (
                  <span className="flex items-center gap-1 text-danger-orange">
                    <Flame size={12} /> Yes
                  </span>
                ) : 'No'
              ) : ''
            }
            hasValue={!!tokenomics}
            showEmpty={showEmpty}
          />
          <DataRowOptional label="Vesting" value={tokenomics?.vestingSchedule || ''} hasValue={!!tokenomics?.vestingSchedule} showEmpty={showEmpty} mono={false} />
          <DataRowOptional label="Burn Rate" value={tokenomics?.burnRate || ''} hasValue={!!tokenomics?.burnRate} showEmpty={showEmpty} />
        </div>
        {tokenomics?.burnMechanism ? (
          <div className="mt-4 p-3 bg-danger-orange/5 border-l-2 border-danger-orange/30">
            <div className="flex items-center gap-1 text-xs text-danger-orange mb-1">
              <Flame size={10} /> Burn Mechanism
            </div>
            <p className="text-xs text-ivory-light">{tokenomics.burnMechanism}</p>
          </div>
        ) : showEmpty ? (
          <div className="mt-4 p-3 border-l-2 border-ivory-light/5">
            <div className="flex items-center gap-1 text-xs text-ivory-light mb-1">
              <Flame size={10} /> Burn Mechanism
            </div>
            <p className="text-xs text-ivory-light">&mdash;</p>
          </div>
        ) : null}
        {!tokenomics && !showEmpty && <p className="text-xs text-ivory-light font-mono italic">No data available</p>}
      </CardBody>
    </Card>
  );
}

// -- TECH STACK --
function TechStackSection({ techStack }: { techStack?: TechStack | null }) {
  const [showEmpty, setShowEmpty] = useState(false);
  return (
    <Card>
      <CardHeader title="Tech Stack" icon={Cpu} accentColor={techStack?.zkTech ? '#a855f7' : techStack ? '#6366f1' : '#6b7280'} action={<ShowEmptyToggle checked={showEmpty} onChange={setShowEmpty} />} />
      <CardBody>
        <div className="space-y-0">
          <DataRowOptional label="Blockchain" value={techStack?.blockchain || ''} hasValue={!!techStack?.blockchain} showEmpty={showEmpty} />
          <DataRowOptional
            label="ZK Technology"
            value={techStack?.zkTech ? <span className="text-purple-400">{techStack.zkTech}</span> : ''}
            hasValue={!!techStack?.zkTech}
            showEmpty={showEmpty}
          />
          <DataRowOptional
            label="Offline Capable"
            value={
              techStack ? (
                techStack.offlineCapability ? (
                  <span className="flex items-center gap-1 text-larp-green">
                    <Wifi size={12} /> Yes
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-ivory-light">
                    <WifiOff size={12} /> No
                  </span>
                )
              ) : ''
            }
            hasValue={!!techStack}
            showEmpty={showEmpty}
          />
        </div>
        {(techStack?.hardwareProducts?.length || showEmpty) && (
          <div className="mt-4 pt-4 border-t border-ivory-light/5">
            <div className="text-[10px] text-ivory-light uppercase tracking-wider mb-2 flex items-center gap-1">
              <HardDrive size={10} /> Hardware Products
            </div>
            {techStack?.hardwareProducts && techStack.hardwareProducts.length > 0 ? (
              <div className="flex flex-wrap gap-1">
                {techStack.hardwareProducts.map((product, idx) => (
                  <Badge key={idx}>{product}</Badge>
                ))}
              </div>
            ) : (
              <span className="text-xs text-ivory-light font-mono">&mdash;</span>
            )}
          </div>
        )}
        {!techStack && !showEmpty && <p className="text-xs text-ivory-light font-mono italic">No data available</p>}
      </CardBody>
    </Card>
  );
}

// -- WEBSITE INTEL --
function WebsiteIntelSection({ intel, websiteUrl }: { intel?: Project['websiteIntel']; websiteUrl?: string }) {
  const [showEmpty, setShowEmpty] = useState(false);
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

  const visibleCheckItems = showEmpty ? checkItems : checkItems.filter(i => i.value);

  return (
    <Card>
      <CardHeader
        title="Website Intel"
        icon={Globe}
        accentColor={intel ? (qualityColors[intel.websiteQuality] || '#6b7280') : '#6b7280'}
        action={
          <div className="flex items-center gap-3">
            {websiteUrl && (
              <a
                href={websiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[10px] text-ivory-light hover:text-danger-orange transition-colors flex items-center gap-1"
              >
                Visit <ExternalLink size={10} />
              </a>
            )}
            <ShowEmptyToggle checked={showEmpty} onChange={setShowEmpty} />
          </div>
        }
      />
      <CardBody>
        {/* Quality Score */}
        {(intel || showEmpty) && (
          <div className="flex items-center justify-between mb-4 p-3 bg-ivory-light/[0.02] border border-ivory-light/10">
            <div>
              <div className="text-[10px] text-ivory-light uppercase">Quality</div>
              <div className="text-sm font-mono font-medium capitalize"
                style={{ color: intel ? (qualityColors[intel.websiteQuality] || '#6b7280') : undefined }}>
                {intel?.websiteQuality || '\u2014'}
              </div>
            </div>
            <div className="text-right">
              <div className="text-[10px] text-ivory-light uppercase">Score</div>
              <div className="text-sm font-mono font-bold"
                style={{ color: intel ? (qualityColors[intel.websiteQuality] || '#6b7280') : undefined }}>
                {intel?.qualityScore !== undefined ? `${intel.qualityScore}/100` : '\u2014'}
              </div>
            </div>
          </div>
        )}

        {/* Checklist */}
        {visibleCheckItems.length > 0 && (
          <div className="grid grid-cols-2 gap-1 mb-4">
            {visibleCheckItems.map((item) => (
              <div key={item.key} className="flex items-center gap-2 py-1.5">
                {item.value ? (
                  <CheckCircle2 size={12} className="text-larp-green shrink-0" />
                ) : (
                  <XCircle size={12} className="text-ivory-light shrink-0" />
                )}
                <span className={`text-xs ${item.value ? 'text-ivory-light' : 'text-ivory-light'}`}>
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Trust Indicators */}
        {(intel?.trustIndicators?.length || showEmpty) ? (
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
              <span className="text-xs text-ivory-light font-mono">&mdash;</span>
            )}
          </div>
        ) : null}

        {/* Red Flags */}
        {(intel?.redFlags?.length || showEmpty) ? (
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
              <span className="text-xs text-ivory-light font-mono">&mdash;</span>
            )}
          </div>
        ) : null}

        {!intel && !showEmpty && <p className="text-xs text-ivory-light font-mono italic">No data available</p>}
      </CardBody>
    </Card>
  );
}

// -- LEGAL ENTITY --
function LegalSection({ entity }: { entity?: LegalEntity | null }) {
  const [showEmpty, setShowEmpty] = useState(false);
  return (
    <Card>
      <CardHeader
        title="Legal Entity"
        icon={Building2}
        accentColor={entity?.isRegistered ? '#22c55e' : '#6b7280'}
        action={<ShowEmptyToggle checked={showEmpty} onChange={setShowEmpty} />}
      />
      <CardBody>
        <div className="space-y-0">
          <DataRowOptional label="Company" value={entity?.companyName || ''} hasValue={!!entity?.companyName} showEmpty={showEmpty} />
          <DataRowOptional label="Jurisdiction" value={entity?.jurisdiction || ''} hasValue={!!entity?.jurisdiction} showEmpty={showEmpty} />
          <DataRowOptional
            label="Status"
            value={
              entity?.isRegistered ? (
                <Badge variant="success">Verified</Badge>
              ) : entity ? (
                <Badge variant="default">Unverified</Badge>
              ) : ''
            }
            hasValue={!!entity}
            showEmpty={showEmpty}
          />
          <DataRowOptional label="Details" value={entity?.registrationDetails || ''} hasValue={!!entity?.registrationDetails} showEmpty={showEmpty} mono={false} />
        </div>
        {!entity && !showEmpty && <p className="text-xs text-ivory-light font-mono italic">No data available</p>}
      </CardBody>
    </Card>
  );
}

// -- AFFILIATIONS --
function AffiliationsSection({ affiliations }: { affiliations?: Affiliation[] | null }) {
  const [showEmpty, setShowEmpty] = useState(false);
  const typeColors: Record<string, string> = {
    council: 'text-blue-400',
    accelerator: 'text-larp-yellow',
    vc: 'text-larp-green',
    exchange: 'text-purple-400',
    regulatory: 'text-cyan-400',
    other: 'text-ivory-light',
  };
  const hasData = !!(affiliations && affiliations.length > 0);

  return (
    <Card>
      <CardHeader title="Affiliations" icon={Award} accentColor={hasData ? '#8b5cf6' : '#6b7280'} action={<ShowEmptyToggle checked={showEmpty} onChange={setShowEmpty} />} />
      <CardBody>
        {hasData ? (
          <ExpandableList
            items={affiliations!}
            previewCount={4}
            renderItem={(aff, idx) => (
              <div key={idx} className="flex items-center gap-3 p-2 bg-ivory-light/[0.02] border border-ivory-light/5">
                <span className={`text-[10px] font-mono uppercase ${typeColors[aff.type] || typeColors.other}`}>
                  {aff.type}
                </span>
                <span className="text-sm text-ivory-light">{aff.name}</span>
              </div>
            )}
          />
        ) : showEmpty ? (
          <div className="space-y-0">
            <PlaceholderRow label="Councils" />
            <PlaceholderRow label="Accelerators" />
            <PlaceholderRow label="VCs" />
            <PlaceholderRow label="Exchanges" />
          </div>
        ) : (
          <p className="text-xs text-ivory-light font-mono italic">No data available</p>
        )}
      </CardBody>
    </Card>
  );
}

// -- GITHUB INTEL --
function GitHubSection({ project }: { project: Project }) {
  const [showEmpty, setShowEmpty] = useState(false);
  const intel = project.githubIntel;

  return (
    <Card>
      <CardHeader
        title="Development"
        icon={GithubIcon}
        accentColor={intel ? '#22c55e' : '#6b7280'}
        action={
          <div className="flex items-center gap-3">
            {project.githubUrl && (
              <a
                href={project.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[10px] text-ivory-light hover:text-larp-green transition-colors flex items-center gap-1"
              >
                GitHub <ExternalLink size={10} />
              </a>
            )}
            <ShowEmptyToggle checked={showEmpty} onChange={setShowEmpty} />
          </div>
        }
      />
      <CardBody>
        {/* Stats Row */}
        {(intel || showEmpty) && (
          <div className="flex items-center gap-4 mb-4 pb-4 border-b border-ivory-light/5 flex-wrap">
            <span className="flex items-center gap-1 text-xs">
              <Star size={12} className={intel ? 'text-larp-yellow' : 'text-ivory-light'} />
              <span className={`font-mono ${intel ? 'text-ivory-light' : 'text-ivory-light'}`}>{intel ? formatNumber(intel.stars) : '\u2014'}</span>
            </span>
            <span className="flex items-center gap-1 text-xs">
              <GitFork size={12} className={intel ? 'text-ivory-light' : 'text-ivory-light'} />
              <span className={intel ? 'text-ivory-light' : 'text-ivory-light'}>{intel ? formatNumber(intel.forks) : '\u2014'}</span>
            </span>
            <span className="flex items-center gap-1 text-xs">
              <Users size={12} className={intel ? 'text-ivory-light' : 'text-ivory-light'} />
              <span className={intel ? 'text-ivory-light' : 'text-ivory-light'}>{intel?.contributorsCount ?? '\u2014'}</span>
            </span>
            <span className="flex items-center gap-1 text-xs">
              <GitCommit size={12} className={intel ? 'text-larp-green' : 'text-ivory-light'} />
              <span className={intel ? 'text-larp-green' : 'text-ivory-light'}>{intel?.commitsLast30d ?? '\u2014'}</span>
              <span className="text-ivory-light">in 30d</span>
            </span>
          </div>
        )}

        <div className="space-y-0">
          <DataRowOptional label="Language" value={intel?.primaryLanguage || ''} hasValue={!!intel?.primaryLanguage} showEmpty={showEmpty} />
          <DataRowOptional label="License" value={intel?.license || ''} hasValue={!!intel?.license} showEmpty={showEmpty} />
          <DataRowOptional label="Last Commit" value={intel?.lastCommitDate ? formatDate(intel.lastCommitDate) : ''} hasValue={!!intel?.lastCommitDate} showEmpty={showEmpty} />
          <DataRowOptional label="Open Issues" value={intel?.openIssues !== undefined ? String(intel.openIssues) : ''} hasValue={intel?.openIssues !== undefined} showEmpty={showEmpty} />
          <DataRowOptional label="Watchers" value={intel?.watchers !== undefined ? formatNumber(intel.watchers) : ''} hasValue={intel?.watchers !== undefined} showEmpty={showEmpty} />
          <DataRowOptional label="Archived" value={intel ? (intel.isArchived ? 'Yes' : 'No') : ''} hasValue={!!intel} showEmpty={showEmpty} />
          <DataRowOptional
            label="Health Score"
            value={
              intel ? (
                <span style={{ color: intel.healthScore >= 70 ? '#22c55e' : intel.healthScore >= 50 ? '#f97316' : '#dc2626' }}>
                  {intel.healthScore}/100
                </span>
              ) : ''
            }
            hasValue={!!intel}
            showEmpty={showEmpty}
          />
        </div>
        {!intel && !showEmpty && <p className="text-xs text-ivory-light font-mono italic">No data available</p>}
      </CardBody>
    </Card>
  );
}

// -- TEAM --
function TeamSection({ project }: { project: Project }) {
  const [showEmpty, setShowEmpty] = useState(false);
  const team = project.team || [];
  const hasData = team.length > 0;

  return (
    <Card>
      <CardHeader title="Team" icon={Users} accentColor={hasData ? '#3b82f6' : '#6b7280'} action={<ShowEmptyToggle checked={showEmpty} onChange={setShowEmpty} />} />
      <CardBody>
        {hasData ? (
          <ExpandableList
            items={team}
            previewCount={4}
            renderItem={(member, idx) => (
              <div key={idx} className="flex items-center gap-3 p-3 bg-ivory-light/[0.02] border border-ivory-light/5">
                {member.avatarUrl ? (
                  <Image src={member.avatarUrl} alt={member.displayName || member.handle} width={36} height={36} className="rounded shrink-0" />
                ) : (
                  <div className="w-9 h-9 rounded bg-ivory-light/10 flex items-center justify-center shrink-0">
                    <Users size={14} className="text-ivory-light" />
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
                    <div className="text-[10px] text-ivory-light mt-0.5">
                      Ex: {member.previousEmployers.slice(0, 2).join(', ')}
                    </div>
                  )}
                </div>
                {member.handle && (
                  <a
                    href={`https://x.com/${member.handle}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-ivory-light hover:text-ivory-light transition-colors shrink-0"
                  >
                    <Twitter size={14} />
                  </a>
                )}
              </div>
            )}
          />
        ) : showEmpty ? (
          <div className="space-y-0">
            <PlaceholderRow label="Founder" />
            <PlaceholderRow label="CTO" />
            <PlaceholderRow label="Team Members" />
            <PlaceholderRow label="Doxxed Status" />
          </div>
        ) : (
          <p className="text-xs text-ivory-light font-mono italic">No data available</p>
        )}
      </CardBody>
    </Card>
  );
}

// -- ROADMAP --
function RoadmapSection({ roadmap }: { roadmap?: RoadmapMilestone[] | null }) {
  const [showEmpty, setShowEmpty] = useState(false);
  const statusIcons = {
    completed: <CheckCircle2 size={14} className="text-larp-green" />,
    'in-progress': <CircleDot size={14} className="text-larp-yellow" />,
    planned: <Circle size={14} className="text-ivory-light" />,
  };
  const hasData = !!(roadmap && roadmap.length > 0);

  return (
    <Card>
      <CardHeader title="Roadmap" icon={Target} accentColor={hasData ? '#06b6d4' : '#6b7280'} action={<ShowEmptyToggle checked={showEmpty} onChange={setShowEmpty} />} />
      <CardBody>
        {hasData ? (
          <ExpandableList
            items={roadmap!}
            previewCount={4}
            renderItem={(item, idx) => (
              <div key={idx} className="flex items-start gap-3 p-3 bg-ivory-light/[0.02] border border-ivory-light/5">
                <div className="mt-0.5 shrink-0">{statusIcons[item.status]}</div>
                <div className="min-w-0">
                  <div className="text-sm text-ivory-light">{item.milestone}</div>
                  {item.targetDate && (
                    <div className="text-xs text-ivory-light flex items-center gap-1 mt-1">
                      <Calendar size={10} /> {item.targetDate}
                    </div>
                  )}
                </div>
              </div>
            )}
          />
        ) : showEmpty ? (
          <div className="space-y-0">
            <PlaceholderRow label="Milestone 1" />
            <PlaceholderRow label="Milestone 2" />
            <PlaceholderRow label="Milestone 3" />
            <PlaceholderRow label="Target Dates" />
          </div>
        ) : (
          <p className="text-xs text-ivory-light font-mono italic">No data available</p>
        )}
      </CardBody>
    </Card>
  );
}

// -- SHIPPING HISTORY --
function ShippingHistorySection({ history }: { history?: ShippingMilestone[] | null }) {
  const [showEmpty, setShowEmpty] = useState(false);
  const hasData = !!(history && history.length > 0);

  return (
    <Card>
      <CardHeader title="Shipping History" icon={Package} accentColor={hasData ? '#06b6d4' : '#6b7280'} action={<ShowEmptyToggle checked={showEmpty} onChange={setShowEmpty} />} />
      <CardBody>
        {hasData ? (
          <ExpandableList
            items={history!}
            previewCount={4}
            gap="space-y-4"
            renderItem={(item, idx) => (
              <div key={idx} className="flex items-start gap-3 relative">
                <div className="w-[11px] h-[11px] rounded-full bg-cyan-500 border-2 border-slate-dark shrink-0 z-10" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-mono text-cyan-400">{item.date}</span>
                    {item.evidenceUrl && (
                      <a href={item.evidenceUrl} target="_blank" rel="noopener noreferrer" className="text-ivory-light hover:text-ivory-light transition-colors">
                        <ExternalLink size={10} />
                      </a>
                    )}
                  </div>
                  <div className="text-sm text-ivory-light">{item.milestone}</div>
                  {item.details && (
                    <p className="text-xs text-ivory-light mt-1">{item.details}</p>
                  )}
                </div>
              </div>
            )}
          />
        ) : showEmpty ? (
          <div className="space-y-0">
            <PlaceholderRow label="Release 1" />
            <PlaceholderRow label="Release 2" />
            <PlaceholderRow label="Evidence URLs" />
          </div>
        ) : (
          <p className="text-xs text-ivory-light font-mono italic">No data available</p>
        )}
      </CardBody>
    </Card>
  );
}

// -- SOURCE ATTRIBUTION (NEW) --
function SourceAttributionSection({ attribution }: { attribution?: SourceAttribution | null }) {
  const [showEmpty, setShowEmpty] = useState(false);
  const fieldEntries = attribution?.fieldSources ? Object.entries(attribution.fieldSources) : [];
  const conflicts = attribution?.conflicts || [];
  const hasData = fieldEntries.length > 0;

  return (
    <Card>
      <CardHeader title="Source Attribution" icon={Database} accentColor={attribution ? '#8b5cf6' : '#6b7280'} action={<ShowEmptyToggle checked={showEmpty} onChange={setShowEmpty} />} />
      <CardBody>
        {hasData ? (
          <div className="space-y-4">
            <div>
              <div className="grid grid-cols-[1fr_auto_auto] gap-x-3 gap-y-1 text-[10px] text-ivory-light uppercase tracking-wider pb-2 border-b border-ivory-light/10 mb-2">
                <span>Field</span>
                <span>Source</span>
                <span>Confidence</span>
              </div>
              <ExpandableList
                items={fieldEntries}
                previewCount={8}
                gap="space-y-0.5"
                renderItem={([field, info], idx) => (
                  <div key={field} className="grid grid-cols-[1fr_auto_auto] gap-x-3 items-center py-1.5 border-b border-ivory-light/5">
                    <span className="text-xs text-ivory-light truncate">{field}</span>
                    <SourceBadge source={info.source} />
                    <ConfidenceDot confidence={info.confidence} />
                  </div>
                )}
              />
            </div>

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
                            <span className="text-ivory-light truncate">{src.value}</span>
                          </div>
                        ))}
                      </div>
                      <div className="text-[10px] text-ivory-light mt-1">
                        Resolution: <span className="text-ivory-light">{conflict.resolution.replace('_', ' ')}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : showEmpty ? (
          <div className="space-y-0">
            <PlaceholderRow label="Field Sources" />
            <PlaceholderRow label="Source Conflicts" />
            <PlaceholderRow label="Confidence Levels" />
          </div>
        ) : (
          <p className="text-xs text-ivory-light font-mono italic">No data available</p>
        )}
      </CardBody>
    </Card>
  );
}

// -- PERPLEXITY CITATIONS (NEW) --
function PerplexityCitationsSection({ citations }: { citations?: Array<{ url: string; title?: string }> | null }) {
  const [showEmpty, setShowEmpty] = useState(false);
  const hasData = !!(citations && citations.length > 0);

  return (
    <Card>
      <CardHeader title="Research Citations" icon={Link2} accentColor={hasData ? '#22c55e' : '#6b7280'} action={<ShowEmptyToggle checked={showEmpty} onChange={setShowEmpty} />} />
      <CardBody>
        {hasData ? (
          <ExpandableList
            items={citations!}
            previewCount={5}
            gap="space-y-1.5"
            renderItem={(cite, idx) => (
              <a
                key={idx}
                href={cite.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-2 p-2 bg-ivory-light/[0.02] border border-ivory-light/5 hover:border-ivory-light/15 hover:bg-ivory-light/[0.04] transition-all group"
              >
                <span className="text-[10px] font-mono text-ivory-light mt-0.5 shrink-0">[{idx + 1}]</span>
                <div className="min-w-0">
                  <div className="text-xs text-ivory-light group-hover:text-danger-orange transition-colors truncate">
                    {cite.title || cite.url}
                  </div>
                  <div className="text-[10px] text-ivory-light truncate mt-0.5">
                    {cite.url}
                  </div>
                </div>
                <ExternalLink size={10} className="text-ivory-light group-hover:text-ivory-light shrink-0 mt-1" />
              </a>
            )}
          />
        ) : showEmpty ? (
          <div className="space-y-0">
            <PlaceholderRow label="Citation 1" />
            <PlaceholderRow label="Citation 2" />
            <PlaceholderRow label="Citation 3" />
          </div>
        ) : (
          <p className="text-xs text-ivory-light font-mono italic">No data available</p>
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
    <div className="min-h-screen flex items-center justify-center">
      <ClarpLoader size={96} variant="light" label="loading..." />
    </div>
  );
}

function NotFoundState() {
  const router = useRouter();

  return (
    <div className="h-full flex flex-col items-center justify-center">
      <div className="font-mono text-6xl text-ivory-light mb-2">404</div>
      <div className="font-mono text-sm text-ivory-light mb-6">Entity not found</div>
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
  const fullHeaderRef = useRef<HTMLDivElement>(null);
  const [isHeaderCompact, setIsHeaderCompact] = useState(false);

  // Register as a detail page
  useEffect(() => {
    setIsDetailPage(true);
    return () => setIsDetailPage(false);
  }, [setIsDetailPage]);

  // Scroll spy: observe section group headings
  useEffect(() => {
    if (!project) return;

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

  // Sticky header detection: observe when full header leaves viewport
  useEffect(() => {
    const header = fullHeaderRef.current;
    if (!header) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        // When the full header is NOT intersecting (scrolled out), show compact
        setIsHeaderCompact(!entry.isIntersecting);
      },
      {
        threshold: 0,
        rootMargin: '-10px 0px 0px 0px',
      }
    );

    observer.observe(header);
    return () => observer.disconnect();
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
    <>
        {/* ============================================================ */}
        {/* FULL HEADER (scrolls away) */}
        {/* ============================================================ */}
        <div ref={fullHeaderRef} className="px-4 sm:px-6 py-4 sm:py-6 border-b border-ivory-light/5">
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
                    className="flex items-center gap-1 text-xs text-ivory-light hover:text-ivory-light transition-colors">
                    <Twitter size={12} /> @{project.xHandle}
                  </a>
                )}
                {project.websiteUrl && (
                  <a href={project.websiteUrl} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs text-ivory-light hover:text-ivory-light transition-colors">
                    <Globe size={12} /> <span className="hidden xs:inline">Website</span>
                  </a>
                )}
                {project.githubUrl && (
                  <a href={project.githubUrl} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs text-ivory-light hover:text-ivory-light transition-colors">
                    <GithubIcon size={12} /> <span className="hidden xs:inline">GitHub</span>
                  </a>
                )}
                {project.discordUrl && (
                  <a href={project.discordUrl} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs text-ivory-light hover:text-ivory-light transition-colors">
                    <MessageCircle size={12} /> <span className="hidden xs:inline">Discord</span>
                  </a>
                )}
                {project.telegramUrl && (
                  <a href={project.telegramUrl} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs text-ivory-light hover:text-ivory-light transition-colors">
                    <Send size={12} /> <span className="hidden xs:inline">Telegram</span>
                  </a>
                )}
                <span className="text-[10px] text-ivory-light flex items-center gap-1 sm:ml-auto">
                  <Clock size={10} />
                  Scanned {formatDate(project.lastScanAt)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ============================================================ */}
        {/* STICKY TOP BAR (compact header + section nav) */}
        {/* ============================================================ */}
        <div className="sticky top-0 z-10 bg-slate-dark/95 backdrop-blur-sm border-b border-ivory-light/10">
          {/* Compact header row — visible when scrolled */}
          {isHeaderCompact && (
            <div
              className="flex items-center justify-between px-4 sm:px-6 py-2 gap-3 border-b border-ivory-light/5"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className={`shrink-0 w-6 h-6 overflow-hidden ${project.entityType === 'person' ? 'rounded-full' : 'rounded'} border border-ivory-light/10`}>
                  {project.avatarUrl ? (
                    <Image src={project.avatarUrl} alt={project.name} width={24} height={24} className="w-full h-full object-cover" />
                  ) : project.tokenAddress ? (
                    <ContractAvatar address={project.tokenAddress} size={24} bgColor="transparent" />
                  ) : (
                    <div className="w-full h-full bg-slate-medium flex items-center justify-center text-[10px] font-mono text-ivory-light">
                      {project.name.charAt(0)}
                    </div>
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
                className="flex items-center gap-1 px-2 py-1 text-xs text-ivory-light border border-ivory-light/10 hover:border-ivory-light/20 hover:text-ivory-light transition-colors cursor-pointer shrink-0"
              >
                <Share2 size={11} />
              </button>
            </div>
          )}
          {/* Section nav */}
          <div className="px-4 sm:px-6">
            <SectionNav activeGroup={activeSectionGroup} onGroupClick={handleGroupClick} />
          </div>
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <PositiveSignalsSection project={project} />
            <NegativeSignalsSection project={project} />
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
          <div className="mt-8 pt-4 border-t border-ivory-light/5 flex items-center justify-between text-[10px] text-ivory-light font-mono">
            <span>Created {formatDate(project.createdAt)}</span>
            <span>Last scan {formatDate(project.lastScanAt)}</span>
          </div>
        </div>
    </>
  );
}