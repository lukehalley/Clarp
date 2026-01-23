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
      year: 'numeric',
    });
  };

  const dateRange = event.endDate
    ? `${formatDate(event.startDate)} - ${formatDate(event.endDate)}`
    : `Started ${formatDate(event.startDate)}`;

  return (
    <button
      onClick={onClick}
      className="w-full text-left p-4 border border-ivory-light/10 bg-ivory-light/5 hover:border-danger-orange/30 transition-all group"
    >
      <div className="flex items-start gap-3">
        {/* Severity indicator */}
        <div
          className="shrink-0 w-1 h-full min-h-[60px] self-stretch"
          style={{ backgroundColor: severityColor }}
        />

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle
              size={16}
              style={{ color: severityColor }}
            />
            <span
              className="font-mono font-bold text-sm uppercase"
              style={{ color: severityColor }}
            >
              {categoryLabel}
            </span>
            <span
              className="font-mono text-xs px-2 py-0.5 border"
              style={{
                borderColor: severityColor,
                color: severityColor,
                backgroundColor: `${severityColor}15`,
              }}
            >
              {event.severity}
            </span>
          </div>

          {/* Summary */}
          <p className="text-ivory-light/80 text-sm font-mono mb-3 line-clamp-2">
            {event.summary}
          </p>

          {/* Meta info */}
          <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-ivory-light/50">
            <div className="flex items-center gap-1.5">
              <Calendar size={12} />
              <span>{dateRange}</span>
            </div>
            {event.sources.length > 0 && (
              <div className="flex items-center gap-1.5">
                <Users size={12} />
                <span>
                  {event.sources.length} source{event.sources.length !== 1 ? 's' : ''}
                </span>
              </div>
            )}
          </div>

          {/* Sources preview */}
          {event.sources.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {event.sources.slice(0, 3).map((source, i) => (
                <span
                  key={i}
                  className="font-mono text-xs px-2 py-0.5 bg-ivory-light/10 text-ivory-light/60"
                >
                  @{source.handle}
                </span>
              ))}
              {event.sources.length > 3 && (
                <span className="font-mono text-xs px-2 py-0.5 text-ivory-light/40">
                  +{event.sources.length - 3} more
                </span>
              )}
            </div>
          )}
        </div>

        {/* Arrow */}
        <ChevronRight
          size={16}
          className="shrink-0 text-ivory-light/30 group-hover:text-danger-orange transition-colors mt-1"
        />
      </div>
    </button>
  );
}
