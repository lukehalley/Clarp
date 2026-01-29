'use client';

import { useEffect, useState, useCallback } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletReadyState } from '@solana/wallet-adapter-base';
import type { Wallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@/contexts/WalletModalContext';
import { X, ChevronDown, ChevronUp } from 'lucide-react';

export default function WalletModal() {
  const { visible, setVisible } = useWalletModal();
  const { wallets, wallet: selectedWallet, select, connect, connected, connecting } = useWallet();
  const [expanded, setExpanded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [connectingWallet, setConnectingWallet] = useState<string | null>(null);

  // Split wallets into detected (installed) and others
  const detected = wallets.filter((w) => w.readyState === WalletReadyState.Installed);
  const others = wallets.filter((w) => w.readyState !== WalletReadyState.Installed && w.readyState !== WalletReadyState.Unsupported);

  // When user clicks a wallet, just select it — the effect below handles connect()
  const handleSelect = useCallback((wallet: Wallet) => {
    setError(null);
    setConnectingWallet(wallet.adapter.name);
    select(wallet.adapter.name);
  }, [select]);

  // Once the adapter registers the selected wallet, call connect()
  useEffect(() => {
    if (!connectingWallet || !selectedWallet) return;
    if (selectedWallet.adapter.name !== connectingWallet) return;

    let cancelled = false;

    connect()
      .then(() => {
        if (!cancelled) {
          setVisible(false);
        }
      })
      .catch((err) => {
        if (cancelled) return;
        console.error('[WalletModal] Connection failed:', err);
        if (err instanceof Error) {
          if (err.message.includes('rejected') || err.message.includes('User rejected')) {
            setError('connection rejected');
          } else {
            setError(err.message.toLowerCase());
          }
        } else {
          setError('connection failed');
        }
        // Deselect so adapter doesn't think we're connected
        select(null);
      })
      .finally(() => {
        if (!cancelled) setConnectingWallet(null);
      });

    return () => { cancelled = true; };
  }, [connectingWallet, selectedWallet, connect, select, setVisible]);

  // Also close modal if connection succeeds via autoConnect
  useEffect(() => {
    if (visible && connected && !connectingWallet) {
      setVisible(false);
    }
  }, [visible, connected, connectingWallet, setVisible]);

  // Close on escape
  useEffect(() => {
    if (!visible) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setVisible(false);
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [visible, setVisible]);

  // Reset state when modal opens
  useEffect(() => {
    if (visible) {
      setError(null);
      setConnectingWallet(null);
      setExpanded(false);
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-md"
        onClick={() => setVisible(false)}
      />

      {/* Modal */}
      <div className="relative w-full max-w-sm bg-slate-dark border-2 border-ivory-light/20 shadow-brutal animate-fade-in">
        {/* Close button */}
        <button
          onClick={() => setVisible(false)}
          className="absolute top-3 right-3 p-1 text-ivory-light/40 hover:text-ivory-light transition-colors"
        >
          <X size={18} />
        </button>

        {/* Header */}
        <div className="p-6 pb-4 text-center">
          <h2 className="font-mono font-bold text-ivory-light text-sm tracking-wider uppercase">
            connect wallet
          </h2>
          <p className="font-mono text-[11px] text-ivory-light/40 mt-1">
            solana network
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="mx-4 mb-3 p-3 bg-larp-red/10 border border-larp-red/40">
            <p className="font-mono text-xs text-larp-red text-center">{error}</p>
          </div>
        )}

        {/* Wallet list */}
        <div className="px-4 pb-2 space-y-1">
          {detected.map((wallet) => (
            <WalletRow
              key={wallet.adapter.name}
              wallet={wallet}
              detected
              loading={connectingWallet === wallet.adapter.name}
              disabled={connecting}
              onClick={() => handleSelect(wallet)}
            />
          ))}

          {others.length > 0 && expanded && (
            <>
              <div className="border-t border-ivory-light/10 my-2" />
              {others.map((wallet) => (
                <WalletRow
                  key={wallet.adapter.name}
                  wallet={wallet}
                  detected={false}
                  loading={connectingWallet === wallet.adapter.name}
                  disabled={connecting}
                  onClick={() => handleSelect(wallet)}
                />
              ))}
            </>
          )}
        </div>

        {/* Toggle */}
        {others.length > 0 && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="w-full py-3 border-t border-ivory-light/10 flex items-center justify-center gap-1.5
                       font-mono text-[11px] text-ivory-light/40 hover:text-ivory-light/60 transition-colors"
          >
            {expanded ? 'less options' : 'more options'}
            {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          </button>
        )}

        {/* Footer */}
        <div className="px-4 pb-4 pt-1">
          <p className="font-mono text-[10px] text-ivory-light/20 text-center">
            CLARP never has access to your funds
          </p>
        </div>
      </div>
    </div>
  );
}

function WalletRow({
  wallet,
  detected,
  loading,
  disabled,
  onClick,
}: {
  wallet: Wallet;
  detected: boolean;
  loading: boolean;
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="w-full flex items-center gap-3 px-3 py-3
                 bg-slate-medium/30 border border-ivory-light/10
                 hover:border-ivory-light/30 hover:bg-slate-medium/50
                 disabled:opacity-50 disabled:cursor-not-allowed
                 transition-all group"
    >
      {/* Icon */}
      <div className="w-8 h-8 flex-shrink-0 overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={wallet.adapter.icon}
          alt={wallet.adapter.name}
          className="w-full h-full object-contain"
        />
      </div>

      {/* Name */}
      <span className="font-mono text-sm text-ivory-light/80 group-hover:text-ivory-light transition-colors lowercase">
        {loading ? (
          <span className="flex items-center gap-2">
            <span className="w-3 h-3 border border-ivory-light/40 border-t-transparent rounded-full animate-spin" />
            connecting...
          </span>
        ) : (
          wallet.adapter.name
        )}
      </span>

      {/* Detected badge */}
      {detected && !loading && (
        <span className="ml-auto font-mono text-[10px] text-ivory-light/30 tracking-wider">
          detected
        </span>
      )}
    </button>
  );
}
