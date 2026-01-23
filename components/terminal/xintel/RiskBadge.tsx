'use client';

import { XIntelRiskLevel, getRiskLevelColor, getRiskLevelLabel } from '@/types/xintel';
import { AlertTriangle, CheckCircle, AlertCircle } from 'lucide-react';

interface RiskBadgeProps {
  level: XIntelRiskLevel;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

export default function RiskBadge({ level, size = 'md', showIcon = true }: RiskBadgeProps) {
  const color = getRiskLevelColor(level);
  const label = getRiskLevelLabel(level);

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs gap-1',
    md: 'px-3 py-1 text-sm gap-1.5',
    lg: 'px-4 py-1.5 text-base gap-2',
  };

  const iconSizes = {
    sm: 12,
    md: 14,
    lg: 16,
  };

  const Icon = level === 'low' ? CheckCircle
    : level === 'medium' ? AlertCircle
    : AlertTriangle;

  return (
    <span
      className={`inline-flex items-center font-mono font-bold uppercase border transition-all ${sizeClasses[size]}`}
      style={{
        borderColor: color,
        color: color,
        backgroundColor: `${color}15`,
      }}
    >
      {showIcon && <Icon size={iconSizes[size]} />}
      {label}
    </span>
  );
}
