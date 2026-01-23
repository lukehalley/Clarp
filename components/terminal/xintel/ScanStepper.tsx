'use client';

import { ScanStatus, SCAN_STATUS_LABELS, SCAN_STATUS_PROGRESS } from '@/types/xintel';
import { Check, Loader2, AlertCircle } from 'lucide-react';

interface ScanStepperProps {
  status: ScanStatus;
  error?: string;
}

const STEPS: ScanStatus[] = ['fetching', 'extracting', 'analyzing', 'scoring'];

export default function ScanStepper({ status, error }: ScanStepperProps) {
  const currentProgress = SCAN_STATUS_PROGRESS[status];
  const isFailed = status === 'failed';
  const isComplete = status === 'complete' || status === 'cached';

  const getStepStatus = (step: ScanStatus): 'pending' | 'active' | 'complete' | 'failed' => {
    if (isFailed) return 'failed';
    if (isComplete) return 'complete';

    const stepProgress = SCAN_STATUS_PROGRESS[step];
    if (currentProgress > stepProgress) return 'complete';
    if (currentProgress === stepProgress || status === step) return 'active';
    return 'pending';
  };

  return (
    <div className="p-6 border-2 border-danger-orange/30 bg-slate-dark">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-mono font-bold text-ivory-light text-lg">
          {isFailed ? 'Scan Failed' : isComplete ? 'Scan Complete' : 'Scanning Profile'}
        </h3>
        <span className="font-mono text-sm text-danger-orange">
          {currentProgress}%
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-2 bg-ivory-light/10 mb-6 overflow-hidden">
        <div
          className={`h-full transition-all duration-500 ${isFailed ? 'bg-larp-red' : 'bg-danger-orange'}`}
          style={{ width: `${currentProgress}%` }}
        />
      </div>

      {/* Steps */}
      <div className="space-y-3">
        {STEPS.map((step, index) => {
          const stepStatus = getStepStatus(step);
          const label = SCAN_STATUS_LABELS[step];

          return (
            <div key={step} className="flex items-center gap-3">
              {/* Step indicator */}
              <div className="shrink-0">
                {stepStatus === 'complete' ? (
                  <div className="w-6 h-6 flex items-center justify-center bg-larp-green/20 border border-larp-green">
                    <Check size={14} className="text-larp-green" />
                  </div>
                ) : stepStatus === 'active' ? (
                  <div className="w-6 h-6 flex items-center justify-center bg-danger-orange/20 border border-danger-orange">
                    <Loader2 size={14} className="text-danger-orange animate-spin" />
                  </div>
                ) : stepStatus === 'failed' ? (
                  <div className="w-6 h-6 flex items-center justify-center bg-larp-red/20 border border-larp-red">
                    <AlertCircle size={14} className="text-larp-red" />
                  </div>
                ) : (
                  <div className="w-6 h-6 flex items-center justify-center bg-ivory-light/10 border border-ivory-light/30">
                    <span className="font-mono text-xs text-ivory-light/40">{index + 1}</span>
                  </div>
                )}
              </div>

              {/* Step label */}
              <span
                className={`font-mono text-sm ${
                  stepStatus === 'complete' ? 'text-larp-green'
                    : stepStatus === 'active' ? 'text-danger-orange'
                    : stepStatus === 'failed' ? 'text-larp-red'
                    : 'text-ivory-light/40'
                }`}
              >
                {label}
              </span>

              {/* Active indicator */}
              {stepStatus === 'active' && (
                <span className="font-mono text-xs text-danger-orange/60 animate-pulse">
                  Processing...
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Error message */}
      {isFailed && error && (
        <div className="mt-4 p-3 bg-larp-red/10 border border-larp-red/30">
          <p className="font-mono text-sm text-larp-red">{error}</p>
        </div>
      )}

      {/* Complete message */}
      {isComplete && (
        <div className="mt-4 p-3 bg-larp-green/10 border border-larp-green/30">
          <p className="font-mono text-sm text-larp-green">
            {status === 'cached' ? 'Loaded from cache' : 'Report generated successfully'}
          </p>
        </div>
      )}
    </div>
  );
}
