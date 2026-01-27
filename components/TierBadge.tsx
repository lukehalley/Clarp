'use client';

// Tier Badge Component
// Displays user's CLARP tier with Lucide icon - brutalist industrial style

import { Tier, TIER_CONFIG } from '@/lib/config/tokenomics';
import { User, Star, Gem, Crown, LucideIcon } from 'lucide-react';

// Map icon names to Lucide components
const ICON_MAP: Record<string, LucideIcon> = {
  user: User,
  star: Star,
  gem: Gem,
  crown: Crown,
};

interface TierBadgeProps {
  tier: Tier;
  showIcon?: boolean;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export function TierBadge({
  tier,
  showIcon = true,
  size = 'md',
  showLabel = true,
}: TierBadgeProps) {
  const config = TIER_CONFIG[tier];
  const IconComponent = ICON_MAP[config.icon];

  const sizeClasses = {
    sm: 'text-[9px] px-2 py-1 gap-1',
    md: 'text-[10px] px-2.5 py-1 gap-1.5',
    lg: 'text-xs px-3 py-1.5 gap-2',
  };

  const iconSizes = {
    sm: 10,
    md: 11,
    lg: 13,
  };

  return (
    <span
      className={`
        inline-flex items-center font-mono font-bold uppercase tracking-wider
        border
        ${config.color} ${config.bg} ${config.border} ${sizeClasses[size]}
      `}
    >
      {showIcon && IconComponent && (
        <IconComponent
          size={iconSizes[size]}
          className="flex-shrink-0"
          strokeWidth={2.5}
        />
      )}
      {showLabel && <span>{config.label}</span>}
    </span>
  );
}
