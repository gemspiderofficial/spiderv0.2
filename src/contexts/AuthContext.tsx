import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { useAuth } from '../hooks/useAuth';
import { getOrCreatePlayerProfile } from '../services/playerService';
import { GameProfile } from '../types/Firebase';
import { useTonConnectUI } from '@tonconnect/ui-react';
import { doc, setDoc } from 'firebase/firestore';
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
    const loadProfile = async () => {
      if (user) {
        setIsPlayerProfileLoading(true);
        setPlayerProfileError(null);
        
        try {
          // If TON wallet is connected, update user data with wallet address
          if (tonConnectUI.account && tonConnectUI.connected) {
            // Store wallet address in Firestore directly
            await setDoc(doc(db, 'users', user.uid), {
              walletAddress: tonConnectUI.account.address,
              updatedAt: new Date()
            }, { merge: true });
            
            // Link wallet to user
            await linkWalletToUser(user.uid, tonConnectUI.account.address);
          }
          
          // Load or create player profile
          const profile = await getOrCreatePlayerProfile(user);
          setPlayerProfile(profile);
          
          // Update the local game state with the player's balance from Firestore
          if (profile.balance) {
            updateBalance({
              SPIDER: profile.balance.SPIDER,
              feeders: profile.balance.feeders
            });
            console.log('Updated local balance from Firestore:', profile.balance);
          }
          
          // Add a small delay to ensure any recent writes to Firestore are complete
          // This helps avoid race conditions where a spider was just created but not yet visible in queries
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // Load player's spiders from Firestore and add them to the game store
          const spiders = await loadPlayerSpiders(user.uid);
          console.log(`Loaded ${spiders.length} spiders for player ${user.uid}:`, spiders);
          
          // Add each spider to the game store
          spiders.forEach(spider => {
            addSpider(spider);
          });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Error loading player profile';
          setPlayerProfileError(errorMessage);
          console.error('Error loading player profile:', error);
        } finally {
          setIsPlayerProfileLoading(false);
        }
      } else {
        // Reset player profile when user logs out
        setPlayerProfile(null);
      }
    };
    
    loadProfile();
  }, [user, tonConnectUI.account, tonConnectUI.connected, addSpider, updateBalance]);

  // Fetch token balance when wallet is connected
  useEffect(() => {
    const fetchBalance = async () => {
      if (tonConnectUI.account && tonConnectUI.connected) {
        setIsBalanceLoading(true);
        try {
          const balance = await fetchSpiderTokenBalance(tonConnectUI.account.address);
          setSpiderTokenBalance(balance);
        } catch (error) {
          console.error('Error fetching token balance:', error);
        } finally {
          setIsBalanceLoading(false);
        }
      } else {
        // Reset balance when wallet is disconnected
        setSpiderTokenBalance(null);
      }
    };
    
    fetchBalance();
  }, [tonConnectUI.account, tonConnectUI.connected]);

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
    await login(email, password);
  };

  const loginWithGoogle = async (): Promise<void> => {
    await loginGoogle();
  };

  const loginAnonymously = async (): Promise<void> => {
    await loginAnon();
  };

  const signupWithEmail = async (email: string, password: string): Promise<void> => {
    await signup(email, password);
  };

  const logout = async (): Promise<void> => {
    // Disconnect TON wallet if connected
    if (tonConnectUI.connected) {
      await tonConnectUI.disconnect();
    }
    
    // Logout from Firebase
    await authLogout();
    setPlayerProfile(null);
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
        logout
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