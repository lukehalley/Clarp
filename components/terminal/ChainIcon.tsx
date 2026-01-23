'use client';

import { Chain } from '@/types/terminal';
import Image from 'next/image';

const CHAIN_ICONS: Record<Chain, string> = {
  ethereum: '/icons/chains/eth.svg',
  solana: '/icons/chains/sol.svg',
  base: '/icons/chains/base.svg',
  arbitrum: '/icons/chains/arb.svg',
};

interface ChainIconProps {
  chain: Chain;
  size?: number;
  className?: string;
}

export default function ChainIcon({ chain, size = 16, className = '' }: ChainIconProps) {
  const iconPath = CHAIN_ICONS[chain];

  return (
    <Image
      src={iconPath}
      alt={chain}
      width={size}
      height={size}
      className={className}
    />
  );
}
