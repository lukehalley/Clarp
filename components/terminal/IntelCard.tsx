'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  Shield,
  AlertTriangle,
  CheckCircle,
  User,
  Boxes,
  Building2,
  Globe,
  MessageCircle,
  Send,
  Lock,
  Unlock,
  Clock,
  TrendingUp,
  TrendingDown,
  Users,
  Circle,
} from 'lucide-react';
import type { Project, EntityType } from '@/types/project';

// ============================================================================
// ICONS
// ============================================================================

function XIcon({ size = 14, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function GithubIcon({ size = 14, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
    </svg>
  );
}

// ============================================================================
// ENTITY STYLES
// ============================================================================

const ENTITY_STYLES: Record<EntityType | 'default', {
  iconLarge: React.ReactNode;
  color: string;
  accentHex: string;
}> = {
  project: {
    iconLarge: <Boxes size={28} />,
    color: 'text-danger-orange',
    accentHex: '#FF6B35',
  },
  person: {
    iconLarge: <User size={28} />,
    color: 'text-larp-purple',
    accentHex: '#9B59B6',
  },
  organization: {
    iconLarge: <Building2 size={28} />,
    color: 'text-larp-yellow',
    accentHex: '#FFD93D',
  },
  default: {
    iconLarge: <Boxes size={28} />,
    color: 'text-danger-orange',
    accentHex: '#FF6B35',
  },
};

// ============================================================================
// UTILITIES
// ============================================================================

const DASH = '\u2014';

function getScoreColor(score: number): string {
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

function getScoreIcon(score: number, isVerified: boolean) {
  if (isVerified) return <CheckCircle size={11} />;
  if (score >= 70) return <Shield size={11} />;
  if (score >= 40) return <Circle size={11} />;
  return <AlertTriangle size={11} />;
}

function timeAgo(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 30) return `${diffDays}d ago`;
  const diffMonths = Math.floor(diffDays / 30);
  return `${diffMonths}mo ago`;
}

function formatCompact(num: number | undefined | null): string {
  if (!num) return DASH;
  if (num >= 1_000_000_000) return `$${(num / 1_000_000_000).toFixed(1)}B`;
  if (num >= 1_000_000) return `$${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `$${(num / 1_000).toFixed(1)}K`;
  return `$${num.toFixed(2)}`;
}

function formatCount(num: number | undefined | null): string {
  if (!num) return DASH;
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
  return String(num);
}

// ============================================================================
// SUB-COMPONENTS — FIXED-WIDTH, BRIGHT TEXT
// ============================================================================

/** Fixed-width signal dot — on = green/red, off = ghost */
function SignalDot({ active, positive, label }: { active: boolean; positive: boolean; label: string }) {
  return (
    <span className="inline-flex items-center gap-1 w-[14px] lg:w-[70px]" title={label}>
      <span
        className="w-[6px] h-[6px] rounded-full shrink-0"
        style={{
          backgroundColor: active
            ? (positive ? '#2ECC71' : '#E74C3C')
            : '#ffffff0a',
        }}
      />
      <span className={`font-mono text-[10px] hidden lg:inline truncate ${
        active
          ? (positive ? 'text-larp-green' : 'text-larp-red')
          : 'text-ivory-light/20'
      }`}>
        {label}
      </span>
    </span>
  );
}

/** Fixed-width metric — flex-1 for equal distribution */
function MetricSlot({ icon, label, value, color }: {
  icon: React.ReactNode;
  label: string;
  value: string;
  color?: 'green' | 'red';
}) {
  const hasValue = value !== DASH;
  const valueClass = !hasValue ? 'text-ivory-light/20'
    : color === 'green' ? 'text-larp-green'
    : color === 'red' ? 'text-larp-red'
    : 'text-ivory-light';

  return (
    <div className="flex items-center gap-1 flex-1 min-w-0" title={label}>
      <span className={`shrink-0 ${hasValue ? 'text-ivory-light/50' : 'text-ivory-light/15'}`}>
        {icon}
      </span>
      <span className={`font-mono text-[10px] tabular-nums truncate ${valueClass}`}>
        {value}
      </span>
    </div>
  );
}

/** Fixed-width security badge — flex-1 for equal distribution */
function SecuritySlot({ icon, label, status }: {
  icon: React.ReactNode;
  label: string;
  status: 'good' | 'bad' | 'unknown';
}) {
  const styles = {
    good: 'text-larp-green bg-larp-green/10',
    bad: 'text-larp-red bg-larp-red/10',
    unknown: 'text-ivory-light/20 bg-ivory-light/[0.03]',
  };

  return (
    <span className={`inline-flex items-center justify-center gap-1 px-1.5 py-0.5 font-mono text-[10px] leading-none flex-1 min-w-0 ${styles[status]}`}>
      <span className="shrink-0">{icon}</span>
      <span className="truncate">{label}</span>
    </span>
  );
}

/** Fixed-width tag slot */
function TagSlot({ tag, accentHex }: { tag: string | undefined; accentHex: string }) {
  return (
    <span
      className={`font-mono text-[9px] sm:text-[10px] px-1.5 py-0.5 w-[72px] text-center truncate block ${
        tag ? 'text-ivory-light' : 'text-ivory-light/15'
      }`}
      style={{
        backgroundColor: tag ? `${accentHex}15` : '#ffffff06',
      }}
      title={tag || ''}
    >
      {tag || DASH}
    </span>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

interface IntelCardProps {
  project: Project;
  scoreDelta24h?: number;
}

export default function IntelCard({ project }: IntelCardProps) {
  const router = useRouter();
  const score = project.trustScore?.score ?? 50;
  const displayScore = Math.max(1, score);
  const scoreColor = getScoreColor(displayScore);
  const trustLabel = getTrustLabel(displayScore);

  const entityType = project.entityType || 'default';
  const entityStyle = ENTITY_STYLES[entityType] || ENTITY_STYLES.default;
  const isVerified = project.trustScore?.tier === 'verified';

  const descriptionLine = project.description || project.aiSummary || null;
  const tags = project.tags || [];

  const socials = [
    { icon: <XIcon size={12} />, active: !!project.xHandle, label: 'X' },
    { icon: <GithubIcon size={12} />, active: !!project.githubUrl, label: 'GitHub' },
    { icon: <Globe size={12} />, active: !!project.websiteUrl, label: 'Web' },
    { icon: <MessageCircle size={12} />, active: !!project.discordUrl, label: 'Discord' },
    { icon: <Send size={12} />, active: !!project.telegramUrl, label: 'Telegram' },
  ];

  const getEntityRoute = () => {
    const identifier = project.xHandle || project.id;
    switch (project.entityType) {
      case 'person': return `/terminal/person/${identifier}`;
      case 'organization': return `/terminal/org/${identifier}`;
      default: return `/terminal/project/${identifier}`;
    }
  };

  const priceChange = project.marketData?.priceChange24h;
  const priceUp = (priceChange ?? 0) >= 0;

  const lpLocked = project.securityIntel?.lpLocked ?? project.liquidity?.liquidityLocked;
  const mintEnabled = project.securityIntel?.mintAuthorityEnabled;
  const freezeEnabled = project.securityIntel?.freezeAuthorityEnabled;

  const pi = project.positiveIndicators;
  const ni = project.negativeIndicators;

  return (
    <div
      onClick={() => router.push(getEntityRoute())}
      className="group block cursor-pointer"
    >
      <div
        className="transition-all duration-150 overflow-hidden"
        style={{
          boxShadow: `3px 3px 0 ${entityStyle.accentHex}15`,
          background: '#0a0a09',
        }}
        onMouseEnter={(e) => {
          const el = e.currentTarget;
          el.style.boxShadow = `4px 4px 0 ${entityStyle.accentHex}30`;
          el.style.transform = 'translate(-1px, -1px)';
        }}
        onMouseLeave={(e) => {
          const el = e.currentTarget;
          el.style.boxShadow = `3px 3px 0 ${entityStyle.accentHex}15`;
          el.style.transform = 'translate(0, 0)';
        }}
      >
        <div className="flex items-stretch">
          {/* Avatar — full card height */}
          <div
            className={`shrink-0 w-[48px] sm:w-[80px] relative overflow-hidden ${entityStyle.color}`}
            style={{ borderRight: `1px solid ${entityStyle.accentHex}15` }}
          >
            {project.avatarUrl ? (
              <Image src={project.avatarUrl} alt={project.name} fill className="object-cover" />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center" style={{ background: `${entityStyle.accentHex}08` }}>
                {entityStyle.iconLarge}
              </div>
            )}
          </div>

          {/* Content — fixed 3-row grid */}
          <div className="flex-1 min-w-0 px-3 sm:px-4 py-2 sm:py-2.5 flex flex-col gap-1.5">

            {/* ROW 1: Identity + Score */}
            <div className="flex items-start justify-between gap-3 h-[34px] sm:h-[36px]">
              <div className="min-w-0 flex-1 flex flex-col justify-center">
                <div className="flex items-center gap-2">
                  <h3 className="font-mono font-bold text-ivory-light text-xs sm:text-sm truncate">
                    {project.name}
                  </h3>
                  <span className="font-mono text-[10px] sm:text-[11px] shrink-0 w-[48px] sm:w-[56px] truncate" style={{ color: entityStyle.accentHex }}>
                    {project.ticker ? `$${project.ticker}` : DASH}
                  </span>
                  <div className="hidden md:flex items-center gap-1.5 ml-1">
                    {socials.map((s, i) => (
                      <span
                        key={i}
                        className={`transition-colors ${s.active ? 'text-ivory-light/50 group-hover:text-ivory-light' : 'text-ivory-light/10'}`}
                        title={s.label}
                      >
                        {s.icon}
                      </span>
                    ))}
                  </div>
                </div>
                <p className="font-mono text-[10px] sm:text-[11px] text-ivory-light/40 truncate mt-0.5 h-[14px]">
                  {descriptionLine || DASH}
                </p>
              </div>

              {/* Score — fixed width */}
              <div className="shrink-0 flex flex-col items-end gap-0.5 w-[72px] sm:w-[105px]">
                <div
                  className="flex items-center gap-1.5 px-2 py-0.5 font-mono text-xs sm:text-sm font-bold tabular-nums w-full justify-center"
                  style={{
                    color: isVerified ? '#22c55e' : scoreColor,
                    backgroundColor: (isVerified ? '#22c55e' : scoreColor) + '12',
                  }}
                >
                  {getScoreIcon(displayScore, isVerified)}
                  <span>{displayScore}</span>
                  <span className="text-[9px] font-normal opacity-60 hidden sm:inline">
                    {trustLabel}
                  </span>
                </div>
                <span className="font-mono text-[9px] text-ivory-light/30 flex items-center gap-1 h-[14px]">
                  <Clock size={8} />
                  {project.lastScanAt ? timeAgo(project.lastScanAt) : DASH}
                </span>
              </div>
            </div>

            {/* Divider */}
            <div className="h-px w-full" style={{ background: `${entityStyle.accentHex}0d` }} />

            {/* ROW 2: Tags + Signal dots */}
            <div className="flex items-center gap-2 h-[20px] overflow-hidden">
              <div className="flex items-center gap-1.5 shrink-0">
                <TagSlot tag={tags[0]} accentHex={entityStyle.accentHex} />
                <TagSlot tag={tags[1]} accentHex={entityStyle.accentHex} />
                <TagSlot tag={tags[2]} accentHex={entityStyle.accentHex} />
              </div>

              <span className="w-px h-3 bg-ivory-light/8 hidden sm:block shrink-0" />

              <div className="hidden sm:flex items-center gap-1 shrink-0">
                <SignalDot active={!!pi?.isDoxxed} positive label="doxxed" />
                <SignalDot active={!!pi?.hasActiveGithub} positive label="active gh" />
                <SignalDot active={!!pi?.hasRealProduct} positive label="product" />
                <SignalDot active={!!pi?.hasCredibleBackers} positive label="backed" />
              </div>

              <span className="w-px h-3 bg-ivory-light/8 hidden sm:block shrink-0" />

              <div className="hidden sm:flex items-center gap-1 shrink-0">
                <SignalDot active={!!ni?.hasScamAllegations} positive={false} label="scam" />
                <SignalDot active={!!ni?.hasRugHistory} positive={false} label="rug" />
                <SignalDot active={!!ni?.isAnonymousTeam} positive={false} label="anon" />
              </div>
            </div>

            {/* ROW 3: Key metrics + Security — combined into one row */}
            <div className="flex items-center gap-2 h-[18px] overflow-hidden">
              <MetricSlot icon={<TrendingUp size={9} />} label="Mcap" value={formatCompact(project.marketData?.marketCap)} />
              <MetricSlot
                icon={priceUp ? <TrendingUp size={9} /> : <TrendingDown size={9} />}
                label="24h"
                value={priceChange != null ? `${priceUp ? '+' : ''}${priceChange.toFixed(1)}%` : DASH}
                color={priceChange != null ? (priceUp ? 'green' : 'red') : undefined}
              />
              <MetricSlot icon={<Users size={9} />} label="Followers" value={formatCount(project.socialMetrics?.followers)} />

              <span className="w-px h-3 bg-ivory-light/8 hidden sm:block shrink-0" />

              <SecuritySlot
                icon={lpLocked ? <Lock size={9} /> : <Unlock size={9} />}
                label={lpLocked === true ? 'lp locked' : lpLocked === false ? 'lp unlocked' : `lp ${DASH}`}
                status={lpLocked === true ? 'good' : lpLocked === false ? 'bad' : 'unknown'}
              />
              <SecuritySlot
                icon={<AlertTriangle size={9} />}
                label={mintEnabled === true ? 'mint on' : mintEnabled === false ? 'mint off' : `mint ${DASH}`}
                status={mintEnabled === true ? 'bad' : mintEnabled === false ? 'good' : 'unknown'}
              />
              <SecuritySlot
                icon={<AlertTriangle size={9} />}
                label={freezeEnabled === true ? 'freeze on' : freezeEnabled === false ? 'freeze off' : `freeze ${DASH}`}
                status={freezeEnabled === true ? 'bad' : freezeEnabled === false ? 'good' : 'unknown'}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
