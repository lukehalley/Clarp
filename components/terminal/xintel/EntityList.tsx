'use client';

import { LinkedEntity, LINKED_ENTITY_TYPE_LABELS, LINKED_ENTITY_TYPE_ICONS } from '@/types/xintel';
import { ExternalLink, Copy, Check } from 'lucide-react';
import { useState } from 'react';

interface EntityListProps {
  entities: LinkedEntity[];
  onEntityClick?: (entity: LinkedEntity) => void;
}

export default function EntityList({ entities, onEntityClick }: EntityListProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (entities.length === 0) {
    return (
      <div className="p-6 border border-ivory-light/10 bg-ivory-light/5 text-center">
        <p className="text-ivory-light/50 font-mono text-sm">
          No linked entities detected
        </p>
      </div>
    );
  }

  // Group by type
  const groupedEntities = entities.reduce((acc, entity) => {
    if (!acc[entity.type]) acc[entity.type] = [];
    acc[entity.type].push(entity);
    return acc;
  }, {} as Record<string, LinkedEntity[]>);

  const handleCopy = async (entity: LinkedEntity, e: React.MouseEvent) => {
    e.stopPropagation();
    await navigator.clipboard.writeText(entity.value);
    setCopiedId(entity.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getExternalUrl = (entity: LinkedEntity): string | null => {
    switch (entity.type) {
      case 'domain':
        return `https://${entity.value}`;
      case 'telegram':
        return `https://t.me/${entity.value}`;
      case 'discord':
        return `https://discord.gg/${entity.value}`;
      case 'github':
        return `https://github.com/${entity.value}`;
      case 'handle':
        return `https://x.com/${entity.value}`;
      case 'wallet':
        if (entity.chain === 'solana') {
          return `https://solscan.io/account/${entity.value}`;
        }
        return `https://etherscan.io/address/${entity.value}`;
      default:
        return null;
    }
  };

  const confidenceColors = {
    high: 'bg-larp-green/20 text-larp-green border-larp-green/30',
    medium: 'bg-larp-yellow/20 text-larp-yellow border-larp-yellow/30',
    low: 'bg-ivory-light/10 text-ivory-light/50 border-ivory-light/20',
  };

  return (
    <div className="space-y-4">
      {Object.entries(groupedEntities).map(([type, typeEntities]) => (
        <div key={type}>
          {/* Type header */}
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">{LINKED_ENTITY_TYPE_ICONS[type as LinkedEntity['type']]}</span>
            <span className="font-mono text-sm text-ivory-light/70">
              {LINKED_ENTITY_TYPE_LABELS[type as LinkedEntity['type']]}
            </span>
            <span className="font-mono text-xs text-ivory-light/40">
              ({typeEntities.length})
            </span>
          </div>

          {/* Entities */}
          <div className="space-y-1.5">
            {typeEntities.map((entity) => {
              const externalUrl = getExternalUrl(entity);

              return (
                <div
                  key={entity.id}
                  className="flex items-center justify-between p-3 border border-ivory-light/10 bg-ivory-light/5 hover:border-ivory-light/20 transition-colors group"
                >
                  {/* Value */}
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <span className="font-mono text-sm text-ivory-light truncate">
                      {entity.value}
                    </span>
                    {entity.chain && (
                      <span className="font-mono text-xs px-1.5 py-0.5 bg-ivory-light/10 text-ivory-light/50 uppercase shrink-0">
                        {entity.chain}
                      </span>
                    )}
                  </div>

                  {/* Meta */}
                  <div className="flex items-center gap-2 shrink-0">
                    {/* Mentions */}
                    <span className="font-mono text-xs text-ivory-light/40">
                      {entity.mentionCount}x
                    </span>

                    {/* Confidence */}
                    <span
                      className={`font-mono text-xs px-2 py-0.5 border ${confidenceColors[entity.confidence]}`}
                    >
                      {entity.confidence}
                    </span>

                    {/* Actions */}
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => handleCopy(entity, e)}
                        className="p-1.5 hover:bg-ivory-light/10 transition-colors"
                        title="Copy"
                      >
                        {copiedId === entity.id ? (
                          <Check size={14} className="text-larp-green" />
                        ) : (
                          <Copy size={14} className="text-ivory-light/50" />
                        )}
                      </button>
                      {externalUrl && (
                        <a
                          href={externalUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="p-1.5 hover:bg-ivory-light/10 transition-colors"
                          title="Open external"
                        >
                          <ExternalLink size={14} className="text-ivory-light/50" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
