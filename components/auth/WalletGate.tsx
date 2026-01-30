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
