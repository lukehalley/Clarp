'use client';

import { createContext, useContext, useState, useCallback } from 'react';

type TabId = 'overview' | 'security' | 'market' | 'intel' | 'development';

interface TerminalNavContextType {
  /** Active detail tab (only relevant on entity detail pages) */
  activeDetailTab: TabId;
  setActiveDetailTab: (tab: TabId) => void;
  /** Whether a detail page is currently mounted and controlling the tab */
  isDetailPage: boolean;
  setIsDetailPage: (v: boolean) => void;
}

const TerminalNavContext = createContext<TerminalNavContextType>({
  activeDetailTab: 'overview',
  setActiveDetailTab: () => {},
  isDetailPage: false,
  setIsDetailPage: () => {},
});

export function TerminalNavProvider({ children }: { children: React.ReactNode }) {
  const [activeDetailTab, setActiveDetailTab] = useState<TabId>('overview');
  const [isDetailPage, setIsDetailPage] = useState(false);

  return (
    <TerminalNavContext.Provider
      value={{
        activeDetailTab,
        setActiveDetailTab,
        isDetailPage,
        setIsDetailPage,
      }}
    >
      {children}
    </TerminalNavContext.Provider>
  );
}

export function useTerminalNav() {
  return useContext(TerminalNavContext);
}

export type { TabId };
