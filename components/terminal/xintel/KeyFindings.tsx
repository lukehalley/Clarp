'use client';

import { KeyFinding } from '@/types/xintel';
import { AlertTriangle, AlertCircle, Info, CheckCircle, ChevronRight } from 'lucide-react';

interface KeyFindingsProps {
  findings: KeyFinding[];
  onFindingClick?: (finding: KeyFinding) => void;
}

// Check if a finding is positive based on content
function isPositiveFinding(finding: KeyFinding): boolean {
  const text = (finding.title + ' ' + finding.description).toLowerCase();
  const positiveKeywords = [
    'doxxed', 'verified', 'established', 'active github', 'real product',
    'organic engagement', 'consistent history', 'credible', 'trustworthy',
    'clean history', 'legitimate', 'transparent', 'professional',
    'year-old account', 'years-old account', 'year old account',
    'blue verified', 'no scam', 'no rug', 'no fraud', 'good standing'
  ];
  return positiveKeywords.some(keyword => text.includes(keyword));
}

export default function KeyFindings({ findings, onFindingClick }: KeyFindingsProps) {
  if (findings.length === 0) {
    return (
      <div className="p-4 border border-larp-green/30 bg-larp-green/5">
        <div className="flex items-center gap-2 text-larp-green font-mono text-sm">
          <Info size={16} />
          <span>No major concerns detected</span>
        </div>
      </div>
    );
  }

  const severityConfig = {
    positive: {
      icon: CheckCircle,
      color: '#22c55e',
      bg: 'bg-larp-green/10',
      border: 'border-larp-green/30',
    },
    critical: {
      icon: AlertTriangle,
      color: '#dc2626',
      bg: 'bg-larp-red/10',
      border: 'border-larp-red/30',
    },
    warning: {
      icon: AlertCircle,
      color: '#f97316',
      bg: 'bg-danger-orange/10',
      border: 'border-danger-orange/30',
    },
    info: {
      icon: Info,
      color: '#6b7280',
      bg: 'bg-ivory-light/5',
      border: 'border-ivory-light/20',
    },
  };

  return (
    <div className="space-y-2">
      {findings.slice(0, 3).map((finding) => {
        // Use positive config if this is a positive finding, otherwise use severity
        const isPositive = isPositiveFinding(finding);
        const config = isPositive ? severityConfig.positive : severityConfig[finding.severity];
        const Icon = config.icon;

        return (
          <button
            key={finding.id}
            onClick={() => onFindingClick?.(finding)}
            className={`w-full text-left p-3 border ${config.border} ${config.bg} hover:border-danger-orange/50 transition-colors group`}
          >
            <div className="flex items-start gap-3">
              <Icon
                size={18}
                className="shrink-0 mt-0.5"
                style={{ color: config.color }}
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span
                    className="font-mono font-bold text-sm"
                    style={{ color: config.color }}
                  >
                    {finding.title}
                  </span>
                  <ChevronRight
                    size={14}
                    className="shrink-0 text-ivory-light/30 group-hover:text-danger-orange transition-colors"
                  />
                </div>
                <p className="text-ivory-light/60 text-xs font-mono mt-1 line-clamp-2">
                  {finding.description}
                </p>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
