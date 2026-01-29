'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

interface WalletModalContextType {
  visible: boolean;
  setVisible: (visible: boolean) => void;
}

const WalletModalContext = createContext<WalletModalContextType | null>(null);

export function useWalletModal() {
  const context = useContext(WalletModalContext);
  if (!context) {
    throw new Error('useWalletModal must be used within a WalletModalProvider');
  }
  return context;
}

interface WalletModalProviderProps {
  children: ReactNode;
}

export function WalletModalProvider({ children }: WalletModalProviderProps) {
  const [visible, setVisibleState] = useState(false);

  const setVisible = useCallback((v: boolean) => {
    setVisibleState(v);
  }, []);

  return (
    <WalletModalContext.Provider value={{ visible, setVisible }}>
      {children}
    </WalletModalContext.Provider>
  );
}
