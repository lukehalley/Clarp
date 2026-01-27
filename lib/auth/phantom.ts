// Phantom Wallet Connection Utility
// Sign In With Solana (SIWS) - No transactions, just message signing

import bs58 from 'bs58';
import type { PhantomProvider, PhantomWindow, SignInData } from './types';

/**
 * Get Phantom provider from window
 */
export function getPhantomProvider(): PhantomProvider | null {
  if (typeof window === 'undefined') return null;

  const phantomWindow = window as unknown as PhantomWindow;
  const provider = phantomWindow.phantom?.solana;

  if (provider?.isPhantom) {
    return provider;
  }

  return null;
}

/**
 * Check if Phantom wallet is installed
 */
export function isPhantomInstalled(): boolean {
  return getPhantomProvider() !== null;
}

/**
 * Open Phantom download page
 */
export function openPhantomDownload(): void {
  window.open('https://phantom.app/', '_blank');
}

/**
 * Create SIWS (Sign In With Solana) message
 * Includes nonce and timestamp to prevent replay attacks
 */
export function createSignInMessage(walletAddress: string, nonce: string): string {
  const timestamp = new Date().toISOString();
  const domain = typeof window !== 'undefined' ? window.location.host : 'clarp.app';

  return `CLARP Terminal - Sign In

Domain: ${domain}
Wallet: ${walletAddress}
Nonce: ${nonce}
Issued At: ${timestamp}

This signature proves you own this wallet.
No transaction will occur and no fees will be charged.`;
}

/**
 * Generate a cryptographically secure nonce
 */
export function generateNonce(): string {
  return crypto.randomUUID();
}

/**
 * Connect to Phantom and sign authentication message
 * Returns the public key, signature, and message for verification
 */
export async function connectAndSign(): Promise<SignInData> {
  const provider = getPhantomProvider();

  if (!provider) {
    openPhantomDownload();
    throw new Error('Phantom wallet not installed. Please install Phantom and try again.');
  }

  try {
    // 1. Connect to wallet (gets public key)
    const { publicKey } = await provider.connect();
    const walletAddress = publicKey.toString();

    // 2. Create sign-in message with nonce
    const nonce = generateNonce();
    const message = createSignInMessage(walletAddress, nonce);

    // 3. Sign the message (proves wallet ownership - no transaction/fees)
    const encodedMessage = new TextEncoder().encode(message);
    const { signature } = await provider.signMessage(encodedMessage, 'utf8');

    return {
      publicKey: walletAddress,
      signature: bs58.encode(signature),
      message,
    };
  } catch (error) {
    // User rejected connection or signing
    if (error instanceof Error) {
      if (error.message.includes('User rejected')) {
        throw new Error('Connection cancelled by user');
      }
      throw error;
    }
    throw new Error('Failed to connect to Phantom wallet');
  }
}

/**
 * Disconnect from Phantom wallet
 */
export async function disconnectWallet(): Promise<void> {
  const provider = getPhantomProvider();

  if (provider?.isConnected) {
    await provider.disconnect();
  }
}

/**
 * Get currently connected wallet address (if any)
 */
export function getConnectedWallet(): string | null {
  const provider = getPhantomProvider();

  if (provider?.isConnected && provider.publicKey) {
    return provider.publicKey.toString();
  }

  return null;
}

/**
 * Try to reconnect to a previously connected wallet (silent connect)
 */
export async function tryReconnect(): Promise<string | null> {
  const provider = getPhantomProvider();

  if (!provider) return null;

  try {
    // onlyIfTrusted: true = only connect if user has previously approved this site
    const { publicKey } = await provider.connect({ onlyIfTrusted: true });
    return publicKey.toString();
  } catch {
    // User hasn't previously connected, or connection failed
    return null;
  }
}

/**
 * Subscribe to wallet disconnect events
 */
export function onWalletDisconnect(callback: () => void): () => void {
  const provider = getPhantomProvider();

  if (!provider) return () => {};

  provider.on('disconnect', callback);

  return () => {
    provider.off('disconnect', callback);
  };
}

/**
 * Subscribe to account change events
 */
export function onAccountChange(callback: (publicKey: string | null) => void): () => void {
  const provider = getPhantomProvider();

  if (!provider) return () => {};

  const handler = (publicKey: unknown) => {
    if (publicKey && typeof publicKey === 'object' && 'toString' in publicKey) {
      callback((publicKey as { toString: () => string }).toString());
    } else {
      callback(null);
    }
  };

  provider.on('accountChanged', handler);

  return () => {
    provider.off('accountChanged', handler);
  };
}
