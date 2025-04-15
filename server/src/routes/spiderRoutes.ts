import express from 'express';
import { logger } from '../utils/logger';
import { feedSpider, hydrateSpider, healSpider } from '../services/spiderService';

const router = express.Router();

/**
 * @route POST /api/spiders/:spiderId/feed
 * @desc Feed a spider to increase hunger
 * @access Private
 */
router.post('/:spiderId/feed', async (req, res) => {
  try {
    const { spiderId } = req.params;
    const { amount } = req.body;
    
    if (!spiderId) {
      return res.status(400).json({
        success: false,
        message: 'Spider ID is required'
      });
    }
    
    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid amount is required'
      });
    }
    
    const result = await feedSpider(spiderId, amount);
    
    if (!result) {
      return res.status(400).json({
        success: false,
        message: 'Failed to feed spider'
      });
    }
    
    return res.status(200).json({
      success: true,
      message: `Spider ${spiderId} fed successfully`
    });
    
  } catch (error) {
    logger.error(`Error feeding spider:`, error);
    return res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

/**
 * @route POST /api/spiders/:spiderId/hydrate
 * @desc Hydrate a spider to increase hydration
 * @access Private
 */
router.post('/:spiderId/hydrate', async (req, res) => {
  try {
    const { spiderId } = req.params;
    const { amount } = req.body;
    
    if (!spiderId) {
      return res.status(400).json({
        success: false,
        message: 'Spider ID is required'
      });
    }
    
    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid amount is required'
      });
    }
    
    const result = await hydrateSpider(spiderId, amount);
    
    if (!result) {
      return res.status(400).json({
        success: false,
        message: 'Failed to hydrate spider'
      });
    }
    
    return res.status(200).json({
      success: true,
      message: `Spider ${spiderId} hydrated successfully`
    });
    
  } catch (error) {
    logger.error(`Error hydrating spider:`, error);
    return res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

/**
 * @route POST /api/spiders/:spiderId/heal
 * @desc Heal a spider to increase health
 * @access Private
 */
router.post('/:spiderId/heal', async (req, res) => {
  try {
    const { spiderId } = req.params;
    const { amount } = req.body;
    
    if (!spiderId) {
      return res.status(400).json({
        success: false,
        message: 'Spider ID is required'
      });
    }
    
    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid amount is required'
      });
    }
    
    const result = await healSpider(spiderId, amount);
    
    if (!result) {
      return res.status(400).json({
        success: false,
        message: 'Failed to heal spider'
      });
    }
    
    return res.status(200).json({
      success: true,
      message: `Spider ${spiderId} healed successfully`
    });
    
  } catch (error) {
    logger.error(`Error healing spider:`, error);
    return res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

export default router; 