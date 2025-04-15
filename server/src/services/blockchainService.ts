import axios from 'axios';
import { db } from '../config/firebase';
import { logger } from '../utils/logger';

// Constants with validation
const TON_API_KEY = process.env.TON_API_KEY;
const TON_API_URL = process.env.TON_API_URL || 'https://toncenter.com/api/v2';
const SPIDER_TOKEN_ADDRESS = process.env.SPIDER_TOKEN_ADDRESS;
const MIN_CONFIRMATIONS = 3;

// Validate configuration on service initialization
if (!TON_API_KEY || !SPIDER_TOKEN_ADDRESS) {
  logger.error('Missing required blockchain configuration:', {
    TON_API_KEY: !!TON_API_KEY,
    SPIDER_TOKEN_ADDRESS: !!SPIDER_TOKEN_ADDRESS
  });
}

/**
 * Verify a transaction on the TON blockchain with improved error handling
 */
export const verifyTransaction = async (
  txHash: string,
  expectedAmount: number,
  expectedSender?: string,
  expectedReceiver?: string
): Promise<{ verified: boolean; message: string; data?: any }> => {
  try {
    logger.info(`Verifying transaction ${txHash}`);
    
    if (!TON_API_KEY) {
      throw new Error('TON API configuration missing');
    }
    
    if (!txHash) {
      throw new Error('Transaction hash is required');
    }
    
    // Get transaction details with retry logic
    let response;
    let retries = 3;
    while (retries > 0) {
      try {
        response = await axios.get(`${TON_API_URL}/transactions/${txHash}`, {
          headers: {
            'X-API-Key': TON_API_KEY
          }
        });
        break;
      } catch (error) {
        retries--;
        if (retries === 0) throw error;
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    if (!response?.data.ok) {
      return {
        verified: false,
        message: 'Transaction not found or pending'
      };
    }

    const tx = response.data.result;

    // Verify transaction details
    if (!tx || typeof tx.confirmations !== 'number') {
      return {
        verified: false,
        message: 'Invalid transaction data received'
      };
    }

    if (tx.confirmations < MIN_CONFIRMATIONS) {
      return {
        verified: false,
        message: `Waiting for confirmations (${tx.confirmations}/${MIN_CONFIRMATIONS})`
      };
    }

    // Verify amount and addresses with tolerance for floating point comparison
    const amountMatch = Math.abs(tx.amount - expectedAmount) < 0.000001;
    const senderMatch = !expectedSender || tx.from.toLowerCase() === expectedSender.toLowerCase();
    const receiverMatch = !expectedReceiver || tx.to.toLowerCase() === expectedReceiver.toLowerCase();

    if (!amountMatch || !senderMatch || !receiverMatch) {
      return {
        verified: false,
        message: 'Transaction details do not match',
        data: {
          expectedAmount,
          actualAmount: tx.amount,
          expectedSender,
          actualSender: tx.from,
          expectedReceiver,
          actualReceiver: tx.to
        }
      };
    }

    return {
      verified: true,
      message: 'Transaction verified successfully',
      data: tx
    };
  } catch (error) {
    logger.error(`Error verifying transaction ${txHash}:`, error);
    return {
      verified: false,
      message: error instanceof Error ? error.message : 'Unknown error verifying transaction'
    };
  }
};

/**
 * Fetch token balance from the blockchain with retry logic
 */
export const fetchTokenBalance = async (walletAddress: string): Promise<number | null> => {
  try {
    logger.info(`Fetching token balance for wallet ${walletAddress}`);
    
    if (!TON_API_KEY || !SPIDER_TOKEN_ADDRESS) {
      throw new Error('TON API configuration missing');
    }

    if (!walletAddress) {
      throw new Error('Wallet address is required');
    }
    
    // Implement retry logic for better reliability
    let retries = 3;
    while (retries > 0) {
      try {
        const response = await axios.get(`${TON_API_URL}/tokens/balance`, {
          params: {
            address: walletAddress,
            token_address: SPIDER_TOKEN_ADDRESS
          },
          headers: {
            'X-API-Key': TON_API_KEY
          }
        });

        if (!response.data.ok) {
          throw new Error('Failed to fetch balance');
        }

        const balance = Number(response.data.result);
        if (isNaN(balance)) {
          throw new Error('Invalid balance value received');
        }

        return balance;
      } catch (error) {
        retries--;
        if (retries === 0) throw error;
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    throw new Error('Failed to fetch balance after retries');
  } catch (error) {
    logger.error(`Error fetching token balance for wallet ${walletAddress}:`, error);
    return null;
  }
};

/**
 * Process a deposit from blockchain to game balance with improved validation
 */
export const processDeposit = async (
  userId: string,
  walletAddress: string,
  amount: number,
  txHash: string
): Promise<{ success: boolean; message: string; newBalance?: number }> => {
  try {
    logger.info(`Processing deposit of ${amount} tokens for user ${userId}`);
    
    if (!userId || !walletAddress || !amount || !txHash) {
      throw new Error('Missing required parameters for deposit processing');
    }

    // Verify the transaction first
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

    // Get user's profile and update balance with retries
    const profileRef = db.collection('gameProfiles').doc(userId);
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
        message: 'Invalid profile data'
      };
    }

    // Update balance with retry logic
    let retries = 3;
    while (retries > 0) {
      try {
        const currentBalance = profile.balance?.SPIDER || 0;
        const newBalance = currentBalance + amount;
        
        await profileRef.update({
          'balance.SPIDER': newBalance,
          updatedAt: new Date()
        });

        // Record the transaction
        await db.collection('transactions').add({
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
        retries--;
        if (retries === 0) throw error;
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    throw new Error('Failed to process deposit after retries');
  } catch (error) {
    logger.error(`Error processing deposit for user ${userId}:`, error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Error processing deposit'
    };
  }
};