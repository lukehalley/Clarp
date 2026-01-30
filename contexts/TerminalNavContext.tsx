'use client';

import { createContext, useContext, useState, useCallback } from 'react';

// Legacy tab IDs (for sidebar/bottom nav compatibility)
type TabId = 'overview' | 'security' | 'market' | 'intel' | 'development';

// New section group IDs for the single-page scroll layout
type SectionGroupId = 'overview' | 'trust' | 'security' | 'market' | 'tokenomics' | 'intel' | 'development' | 'sources';

interface TerminalNavContextType {
  /** Active detail tab (only relevant on entity detail pages) */
  activeDetailTab: TabId;
  setActiveDetailTab: (tab: TabId) => void;
  /** Active section group for scroll-spy navigation */
  activeSectionGroup: SectionGroupId;
  setActiveSectionGroup: (group: SectionGroupId) => void;
  /** Whether a detail page is currently mounted and controlling the tab */
  isDetailPage: boolean;
  setIsDetailPage: (v: boolean) => void;
}

const TerminalNavContext = createContext<TerminalNavContextType>({
  activeDetailTab: 'overview',
  setActiveDetailTab: () => {},
  activeSectionGroup: 'overview',
  setActiveSectionGroup: () => {},
  isDetailPage: false,
  setIsDetailPage: () => {},
});

export function TerminalNavProvider({ children }: { children: React.ReactNode }) {
  const [activeDetailTab, setActiveDetailTab] = useState<TabId>('overview');
  const [activeSectionGroup, setActiveSectionGroup] = useState<SectionGroupId>('overview');
  const [isDetailPage, setIsDetailPage] = useState(false);

  return (
    <TerminalNavContext.Provider
      value={{
        activeDetailTab,
        setActiveDetailTab,
        activeSectionGroup,
        setActiveSectionGroup,
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

export type { TabId, SectionGroupId };
