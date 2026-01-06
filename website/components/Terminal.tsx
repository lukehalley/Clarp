'use client';

import { ReactNode } from 'react';

interface TerminalProps {
  children: ReactNode;
  title?: string;
  className?: string;
}

export default function Terminal({ children, title = 'terminal', className = '' }: TerminalProps) {
  // Check if we need flex layout (when className contains flex)
  const needsFlex = className.includes('flex');

  return (
    <div className={`terminal ${className}`}>
      <div className="terminal-header shrink-0">
        <div className="terminal-dot bg-larp-red" />
        <div className="terminal-dot bg-larp-yellow" />
        <div className="terminal-dot bg-larp-green" />
        <span className="ml-3 text-xs text-ivory-light/50 font-mono">{title}</span>
      </div>
      <div className={`terminal-body text-sm ${needsFlex ? 'flex-1 overflow-hidden' : ''}`}>
        {children}
      </div>
    </div>
  );
}
