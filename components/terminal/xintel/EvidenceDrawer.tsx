'use client';

import { XIntelEvidence, EVIDENCE_LABEL_COLORS } from '@/types/xintel';
import { X, ExternalLink, Calendar, Tag } from 'lucide-react';
import { useEffect } from 'react';

interface EvidenceDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  evidence: XIntelEvidence[];
}

export default function EvidenceDrawer({ isOpen, onClose, title, evidence }: EvidenceDrawerProps) {
  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 z-40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 bottom-0 w-full max-w-lg bg-slate-dark border-l-2 border-danger-orange/30 z-50 flex flex-col animate-slide-in-right">
        {/* Header */}
        <div className="shrink-0 p-4 border-b-2 border-ivory-light/10 flex items-center justify-between">
          <h3 className="font-mono font-bold text-ivory-light text-lg">
            {title}
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-ivory-light/10 transition-colors"
          >
            <X size={20} className="text-ivory-light/70" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {evidence.length === 0 ? (
            <div className="p-6 text-center">
              <p className="text-ivory-light/50 font-mono text-sm">
                No evidence items available
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {evidence.map((item) => {
                const labelColor = EVIDENCE_LABEL_COLORS[item.label];

                return (
                  <div
                    key={item.id}
                    className="p-4 border border-ivory-light/10 bg-ivory-light/5 hover:border-ivory-light/20 transition-colors"
                  >
                    {/* Label and date */}
                    <div className="flex items-center justify-between mb-3">
                      <span
                        className="font-mono text-xs px-2 py-0.5 border uppercase"
                        style={{
                          borderColor: labelColor,
                          color: labelColor,
                          backgroundColor: `${labelColor}15`,
                        }}
                      >
                        <Tag size={10} className="inline mr-1" />
                        {item.label}
                      </span>
                      <span className="font-mono text-xs text-ivory-light/40 flex items-center gap-1">
                        <Calendar size={12} />
                        {formatDate(item.timestamp)}
                      </span>
                    </div>

                    {/* Excerpt */}
                    <blockquote className="font-mono text-sm text-ivory-light/80 leading-relaxed border-l-2 border-danger-orange/30 pl-3 mb-3">
                      "{item.excerpt}"
                    </blockquote>

                    {/* Link */}
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 font-mono text-xs text-danger-orange hover:text-danger-orange/80 transition-colors"
                    >
                      <ExternalLink size={12} />
                      View original post
                    </a>

                    {/* Confidence */}
                    <div className="mt-2 flex items-center gap-2">
                      <span className="font-mono text-xs text-ivory-light/40">
                        Confidence:
                      </span>
                      <div className="flex-1 h-1 bg-ivory-light/10 max-w-[100px]">
                        <div
                          className="h-full bg-danger-orange/70"
                          style={{ width: `${item.confidence * 100}%` }}
                        />
                      </div>
                      <span className="font-mono text-xs text-ivory-light/50">
                        {Math.round(item.confidence * 100)}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="shrink-0 p-4 border-t border-ivory-light/10 bg-ivory-light/5">
          <p className="font-mono text-xs text-ivory-light/40 text-center">
            {evidence.length} evidence item{evidence.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes slide-in-right {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
          }
        }
        .animate-slide-in-right {
          animation: slide-in-right 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
      `}</style>
    </>
  );
}
