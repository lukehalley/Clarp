// Phantom Wallet Auth Types

export interface PhantomProvider {
  isPhantom: boolean;
  publicKey: { toString: () => string; toBytes: () => Uint8Array } | null;
  isConnected: boolean;
  connect: (opts?: { onlyIfTrusted?: boolean }) => Promise<{ publicKey: { toString: () => string; toBytes: () => Uint8Array } }>;
  disconnect: () => Promise<void>;
  signMessage: (message: Uint8Array, display: string) => Promise<{ signature: Uint8Array }>;
  on: (event: string, callback: (...args: unknown[]) => void) => void;
  off: (event: string, callback: (...args: unknown[]) => void) => void;
}

export interface PhantomWindow {
  phantom?: {
    solana?: PhantomProvider;
  };
}

export interface SignInData {
  publicKey: string;
  signature: string;
  message: string;
}

export interface User {
  id: string;
  wallet_address: string;
  created_at: string;
  last_login: string;
}

export interface AuthSession {
  token: string;
  user: User;
}

export interface JWTPayload {
  sub: string; // user id
  wallet: string; // wallet address
  iat: number;
  exp: number;
}

// Extend Window interface globally
declare global {
  interface Window {
    phantom?: {
      solana?: PhantomProvider;
    };
    solana?: PhantomProvider;
    braveSolana?: PhantomProvider;
  }
}
