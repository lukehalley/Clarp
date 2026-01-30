'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
  ReactNode,
} from 'react';
import { createClient, SupabaseClient, User, Session } from '@supabase/supabase-js';
import { useWallet } from '@solana/wallet-adapter-react';

interface AuthContextType {
  // State
  user: User | null;
  session: Session | null;
  wallet: string | null;
  isConnecting: boolean;
  isLoading: boolean;
  isAuthenticated: boolean;

  // Actions
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;

  // Utils
  supabase: SupabaseClient | null;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Get wallet from Solana wallet adapter
  const { publicKey, connected, signMessage } = useWallet();

  // Create Supabase client
  const supabase = useMemo(() => {
    if (typeof window === 'undefined') return null;

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!url || !key) {
      console.warn('[Auth] Supabase not configured');
      return null;
    }

    return createClient(url, key, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
      },
    });
  }, []);

  // Get wallet address string
  const wallet = useMemo(() => {
    if (!publicKey) return null;
    return publicKey.toBase58();
  }, [publicKey]);

  // Use a ref for the connecting guard so signIn callback stays stable
  const isConnectingRef = useRef(false);

  // Sign in with Supabase Web3
  const signIn = useCallback(async () => {
    if (!supabase) {
      throw new Error('Supabase not configured');
    }

    if (!connected || !publicKey || !signMessage) {
      throw new Error('Wallet not connected');
    }

    if (isConnectingRef.current) return;

    isConnectingRef.current = true;
    setIsConnecting(true);

    try {
      // Use Supabase's Web3 sign-in with the wallet adapter
      const { data, error } = await supabase.auth.signInWithWeb3({
        chain: 'solana',
        statement: 'Sign in to CLARP Terminal. This will not trigger any blockchain transaction.',
        wallet: {
          publicKey,
          signMessage,
        },
      });

      if (error) {
        throw error;
      }

      if (data.session) {
        setSession(data.session);
        setUser(data.user);
      }
    } catch (error) {
      console.error('[Auth] Sign in failed:', error);
      throw error;
    } finally {
      isConnectingRef.current = false;
      setIsConnecting(false);
    }
  }, [supabase, connected, publicKey, signMessage]);

  // Sign out
  const signOut = useCallback(async () => {
    if (!supabase) return;

    try {
      await supabase.auth.signOut();
      setSession(null);
      setUser(null);
    } catch (error) {
      console.error('[Auth] Sign out error:', error);
    }
  }, [supabase]);

  // Initialize auth state
  useEffect(() => {
    if (!supabase) {
      setIsLoading(false);
      return;
    }

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  const value: AuthContextType = {
    user,
    session,
    wallet,
    isConnecting,
    isLoading,
    isAuthenticated: !!session && !!user && !!wallet,
    signIn,
    signOut,
    supabase,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
