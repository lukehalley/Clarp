'use client';

import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import ConnectWallet from '@/components/ConnectWallet';
import {
  Boxes,
  User,
  Building2,
  ChevronLeft,
  ChevronRight,
  Search,
} from 'lucide-react';

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  href?: string;
  disabled?: boolean;
  disabledLabel?: string;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'projects', label: 'Projects', icon: <Boxes size={18} />, href: '/terminal/projects' },
  { id: 'people', label: 'People', icon: <User size={18} />, href: '/terminal/people' },
  { id: 'orgs', label: 'Orgs', icon: <Building2 size={18} />, href: '/terminal/orgs' },
  { id: 'scan', label: 'Scan', icon: <Search size={18} />, href: '/terminal/scan' },
];

export default function TerminalSidebar() {
  const [expanded, setExpanded] = useState(true);
  const pathname = usePathname();
  const router = useRouter();

  // Detect if we're on a detail page (e.g. /terminal/project/clarp, /terminal/person/foo, /terminal/org/bar)
  const isDetailPage =
    (pathname.startsWith('/terminal/project/')) ||
    (pathname.startsWith('/terminal/person/')) ||
    (pathname.startsWith('/terminal/org/'));

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
      <div className="shrink-0 border-b border-ivory-light/10 px-3 h-12 flex items-center justify-center overflow-hidden">
        {expanded ? (
          <Link
            href="/terminal/projects"
            className="flex items-center gap-2 font-mono font-bold text-sm whitespace-nowrap"
          >
            <span className="text-danger-orange">CLARP</span>
            <span className="text-ivory-light">TERMINAL</span>
          </Link>
        ) : (
          <Link
            href="/terminal/projects"
            className="flex items-center justify-center w-8 h-8 font-mono font-bold text-danger-orange text-sm"
            title="CLARP TERMINAL"
          >
            CT
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
                    ? 'text-ivory-light cursor-not-allowed'
                    : 'text-ivory-light hover:text-ivory-light hover:bg-ivory-light/[0.03] cursor-pointer'
                  }
                `}
              >
                <span className="shrink-0 w-[18px] flex items-center justify-center">
                  {isActive && isDetailPage ? <span className="font-mono text-sm">&lt;</span> : item.icon}
                </span>
                {expanded && (
                  <span className="truncate whitespace-nowrap">
                    {item.label}
                    {isDisabled && (
                      <span className="ml-1 text-[9px] text-ivory-light uppercase">soon</span>
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
                  {isActive && isDetailPage ? `Back to ${item.label}` : item.label}
                  {isDisabled && (
                    <span className="ml-1 text-ivory-light">({item.disabledLabel})</span>
                  )}
                </div>
              )}
            </div>
          );
        })}

      </nav>

      {/* Bottom section: Wallet + Collapse toggle */}
      <div className="shrink-0 border-t border-ivory-light/10 overflow-hidden flex items-center h-10">
        {/* Wallet — always rendered with compact mode */}
        <div className="flex-1 overflow-hidden">
          <ConnectWallet compact showLabel={expanded} />
        </div>

        {/* Collapse toggle */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="shrink-0 flex items-center justify-center w-10 h-10 border-l border-ivory-light/10 text-ivory-light hover:text-ivory-light transition-colors cursor-pointer"
          title={expanded ? 'Collapse' : 'Expand'}
        >
          {expanded ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
        </button>
      </div>
    </aside>
  );
}
