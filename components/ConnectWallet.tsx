'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@/contexts/WalletModalContext';
import { useAuth } from '@/contexts/AuthContext';
import { useUserTier } from '@/hooks/useUserTier';
import { useTokenBalance } from '@/hooks/useTokenBalance';
import { TierBadge } from './TierBadge';
import { Wallet, LogOut, Copy, Check, ExternalLink, RefreshCw, Link2 } from 'lucide-react';

interface ConnectWalletProps {
  className?: string;
  compact?: boolean;
  showLabel?: boolean;
}

/**
 * Truncate wallet address for display
 * e.g., "7xKp...3nFq"
 */
function truncateAddress(address: string | null, startChars = 4, endChars = 4): string {
  if (!address) return '...';
  if (address.length <= startChars + endChars + 3) return address;
  return `${address.slice(0, startChars)}...${address.slice(-endChars)}`;
}

export default function ConnectWallet({ className = '', compact = false, showLabel = true }: ConnectWalletProps) {
  const { connected, publicKey, disconnect } = useWallet();
  const { setVisible } = useWalletModal();
  const { wallet, isConnecting, isAuthenticated, isLoading: authLoading, signIn, signOut } = useAuth();
  const { tier, balanceFormatted, isLoading: tierLoading } = useUserTier();
  const { refetch: refetchBalance } = useTokenBalance();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [userDisconnected, setUserDisconnected] = useState(false);
  const [signInRejected, setSignInRejected] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Track mount state to avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
    // Check if user previously disconnected
    const disconnected = localStorage.getItem('wallet-user-disconnected') === 'true';
    setUserDisconnected(disconnected);
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };

    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownOpen]);

  // Only auto sign-in when user explicitly clicks connect, not on autoConnect page reload
  const userInitiatedConnectRef = useRef(false);

  // When wallet connects after user-initiated action, trigger sign-in once
  useEffect(() => {
    if (
      connected && publicKey && !isAuthenticated && !isConnecting &&
      !authLoading && mounted && !signInRejected &&
      userInitiatedConnectRef.current
    ) {
      userInitiatedConnectRef.current = false;
      signIn().catch((err) => {
        console.error('[ConnectWallet] Auto sign-in failed:', err);
        setSignInRejected(true);
        setError(err instanceof Error ? err.message : 'Sign in failed');
        setTimeout(() => setError(null), 5000);
      });
    }
  }, [connected, publicKey, isAuthenticated, isConnecting, authLoading, mounted, signIn, signInRejected]);

  // Handle connect - opens wallet modal
  const handleConnect = () => {
    setError(null);
    setDropdownOpen(false);
    // Clear flags when user manually initiates connection
    localStorage.removeItem('wallet-user-disconnected');
    setUserDisconnected(false);
    setSignInRejected(false);
    userInitiatedConnectRef.current = true;
    setVisible(true);
  };

  // Handle disconnect — disconnect wallet first, then sign out of Supabase
  const handleDisconnect = async () => {
    setDropdownOpen(false);
    // Remember that user manually disconnected to prevent auto-reconnect spam
    localStorage.setItem('wallet-user-disconnected', 'true');
    setUserDisconnected(true);
    try {
      // Disconnect wallet adapter first (tells Phantom to sever the connection)
      await disconnect();
    } catch (err) {
      console.error('[ConnectWallet] Wallet disconnect error:', err);
    }
    try {
      // Then sign out from Supabase auth
      await signOut();
    } catch (err) {
      console.error('[ConnectWallet] Sign out error:', err);
    }
  };

  // Copy address to clipboard
  const handleCopyAddress = async () => {
    if (!wallet) return;
    try {
      await navigator.clipboard.writeText(wallet);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement('textarea');
      textarea.value = wallet;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // View on Solscan
  const handleViewOnSolscan = () => {
    if (!wallet) return;
    window.open(`https://solscan.io/account/${wallet}`, '_blank');
    setDropdownOpen(false);
  };

  // --- Non-compact mode: keep original separate layouts ---
  if (!compact) {
    // Don't render until mounted to avoid hydration issues
    if (!mounted) {
      return (
        <div className={`relative ${className}`}>
          <div
            className="flex items-center gap-2 font-mono justify-center bg-larp-green border-2 border-black font-bold text-black px-4 py-2.5 text-sm"
            style={{ boxShadow: '3px 3px 0 black' }}
          >
            <Wallet size={16} className="shrink-0" />
            <span>connect wallet</span>
          </div>
        </div>
      );
    }

    if (!connected) {
      return (
        <div className={`relative ${className}`}>
          <button
            onClick={handleConnect}
            disabled={isConnecting}
            className="flex items-center gap-2 font-mono transition-colors disabled:opacity-50 disabled:cursor-not-allowed px-4 py-2.5 text-sm bg-larp-green border-2 border-black font-bold text-black hover:translate-x-0.5 hover:translate-y-0.5"
            style={{ boxShadow: isConnecting ? 'none' : '3px 3px 0 black' }}
          >
            {isConnecting ? (
              <>
                <div className="w-4 h-4 border-2 rounded-full animate-spin border-black border-t-transparent" />
                <span>connecting...</span>
              </>
            ) : (
              <>
                <Wallet size={16} className="shrink-0" />
                <span>connect wallet</span>
              </>
            )}
          </button>
          {error && (
            <div className="absolute top-full left-0 right-0 mt-2 p-2 bg-larp-red/20 border border-larp-red text-larp-red font-mono text-xs text-center z-50">
              {error}
            </div>
          )}
        </div>
      );
    }

    return (
      <div className={`relative ${className}`} ref={dropdownRef}>
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="flex items-center gap-2 font-mono transition-colors px-4 py-2.5 text-sm bg-larp-green/20 border-2 border-larp-green/50 text-larp-green hover:bg-larp-green/30 hover:border-larp-green"
        >
          <div className="w-1.5 h-1.5 bg-larp-green rounded-full animate-pulse shrink-0" />
          <span className="truncate">{truncateAddress(wallet)}</span>
        </button>

        {dropdownOpen && (
          <div className="absolute w-64 bg-slate-dark border border-ivory-light/20 z-50 shadow-lg right-0 top-full mt-2">
            <div className="p-3 border-b border-ivory-light/10">
              <p className="font-mono text-[10px] text-ivory-light/40 mb-1">CONNECTED WALLET</p>
              <p className="font-mono text-xs text-ivory-light break-all">{wallet}</p>
            </div>
            <div className="p-3 border-b border-ivory-light/10">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-mono text-[10px] text-ivory-light/40 mb-1">CLARP BALANCE</p>
                  <div className="flex items-center gap-2">
                    <p className="font-mono text-sm text-larp-green font-bold">
                      {tierLoading ? '...' : balanceFormatted}
                    </p>
                    <button
                      onClick={(e) => { e.stopPropagation(); refetchBalance(); }}
                      className="p-0.5 text-ivory-light/40 hover:text-ivory-light transition-colors"
                      title="Refresh balance"
                    >
                      <RefreshCw size={10} className={tierLoading ? 'animate-spin' : ''} />
                    </button>
                  </div>
                </div>
                <TierBadge tier={tier} size="sm" />
              </div>
            </div>
            <div className="py-1">
              <button onClick={handleCopyAddress} className="w-full flex items-center gap-3 px-3 py-2 text-left font-mono text-xs text-ivory-light/70 hover:text-ivory-light hover:bg-ivory-light/5 transition-colors">
                {copied ? (<><Check size={14} className="text-larp-green" /><span className="text-larp-green">COPIED!</span></>) : (<><Copy size={14} /><span>COPY ADDRESS</span></>)}
              </button>
              <button onClick={handleViewOnSolscan} className="w-full flex items-center gap-3 px-3 py-2 text-left font-mono text-xs text-ivory-light/70 hover:text-ivory-light hover:bg-ivory-light/5 transition-colors">
                <ExternalLink size={14} /><span>VIEW ON SOLSCAN</span>
              </button>
              <div className="border-t border-ivory-light/10 mt-1 pt-1">
                <button onClick={handleDisconnect} className="w-full flex items-center gap-3 px-3 py-2 text-left font-mono text-xs text-larp-red/70 hover:text-larp-red hover:bg-larp-red/5 transition-colors">
                  <LogOut size={14} /><span>DISCONNECT</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // --- Compact mode: unified layout regardless of connection state ---

  // Status indicator
  const isWalletConnected = mounted && connected;
  const statusColor = isWalletConnected ? 'bg-larp-green' : 'bg-ivory-light/20';
  const displayText = isWalletConnected ? truncateAddress(wallet) : 'wallet';

  // Ref for the trigger button to calculate portal dropdown position
  const triggerRef = useRef<HTMLButtonElement>(null);
  const portalDropdownRef = useRef<HTMLDivElement>(null);
  const [dropdownPos, setDropdownPos] = useState<{ top: number; left: number } | null>(null);

  // Calculate dropdown position when opening
  const openDropdown = useCallback(() => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      // Position: above the button, aligned to left edge
      setDropdownPos({ top: rect.top, left: rect.left });
    }
    setDropdownOpen((prev) => !prev);
  }, []);

  // Close on click outside (portal-aware)
  useEffect(() => {
    if (!dropdownOpen) return;
    const handleClick = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        triggerRef.current?.contains(target) ||
        portalDropdownRef.current?.contains(target)
      ) return;
      setDropdownOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [dropdownOpen]);

  // Dropdown content shared between connected/disconnected
  const dropdownContent = dropdownOpen && dropdownPos && mounted
    ? createPortal(
        <div
          ref={portalDropdownRef}
          className="fixed w-64 bg-slate-dark border border-ivory-light/20 z-[9999] shadow-lg"
          style={{
            top: dropdownPos.top,
            left: dropdownPos.left,
            transform: 'translateY(-100%) translateY(-8px)',
          }}
        >
          {isWalletConnected ? (
            <>
              <div className="p-3 border-b border-ivory-light/10">
                <p className="font-mono text-[10px] text-ivory-light/40 mb-1">CONNECTED WALLET</p>
                <p className="font-mono text-xs text-ivory-light break-all">{wallet}</p>
              </div>

              <div className="p-3 border-b border-ivory-light/10">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-mono text-[10px] text-ivory-light/40 mb-1">CLARP BALANCE</p>
                    <div className="flex items-center gap-2">
                      <p className="font-mono text-sm text-larp-green font-bold">
                        {tierLoading ? '...' : balanceFormatted}
                      </p>
                      <button
                        onClick={(e) => { e.stopPropagation(); refetchBalance(); }}
                        className="p-0.5 text-ivory-light/40 hover:text-ivory-light transition-colors"
                        title="Refresh balance"
                      >
                        <RefreshCw size={10} className={tierLoading ? 'animate-spin' : ''} />
                      </button>
                    </div>
                  </div>
                  <TierBadge tier={tier} size="sm" />
                </div>
              </div>

              <div className="py-1">
                <button
                  onClick={handleCopyAddress}
                  className="w-full flex items-center gap-3 px-3 py-2 text-left font-mono text-xs text-ivory-light/70 hover:text-ivory-light hover:bg-ivory-light/5 transition-colors"
                >
                  {copied ? (
                    <><Check size={14} className="text-larp-green" /><span className="text-larp-green">COPIED!</span></>
                  ) : (
                    <><Copy size={14} /><span>COPY ADDRESS</span></>
                  )}
                </button>

                <button
                  onClick={handleViewOnSolscan}
                  className="w-full flex items-center gap-3 px-3 py-2 text-left font-mono text-xs text-ivory-light/70 hover:text-ivory-light hover:bg-ivory-light/5 transition-colors"
                >
                  <ExternalLink size={14} />
                  <span>VIEW ON SOLSCAN</span>
                </button>

                <div className="border-t border-ivory-light/10 mt-1 pt-1">
                  <button
                    onClick={handleDisconnect}
                    className="w-full flex items-center gap-3 px-3 py-2 text-left font-mono text-xs text-larp-red/70 hover:text-larp-red hover:bg-larp-red/5 transition-colors"
                  >
                    <LogOut size={14} />
                    <span>DISCONNECT</span>
                  </button>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="p-3 border-b border-ivory-light/10">
                <p className="font-mono text-[10px] text-ivory-light/40 mb-1">WALLET</p>
                <p className="font-mono text-xs text-ivory-light/50">No wallet connected</p>
              </div>

              <div className="py-1">
                <button
                  onClick={handleConnect}
                  disabled={isConnecting}
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-left font-mono text-xs text-larp-green hover:bg-larp-green/5 transition-colors disabled:opacity-50"
                >
                  {isConnecting ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 rounded-full animate-spin border-ivory-light/30 border-t-larp-green" />
                      <span>CONNECTING...</span>
                    </>
                  ) : (
                    <>
                      <Link2 size={14} />
                      <span>CONNECT WALLET</span>
                    </>
                  )}
                </button>
              </div>
            </>
          )}
        </div>,
        document.body
      )
    : null;

  return (
    <div className={`relative ${className}`}>
      {/* Unified trigger button — same layout whether connected or not */}
      <button
        ref={triggerRef}
        onClick={openDropdown}
        disabled={!mounted}
        className="w-full flex items-center justify-center gap-2.5 h-10 px-3 font-mono text-xs text-ivory-light/50 hover:text-ivory-light hover:bg-ivory-light/[0.03] transition-colors cursor-pointer disabled:cursor-not-allowed"
      >
        <span className="shrink-0 w-[18px] flex items-center justify-center relative">
          <Wallet size={16} />
          <span className={`absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full ${statusColor} ${isWalletConnected ? 'animate-pulse' : ''}`} />
        </span>
        {showLabel && <span className="truncate">{isConnecting ? 'connecting...' : displayText}</span>}
      </button>

      {/* Error message */}
      {error && (
        <div className="absolute bottom-full left-0 right-0 mb-2 p-2 bg-larp-red/20 border border-larp-red text-larp-red font-mono text-xs text-center z-50">
          {error}
        </div>
      )}

      {/* Dropdown rendered via portal to escape sidebar overflow */}
      {dropdownContent}
    </div>
  );
}
