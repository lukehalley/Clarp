'use client';

import { useRouter } from 'next/navigation';
import { Shield, AlertTriangle, User, Boxes, Building2 } from 'lucide-react';
import ChainIcon, { type Chain } from '@/components/terminal/ChainIcon';
import type { Project, EntityType } from '@/types/project';

interface IntelCardProps {
  project: Project;
  scoreDelta24h?: number;
}

// Entity type styling configuration
const ENTITY_STYLES: Record<EntityType | 'default', {
  icon: React.ReactNode;
  iconLarge: React.ReactNode;
  label: string;
  color: string;
  hexColor: string;
  bgColor: string;
  borderColor: string;
}> = {
  project: {
    icon: <Boxes size={10} />,
    iconLarge: <Boxes size={22} />,
    label: 'Project',
    color: 'text-danger-orange',
    hexColor: '#FF6B35',
    bgColor: 'bg-danger-orange/10',
    borderColor: 'border-danger-orange/30',
  },
  person: {
    icon: <User size={10} />,
    iconLarge: <User size={22} />,
    label: 'Person',
    color: 'text-larp-purple',
    hexColor: '#9B59B6',
    bgColor: 'bg-larp-purple/10',
    borderColor: 'border-larp-purple/30',
  },
  organization: {
    icon: <Building2 size={10} />,
    iconLarge: <Building2 size={22} />,
    label: 'Org',
    color: 'text-larp-yellow',
    hexColor: '#FFD93D',
    bgColor: 'bg-larp-yellow/10',
    borderColor: 'border-larp-yellow/30',
  },
  default: {
    icon: <Boxes size={10} />,
    iconLarge: <Boxes size={22} />,
    label: 'Project',
    color: 'text-danger-orange',
    hexColor: '#FF6B35',
    bgColor: 'bg-danger-orange/10',
    borderColor: 'border-danger-orange/30',
  },
};

// Get color based on trust score
function getScoreColor(score: number): string {
  if (score >= 85) return '#22c55e';
  if (score >= 70) return '#84cc16';
  if (score >= 50) return '#6b7280';
  if (score >= 30) return '#f97316';
  return '#dc2626';
}

// Detect chain from token address
function detectChain(address?: string): Chain | null {
  if (!address) return null;
  if (address.startsWith('0x')) return 'ethereum';
  if (/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address)) return 'solana';
  return null;
}

export default function IntelCard({ project }: IntelCardProps) {
  const router = useRouter();
  const score = project.trustScore?.score ?? 50;
  const displayScore = Math.max(1, score);
  const scoreColor = getScoreColor(displayScore);
  const chain = detectChain(project.tokenAddress);

  // Get entity type styling
  const entityType = project.entityType || 'default';
  const entityStyle = ENTITY_STYLES[entityType] || ENTITY_STYLES.default;
  const isPerson = entityType === 'person';
  const isOrganization = entityType === 'organization';

  // Extract tags from project
  const tags = project.tags?.slice(0, 3) || [];

  // Get the correct route based on entity type
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

  return (
    <div
      onClick={handleClick}
      className="group block cursor-pointer"
    >
      <div className={`
        flex items-center gap-3 sm:gap-4 px-3 sm:px-4 py-3 border bg-ivory-light/[0.02] transition-all duration-200
        ${isPerson
          ? 'border-larp-purple/15 hover:border-larp-purple/30'
          : isOrganization
          ? 'border-larp-yellow/15 hover:border-larp-yellow/30'
          : 'border-ivory-light/10 hover:border-danger-orange/25'
        }
      `}>
        {/* Entity type icon */}
        <div className={`
          shrink-0 w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center
          ${entityStyle.bgColor} ${entityStyle.borderColor} border ${entityStyle.color}
        `}>
          {entityStyle.iconLarge}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <h3 className="font-mono font-bold text-ivory-light text-sm truncate">
              {project.name}
            </h3>
            {project.ticker && (
              <span className="font-mono text-xs text-danger-orange shrink-0">
                ${project.ticker}
              </span>
            )}
            {chain && <ChainIcon chain={chain} size={14} />}
          </div>
          {/* Tags / Handle */}
          <div className="flex items-center gap-1.5 mt-0.5">
            {isPerson && project.xHandle ? (
              <span className="text-[10px] font-mono text-larp-purple/60">
                @{project.xHandle}
              </span>
            ) : tags.length > 0 ? (
              <div className="flex gap-1">
                {tags.slice(0, 2).map((tag, i) => (
                  <span
                    key={i}
                    className="text-[9px] font-mono px-1 py-0.5 bg-ivory-light/5 text-ivory-light/35 border border-ivory-light/8"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            ) : null}
            {project.trustScore?.tier === 'verified' && (
              <span className="text-[9px] font-mono px-1 py-0.5 bg-larp-green/15 text-larp-green border border-larp-green/25">
                Verified
              </span>
            )}
          </div>
        </div>

        {/* Compact trust score badge */}
        <div
          className="shrink-0 flex items-center gap-1 px-2 py-1 border font-mono text-sm font-bold"
          style={{
            color: scoreColor,
            borderColor: scoreColor + '40',
            backgroundColor: scoreColor + '10',
          }}
        >
          {displayScore >= 70 ? (
            <Shield size={12} />
          ) : displayScore < 40 ? (
            <AlertTriangle size={12} />
          ) : null}
          {displayScore}
        </div>
      </div>
    </div>
  );
}
