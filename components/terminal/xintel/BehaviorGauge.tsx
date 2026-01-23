'use client';

import { BehaviorExample } from '@/types/xintel';

interface BehaviorGaugeProps {
  label: string;
  score: number;
  maxScore?: number;
  examples?: BehaviorExample[];
  keywords?: string[];
  description?: string;
  invertColor?: boolean; // For consistency score where higher = better
  onExampleClick?: (example: BehaviorExample) => void;
}

export default function BehaviorGauge({
  label,
  score,
  maxScore = 100,
  examples = [],
  keywords = [],
  description,
  invertColor = false,
  onExampleClick,
}: BehaviorGaugeProps) {
  const percentage = Math.min(100, (score / maxScore) * 100);

  // Color logic
  const getColor = () => {
    const value = invertColor ? 100 - percentage : percentage;
    if (value >= 70) return '#dc2626'; // red
    if (value >= 50) return '#f97316'; // orange
    if (value >= 30) return '#eab308'; // yellow
    return '#22c55e'; // green
  };

  const color = getColor();

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="p-4 border border-ivory-light/10 bg-ivory-light/5">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <span className="font-mono font-bold text-ivory-light text-sm">
          {label}
        </span>
        <span
          className="font-mono font-bold text-lg"
          style={{ color }}
        >
          {score}
          <span className="text-ivory-light/40 text-sm">/{maxScore}</span>
        </span>
      </div>

      {/* Gauge bar */}
      <div className="h-2 bg-ivory-light/10 overflow-hidden mb-3">
        <div
          className="h-full transition-all duration-700 ease-out"
          style={{
            width: `${percentage}%`,
            backgroundColor: color,
            boxShadow: `0 0 10px ${color}60`,
          }}
        />
      </div>

      {/* Description */}
      {description && (
        <p className="text-xs font-mono text-ivory-light/50 mb-3">
          {description}
        </p>
      )}

      {/* Keywords */}
      {keywords.length > 0 && (
        <div className="mb-3">
          <div className="text-xs font-mono text-ivory-light/40 mb-1.5 uppercase">
            Detected Keywords
          </div>
          <div className="flex flex-wrap gap-1.5">
            {keywords.slice(0, 6).map((keyword, i) => (
              <span
                key={i}
                className="font-mono text-xs px-2 py-0.5 bg-danger-orange/10 text-danger-orange border border-danger-orange/30"
              >
                {keyword}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Examples */}
      {examples.length > 0 && (
        <div>
          <div className="text-xs font-mono text-ivory-light/40 mb-1.5 uppercase">
            Examples
          </div>
          <div className="space-y-2">
            {examples.slice(0, 2).map((example, i) => (
              <button
                key={i}
                onClick={() => onExampleClick?.(example)}
                className="w-full text-left p-2 bg-ivory-light/5 border border-ivory-light/10 hover:border-danger-orange/30 transition-colors"
              >
                <p className="text-xs font-mono text-ivory-light/70 line-clamp-2">
                  "{example.excerpt}"
                </p>
                <span className="text-xs font-mono text-ivory-light/40 mt-1 block">
                  {formatDate(example.timestamp)}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
