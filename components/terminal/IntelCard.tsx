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
} from 'lucide-react';
import type { Project, EntityType } from '@/types/project';

interface IntelCardProps {
  project: Project;
  scoreDelta24h?: number;
}

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

// Entity type styling configuration
const ENTITY_STYLES: Record<EntityType | 'default', {
  iconLarge: React.ReactNode;
  color: string;
  bgColor: string;
  borderColor: string;
}> = {
  project: {
    iconLarge: <Boxes size={22} />,
    color: 'text-danger-orange',
    bgColor: 'bg-danger-orange/10',
    borderColor: 'border-danger-orange/30',
  },
  person: {
    iconLarge: <User size={22} />,
    color: 'text-larp-purple',
    bgColor: 'bg-larp-purple/10',
    borderColor: 'border-larp-purple/30',
  },
  organization: {
    iconLarge: <Building2 size={22} />,
    color: 'text-larp-yellow',
    bgColor: 'bg-larp-yellow/10',
    borderColor: 'border-larp-yellow/30',
  },
  default: {
    iconLarge: <Boxes size={22} />,
    color: 'text-danger-orange',
    bgColor: 'bg-danger-orange/10',
    borderColor: 'border-danger-orange/30',
  },
};

function getScoreColor(score: number): string {
  if (score >= 85) return '#22c55e';
  if (score >= 70) return '#84cc16';
  if (score >= 50) return '#6b7280';
  if (score >= 30) return '#f97316';
  return '#dc2626';
}


export default function IntelCard({ project }: IntelCardProps) {
  const router = useRouter();
  const score = project.trustScore?.score ?? 50;
  const displayScore = Math.max(1, score);
  const scoreColor = getScoreColor(displayScore);

  const entityType = project.entityType || 'default';
  const entityStyle = ENTITY_STYLES[entityType] || ENTITY_STYLES.default;
  const isPerson = entityType === 'person';
  const isOrganization = entityType === 'organization';
  const isVerified = project.trustScore?.tier === 'verified';

  const getEntityRoute = () => {
    const identifier = project.xHandle || project.id;
    switch (project.entityType) {
      case 'person':
        return `/terminal/person/${identifier}`;
      case 'organization':
        return `/terminal/org/${identifier}`;
      default:
        return `/terminal/project/${identifier}`;
    }
  };

  const handleClick = () => {
    router.push(getEntityRoute());
  };

  // Social presence indicators
  const socials = [
    { icon: <XIcon size={16} />, active: !!project.xHandle, label: 'X/Twitter' },
    { icon: <GithubIcon size={16} />, active: !!project.githubUrl, label: 'GitHub' },
    { icon: <Globe size={16} />, active: !!project.websiteUrl, label: 'Website' },
    { icon: <MessageCircle size={16} />, active: !!project.discordUrl, label: 'Discord' },
    { icon: <Send size={16} />, active: !!project.telegramUrl, label: 'Telegram' },
  ];

  return (
    <div
      onClick={handleClick}
      className="group block cursor-pointer"
    >
      <div className={`
        flex items-stretch border bg-ivory-light/[0.02] transition-all duration-200 overflow-hidden
        ${isPerson
          ? 'border-larp-purple/15 hover:border-larp-purple/30'
          : isOrganization
          ? 'border-larp-yellow/15 hover:border-larp-yellow/30'
          : 'border-ivory-light/10 hover:border-danger-orange/25'
        }
      `}>
        {/* Avatar / Entity icon fallback — flush left, square */}
        <div className={`
          shrink-0 w-16 sm:w-[72px] relative overflow-hidden
          ${entityStyle.color}
        `}>
          {project.avatarUrl ? (
            <Image
              src={project.avatarUrl}
              alt={project.name}
              fill
              className="object-cover"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              {entityStyle.iconLarge}
            </div>
          )}
        </div>

        {/* Content — left side */}
        <div className="flex-1 min-w-0 flex items-center gap-3 sm:gap-4 px-3 sm:px-5 py-3 sm:py-4">
          <div className="flex-1 min-w-0">
            {/* Row 1: Name */}
            <h3 className="font-mono font-bold text-ivory-light text-sm truncate">
              {project.name}
            </h3>

            {/* Row 2: Ticker (always rendered for uniform height) */}
            <span className="font-mono text-[11px] mt-0.5 block h-[16px]">
              {project.ticker ? (
                <span className="text-danger-orange/70">${project.ticker}</span>
              ) : (
                <span className="text-ivory-light">&mdash;</span>
              )}
            </span>
          </div>

          {/* Right side — socials | score */}
          <div className="shrink-0 hidden sm:flex items-center gap-4">
            {/* Social presence icons */}
            {socials.map((s, i) => (
              <span
                key={i}
                className={s.active ? 'text-ivory-light' : 'text-ivory-light'}
                title={s.label}
              >
                {s.icon}
              </span>
            ))}

            {/* Separator */}
            <div className="w-px h-5 bg-ivory-light/15" />

            {/* Trust score badge */}
            <div
              className="flex items-center gap-1 px-2 py-1 border font-mono text-sm font-bold"
              style={{
                color: isVerified ? '#22c55e' : scoreColor,
                borderColor: (isVerified ? '#22c55e' : scoreColor) + '40',
                backgroundColor: (isVerified ? '#22c55e' : scoreColor) + '10',
              }}
            >
              {isVerified ? (
                <CheckCircle size={12} />
              ) : displayScore >= 70 ? (
                <Shield size={12} />
              ) : displayScore < 40 ? (
                <AlertTriangle size={12} />
              ) : null}
              {displayScore}
            </div>
          </div>

          {/* Mobile-only score */}
          <div className="shrink-0 sm:hidden">
            <div
              className="flex items-center gap-1 px-2 py-1 border font-mono text-sm font-bold"
              style={{
                color: isVerified ? '#22c55e' : scoreColor,
                borderColor: (isVerified ? '#22c55e' : scoreColor) + '40',
                backgroundColor: (isVerified ? '#22c55e' : scoreColor) + '10',
              }}
            >
              {isVerified ? (
                <CheckCircle size={12} />
              ) : displayScore >= 70 ? (
                <Shield size={12} />
              ) : displayScore < 40 ? (
                <AlertTriangle size={12} />
              ) : null}
              {displayScore}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
