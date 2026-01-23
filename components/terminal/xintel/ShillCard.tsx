'use client';

import { ShilledEntity } from '@/types/xintel';
import { TrendingUp, Calendar, MessageSquare, ChevronRight } from 'lucide-react';

interface ShillCardProps {
  entity: ShilledEntity;
  rank: number;
  onClick?: () => void;
}

export default function ShillCard({ entity, rank, onClick }: ShillCardProps) {
  const intensity = entity.promoIntensity;
  const intensityColor = intensity >= 80 ? '#dc2626'
    : intensity >= 60 ? '#f97316'
    : intensity >= 40 ? '#eab308'
    : '#22c55e';

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <button
      onClick={onClick}
      className="w-full text-left p-4 border border-ivory-light/10 bg-ivory-light/5 hover:border-danger-orange/30 hover:bg-danger-orange/5 transition-all group"
    >
      <div className="flex items-start justify-between gap-3">
        {/* Rank badge */}
        <div className="shrink-0 w-8 h-8 flex items-center justify-center bg-danger-orange/20 border border-danger-orange/30 font-mono font-bold text-danger-orange">
          #{rank}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center gap-2 mb-2">
            <span className="font-mono font-bold text-ivory-light text-lg truncate">
              {entity.entityName}
            </span>
            {entity.ticker && (
              <span className="font-mono text-xs px-2 py-0.5 bg-danger-orange/20 text-danger-orange border border-danger-orange/30">
                ${entity.ticker}
              </span>
            )}
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs font-mono">
            <div className="flex items-center gap-1.5 text-ivory-light/60">
              <MessageSquare size={12} />
              <span>{entity.mentionCount} mentions</span>
            </div>
            <div className="flex items-center gap-1.5 text-ivory-light/60">
              <TrendingUp size={12} />
              <span>{entity.promoCount} promos</span>
            </div>
            <div className="flex items-center gap-1.5 text-ivory-light/60">
              <Calendar size={12} />
              <span>First: {formatDate(entity.firstSeen)}</span>
            </div>
            <div className="flex items-center gap-1.5 text-ivory-light/60">
              <Calendar size={12} />
              <span>Last: {formatDate(entity.lastSeen)}</span>
            </div>
          </div>

          {/* Promo intensity bar */}
          <div className="mt-3">
            <div className="flex items-center justify-between text-xs font-mono mb-1">
              <span className="text-ivory-light/50">Promo Intensity</span>
              <span style={{ color: intensityColor }}>{intensity}%</span>
            </div>
            <div className="h-1.5 bg-ivory-light/10 overflow-hidden">
              <div
                className="h-full transition-all duration-500"
                style={{
                  width: `${intensity}%`,
                  backgroundColor: intensityColor,
                }}
              />
            </div>
          </div>
        </div>

        {/* Arrow */}
        <ChevronRight
          size={16}
          className="shrink-0 text-ivory-light/30 group-hover:text-danger-orange transition-colors mt-2"
        />
      </div>
    </button>
  );
}
