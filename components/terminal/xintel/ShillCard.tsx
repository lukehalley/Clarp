'use client';

import { useState } from 'react';
import { ShilledEntity } from '@/types/xintel';
import { ExternalLink, FileText } from 'lucide-react';

interface ShillCardProps {
  entity: ShilledEntity;
  rank: number;
  onClick?: () => void;
}

// Get token image - prefer DexScreener's info.imageUrl, fallback to token address URL
function getTokenImageUrl(tokenAddress: string, imageUrl?: string): string {
  if (imageUrl) return imageUrl;
  return `https://dd.dexscreener.com/ds-data/tokens/solana/${tokenAddress}.png`;
}

// Format price with appropriate precision
function formatPrice(price: number): string {
  if (price >= 1) return `$${price.toFixed(2)}`;
  if (price >= 0.01) return `$${price.toFixed(4)}`;
  if (price >= 0.0001) return `$${price.toFixed(6)}`;
  return `$${price.toFixed(8)}`;
}

// Format market cap / volume
function formatCompact(value: number): string {
  if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(1)}B`;
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(1)}K`;
  return `$${value.toFixed(0)}`;
}

export default function ShillCard({ entity, rank, onClick }: ShillCardProps) {
  const [imgError, setImgError] = useState(false);
  const tokenData = entity.tokenData;

  // Format ticker - remove $ if already present
  const displayTicker = entity.ticker?.replace(/^\$/, '');

  // Always have a DexScreener URL - either direct link or search
  const dexScreenerUrl = tokenData?.dexScreenerUrl
    || (tokenData?.tokenAddress ? `https://dexscreener.com/solana/${tokenData.tokenAddress}` : null)
    || (displayTicker ? `https://dexscreener.com/search?q=${encodeURIComponent(displayTicker)}` : null);

  const tokenAddress = tokenData?.tokenAddress;
  const imageUrl = tokenData?.imageUrl;
  const hasImage = (tokenAddress || imageUrl) && !imgError;

  const priceChange1h = tokenData?.priceChange1h;
  const priceChange6h = tokenData?.priceChange6h;
  const priceChange24h = tokenData?.priceChange24h ?? 0;

  return (
    <div className="group flex items-center gap-4 px-3 py-2.5 border-b border-ivory-light/5 hover:bg-ivory-light/[0.02] transition-colors">
      {/* Rank */}
      <span className="font-mono text-xs text-ivory-light/30 w-6 shrink-0">#{rank}</span>

      {/* Token Logo + Name + Ticker */}
      <div className="flex items-center gap-3 min-w-0 flex-1">
        {/* Logo */}
        {hasImage ? (
          <img
            src={getTokenImageUrl(tokenAddress || '', imageUrl)}
            alt={displayTicker || entity.entityName}
            className="w-8 h-8 rounded-full border border-ivory-light/10 bg-ivory-light/5 shrink-0"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-8 h-8 rounded-full border border-ivory-light/10 bg-danger-orange/10 flex items-center justify-center shrink-0">
            <span className="font-mono text-sm text-danger-orange font-bold">
              {(displayTicker || entity.entityName)?.[0]?.toUpperCase() || '?'}
            </span>
          </div>
        )}

        {/* Name + Ticker */}
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm text-ivory-light font-medium truncate">
              {entity.entityName}
            </span>
          </div>
          {displayTicker && (
            <div className="flex items-center gap-1.5">
              <span className="font-mono text-[10px] text-ivory-light/40">SOL</span>
              {dexScreenerUrl ? (
                <a
                  href={dexScreenerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-xs text-danger-orange hover:underline"
                  onClick={(e) => e.stopPropagation()}
                >
                  ${displayTicker}
                </a>
              ) : (
                <span className="font-mono text-xs text-ivory-light/50">${displayTicker}</span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Price */}
      <div className="w-24 text-right shrink-0 hidden sm:block">
        {tokenData ? (
          <span className="font-mono text-sm text-ivory-light">{formatPrice(tokenData.priceUsd)}</span>
        ) : (
          <span className="font-mono text-xs text-ivory-light/20">-</span>
        )}
      </div>

      {/* 1h Change */}
      <div className="w-16 text-right shrink-0 hidden lg:block">
        {priceChange1h !== undefined ? (
          <span className={`font-mono text-sm ${priceChange1h >= 0 ? 'text-larp-green' : 'text-larp-red'}`}>
            {priceChange1h >= 0 ? '+' : ''}{priceChange1h.toFixed(1)}%
          </span>
        ) : (
          <span className="font-mono text-xs text-ivory-light/20">-</span>
        )}
      </div>

      {/* 6h Change */}
      <div className="w-16 text-right shrink-0 hidden xl:block">
        {priceChange6h !== undefined ? (
          <span className={`font-mono text-sm ${priceChange6h >= 0 ? 'text-larp-green' : 'text-larp-red'}`}>
            {priceChange6h >= 0 ? '+' : ''}{priceChange6h.toFixed(1)}%
          </span>
        ) : (
          <span className="font-mono text-xs text-ivory-light/20">-</span>
        )}
      </div>

      {/* 24h Change */}
      <div className="w-16 text-right shrink-0 hidden md:block">
        {priceChange24h !== 0 ? (
          <span className={`font-mono text-sm ${priceChange24h >= 0 ? 'text-larp-green' : 'text-larp-red'}`}>
            {priceChange24h >= 0 ? '+' : ''}{priceChange24h.toFixed(1)}%
          </span>
        ) : (
          <span className="font-mono text-xs text-ivory-light/20">-</span>
        )}
      </div>

      {/* Volume */}
      <div className="w-20 text-right shrink-0 hidden 2xl:block">
        {tokenData?.volume24h ? (
          <span className="font-mono text-sm text-ivory-light/70">{formatCompact(tokenData.volume24h)}</span>
        ) : (
          <span className="font-mono text-xs text-ivory-light/20">-</span>
        )}
      </div>

      {/* Market Cap */}
      <div className="w-20 text-right shrink-0 hidden 2xl:block">
        {tokenData?.marketCap ? (
          <span className="font-mono text-sm text-ivory-light/70">{formatCompact(tokenData.marketCap)}</span>
        ) : (
          <span className="font-mono text-xs text-ivory-light/20">-</span>
        )}
      </div>

      {/* Mentions */}
      <div className="w-16 text-right shrink-0">
        <span className="font-mono text-sm text-ivory-light/50">{entity.mentionCount}</span>
      </div>

      {/* Evidence Button */}
      <div className="w-20 shrink-0">
        {onClick && entity.evidenceIds.length > 0 ? (
          <button
            onClick={onClick}
            className="flex items-center gap-1 px-2 py-1 font-mono text-[10px] text-danger-orange border border-danger-orange/30 hover:bg-danger-orange/10 transition-colors"
          >
            <FileText size={10} />
            {entity.evidenceIds.length}
          </button>
        ) : (
          <span className="font-mono text-xs text-ivory-light/20">-</span>
        )}
      </div>

      {/* External Link */}
      {dexScreenerUrl && (
        <a
          href={dexScreenerUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-ivory-light/20 hover:text-danger-orange transition-colors shrink-0"
          onClick={(e) => e.stopPropagation()}
        >
          <ExternalLink size={14} />
        </a>
      )}
    </div>
  );
}

// Table Header Component
export function ShillTableHeader() {
  return (
    <div className="flex items-center gap-4 px-3 py-2 border-b border-ivory-light/10 bg-ivory-light/[0.02]">
      <span className="font-mono text-[10px] text-ivory-light/40 uppercase tracking-wider w-6 shrink-0">#</span>
      <span className="font-mono text-[10px] text-ivory-light/40 uppercase tracking-wider flex-1">Token</span>
      <span className="font-mono text-[10px] text-ivory-light/40 uppercase tracking-wider w-24 text-right shrink-0 hidden sm:block">Price</span>
      <span className="font-mono text-[10px] text-ivory-light/40 uppercase tracking-wider w-16 text-right shrink-0 hidden lg:block">1h</span>
      <span className="font-mono text-[10px] text-ivory-light/40 uppercase tracking-wider w-16 text-right shrink-0 hidden xl:block">6h</span>
      <span className="font-mono text-[10px] text-ivory-light/40 uppercase tracking-wider w-16 text-right shrink-0 hidden md:block">24h</span>
      <span className="font-mono text-[10px] text-ivory-light/40 uppercase tracking-wider w-20 text-right shrink-0 hidden 2xl:block">Volume</span>
      <span className="font-mono text-[10px] text-ivory-light/40 uppercase tracking-wider w-20 text-right shrink-0 hidden 2xl:block">MCap</span>
      <span className="font-mono text-[10px] text-ivory-light/40 uppercase tracking-wider w-16 text-right shrink-0">Mentions</span>
      <span className="font-mono text-[10px] text-ivory-light/40 uppercase tracking-wider w-20 shrink-0">Evidence</span>
      <span className="w-[14px] shrink-0"></span>
    </div>
  );
}
