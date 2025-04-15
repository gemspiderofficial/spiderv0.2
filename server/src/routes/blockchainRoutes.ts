import express from 'express';
import { verifyTransaction, fetchTokenBalance, processDeposit } from '../services/blockchainService';
import { logger } from '../utils/logger';

const router = express.Router();

/**
 * @route GET /api/blockchain/balance/:walletAddress
 * @desc Get token balance for a wallet address
 * @access Public
 */
router.get('/balance/:walletAddress', async (req, res) => {
  try {
    const { walletAddress } = req.params;
    
    if (!walletAddress) {
      return res.status(400).json({ 
        success: false, 
        message: 'Wallet address is required' 
      });
    }
    
    const balance = await fetchTokenBalance(walletAddress);
    
    if (balance === null) {
      return res.status(500).json({ 
        success: false, 
        message: 'Error fetching balance' 
      });
    }
    
    return res.status(200).json({ 
      success: true, 
      balance 
    });
    
  } catch (error) {
    logger.error('Error in balance endpoint:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

/**
 * @route POST /api/blockchain/verify-transaction
 * @desc Verify a blockchain transaction
 * @access Public
 */
router.post('/verify-transaction', async (req, res) => {
  try {
    const { txHash, expectedAmount, expectedSender, expectedReceiver } = req.body;
    
    if (!txHash || !expectedAmount) {
      return res.status(400).json({ 
        success: false, 
        message: 'Transaction hash and expected amount are required' 
      });
    }
    
    const verification = await verifyTransaction(
      txHash,
      expectedAmount,
      expectedSender,
      expectedReceiver
    );
    
    return res.status(verification.verified ? 200 : 400).json({
      success: verification.verified,
      message: verification.message,
      data: verification.data
    });
    
  } catch (error) {
    logger.error('Error in verify-transaction endpoint:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

/**
 * @route POST /api/blockchain/deposit
 * @desc Process a deposit from blockchain to game balance
 * @access Private
 */
router.post('/deposit', async (req, res) => {
  try {
    const { userId, walletAddress, amount, txHash } = req.body;
    
    if (!userId || !walletAddress || !amount || !txHash) {
      return res.status(400).json({ 
        success: false, 
        message: 'User ID, wallet address, amount, and transaction hash are required' 
      });
    }
    
    const result = await processDeposit(userId, walletAddress, amount, txHash);
    
    return res.status(result.success ? 200 : 400).json(result);
    
  } catch (error) {
    logger.error('Error in deposit endpoint:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

export default router; 