import express from 'express';
import { logger } from '../utils/logger';
import { db } from '../config/firebase';

const router = express.Router();

/**
 * @route GET /api/players/:userId/profile
 * @desc Get a player's game profile
 * @access Private
 */
router.get('/:userId/profile', async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }
    
    const profileDoc = await db().collection('gameProfiles').doc(userId).get();
    
    if (!profileDoc.exists) {
      return res.status(404).json({
        success: false,
        message: 'Player profile not found'
      });
    }
    
    const profile = profileDoc.data();
    
    return res.status(200).json({
      success: true,
      profile: {
        id: profileDoc.id,
        ...profile
      }
    });
    
  } catch (error) {
    logger.error(`Error getting player profile:`, error);
    return res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

/**
 * @route GET /api/players/:userId/spiders
 * @desc Get all spiders owned by a player
 * @access Private
 */
router.get('/:userId/spiders', async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }
    
    const spidersSnapshot = await db()
      .collection('spiders')
      .where('ownerId', '==', userId)
      .get();
    
    const spiders = [];
    
    spidersSnapshot.forEach((doc) => {
      spiders.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return res.status(200).json({
      success: true,
      spiders
    });
    
  } catch (error) {
    logger.error(`Error getting player spiders:`, error);
    return res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

/**
 * @route POST /api/players/:userId/update-activity
 * @desc Update a player's last activity timestamp
 * @access Private
 */
router.post('/:userId/update-activity', async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }
    
    const now = new Date();
    
    await db().collection('gameProfiles').doc(userId).update({
      lastActivity: now.toISOString(),
      updatedAt: now
    });
    
    return res.status(200).json({
      success: true,
      message: 'Player activity updated'
    });
    
  } catch (error) {
    logger.error(`Error updating player activity:`, error);
    return res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

/**
 * @route GET /api/players/:userId/transactions
 * @desc Get a player's transaction history
 * @access Private
 */
router.get('/:userId/transactions', async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 10, offset = 0 } = req.query;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }
    
    const transactionsSnapshot = await db()
      .collection('transactions')
      .where('userId', '==', userId)
      .orderBy('createdAt', 'desc')
      .limit(parseInt(limit as string))
      .offset(parseInt(offset as string))
      .get();
    
    const transactions = [];
    
    transactionsSnapshot.forEach((doc) => {
      transactions.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return res.status(200).json({
      success: true,
      transactions
    });
    
  } catch (error) {
    logger.error(`Error getting player transactions:`, error);
    return res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

export default router; 