'use client';

import { ReputationScore as ReputationScoreType, getScoreColor, getScoreLabel, getRiskLevelColor, SCORE_FACTOR_CONFIG } from '@/types/xintel';

interface ReputationScoreProps {
  score: ReputationScoreType;
  size?: 'sm' | 'md' | 'lg';
  showFactors?: boolean;
}

export default function ReputationScore({ score, size = 'md', showFactors = false }: ReputationScoreProps) {
  const scoreColor = getScoreColor(score.overall);
  const riskColor = getRiskLevelColor(score.riskLevel);

  const sizeClasses = {
    sm: {
      container: 'gap-2',
      score: 'text-4xl',
      label: 'text-xs',
      badge: 'text-xs px-2 py-0.5',
    },
    md: {
      container: 'gap-3',
      score: 'text-6xl',
      label: 'text-sm',
      badge: 'text-xs px-3 py-1',
    },
    lg: {
      container: 'gap-4',
      score: 'text-8xl',
      label: 'text-base',
      badge: 'text-sm px-4 py-1.5',
    },
  };

  const classes = sizeClasses[size];

  // Get active factors (those with points > 0)
  const activeFactors = score.factors
    .filter(f => f.points > 0)
    .sort((a, b) => b.points - a.points);

  return (
    <div className={`flex flex-col ${classes.container}`}>
      {/* Score number with animated glow */}
      <div className="flex items-baseline gap-2">
        <span
          className={`font-mono font-bold ${classes.score} transition-all duration-300`}
          style={{
            color: scoreColor,
            textShadow: `0 0 20px ${scoreColor}40`,
          }}
        >
          {score.overall}
        </span>
        <span className="text-ivory-light/40 font-mono text-lg">/100</span>
      </div>

      {/* Score label */}
      <div className={`font-mono ${classes.label} text-ivory-light/70`}>
        {getScoreLabel(score.overall)}
      </div>

      {/* Badges */}
      <div className="flex flex-wrap items-center gap-2 mt-1">
        {/* Risk level */}
        <span
          className={`font-mono font-bold uppercase ${classes.badge} border transition-colors`}
          style={{
            borderColor: riskColor,
            color: riskColor,
            backgroundColor: `${riskColor}15`,
          }}
        >
          {score.riskLevel} risk
        </span>

        {/* Confidence */}
        <span
          className={`font-mono ${classes.badge} border border-ivory-light/30 text-ivory-light/60`}
        >
          {score.confidence} confidence
        </span>
      </div>

      {/* Factor breakdown */}
      {showFactors && activeFactors.length > 0 && (
        <div className="mt-4 space-y-2">
          <div className="text-xs font-mono text-ivory-light/50 uppercase tracking-wider">
            Risk Factors
          </div>
          <div className="space-y-1.5">
            {activeFactors.slice(0, 4).map((factor) => {
              const config = SCORE_FACTOR_CONFIG[factor.type];
              const percentage = (factor.points / factor.maxPoints) * 100;

              return (
                <div key={factor.type} className="group">
                  <div className="flex items-center justify-between text-xs font-mono mb-1">
                    <span className="text-ivory-light/70">{config.label}</span>
                    <span className="text-danger-orange">-{factor.points}</span>
                  </div>
                  <div className="h-1.5 bg-ivory-light/10 overflow-hidden">
                    <div
                      className="h-full bg-danger-orange/80 transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
