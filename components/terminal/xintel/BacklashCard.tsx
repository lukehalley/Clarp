'use client';

import { BacklashEvent, BACKLASH_CATEGORY_LABELS, BACKLASH_SEVERITY_COLORS } from '@/types/xintel';
import { AlertTriangle, Users, Calendar, ChevronRight } from 'lucide-react';

interface BacklashCardProps {
  event: BacklashEvent;
  onClick?: () => void;
}

export default function BacklashCard({ event, onClick }: BacklashCardProps) {
  const severityColor = BACKLASH_SEVERITY_COLORS[event.severity];
  const categoryLabel = BACKLASH_CATEGORY_LABELS[event.category];

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <button
      onClick={onClick}
      className="w-full text-left p-3 border border-ivory-light/10 bg-ivory-light/[0.02] hover:border-danger-orange/30 transition-all group"
    >
      <div className="flex items-start gap-2">
        {/* Severity indicator */}
        <div
          className="shrink-0 w-1 h-full min-h-[40px] self-stretch rounded-full"
          style={{ backgroundColor: severityColor }}
        />

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle size={12} style={{ color: severityColor }} />
            <span className="font-mono font-bold text-xs uppercase truncate" style={{ color: severityColor }}>
              {categoryLabel}
            </span>
            <span
              className="font-mono text-[9px] px-1 py-0.5 border shrink-0"
              style={{ borderColor: severityColor, color: severityColor, backgroundColor: `${severityColor}15` }}
            >
              {event.severity}
            </span>
            <ChevronRight
              size={12}
              className="ml-auto shrink-0 text-ivory-light/20 group-hover:text-danger-orange transition-colors"
            />
          </div>

          {/* Summary */}
          <p className="text-ivory-light/70 text-xs font-mono mb-2 line-clamp-2">
            {event.summary}
          </p>

          {/* Meta */}
          <div className="flex items-center gap-3 text-[10px] font-mono text-ivory-light/40">
            <span className="flex items-center gap-1">
              <Calendar size={10} />
              {formatDate(event.startDate)}
            </span>
            {event.sources.length > 0 && (
              <span className="flex items-center gap-1">
                <Users size={10} />
                {event.sources.length}
              </span>
            )}
          </div>
        </div>
      </div>
    </button>
  );
}
