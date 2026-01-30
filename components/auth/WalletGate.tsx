/**
 * WalletGate - Token-gated access component (currently disabled)
 *
 * Gate is bypassed — all users can access content without connecting a wallet.
 */

interface WalletGateProps {
  children: React.ReactNode;
  requiredBalance?: number;
  showPreview?: boolean;
}

export default function WalletGate({
  children,
}: WalletGateProps) {
  // Token gate disabled — allow all users through
  return <>{children}</>;
}

/**
 * Free scan button component
 * Redirects to /terminal/scan for full OSINT analysis
 */
// Solana address validation (base58, 32-44 chars)
const SOLANA_ADDRESS_REGEX = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;

function isValidSolanaAddress(address: string): boolean {
  return SOLANA_ADDRESS_REGEX.test(address.trim());
}

function FreeScanButton() {
  const router = useRouter();
  const [showInput, setShowInput] = useState(false);
  const [tokenAddress, setTokenAddress] = useState('');

  const trimmedAddress = tokenAddress.trim();
  const isValidAddress = trimmedAddress.length > 0 && isValidSolanaAddress(trimmedAddress);
  const showValidationError = trimmedAddress.length > 0 && !isValidAddress;

  function handleFreeScan() {
    if (!isValidAddress) return;

    // Set pending free scan flag (expires in 5 minutes)
    localStorage.setItem(FREE_SCAN_PENDING_KEY, Date.now().toString());
    // Mark as used
    localStorage.setItem(FREE_SCAN_KEY, 'true');
    // Redirect to scan page
    router.push(`/terminal/scan?address=${encodeURIComponent(trimmedAddress)}`);
  }

  if (showInput) {
    return (
      <div className="space-y-3">
        <input
          type="text"
          value={tokenAddress}
          onChange={(e) => setTokenAddress(e.target.value)}
          placeholder="Paste Solana token address..."
          className={`w-full bg-slate-dark border-2 px-4 py-3
                     font-mono text-sm text-ivory-light placeholder-ivory-light/30
                     outline-none transition-colors ${
                       showValidationError
                         ? 'border-larp-red/50 focus:border-larp-red'
                         : 'border-ivory-light/20 focus:border-danger-orange/50'
                     }`}
        />
        {showValidationError && (
          <p className="font-mono text-xs text-larp-red">
            Invalid Solana address format (32-44 base58 characters)
          </p>
        )}
        <button
          onClick={handleFreeScan}
          disabled={!isValidAddress}
          className="w-full bg-slate-dark hover:bg-ivory-light/5 disabled:opacity-50
                     disabled:cursor-not-allowed border-2 border-ivory-light/20
                     hover:border-ivory-light/40 text-ivory-light font-mono font-bold
                     py-3 transition-all flex items-center justify-center gap-2"
        >
          <Zap className="w-4 h-4 text-larp-yellow" />
          RUN FREE SCAN
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setShowInput(true)}
      className="w-full bg-slate-dark hover:bg-ivory-light/5
                 border-2 border-ivory-light/20 hover:border-larp-yellow/50
                 text-ivory-light font-mono py-3 transition-all
                 flex items-center justify-center gap-2"
    >
      <Zap className="w-4 h-4 text-larp-yellow" />
      TRY 1 FREE SCAN
      <ArrowRight className="w-4 h-4" />
    </button>
  );
}
