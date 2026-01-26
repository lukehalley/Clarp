'use client';

import { ScanStatus, SCAN_STATUS_LABELS } from '@/types/xintel';
import { Check, Loader2, AlertCircle } from 'lucide-react';

interface ScanStepperProps {
  status: ScanStatus;
  progress?: number;
  statusMessage?: string;
  error?: string;
}

// Define progress ranges for each step
const STEP_RANGES: Record<ScanStatus, { min: number; max: number }> = {
  queued: { min: 0, max: 10 },
  fetching: { min: 10, max: 25 },
  extracting: { min: 25, max: 45 },
  analyzing: { min: 45, max: 80 },
  scoring: { min: 80, max: 100 },
  complete: { min: 100, max: 100 },
  failed: { min: 0, max: 0 },
  cached: { min: 100, max: 100 },
};

const STEPS: ScanStatus[] = ['fetching', 'extracting', 'analyzing', 'scoring'];

export default function ScanStepper({ status, progress, statusMessage, error }: ScanStepperProps) {
  // Use provided progress or fall back to the minimum for the current status
  const currentProgress = progress ?? STEP_RANGES[status]?.min ?? 0;
  const isFailed = status === 'failed';
  const isComplete = status === 'complete' || status === 'cached';

  const getStepStatus = (step: ScanStatus): 'pending' | 'active' | 'complete' | 'failed' => {
    if (isFailed) return 'failed';
    if (isComplete) return 'complete';

    const stepRange = STEP_RANGES[step];
    if (currentProgress >= stepRange.max) return 'complete';
    if (currentProgress >= stepRange.min) return 'active';
    return 'pending';
  };

  return (
    <div className="p-6 border-2 border-danger-orange/30 bg-slate-dark">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-mono font-bold text-ivory-light text-lg">
          {isFailed ? 'Scan Failed' : isComplete ? 'Scan Complete' : 'Scanning Profile'}
        </h3>
        <span className="font-mono text-sm text-danger-orange tabular-nums">
          {currentProgress}%
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-2 bg-ivory-light/10 mb-4 overflow-hidden">
        <div
          className={`h-full transition-all duration-300 ease-out ${isFailed ? 'bg-larp-red' : 'bg-danger-orange'}`}
          style={{ width: `${currentProgress}%` }}
        />
      </div>

      {/* Current status message */}
      {statusMessage && !isFailed && !isComplete && (
        <div className="mb-4 px-3 py-2 bg-danger-orange/10 border border-danger-orange/20">
          <p className="font-mono text-sm text-danger-orange flex items-center gap-2">
            <Loader2 size={14} className="animate-spin shrink-0" />
            <span className="truncate">{statusMessage}</span>
          </p>
        </div>
      )}

      {/* Steps */}
      <div className="space-y-2">
        {STEPS.map((step, index) => {
          const stepStatus = getStepStatus(step);
          const label = SCAN_STATUS_LABELS[step];
          const stepRange = STEP_RANGES[step];

          // Calculate sub-progress within this step
          let stepProgress = 0;
          if (stepStatus === 'complete') {
            stepProgress = 100;
          } else if (stepStatus === 'active') {
            const range = stepRange.max - stepRange.min;
            stepProgress = Math.round(((currentProgress - stepRange.min) / range) * 100);
          }

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

              {/* Step content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
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

                  {/* Step sub-progress */}
                  {stepStatus === 'active' && (
                    <span className="font-mono text-xs text-danger-orange/60 tabular-nums">
                      {stepProgress}%
                    </span>
                  )}
                </div>

                {/* Step progress bar */}
                {stepStatus === 'active' && (
                  <div className="h-1 bg-ivory-light/10 mt-1 overflow-hidden">
                    <div
                      className="h-full bg-danger-orange/50 transition-all duration-300 ease-out"
                      style={{ width: `${stepProgress}%` }}
                    />
                  </div>
                )}
              </div>
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
