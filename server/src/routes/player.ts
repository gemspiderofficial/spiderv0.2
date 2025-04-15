import express from 'express';
import Player from '../models/Player';
import Spider from '../models/Spider';
import { emitPlayerUpdate, emitSpiderUpdate } from '../services/websocket';

const router = express.Router();

// Get player profile
router.get('/:walletAddress', async (req, res) => {
  try {
    const { walletAddress } = req.params;
    const player = await Player.findOne({ walletAddress });
    
    if (!player) {
      return res.status(404).json({ error: 'Player not found' });
    }

    res.json(player);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch player profile' });
  }
});

// Create or update player
router.post('/', async (req, res) => {
  try {
    const { walletAddress, name } = req.body;
    
    let player = await Player.findOne({ walletAddress });
    
    if (player) {
      player.name = name;
      player.lastLogin = new Date();
    } else {
      player = new Player({
        walletAddress,
        name,
        balance: { SPIDER: 1000, feeders: 10 }, // Starting balance
      });
    }

    await player.save();
    emitPlayerUpdate(walletAddress, player);
    res.json(player);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update player' });
  }
});

// Get player's spiders
router.get('/:walletAddress/spiders', async (req, res) => {
  try {
    const { walletAddress } = req.params;
    const spiders = await Spider.find({ owner: walletAddress });
    res.json(spiders);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch player spiders' });
  }
});

// Feed spider
router.post('/:walletAddress/feed-spider/:spiderId', async (req, res) => {
  try {
    const { walletAddress, spiderId } = req.params;
    
    const player = await Player.findOne({ walletAddress });
    if (!player) {
      return res.status(404).json({ error: 'Player not found' });
    }

    if (player.balance.feeders <= 0) {
      return res.status(400).json({ error: 'No feeders available' });
    }

    const spider = await Spider.findOne({ uniqueId: spiderId, owner: walletAddress });
    if (!spider) {
      return res.status(404).json({ error: 'Spider not found or not owned by player' });
    }

    // Update spider condition
    spider.condition.hunger = Math.min(100, spider.condition.hunger + 25);
    spider.lastFed = new Date();
    await spider.save();

    // Deduct feeder
    player.balance.feeders--;
    await player.save();

    emitSpiderUpdate(walletAddress, spider);
    emitPlayerUpdate(walletAddress, player);

    res.json({ spider, player });
  } catch (error) {
    res.status(500).json({ error: 'Failed to feed spider' });
  }
});

// Collect web trap rewards
router.post('/:walletAddress/collect-webtrap', async (req, res) => {
  try {
    const { walletAddress } = req.params;
    const player = await Player.findOne({ walletAddress });
    
    if (!player) {
      return res.status(404).json({ error: 'Player not found' });
    }

    if (!player.webtrap.isUnlocked) {
      return res.status(400).json({ error: 'Web trap not unlocked' });
    }

    const now = new Date();
    const lastCollection = new Date(player.webtrap.lastCollection);
    const hoursSinceLastCollection = (now.getTime() - lastCollection.getTime()) / (1000 * 60 * 60);

    if (hoursSinceLastCollection < 24) {
      return res.status(400).json({ error: 'Web trap can only be collected once per day' });
    }

    // Calculate rewards based on web trap level
    const feedersReward = Math.floor(5 * player.webtrap.level);
    const spiderReward = Math.floor(10 * player.webtrap.level);

    // Update player
    player.balance.feeders += feedersReward;
    player.balance.SPIDER += spiderReward;
    player.webtrap.lastCollection = now;
    await player.save();

    emitPlayerUpdate(walletAddress, player);

    res.json({
      message: 'Web trap collected successfully',
      rewards: {
        feeders: feedersReward,
        SPIDER: spiderReward
      },
      player
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to collect web trap rewards' });
  }
});

// Upgrade web trap
router.post('/:walletAddress/upgrade-webtrap', async (req, res) => {
  try {
    const { walletAddress } = req.params;
    const player = await Player.findOne({ walletAddress });
    
    if (!player) {
      return res.status(404).json({ error: 'Player not found' });
    }

    if (!player.webtrap.isUnlocked) {
      if (player.balance.SPIDER < 1000) {
        return res.status(400).json({ error: 'Insufficient balance to unlock web trap' });
      }
      player.webtrap.isUnlocked = true;
      player.balance.SPIDER -= 1000;
    } else {
      const upgradeCost = 500 * player.webtrap.level;
      if (player.balance.SPIDER < upgradeCost) {
        return res.status(400).json({ error: 'Insufficient balance to upgrade web trap' });
      }
      player.balance.SPIDER -= upgradeCost;
      player.webtrap.level++;
    }

    await player.save();
    emitPlayerUpdate(walletAddress, player);

    res.json({
      message: player.webtrap.level === 1 ? 'Web trap unlocked' : 'Web trap upgraded',
      player
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to upgrade web trap' });
  }
});

export default router; 