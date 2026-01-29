'use client';

/**
 * WalletSelect - Inline wallet selection with auto-detection.
 * Replaces the modal for the gate page — wallets are shown directly in the UI.
 */

import { useEffect, useState, useCallback } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletReadyState } from '@solana/wallet-adapter-base';
import type { Wallet } from '@solana/wallet-adapter-react';
import { getWalletIcon } from '@/components/icons/WalletIcons';
import { ChevronDown, ChevronUp } from 'lucide-react';

export default function WalletSelect() {
  const { wallets, wallet: selectedWallet, select, connect, connecting } = useWallet();
  const [error, setError] = useState<string | null>(null);
  const [connectingWallet, setConnectingWallet] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);

  // Auto-detect: installed wallets first, then loadable
  const detected = wallets.filter((w) => w.readyState === WalletReadyState.Installed);
  const loadable = wallets.filter(
    (w) => w.readyState === WalletReadyState.Loadable || w.readyState === WalletReadyState.NotDetected
  );

  const handleSelect = useCallback((wallet: Wallet) => {
    setError(null);
    setConnectingWallet(wallet.adapter.name);
    select(wallet.adapter.name);
  }, [select]);

  // Once adapter registers the selected wallet, call connect()
  useEffect(() => {
    if (!connectingWallet || !selectedWallet) return;
    if (selectedWallet.adapter.name !== connectingWallet) return;

    let cancelled = false;

    connect()
      .catch((err) => {
        if (cancelled) return;
        console.error('[WalletSelect] Connection failed:', err);
        if (err instanceof Error) {
          if (err.message.includes('rejected') || err.message.includes('User rejected')) {
            setError('connection rejected — try again');
          } else {
            setError(err.message.toLowerCase());
          }
        } else {
          setError('connection failed');
        }
        select(null);
      })
      .finally(() => {
        if (!cancelled) setConnectingWallet(null);
      });

    return () => { cancelled = true; };
  }, [connectingWallet, selectedWallet, connect, select]);

  return (
    <div className="space-y-3">
      {/* Error */}
      {error && (
        <div className="p-2.5 bg-larp-red/10 border border-larp-red/40">
          <p className="font-mono text-xs text-larp-red text-center">{error}</p>
        </div>
      )}

      {/* Detected wallets — prominent full-width buttons */}
      {detected.map((wallet) => (
        <DetectedWalletButton
          key={wallet.adapter.name}
          wallet={wallet}
          loading={connectingWallet === wallet.adapter.name}
          disabled={connecting}
          onClick={() => handleSelect(wallet)}
        />
      ))}

      {/* No wallets detected */}
      {detected.length === 0 && (
        <div className="p-3 border border-ivory-light/10 bg-slate-dark">
          <p className="font-mono text-xs text-ivory-light/40 text-center">
            no wallets detected — install{' '}
            <a
              href="https://phantom.app"
              target="_blank"
              rel="noopener noreferrer"
              className="text-danger-orange hover:underline"
            >
              phantom
            </a>
            {' '}or{' '}
            <a
              href="https://solflare.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-danger-orange hover:underline"
            >
              solflare
            </a>
          </p>
        </div>
      )}

      {/* Other wallets — compact grid */}
      {loadable.length > 0 && (
        <>
          <button
            onClick={() => setExpanded(!expanded)}
            className="w-full py-1.5 flex items-center justify-center gap-1.5
                       font-mono text-[11px] text-ivory-light/30 hover:text-ivory-light/50 transition-colors"
          >
            {expanded ? 'less options' : 'more options'}
            {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          </button>

          {expanded && (
            <div className="grid grid-cols-3 gap-1.5">
              {loadable.map((wallet) => (
                <WalletTile
                  key={wallet.adapter.name}
                  wallet={wallet}
                  loading={connectingWallet === wallet.adapter.name}
                  disabled={connecting}
                  onClick={() => handleSelect(wallet)}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

/** Full-width button for detected (installed) wallets */
function DetectedWalletButton({
  wallet,
  loading,
  disabled,
  onClick,
}: {
  wallet: Wallet;
  loading: boolean;
  disabled: boolean;
  onClick: () => void;
}) {
  const IconComponent = getWalletIcon(wallet.adapter.name);

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="w-full flex items-center gap-3 px-4 py-3.5
                 bg-slate-dark border-2 border-danger-orange/40
                 hover:border-danger-orange hover:bg-danger-orange/5
                 disabled:opacity-50 disabled:cursor-not-allowed
                 transition-all group"
    >
      <div className="w-9 h-9 flex-shrink-0">
        {IconComponent ? (
          <IconComponent className="w-9 h-9" />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={wallet.adapter.icon} alt={wallet.adapter.name} className="w-9 h-9 object-contain" />
        )}
      </div>

      <span className="font-mono text-sm text-ivory-light group-hover:text-danger-orange transition-colors lowercase">
        {loading ? (
          <span className="flex items-center gap-2">
            <span className="w-3 h-3 border-2 border-danger-orange border-t-transparent rounded-full animate-spin" />
            connecting...
          </span>
        ) : (
          wallet.adapter.name
        )}
      </span>

      <span className="ml-auto font-mono text-[10px] tracking-wider text-danger-orange/60">
        {loading ? '' : 'detected'}
      </span>
    </button>
  );
}

/** Compact tile for non-detected wallets — used in 3-column grid */
function WalletTile({
  wallet,
  loading,
  disabled,
  onClick,
}: {
  wallet: Wallet;
  loading: boolean;
  disabled: boolean;
  onClick: () => void;
}) {
  const IconComponent = getWalletIcon(wallet.adapter.name);

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="flex flex-col items-center gap-1.5 py-3 px-1
                 bg-slate-dark border border-ivory-light/8
                 hover:border-ivory-light/25 hover:bg-ivory-light/5
                 disabled:opacity-50 disabled:cursor-not-allowed
                 transition-all group"
    >
      <div className="w-7 h-7 flex-shrink-0">
        {IconComponent ? (
          <IconComponent className="w-7 h-7" />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={wallet.adapter.icon} alt={wallet.adapter.name} className="w-7 h-7 object-contain" />
        )}
      </div>

      <span className="font-mono text-[10px] text-ivory-light/40 group-hover:text-ivory-light/70 transition-colors lowercase truncate w-full text-center">
        {loading ? (
          <span className="flex items-center justify-center gap-1">
            <span className="w-2 h-2 border border-ivory-light/40 border-t-transparent rounded-full animate-spin" />
          </span>
        ) : (
          wallet.adapter.name
        )}
      </span>
    </button>
  );
}
