import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { useAuth } from '../hooks/useAuth';
import { getOrCreatePlayerProfile } from '../services/playerService';
import { GameProfile } from '../types/Firebase';
import { useTonConnectUI } from '@tonconnect/ui-react';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import { fetchSpiderTokenBalance, linkWalletToUser } from '../services/tonService';
import { loadPlayerSpiders } from '../services/spiderService';
import { useGameStore } from '../store/useGameStore';

interface AuthContextProps {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  playerProfile: GameProfile | null;
  isPlayerProfileLoading: boolean;
  playerProfileError: string | null;
  spiderTokenBalance: number | null;
  isBalanceLoading: boolean;
  refreshBalance: () => Promise<void>;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  loginWithTon: () => Promise<void>;
  loginAnonymously: () => Promise<void>;
  signupWithEmail: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isTonConnectReady: boolean;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const {
    user,
    loading: authLoading,
    error: authError,
    login,
    loginWithGoogle: loginGoogle,
    loginAnonymously: loginAnon,
    signup,
    logout: authLogout
  } = useAuth();

  const [tonConnectUI] = useTonConnectUI();
  const { addSpider, updateBalance } = useGameStore();
  
  // Player profile state
  const [playerProfile, setPlayerProfile] = useState<GameProfile | null>(null);
  const [isPlayerProfileLoading, setIsPlayerProfileLoading] = useState(false);
  const [playerProfileError, setPlayerProfileError] = useState<string | null>(null);

  // Token balance state
  const [spiderTokenBalance, setSpiderTokenBalance] = useState<number | null>(null);
  const [isBalanceLoading, setIsBalanceLoading] = useState(false);

  // TON Connect UI state
  const [isTonConnectReady, setIsTonConnectReady] = useState(false);

  // Initialize TON Connect UI
  useEffect(() => {
    const initializeTonConnect = async () => {
      try {
        await tonConnectUI.connectionRestored;
        setIsTonConnectReady(true);
      } catch (error) {
        console.error('Error initializing TON Connect:', error);
        // Still set ready to true to not block the UI
        setIsTonConnectReady(true);
      }
    };
    
    initializeTonConnect();
  }, []);

  // Connect wallet when requested
  const loginWithTon = async (): Promise<void> => {
    try {
      // First, ensure we have a Firebase user account
      if (!user) {
        // Create anonymous account first if not logged in
        await loginAnon();
      }
      
      // Then open wallet connection
      await tonConnectUI.openModal();
    } catch (error) {
      console.error('Error connecting TON wallet:', error);
      throw error;
    }
  };
  
  // Load or create player profile when user authenticates
  useEffect(() => {
    let isMounted = true;
    const loadProfile = async () => {
      if (!user || isPlayerProfileLoading) return;
      
      setIsPlayerProfileLoading(true);
      setPlayerProfileError(null);
      
      try {
        // Wait for TON Connect to be ready before proceeding
        if (!isTonConnectReady) {
          await tonConnectUI.connectionRestored;
        }

        // If TON wallet is connected, update user data
        if (tonConnectUI.account && tonConnectUI.connected) {
          await setDoc(doc(db, 'users', user.uid), {
            walletAddress: tonConnectUI.account.address,
            updatedAt: serverTimestamp()
          }, { merge: true });
          
          await linkWalletToUser(user.uid, tonConnectUI.account.address);
        }
        
        // Load or create player profile
        const profile = await getOrCreatePlayerProfile(user);
        if (isMounted) {
          setPlayerProfile(profile);
          
          // Update local game state with player's balance
          if (profile.balance) {
            updateBalance({
              SPIDER: profile.balance.SPIDER || 0,
              feeders: profile.balance.feeders || 0
            });
          }
        }
      } catch (error) {
        if (isMounted) {
          const errorMessage = error instanceof Error ? error.message : 'Error loading player profile';
          setPlayerProfileError(errorMessage);
          console.error('Error loading player profile:', error);
        }
      } finally {
        if (isMounted) {
          setIsPlayerProfileLoading(false);
        }
      }
    };
    
    loadProfile();
    return () => { isMounted = false; };
  }, [user, tonConnectUI.account, tonConnectUI.connected, isTonConnectReady]);

  // Fetch token balance when wallet is connected
  useEffect(() => {
    const fetchBalance = async () => {
      if (!isTonConnectReady) return;
      
      if (tonConnectUI.account && tonConnectUI.connected) {
        setIsBalanceLoading(true);
        try {
          const balance = await fetchSpiderTokenBalance(tonConnectUI.account.address);
          if (balance !== null) {
            setSpiderTokenBalance(balance);
          }
        } catch (error) {
          console.error('Error fetching token balance:', error);
        } finally {
          setIsBalanceLoading(false);
        }
      } else {
        setSpiderTokenBalance(null);
      }
    };
    
    fetchBalance();
  }, [tonConnectUI.account, tonConnectUI.connected, isTonConnectReady]);

  // Function to refresh the token balance on demand
  const refreshBalance = async (): Promise<void> => {
    if (tonConnectUI.account && tonConnectUI.connected) {
      setIsBalanceLoading(true);
      try {
        const balance = await fetchSpiderTokenBalance(tonConnectUI.account.address);
        setSpiderTokenBalance(balance);
        console.log('Refreshed token balance:', balance);
      } catch (error) {
        console.error('Error refreshing token balance:', error);
      } finally {
        setIsBalanceLoading(false);
      }
    } else if (playerProfile) {
      // If no TON wallet but we have a player profile, use Firestore balance
      const playerBalance = playerProfile.balance.SPIDER || 0;
      updateBalance({ SPIDER: playerBalance });
    }
  };

  // Handle TON wallet connection
  useEffect(() => {
    const tonWallet = tonConnectUI.account;
    
    if (tonWallet && !user) {
      // If there's a wallet connection but no Firebase user, create an anonymous account
      loginAnon()
        .catch((error) => {
          console.error('Error linking TON wallet:', error);
        });
    }
  }, [tonConnectUI.account, user]);

  const loginWithEmail = async (email: string, password: string): Promise<void> => {
    setPlayerProfileError(null);
    await login(email, password);
  };

  const loginWithGoogle = async (): Promise<void> => {
    setPlayerProfileError(null);
    await loginGoogle();
  };

  const loginAnonymously = async (): Promise<void> => {
    setPlayerProfileError(null);
    await loginAnon();
  };

  const signupWithEmail = async (email: string, password: string): Promise<void> => {
    setPlayerProfileError(null);
    await signup(email, password);
  };

  const logout = async (): Promise<void> => {
    // Disconnect TON wallet if connected
    if (tonConnectUI.connected) {
      await tonConnectUI.disconnect();
    }
    
    // Reset all states before logout
    setPlayerProfile(null);
    setPlayerProfileError(null);
    setSpiderTokenBalance(null);
    
    // Logout from Firebase
    await authLogout();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading: authLoading || isPlayerProfileLoading,
        error: authError,
        playerProfile,
        isPlayerProfileLoading,
        playerProfileError,
        spiderTokenBalance,
        isBalanceLoading,
        refreshBalance,
        loginWithEmail,
        loginWithGoogle,
        loginWithTon,
        loginAnonymously,
        signupWithEmail,
        logout,
        isTonConnectReady
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = (): AuthContextProps => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  
  return context;
};