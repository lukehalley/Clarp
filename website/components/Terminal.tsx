'use client';

import { ReactNode } from 'react';

interface TerminalProps {
  children: ReactNode;
  title?: string;
  className?: string;
}

export default function Terminal({ children, title = 'terminal', className = '' }: TerminalProps) {
  return (
    <div className={`terminal ${className}`}>
      <div className="terminal-header">
        <div className="terminal-dot bg-larp-red" />
        <div className="terminal-dot bg-larp-yellow" />
        <div className="terminal-dot bg-larp-green" />
        <span className="ml-3 text-xs text-ivory-light/50 font-mono">{title}</span>
      </div>
      <div className="terminal-body text-sm">
        {children}
      </div>
    </div>
  );
}
