'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useTerminalNav } from '@/contexts/TerminalNavContext';
import {
  Boxes,
  Eye,
  Shield,
  BarChart3,
  Globe,
} from 'lucide-react';

// GitHub icon
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
}

const MAIN_NAV: NavItem[] = [
  { id: 'projects', label: 'Projects', icon: <Boxes size={20} />, href: '/terminal/projects' },
];

const DETAIL_NAV: { id: TabId; label: string; icon: React.ReactNode }[] = [
  { id: 'overview', label: 'Overview', icon: <Eye size={20} /> },
  { id: 'security', label: 'Security', icon: <Shield size={20} /> },
  { id: 'market', label: 'Market', icon: <BarChart3 size={20} /> },
  { id: 'intel', label: 'Intel', icon: <Globe size={20} /> },
  { id: 'development', label: 'Dev', icon: <GithubIcon size={20} /> },
];

export default function TerminalBottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { activeDetailTab, setActiveDetailTab, isDetailPage } = useTerminalNav();

  const getActiveNavId = () => {
    return 'projects';
  };

  const activeNavId = getActiveNavId();

  // On detail pages, show detail tabs instead of main nav
  if (isDetailPage) {
    return (
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-dark border-t border-ivory-light/10">
        <div className="flex items-center justify-around h-16">
          {DETAIL_NAV.map((tab) => {
            const isActive = activeDetailTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveDetailTab(tab.id)}
                className={`
                  flex flex-col items-center justify-center gap-0.5 flex-1 h-full min-w-[44px] font-mono transition-colors cursor-pointer
                  ${isActive
                    ? 'text-danger-orange'
                    : 'text-ivory-light active:text-ivory-light'
                  }
                `}
              >
                {tab.icon}
                <span className="text-[10px]">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    );
  }

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-dark border-t border-ivory-light/10">
      <div className="flex items-center justify-around h-16">
        {MAIN_NAV.map((item) => {
          const isActive = activeNavId === item.id;
          return (
            <button
              key={item.id}
              onClick={() => item.href && router.push(item.href)}
              className={`
                flex flex-col items-center justify-center gap-0.5 flex-1 h-full min-w-[44px] font-mono transition-colors cursor-pointer
                ${isActive
                  ? 'text-danger-orange'
                  : 'text-ivory-light active:text-ivory-light'
                }
              `}
            >
              {item.icon}
              <span className="text-[10px]">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
