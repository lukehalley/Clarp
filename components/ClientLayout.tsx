'use client';

import { useState, useEffect, useCallback, createContext, useContext, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import ClarpAI from '@/components/ClarpAI';

// Context for page transition
interface TransitionContextType {
  navigateWithFade: (href: string) => void;
}

const TransitionContext = createContext<TransitionContextType | null>(null);

export function usePageTransition() {
  const context = useContext(TransitionContext);
  if (!context) {
    throw new Error('usePageTransition must be used within ClientLayout');
  }
  return context;
}

interface ClientLayoutProps {
  children: React.ReactNode;
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const isTerminal = pathname?.startsWith('/terminal');
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [isFadingIn, setIsFadingIn] = useState(true);
  const [pendingNavigation, setPendingNavigation] = useState<string | null>(null);
  const prevPathname = useRef(pathname);

  // Determine if a path is a dark page (terminal)
  const isDarkPage = (path: string | null) => path?.startsWith('/terminal');

  // Handle fade transition navigation
  const navigateWithFade = useCallback((href: string) => {
    // Don't fade if already on this page
    if (href === pathname) return;

    setIsFadingOut(true);
    setPendingNavigation(href);
  }, [pathname]);

  // Complete navigation after fade out
  useEffect(() => {
    if (isFadingOut && pendingNavigation) {
      const timer = setTimeout(() => {
        router.push(pendingNavigation);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isFadingOut, pendingNavigation, router]);

  // Fade in when route changes
  useEffect(() => {
    if (pathname !== prevPathname.current) {
      prevPathname.current = pathname;
      // Reset states for new page
      setIsFadingOut(false);
      setPendingNavigation(null);
      setIsFadingIn(true);

      // Start fade in after brief delay
      const timer = setTimeout(() => {
        setIsFadingIn(false);
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [pathname]);

  // Initial mount fade in
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsFadingIn(false);
    }, 50);
    return () => clearTimeout(timer);
  }, []);

  // Determine overlay opacity and color
  const overlayOpacity = isFadingOut || isFadingIn ? 1 : 0;
  // Use dark overlay when transitioning to/from terminal, light for other pages
  const targetIsDark = pendingNavigation ? isDarkPage(pendingNavigation) : isDarkPage(pathname);
  const currentIsDark = isDarkPage(pathname);
  // When fading out, use color based on destination; when fading in, use color based on current page
  const useDarkOverlay = isFadingOut ? targetIsDark : currentIsDark;

  return (
    <TransitionContext.Provider value={{ navigateWithFade }}>
      {!isTerminal && <Navbar />}
      {children}
      {!isTerminal && <ClarpAI />}

      {/* Page transition overlay */}
      <div
        className={`fixed inset-0 z-[300] pointer-events-none transition-opacity duration-500 ease-out ${
          useDarkOverlay ? 'bg-black' : 'bg-ivory-light'
        }`}
        style={{ opacity: overlayOpacity }}
      />
    </TransitionContext.Provider>
  );
}
