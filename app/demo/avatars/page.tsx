'use client';

import { useState } from 'react';
import ContractAvatar from '@/components/ContractAvatar';

export default function AvatarDemoPage() {
  const [customAddress, setCustomAddress] = useState('');

  const sampleAddresses = [
    '0x1234567890abcdef1234567890abcdef12345678',
    '0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef',
    '0x742d35Cc6634C0532925a3b844Bc9e7595f1bC19',
    '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
    '0x6B175474E89094C44Da98b954EesdfA2fE3Ac27',
    '0x853d955aCEf822Db058eb8505911ED77F175b99e',
    '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
    '0xdAC17F958D2ee523a2206206994597C13D831ec7',
    '0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9',
    '0x514910771AF9Ca656af840dff83E8264EcF986CA',
    '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984',
    '0x95aD61b0a150d79219dCF64E1E6Cc01f0B64C4cE',
    '0x4d224452801ACEd8B2F0aebE155379bb5D594381',
    '0x7D1AfA7B718fb893dB30A3aBc0Cfc608AaCfeBB0',
    '0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84',
  ];

  return (
    <div className="min-h-screen bg-slate-dark p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-12 border-b-2 border-danger-orange pb-6">
          <h1 className="text-ivory-light font-mono text-3xl font-bold mb-2">
            contract avatar generator
          </h1>
          <p className="text-ivory-light/60 font-mono text-sm">
            github-style identicons from contract address hash
          </p>
        </div>

        {/* Custom input */}
        <div className="mb-12 p-6 border-2 border-ivory-light/20 bg-slate-dark">
          <h2 className="text-danger-orange font-mono text-lg mb-4">try your own address</h2>
          <div className="flex gap-4 items-center flex-wrap">
            <input
              type="text"
              value={customAddress}
              onChange={(e) => setCustomAddress(e.target.value)}
              placeholder="0x..."
              className="flex-1 min-w-[300px] px-4 py-3 bg-slate-medium/50 border-2 border-ivory-light/30 text-ivory-light font-mono text-sm focus:border-danger-orange focus:outline-none"
            />
            {customAddress && (
              <div className="flex gap-4 items-center">
                <ContractAvatar address={customAddress} size={48} />
                <ContractAvatar address={customAddress} size={64} />
                <ContractAvatar address={customAddress} size={96} />
              </div>
            )}
          </div>
        </div>

        {/* Size variations */}
        <div className="mb-12">
          <h2 className="text-danger-orange font-mono text-lg mb-4">size variations</h2>
          <div className="flex items-end gap-6 p-6 border-2 border-ivory-light/10 bg-slate-dark/50">
            {[24, 32, 48, 64, 96, 128].map((size) => (
              <div key={size} className="text-center">
                <ContractAvatar address={sampleAddresses[0]} size={size} />
                <p className="text-ivory-light/40 font-mono text-xs mt-2">{size}px</p>
              </div>
            ))}
          </div>
        </div>

        {/* Gallery */}
        <div className="mb-12">
          <h2 className="text-danger-orange font-mono text-lg mb-4">unique identities</h2>
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-4 p-6 border-2 border-ivory-light/10 bg-slate-dark/50">
            {sampleAddresses.map((addr, i) => (
              <div key={i} className="text-center group">
                <ContractAvatar address={addr} size={48} />
                <p className="text-ivory-light/30 group-hover:text-ivory-light/60 font-mono text-[9px] mt-2 truncate transition-colors">
                  {addr.slice(2, 6)}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Consistency demo */}
        <div className="mb-12">
          <h2 className="text-danger-orange font-mono text-lg mb-4">deterministic</h2>
          <p className="text-ivory-light/60 font-mono text-sm mb-4">
            same address = same avatar, always
          </p>
          <div className="flex gap-4 p-6 border-2 border-ivory-light/10 bg-slate-dark/50">
            {[1, 2, 3, 4, 5].map((n) => (
              <ContractAvatar key={n} address="0xABCDEF123456789" size={48} />
            ))}
          </div>
        </div>

        {/* Usage */}
        <div>
          <h2 className="text-danger-orange font-mono text-lg mb-4">usage</h2>
          <pre className="p-6 border-2 border-ivory-light/10 bg-[#0a0a09] text-ivory-light/80 font-mono text-sm overflow-x-auto">
{`import ContractAvatar from '@/components/ContractAvatar';

<ContractAvatar address="0x1234..." />
<ContractAvatar address="0x1234..." size={96} />
<ContractAvatar address="0x1234..." bgColor="#1a1a1a" />`}
          </pre>
        </div>
      </div>
    </div>
  );
}
