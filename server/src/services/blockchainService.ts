import axios from 'axios';
import { db } from '../config/firebase';
import { logger } from '../utils/logger';

// Constants
const TON_API_KEY = process.env.TON_API_KEY || '';
const TON_API_URL = 'https://toncenter.com/api/v2/';
const SPIDER_TOKEN_ADDRESS = process.env.SPIDER_TOKEN_ADDRESS || '';

/**
 * Verify a transaction on the TON blockchain
 * @param txHash Transaction hash to verify
 * @param expectedAmount Expected amount of the transaction
 * @param expectedSender Expected sender address
 * @param expectedReceiver Expected receiver address
 */
export const verifyTransaction = async (
  txHash: string,
  expectedAmount: number,
  expectedSender?: string,
  expectedReceiver?: string
): Promise<{ verified: boolean; message: string; data?: any }> => {
  try {
    logger.info(`Verifying transaction ${txHash}`);
    
    // In a real implementation, this would make a request to the TON blockchain API
    // For now, we'll simulate the verification process
    
    if (!TON_API_KEY) {
      logger.warn('TON_API_KEY not set, using mock verification');
      
      // Mock verification for development
      const isValid = txHash.length === 64 && !txHash.includes('invalid');
      
      if (!isValid) {
        return {
          verified: false,
          message: 'Invalid transaction hash format'
        };
      }
      
      // Simulate successful verification
      return {
        verified: true,
        message: 'Transaction verified successfully',
        data: {
          hash: txHash,
          amount: expectedAmount,
          sender: expectedSender || 'EQD...mock_sender',
          receiver: expectedReceiver || 'EQD...mock_receiver',
          timestamp: new Date().toISOString()
        }
      };
    }
    
    // Real implementation would use the TON API
    const response = await axios.get(`${TON_API_URL}/getTransactions`, {
      params: {
        address: expectedReceiver,
        limit: 10
      },
      headers: {
        'X-API-Key': TON_API_KEY
      }
    });
    
    // Find the transaction in the response
    const transaction = response.data.result.find((tx: any) => tx.hash === txHash);
    
    if (!transaction) {
      return {
        verified: false,
        message: 'Transaction not found'
      };
    }
    
    // Verify transaction details
    const amountMatch = Math.abs(transaction.amount - expectedAmount) < 0.001;
    const senderMatch = !expectedSender || transaction.from === expectedSender;
    const receiverMatch = !expectedReceiver || transaction.to === expectedReceiver;
    
    if (!amountMatch || !senderMatch || !receiverMatch) {
      return {
        verified: false,
        message: 'Transaction details do not match expected values',
        data: transaction
      };
    }
    
    return {
      verified: true,
      message: 'Transaction verified successfully',
      data: transaction
    };
    
  } catch (error) {
    logger.error(`Error verifying transaction ${txHash}:`, error);
    return {
      verified: false,
      message: 'Error verifying transaction'
    };
  }
};

/**
 * Fetch a user's token balance from the blockchain
 * @param walletAddress Wallet address to check
 */
export const fetchTokenBalance = async (walletAddress: string): Promise<number | null> => {
  try {
    logger.info(`Fetching token balance for wallet ${walletAddress}`);
    
    // In a real implementation, this would make a request to the TON blockchain API
    // For now, we'll simulate the balance fetch
    
    if (!TON_API_KEY) {
      logger.warn('TON_API_KEY not set, using mock balance');
      
      // For development, return a random balance between 1000 and 10000
      return Math.floor(Math.random() * 9000) + 1000;
    }
    
    // Real implementation would use the TON API to fetch token balance
    const response = await axios.get(`${TON_API_URL}/getTokenBalance`, {
      params: {
        address: walletAddress,
        token_address: SPIDER_TOKEN_ADDRESS
      },
      headers: {
        'X-API-Key': TON_API_KEY
      }
    });
    
    return parseFloat(response.data.result);
    
  } catch (error) {
    logger.error(`Error fetching token balance for wallet ${walletAddress}:`, error);
    return null;
  }
};

/**
 * Process a deposit from TON blockchain to game balance
 * @param userId User ID
 * @param walletAddress Wallet address
 * @param amount Amount to deposit
 * @param txHash Transaction hash for verification
 */
export const processDeposit = async (
  userId: string,
  walletAddress: string,
  amount: number,
  txHash: string
): Promise<{ success: boolean; message: string; newBalance?: number }> => {
  try {
    logger.info(`Processing deposit of ${amount} tokens for user ${userId}`);
    
    // Verify the transaction
    const verification = await verifyTransaction(
      txHash,
      amount,
      walletAddress,
      SPIDER_TOKEN_ADDRESS
    );
    
    if (!verification.verified) {
      return {
        success: false,
        message: `Transaction verification failed: ${verification.message}`
      };
    }
    
    // Get the user's current game profile
    const profileRef = db().collection('gameProfiles').doc(userId);
    const profileDoc = await profileRef.get();
    
    if (!profileDoc.exists) {
      return {
        success: false,
        message: 'User profile not found'
      };
    }
    
    const profile = profileDoc.data();
    if (!profile) {
      return {
        success: false,
        message: 'User profile data is null'
      };
    }
    
    // Update the user's balance
    const currentBalance = profile.balance.SPIDER || 0;
    const newBalance = currentBalance + amount;
    
    await profileRef.update({
      'balance.SPIDER': newBalance,
      updatedAt: new Date()
    });
    
    // Record the transaction
    await db().collection('transactions').add({
      userId,
      type: 'deposit',
      amount,
      txHash,
      walletAddress,
      description: `Deposit of ${amount} $SPIDER tokens`,
      status: 'completed',
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    logger.info(`Deposit of ${amount} tokens for user ${userId} processed successfully`);
    
    return {
      success: true,
      message: 'Deposit processed successfully',
      newBalance
    };
    
  } catch (error) {
    logger.error(`Error processing deposit for user ${userId}:`, error);
    return {
      success: false,
      message: 'Error processing deposit'
    };
  }
}; 