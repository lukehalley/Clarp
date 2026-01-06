'use client';

interface ProgressBarProps {
  progress: number;
  label?: string;
  showPercent?: boolean;
  stuck?: boolean;
  className?: string;
}

export default function ProgressBar({
  progress,
  label,
  showPercent = false,
  stuck = true,
  className = '',
}: ProgressBarProps) {
  const displayProgress = stuck ? Math.min(progress, 99) : progress;

  return (
    <div className={className}>
      {(label || showPercent) && (
        <div className="flex items-center justify-between mb-2">
          {label && <span className="text-xs text-slate-light">{label}</span>}
          {showPercent && (
            <span className="text-xs font-mono text-clay">
              {displayProgress}%
              {stuck && displayProgress >= 99 && (
                <span className="text-larp-red ml-1">(stuck)</span>
              )}
            </span>
          )}
        </div>
      )}
      <div className="relative h-2 bg-cloud-light/50 rounded-full overflow-hidden">
        <div
          className={`absolute inset-y-0 left-0 bg-gradient-to-r from-clay to-clay-deep rounded-full transition-all duration-1000 ${
            stuck && displayProgress >= 99 ? 'animate-pulse' : ''
          }`}
          style={{ width: `${displayProgress}%` }}
        />
      </div>
    </div>
  );
}
