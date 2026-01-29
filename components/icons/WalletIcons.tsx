/**
 * Inline SVG icons for major Solana wallets.
 * Recolored to match site design: slate-medium (#3D3D3A) bg, clay/terracotta (#D97757) fg.
 * Path shapes from official brand asset kits.
 */

// Site palette
const BG = '#3D3D3A';  // slate-medium
const FG = '#D97757';  // clay/terracotta (brand accent)

interface IconProps {
  className?: string;
}

/** Phantom ghost — official paths, site colors */
export function PhantomIcon({ className = 'w-8 h-8' }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 1200 1200" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g clipPath="url(#phantom_clip)">
        <rect width="1200" height="1200" rx="257.592" fill={BG} />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M517.219 779.814C470.102 852.012 391.148 943.378 286.09 943.378C236.426 943.378 188.672 922.933 188.672 834.122C188.672 607.943 497.48 257.813 784.004 257.813C947.004 257.813 1011.95 370.902 1011.95 499.326C1011.95 664.168 904.98 852.651 798.648 852.651C764.902 852.651 748.347 834.122 748.347 804.732C748.347 797.065 749.621 788.759 752.168 779.814C715.875 841.789 645.836 899.292 580.254 899.292C532.5 899.292 508.305 869.263 508.305 827.094C508.305 811.76 511.488 795.787 517.219 779.814ZM904.363 494.869C904.363 532.291 882.284 551.002 857.586 551.002C832.514 551.002 810.809 532.291 810.809 494.869C810.809 457.448 832.514 438.737 857.586 438.737C882.284 438.737 904.363 457.448 904.363 494.869ZM764.031 494.871C764.031 532.293 741.952 551.004 717.254 551.004C692.182 551.004 670.477 532.293 670.477 494.871C670.477 457.449 692.182 438.739 717.254 438.739C741.952 438.739 764.031 457.449 764.031 494.871Z"
          fill={FG}
        />
      </g>
      <defs>
        <clipPath id="phantom_clip">
          <rect width="1200" height="1200" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
}

/** Solflare flame — official paths, site colors */
export function SolflareIcon({ className = 'w-8 h-8' }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 290 290" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g clipPath="url(#solflare_clip)">
        <path
          d="M63.2951 1H226.705C261.11 1 289 28.8905 289 63.2951V226.705C289 261.11 261.11 289 226.705 289H63.2951C28.8905 289 1 261.11 1 226.705V63.2951C1 28.8905 28.8905 1 63.2951 1Z"
          fill={BG}
          stroke="#5E5D59"
          strokeWidth="2"
        />
        <path
          d="M140.548 153.231L154.832 139.432L181.462 148.147C198.893 153.958 207.609 164.61 207.609 179.62C207.609 190.999 203.251 198.504 194.536 208.188L191.873 211.093L192.841 204.314C196.714 179.62 189.452 168.968 165.484 161.22L140.548 153.231ZM104.717 68.739L177.347 92.9488L161.61 107.959L123.843 95.3698C110.77 91.012 106.412 83.9911 104.717 69.2232V68.739ZM100.359 191.725L116.822 175.988L147.811 186.157C164.031 191.483 169.599 198.504 167.905 216.177L100.359 191.725ZM79.539 121.516C79.539 116.917 81.9599 112.559 86.0756 108.927C90.4334 115.222 97.9384 120.79 109.801 124.664L135.464 133.137L121.18 146.937L96.0016 138.705C84.3809 134.832 79.539 129.021 79.539 121.516ZM155.558 248.618C208.819 213.272 237.387 189.304 237.387 159.768C237.387 140.158 225.766 129.263 200.104 120.79L180.736 114.253L233.756 63.4128L223.103 52.0342L207.367 65.8337L133.043 41.3818C110.043 48.8869 80.9916 70.9178 80.9916 92.9487C80.9916 95.3697 81.2337 97.7907 81.96 100.454C62.8342 111.348 55.0871 121.516 55.0871 134.105C55.0871 145.968 61.3816 157.831 81.4758 164.368L97.4542 169.694L42.2559 222.713L52.9082 234.092L70.0972 218.356L155.558 248.618Z"
          fill={FG}
        />
      </g>
      <defs>
        <clipPath id="solflare_clip">
          <rect width="290" height="290" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
}

/** Coinbase "C" mark — official paths, site colors */
export function CoinbaseIcon({ className = 'w-8 h-8' }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
      <circle cx="512" cy="512" r="512" fill={BG} />
      <path
        d="M516.3 361.83c60.28 0 108.1 37.18 126.26 92.47H764C742 336.09 644.47 256 517.27 256 372.82 256 260 365.65 260 512.49S370 768 517.27 768c124.35 0 223.82-80.09 245.84-199.28H642.55c-17.22 55.3-65 93.45-125.32 93.45-83.23 0-141.56-63.89-141.56-149.68.04-86.77 57.43-150.66 140.63-150.66z"
        fill={FG}
      />
    </svg>
  );
}

/** Trust Wallet shield — official paths, site colors */
export function TrustWalletIcon({ className = 'w-8 h-8' }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 289 326" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M0 47L144.45 0V325.02C41.27 281.68 0 198.62 0 151.68V47Z"
        fill={FG}
      />
      <path
        d="M288.9 47L144.45 0V325.02C247.63 281.68 288.9 198.62 288.9 151.68V47Z"
        fill="#C6613F"
      />
    </svg>
  );
}

/** Ledger logo mark — official paths, site colors */
export function LedgerIcon({ className = 'w-8 h-8' }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 170 170" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="170" height="170" rx="34" fill={BG} />
      <g transform="translate(35, 35)">
        <path d="M37.7 66.3H17.6v27.1h27.1V73.3c0-3.9-3.2-7-7-7z" fill={FG} />
        <path d="M11.3 66.3H7.9c-3.8 0-7 3.2-7 7v3.5h10.5V66.3z" fill={FG} />
        <path d="M.9 83h10.5v10.5H.9V83z" fill={FG} />
        <path d="M34.3 110.1h3.5c3.8 0 7-3.2 7-7v-3.4H34.3v10.4z" fill={FG} />
        <path d="M17.6 99.7h10.5v10.5H17.6V99.7z" fill={FG} />
        <path d="M.9 99.7v3.5c0 3.8 3.2 7 7 7h3.5V99.7H.9z" fill={FG} />
      </g>
    </svg>
  );
}

/** Torus icon — site colors */
export function TorusIcon({ className = 'w-8 h-8' }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="128" height="128" rx="26" fill={BG} />
      <circle cx="64" cy="56" r="12" fill={FG} />
      <path d="M64 72C48 72 36 80 36 96H92C92 80 80 72 64 72Z" fill={FG} />
    </svg>
  );
}

/** Clover icon — site colors */
export function CloverIcon({ className = 'w-8 h-8' }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="128" height="128" rx="26" fill={BG} />
      <circle cx="50" cy="50" r="16" fill={FG} fillOpacity="0.85" />
      <circle cx="78" cy="50" r="16" fill={FG} fillOpacity="0.85" />
      <circle cx="50" cy="78" r="16" fill={FG} fillOpacity="0.85" />
      <circle cx="78" cy="78" r="16" fill={FG} fillOpacity="0.85" />
      <rect x="58" y="88" width="12" height="20" rx="4" fill={FG} fillOpacity="0.85" />
    </svg>
  );
}

/**
 * Returns the SVG icon component for a wallet by adapter name.
 * Falls back to null — caller should use adapter.icon as fallback.
 */
export function getWalletIcon(adapterName: string): React.ComponentType<IconProps> | null {
  const map: Record<string, React.ComponentType<IconProps>> = {
    'Phantom': PhantomIcon,
    'Solflare': SolflareIcon,
    'Coinbase Wallet': CoinbaseIcon,
    'Trust': TrustWalletIcon,
    'Ledger': LedgerIcon,
    'Torus': TorusIcon,
    'Clover': CloverIcon,
  };
  return map[adapterName] ?? null;
}
