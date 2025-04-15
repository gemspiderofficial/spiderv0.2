import { db } from '../config/firebase';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { updatePlayerBalance } from './playerService';
import axios from 'axios';

// Constants
const SPIDER_TOKEN_ADDRESS = import.meta.env.VITE_SPIDER_TOKEN_ADDRESS;
const TON_API_ENDPOINT = import.meta.env.VITE_TON_API_ENDPOINT;
const GAME_WALLET_ADDRESS = import.meta.env.VITE_GAME_WALLET_ADDRESS;

// Validate required environment variables
if (!SPIDER_TOKEN_ADDRESS || !TON_API_ENDPOINT || !GAME_WALLET_ADDRESS) {
  console.error('Missing required TON configuration:', {
    SPIDER_TOKEN_ADDRESS: !!SPIDER_TOKEN_ADDRESS,
    TON_API_ENDPOINT: !!TON_API_ENDPOINT,
    GAME_WALLET_ADDRESS: !!GAME_WALLET_ADDRESS
  });
}

/**
 * Fetches a user's $SPIDER token balance from the TON blockchain
 */
export const fetchSpiderTokenBalance = async (walletAddress: string): Promise<number | null> => {
  try {
    if (!walletAddress) {
      console.warn('No wallet address provided to fetchSpiderTokenBalance');
      return null;
    }

    if (!TON_API_ENDPOINT || !SPIDER_TOKEN_ADDRESS) {
      console.error('TON configuration missing');
      return null;
    }

    const response = await axios.get(`${TON_API_ENDPOINT}/balance/${walletAddress}`, {
      params: {
        token_address: SPIDER_TOKEN_ADDRESS
      }
    });

    if (response.data.success) {
      return typeof response.data.balance === 'number' ? response.data.balance : null;
    }
    
    console.error('Failed to fetch balance:', response.data.message);
    return null;
  } catch (error) {
    console.error('Error fetching $SPIDER token balance:', error);
    return null;
  }
};

/**
 * Initiates a deposit transaction from user's wallet to game wallet
 */
export const depositSpiderTokens = async (
  userId: string, 
  walletAddress: string, 
  amount: number
): Promise<string | null> => {
  try {
    if (amount <= 0) {
      throw new Error('Deposit amount must be greater than zero');
    }
    
    // 1. Create a pending transaction record
    const transactionId = `tx-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    const transactionRef = doc(db, 'transactions', transactionId);
    
    await setDoc(transactionRef, {
      userId,
      walletAddress,
      amount,
      type: 'deposit',
      status: 'pending',
      targetAddress: GAME_WALLET_ADDRESS,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    // 2. Return transaction ID - the UI will use this to check status
    return transactionId;
  } catch (error) {
    console.error('Error initiating deposit:', error);
    return null;
  }
};

/**
 * Verifies a deposit transaction and updates game balance if confirmed
 */
export const verifyDepositTransaction = async (
  transactionId: string,
  txHash: string
): Promise<boolean> => {
  try {
    // 1. Verify transaction on blockchain
    const response = await axios.post(`${TON_API_ENDPOINT}/verify-transaction`, {
      txHash,
      expectedReceiver: GAME_WALLET_ADDRESS
    });

    if (!response.data.success) {
      throw new Error('Transaction verification failed');
    }

    // 2. Get transaction details from Firestore
    const transactionRef = doc(db, 'transactions', transactionId);
    const transactionDoc = await getDoc(transactionRef);
    
    if (!transactionDoc.exists()) {
      throw new Error('Transaction not found');
    }

    const transaction = transactionDoc.data();

    // 3. Update transaction status and player balance
    await updateDoc(transactionRef, {
      status: 'completed',
      txHash,
      confirmedAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    // 4. Update player's game balance
    await updatePlayerBalance(transaction.userId, {
      SPIDER: transaction.amount
    });

    return true;
  } catch (error) {
    console.error('Error verifying deposit:', error);
    return false;
  }
};

/**
 * Gets wallet address for a user with better error handling
 */
export const getUserWalletAddress = async (userId: string): Promise<string | null> => {
  try {
    if (!userId) {
      console.warn('No user ID provided to getUserWalletAddress');
      return null;
    }

    const userDoc = await getDoc(doc(db, 'users', userId));
    
    if (!userDoc.exists()) {
      console.warn(`No user document found for ID: ${userId}`);
      return null;
    }
    
    const data = userDoc.data();
    return data?.walletAddress || null;
  } catch (error) {
    console.error('Error getting wallet address:', error);
    return null;
  }
};

/**
 * Links a wallet address to a user with validation
 */
export const linkWalletToUser = async (userId: string, walletAddress: string): Promise<void> => {
  try {
    if (!userId || !walletAddress) {
      throw new Error('User ID and wallet address are required');
    }

    await setDoc(doc(db, 'users', userId), {
      walletAddress,
      updatedAt: serverTimestamp(),
      lastWalletLinkTime: serverTimestamp()
    }, { merge: true });
  } catch (error) {
    console.error('Error linking wallet:', error);
    throw error;
  }
};