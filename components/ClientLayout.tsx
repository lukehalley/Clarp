'use client';

import { useState } from 'react';
import Navbar from '@/components/Navbar';
import ClarpAI from '@/components/ClarpAI';

interface ClientLayoutProps {
  children: React.ReactNode;
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  const [showWalletModal, setShowWalletModal] = useState(false);

  return (
    <>
      <Navbar onConnectWallet={() => setShowWalletModal(true)} />
      {children}
      <ClarpAI />

      {/* Wallet Modal */}
      {showWalletModal && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-dark/80 backdrop-blur-sm"
          onClick={() => setShowWalletModal(false)}
        >
          <div
            className="bg-ivory-light border-2 border-slate-dark p-6 max-w-md w-full"
            style={{ boxShadow: '8px 8px 0 #0a0a09' }}
            onClick={e => e.stopPropagation()}
          >
            <h3 className="font-mono text-xl font-bold text-slate-dark mb-4">connect wallet</h3>
            <p className="text-slate-light mb-6">
              we don&apos;t actually have wallet integration. this is vaporware, remember?
            </p>
            <div className="space-y-3">
              <button
                className="w-full btn-secondary py-3"
                onClick={() => setShowWalletModal(false)}
              >
                phantom (coming q2)
              </button>
              <button
                className="w-full btn-secondary py-3"
                onClick={() => setShowWalletModal(false)}
              >
                solflare (coming q3)
              </button>
              <button
                className="w-full btn-secondary py-3"
                onClick={() => setShowWalletModal(false)}
              >
                backpack (coming never)
              </button>
            </div>
            <button
              className="mt-4 text-sm text-slate-light hover:text-danger-orange w-full text-center"
              onClick={() => setShowWalletModal(false)}
            >
              close (the only thing that works)
            </button>
          </div>
        </div>
      )}
    </>
  );
}
