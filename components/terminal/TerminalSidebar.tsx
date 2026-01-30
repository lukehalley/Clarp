'use client';

import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTerminalNav } from '@/contexts/TerminalNavContext';
import ConnectWallet from '@/components/ConnectWallet';
import {
  Boxes,
  User,
  Building2,
  Bookmark,
  Bell,
  Eye,
  Shield,
  BarChart3,
  Globe,
  ChevronLeft,
  ChevronRight,
  Search,
  ArrowLeft,
  Coins,
} from 'lucide-react';

function GithubIcon({ size = 16, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
    </svg>
  );
}

type TabId = 'overview' | 'security' | 'market' | 'intel' | 'development';

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  href?: string;
  disabled?: boolean;
  disabledLabel?: string;
}

interface DetailTab {
  id: TabId;
  label: string;
  icon: React.ReactNode;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'projects', label: 'Projects', icon: <Boxes size={18} />, href: '/terminal/projects' },
  { id: 'people', label: 'People', icon: <User size={18} />, href: '/terminal/people' },
  { id: 'orgs', label: 'Orgs', icon: <Building2 size={18} />, href: '/terminal/orgs' },
  { id: 'scan', label: 'Scan', icon: <Search size={18} />, href: '/terminal/scan' },
  { id: 'tokenomics', label: 'Tokenomics', icon: <Coins size={18} />, href: '/terminal/tokenomics' },
  { id: 'watchlist', label: 'Watchlist', icon: <Bookmark size={18} />, disabled: true, disabledLabel: 'Coming Soon' },
  { id: 'alerts', label: 'Alerts', icon: <Bell size={18} />, disabled: true, disabledLabel: 'Coming Soon' },
];

const DETAIL_TABS: DetailTab[] = [
  { id: 'overview', label: 'Overview', icon: <Eye size={18} /> },
  { id: 'security', label: 'Security', icon: <Shield size={18} /> },
  { id: 'market', label: 'Market', icon: <BarChart3 size={18} /> },
  { id: 'intel', label: 'Intel', icon: <Globe size={18} /> },
  { id: 'development', label: 'Dev', icon: <GithubIcon size={18} /> },
];

export default function TerminalSidebar() {
  const [expanded, setExpanded] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { activeDetailTab, setActiveDetailTab, isDetailPage } = useTerminalNav();

  const getActiveNavId = () => {
    if (pathname.startsWith('/terminal/project') && !pathname.startsWith('/terminal/projects')) return 'projects';
    if (pathname.startsWith('/terminal/person')) return 'people';
    if (pathname.startsWith('/terminal/org')) return 'orgs';
    if (pathname.startsWith('/terminal/scan')) return 'scan';
    if (pathname.startsWith('/terminal/tokenomics')) return 'tokenomics';
    if (pathname.includes('/projects')) return 'projects';
    if (pathname.includes('/people')) return 'people';
    if (pathname.includes('/orgs')) return 'orgs';
    return 'projects';
  };

  const activeNavId = getActiveNavId();

  const handleNavClick = (item: NavItem) => {
    if (item.disabled || !item.href) return;
    router.push(item.href);
  };

  return (
    <aside
      className={`
        hidden lg:flex flex-col shrink-0 bg-slate-dark border-r border-ivory-light/10
        transition-all duration-200 ease-in-out z-30 overflow-x-hidden
        ${expanded ? 'w-52' : 'w-14'}
      `}
    >
      {/* Logo / Brand */}
      <div className="shrink-0 border-b border-ivory-light/10 px-3 h-12 flex items-center overflow-hidden">
        {expanded ? (
          <Link
            href="/terminal/projects"
            className="flex items-center gap-2 font-mono font-bold text-sm whitespace-nowrap"
          >
            <span className="text-danger-orange">CLARP</span>
            <span className="text-ivory-light/60">TERMINAL</span>
          </Link>
        ) : (
          <Link
            href="/terminal/projects"
            className="flex items-center justify-center w-8 h-8 font-mono font-bold text-danger-orange text-sm"
            title="CLARP TERMINAL"
          >
            C
          </Link>
        )}
      </div>

      {/* Navigation items */}
      <nav className="flex-1 py-2 flex flex-col gap-0.5 overflow-y-auto overflow-x-hidden">
        {NAV_ITEMS.map((item) => {
          const isActive = activeNavId === item.id;
          const isDisabled = item.disabled;

          return (
            <div key={item.id} className="relative group">
              <button
                onClick={() => handleNavClick(item)}
                disabled={isDisabled}
                className={`
                  w-full flex items-center gap-3 px-4 h-10 font-mono text-xs transition-all overflow-hidden
                  ${isActive
                    ? 'text-danger-orange bg-danger-orange/5 border-r-2 border-danger-orange'
                    : isDisabled
                    ? 'text-ivory-light/20 cursor-not-allowed'
                    : 'text-ivory-light/50 hover:text-ivory-light hover:bg-ivory-light/[0.03] cursor-pointer'
                  }
                `}
              >
                <span className="shrink-0 w-[18px] flex items-center justify-center">
                  {item.icon}
                </span>
                {expanded && (
                  <span className="truncate whitespace-nowrap">
                    {item.label}
                    {isDisabled && (
                      <span className="ml-1 text-[9px] text-ivory-light/20 uppercase">soon</span>
                    )}
                  </span>
                )}
              </button>

              {/* Tooltip on hover when collapsed */}
              {!expanded && (
                <div className="
                  absolute left-full top-1/2 -translate-y-1/2 ml-2
                  px-2 py-1 bg-[#1a1a19] border border-ivory-light/10 text-ivory-light text-xs font-mono
                  whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100
                  transition-opacity duration-150 z-50
                ">
                  {item.label}
                  {isDisabled && (
                    <span className="ml-1 text-ivory-light/30">({item.disabledLabel})</span>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {/* Separator + Detail tabs when on detail page */}
        {isDetailPage && (
          <>
            <div className="my-2 mx-3 border-t border-ivory-light/10" />
            {expanded && (
              <div className="px-4 mb-1">
                <span className="text-[9px] font-mono text-ivory-light/30 uppercase tracking-wider">Sections</span>
              </div>
            )}
            {DETAIL_TABS.map((tab) => {
              const isActive = activeDetailTab === tab.id;

              return (
                <div key={tab.id} className="relative group">
                  <button
                    onClick={() => setActiveDetailTab(tab.id)}
                    className={`
                      w-full flex items-center gap-3 px-4 h-10 font-mono text-xs transition-all cursor-pointer overflow-hidden
                      ${isActive
                        ? 'text-danger-orange bg-danger-orange/5 border-r-2 border-danger-orange'
                        : 'text-ivory-light/50 hover:text-ivory-light hover:bg-ivory-light/[0.03]'
                      }
                    `}
                  >
                    <span className="shrink-0 w-[18px] flex items-center justify-center">
                      {tab.icon}
                    </span>
                    {expanded && (
                      <span className="truncate whitespace-nowrap">{tab.label}</span>
                    )}
                  </button>

                  {/* Tooltip when collapsed */}
                  {!expanded && (
                    <div className="
                      absolute left-full top-1/2 -translate-y-1/2 ml-2
                      px-2 py-1 bg-[#1a1a19] border border-ivory-light/10 text-ivory-light text-xs font-mono
                      whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100
                      transition-opacity duration-150 z-50
                    ">
                      {tab.label}
                    </div>
                  )}
                </div>
              );
            })}
          </>
        )}
      </nav>

      {/* Bottom section: Wallet + Collapse toggle */}
      <div className="shrink-0 border-t border-ivory-light/10 overflow-hidden">
        {/* Wallet */}
        <div className={`px-2 py-2 ${expanded ? '' : 'flex justify-center'}`}>
          {expanded ? (
            <ConnectWallet compact />
          ) : (
            <div className="relative group">
              <ConnectWallet compact />
            </div>
          )}
        </div>

        {/* Back to home + collapse toggle */}
        <div className="flex items-center border-t border-ivory-light/5">
          <button
            onClick={() => router.push('/')}
            className={`
              flex items-center gap-2 h-10 font-mono text-[10px] text-ivory-light/30 hover:text-ivory-light/50 transition-colors cursor-pointer overflow-hidden
              ${expanded ? 'px-4 flex-1' : 'px-4 flex-1 justify-center'}
            `}
            title="Back to home"
          >
            <ArrowLeft size={14} className="shrink-0" />
            {expanded && <span className="whitespace-nowrap">Home</span>}
          </button>
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center justify-center w-10 h-10 text-ivory-light/30 hover:text-ivory-light/50 transition-colors cursor-pointer border-l border-ivory-light/5"
            title={expanded ? 'Collapse' : 'Expand'}
          >
            {expanded ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
          </button>
        </div>
      </div>
    </aside>
  );
}
