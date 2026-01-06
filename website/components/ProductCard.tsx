'use client';

import Badge from './Badge';
import ProgressBar from './ProgressBar';
import Button from './Button';

interface ProductCardProps {
  name: string;
  tagline: string;
  description: string;
  features: string[];
  progress: number;
  status: 'coming-soon' | 'development' | 'roadmap';
  delay?: number;
}

export default function ProductCard({
  name,
  tagline,
  description,
  features,
  progress,
  status,
  delay = 0,
}: ProductCardProps) {
  const statusConfig = {
    'coming-soon': { badge: 'warning' as const, label: 'Coming Soon' },
    'development': { badge: 'larp' as const, label: 'In Development' },
    'roadmap': { badge: 'default' as const, label: 'On Roadmap' },
  };

  return (
    <div
      className="larp-card animate-slide-up p-4 sm:p-6"
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Status badge */}
      <Badge variant={statusConfig[status].badge} className="mb-3 sm:mb-4">
        {statusConfig[status].label}
      </Badge>

      {/* Header */}
      <h3 className="text-lg sm:text-xl font-semibold text-slate-dark mb-1">{name}</h3>
      <p className="text-xs sm:text-sm font-mono text-clay mb-3 sm:mb-4">{tagline}</p>

      {/* Description */}
      <p className="text-slate-light text-xs sm:text-sm mb-4 sm:mb-6">{description}</p>

      {/* Features */}
      <ul className="space-y-1.5 sm:space-y-2 mb-4 sm:mb-6">
        {features.map((feature, i) => (
          <li key={i} className="flex items-center gap-2 text-xs sm:text-sm text-slate-light">
            <span className="text-cloud-medium shrink-0">▸</span>
            {feature}
          </li>
        ))}
      </ul>

      {/* Progress */}
      <ProgressBar progress={progress} label="Development Progress" showPercent />

      {/* CTA */}
      <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-cloud-light">
        <Button variant="secondary" size="sm" disabled className="w-full text-xs sm:text-sm">
          Learn More
        </Button>
      </div>
    </div>
  );
}
