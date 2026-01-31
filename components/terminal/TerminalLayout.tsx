'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import ConnectWallet from '@/components/ConnectWallet';
import TerminalSidebar from './TerminalSidebar';
import TerminalBottomNav from './TerminalBottomNav';
import { TerminalNavProvider } from '@/contexts/TerminalNavContext';

interface TerminalLayoutProps {
  children: React.ReactNode;
}

export default function TerminalLayout({ children }: TerminalLayoutProps) {
  const router = useRouter();
  const [isFadingOut, setIsFadingOut] = useState(false);

  const handleBackToHome = () => {
    setIsFadingOut(true);
    setTimeout(() => {
      router.push('/');
    }, 500);
  };

  return (
    <TerminalNavProvider>
      {/* Persistent background */}
      <div className="fixed inset-0 bg-slate-dark -z-10" />
      <div className="h-dvh bg-slate-dark flex flex-col overflow-hidden">
        {/* Construction stripe */}
        <div className="construction-stripe h-1 shrink-0" />

        {/* Mobile-only header (hidden on desktop — sidebar handles branding/wallet) */}
        <header className="lg:hidden shrink-0 border-b border-ivory-light/10 bg-slate-dark/95 backdrop-blur-sm sticky top-0 z-40">
          <div className="px-3 sm:px-4 h-12 flex items-center justify-between gap-2 sm:gap-4">
            <Link
              href="/terminal/projects"
              className="flex items-center gap-1.5 sm:gap-2 text-ivory-light font-mono font-bold text-xs sm:text-sm shrink-0"
            >
              <span className="text-danger-orange">CLARP</span>
              <span className="text-ivory-light">TERMINAL</span>
            </Link>
            <ConnectWallet compact />
          </div>
        </header>

        {/* Body — sidebar + content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Sidebar (desktop only) */}
          <TerminalSidebar />

          {/* Main Content — full width */}
          <main className="flex-1 overflow-y-auto pb-16 lg:pb-0 relative">
            {children}
          </main>
        </div>

        {/* Bottom Nav (mobile only) */}
        <TerminalBottomNav />

        {/* Fade out overlay */}
        <div
          className={`fixed inset-0 bg-black z-[150] pointer-events-none transition-opacity duration-500 ${
            isFadingOut ? 'opacity-100' : 'opacity-0'
          }`}
        />
      </div>
    </TerminalNavProvider>
  );
}
