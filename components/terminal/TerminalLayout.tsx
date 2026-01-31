'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import ConnectWallet from '@/components/ConnectWallet';
import TerminalBottomNav from './TerminalBottomNav';
import { TerminalNavProvider } from '@/contexts/TerminalNavContext';

interface TerminalLayoutProps {
  children: React.ReactNode;
}

export default function TerminalLayout({ children }: TerminalLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isFadingOut, setIsFadingOut] = useState(false);

  // Detect detail pages for back button
  const isDetailPage =
    pathname.startsWith('/terminal/project/') ||
    pathname.startsWith('/terminal/person/') ||
    pathname.startsWith('/terminal/org/');

  return (
    <TerminalNavProvider>
      {/* Persistent background */}
      <div className="fixed inset-0 bg-slate-dark -z-10" />
      <div className="h-dvh bg-slate-dark flex flex-col overflow-hidden">
        {/* Construction stripe */}
        <div className="construction-stripe h-1 shrink-0" />

        {/* Top bar — unified for all screen sizes */}
        <header className="shrink-0 border-b border-ivory-light/10 bg-slate-dark z-40">
          <div className="px-3 sm:px-6 h-12 flex items-center justify-between gap-3">
            {/* Left: Back button (detail pages) or Logo */}
            <div className="flex items-center gap-3 shrink-0">
              {isDetailPage && (
                <button
                  onClick={() => router.push('/terminal/projects')}
                  className="flex items-center justify-center w-8 h-8 text-ivory-light/50 hover:text-ivory-light transition-colors cursor-pointer"
                  title="Back to projects"
                >
                  <ArrowLeft size={16} />
                </button>
              )}
              <Link
                href="/terminal/projects"
                className="flex items-center gap-1.5 sm:gap-2 font-mono font-bold text-xs sm:text-sm whitespace-nowrap"
              >
                <span className="text-danger-orange">CLARP</span>
                <span className="text-ivory-light">TERMINAL</span>
              </Link>
            </div>

            {/* Right: Wallet */}
            <ConnectWallet compact />
          </div>
        </header>

        {/* Main content — full width, no sidebar */}
        <main className={`flex-1 overflow-y-auto overflow-x-hidden relative ${isDetailPage ? 'pb-16 lg:pb-0' : ''}`}>
          {children}
        </main>

        {/* Bottom Nav (mobile only — detail page tabs) */}
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
