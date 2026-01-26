'use client';

import Image from 'next/image';

interface ChainIconProps {
  size?: number;
  className?: string;
}

// Solana-only app - simplified chain icon
export default function ChainIcon({ size = 16, className = '' }: ChainIconProps) {
  return (
    <Image
      src="/icons/chains/sol.svg"
      alt="Solana"
      width={size}
      height={size}
      className={className}
    />
  );
}
