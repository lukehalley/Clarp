'use client';

/**
 * ContractAvatar - GitHub-style identicon generator for contract addresses
 * Generates symmetric blocky pixel patterns from address hash
 */

interface ContractAvatarProps {
  /** Contract address or any hash string */
  address: string;
  /** Size in pixels (default: 64) */
  size?: number;
  /** Additional CSS classes */
  className?: string;
  /** Background color (default: transparent) */
  bgColor?: string;
}

// Always use danger orange
const COLOR = '#FF6B35';

/**
 * Simple hash function to convert address to numeric seed
 */
function hashToSeed(str: string): number {
  let hash = 0;
  const normalized = str.toLowerCase().replace(/^0x/, '');
  for (let i = 0; i < normalized.length; i++) {
    const char = normalized.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}

/**
 * Seeded random number generator for deterministic results
 */
function seededRandom(seed: number): () => number {
  let state = seed;
  return () => {
    state = (state * 1103515245 + 12345) & 0x7fffffff;
    return state / 0x7fffffff;
  };
}

/**
 * Generate the identicon grid pattern (5x5, mirrored horizontally)
 */
function generatePattern(seed: number): boolean[][] {
  const random = seededRandom(seed);
  const gridSize = 5;
  const halfWidth = Math.ceil(gridSize / 2); // 3 columns to generate

  // Generate left half + center column
  const pattern: boolean[][] = [];

  for (let row = 0; row < gridSize; row++) {
    const rowPattern: boolean[] = [];

    // Generate left side (including center)
    for (let col = 0; col < halfWidth; col++) {
      rowPattern.push(random() > 0.5);
    }

    // Mirror to create right side
    for (let col = halfWidth - 2; col >= 0; col--) {
      rowPattern.push(rowPattern[col]);
    }

    pattern.push(rowPattern);
  }

  return pattern;
}

export default function ContractAvatar({
  address,
  size = 64,
  className = '',
  bgColor = '#0a0a09',
}: ContractAvatarProps) {
  const seed = hashToSeed(address);
  const pattern = generatePattern(seed);

  const gridSize = 5;
  const padding = size * 0.1; // 10% padding
  const cellSize = (size - padding * 2) / gridSize;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className={className}
      style={{ display: 'block' }}
    >
      {/* Background */}
      <rect
        x="0"
        y="0"
        width={size}
        height={size}
        fill={bgColor}
      />

      {/* Pattern cells */}
      {pattern.map((row, rowIndex) =>
        row.map((filled, colIndex) =>
          filled ? (
            <rect
              key={`${rowIndex}-${colIndex}`}
              x={padding + colIndex * cellSize}
              y={padding + rowIndex * cellSize}
              width={cellSize}
              height={cellSize}
              fill={COLOR}
            />
          ) : null
        )
      )}
    </svg>
  );
}

/**
 * Preview gallery component for testing/demonstration
 */
export function ContractAvatarGallery() {
  const sampleAddresses = [
    '0x1234567890abcdef1234567890abcdef12345678',
    '0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef',
    '0x742d35Cc6634C0532925a3b844Bc9e7595f1bC19',
    '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
    '0x6B175474E89094C44Da98b954EesdfA2fE3Ac27',
    '0x853d955aCEf822Db058eb8505911ED77F175b99e',
    '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
  ];

  return (
    <div className="p-8 bg-slate-dark">
      <h2 className="text-ivory-light font-mono text-xl mb-6">Contract Avatar Gallery</h2>
      <div className="flex flex-wrap gap-4">
        {sampleAddresses.map((addr, i) => (
          <div key={i} className="text-center">
            <ContractAvatar address={addr} size={64} />
            <p className="text-ivory-light/40 font-mono text-[10px] mt-2 max-w-[64px] truncate">
              {addr.slice(0, 8)}...
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
