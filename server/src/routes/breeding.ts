import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import Spider from '../models/Spider';
import Player from '../models/Player';
import { emitSpiderUpdate, emitPlayerUpdate } from '../services/websocket';

const router = express.Router();

// Helper function to determine offspring genetics
const determineOffspringGenetics = (father: any, mother: any) => {
  const parentGenes = new Set([...father.genetics.split(''), ...mother.genetics.split('')]);
  const offspringGenes = Array.from(parentGenes).sort().join('');
  return offspringGenes;
};

// Helper function to calculate breeding cost
const getBreedingCost = (father: any, mother: any) => {
  const baseCost = 500;
  const rarityMultiplier = {
    'Common': 1,
    'Rare': 2,
    'Epic': 3,
    'Legendary': 4,
    'Mythical': 5
  };
  return baseCost * (rarityMultiplier[father.rarity] + rarityMultiplier[mother.rarity]) / 2;
};

// Helper function to determine offspring rarity
const determineOffspringRarity = (father: any, mother: any) => {
  const rarityLevels = ['Common', 'Rare', 'Epic', 'Legendary', 'Mythical'];
  const parentRarityIndex = Math.max(
    rarityLevels.indexOf(father.rarity),
    rarityLevels.indexOf(mother.rarity)
  );
  
  // 60% chance of parent's highest rarity, 30% chance of one level lower, 10% chance of one level higher
  const random = Math.random();
  if (random < 0.6) {
    return rarityLevels[parentRarityIndex];
  } else if (random < 0.9) {
    return rarityLevels[Math.max(0, parentRarityIndex - 1)];
  } else {
    return rarityLevels[Math.min(rarityLevels.length - 1, parentRarityIndex + 1)];
  }
};

// Check breeding compatibility
router.get('/compatibility/:spiderId1/:spiderId2', async (req, res) => {
  try {
    const { spiderId1, spiderId2 } = req.params;
    const [spider1, spider2] = await Promise.all([
      Spider.findOne({ uniqueId: spiderId1 }),
      Spider.findOne({ uniqueId: spiderId2 })
    ]);

    if (!spider1 || !spider2) {
      return res.status(404).json({ error: 'One or both spiders not found' });
    }

    // Check basic breeding requirements
    const compatible = (
      spider1.gender !== spider2.gender && // Different genders
      !spider1.isListed && !spider2.isListed && // Not listed on market
      spider1.condition.health > 50 && spider2.condition.health > 50 && // Healthy
      spider1.condition.hunger > 50 && spider2.condition.hunger > 50 // Well fed
    );

    const cost = getBreedingCost(spider1, spider2);

    res.json({
      compatible,
      cost,
      reasons: !compatible ? [
        spider1.gender === spider2.gender ? 'Same gender' : null,
        spider1.isListed || spider2.isListed ? 'Spider(s) listed on market' : null,
        spider1.condition.health <= 50 || spider2.condition.health <= 50 ? 'Spider(s) unhealthy' : null,
        spider1.condition.hunger <= 50 || spider2.condition.hunger <= 50 ? 'Spider(s) hungry' : null
      ].filter(Boolean) : []
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to check breeding compatibility' });
  }
});

// Breed spiders
router.post('/breed', async (req, res) => {
  try {
    const { walletAddress, spiderId1, spiderId2, name } = req.body;

    // Get parent spiders and player
    const [spider1, spider2, player] = await Promise.all([
      Spider.findOne({ uniqueId: spiderId1, owner: walletAddress }),
      Spider.findOne({ uniqueId: spiderId2, owner: walletAddress }),
      Player.findOne({ walletAddress })
    ]);

    if (!spider1 || !spider2 || !player) {
      return res.status(404).json({ error: 'Spiders or player not found' });
    }

    // Validate breeding conditions
    if (spider1.gender === spider2.gender) {
      return res.status(400).json({ error: 'Spiders must be of opposite genders' });
    }

    if (spider1.isListed || spider2.isListed) {
      return res.status(400).json({ error: 'Cannot breed listed spiders' });
    }

    if (spider1.condition.health <= 50 || spider2.condition.health <= 50) {
      return res.status(400).json({ error: 'Both spiders must be healthy' });
    }

    if (spider1.condition.hunger <= 50 || spider2.condition.hunger <= 50) {
      return res.status(400).json({ error: 'Both spiders must be well fed' });
    }

    // Calculate and validate breeding cost
    const breedingCost = getBreedingCost(spider1, spider2);
    if (player.balance.SPIDER < breedingCost) {
      return res.status(400).json({ error: 'Insufficient balance for breeding' });
    }

    // Create offspring
    const father = spider1.gender === 'Male' ? spider1 : spider2;
    const mother = spider1.gender === 'Female' ? spider1 : spider2;

    const offspring = new Spider({
      uniqueId: uuidv4(),
      name: name || `Baby Spider #${Date.now()}`,
      rarity: determineOffspringRarity(father, mother),
      genetics: determineOffspringGenetics(father, mother),
      gender: Math.random() < 0.5 ? 'Male' : 'Female',
      generation: Math.max(father.generation, mother.generation) + 1,
      parents: {
        father: father.uniqueId,
        mother: mother.uniqueId
      },
      owner: walletAddress,
      stats: {
        attack: Math.floor((father.stats.attack + mother.stats.attack) * 0.6),
        defense: Math.floor((father.stats.defense + mother.stats.defense) * 0.6),
        agility: Math.floor((father.stats.agility + mother.stats.agility) * 0.6),
        luck: Math.floor((father.stats.luck + mother.stats.luck) * 0.6)
      }
    });

    // Update parent spiders
    father.condition.health -= 20;
    mother.condition.health -= 20;
    father.condition.hunger -= 30;
    mother.condition.hunger -= 30;

    // Update player balance
    player.balance.SPIDER -= breedingCost;

    // Save all changes
    await Promise.all([
      offspring.save(),
      father.save(),
      mother.save(),
      player.save()
    ]);

    // Emit updates
    emitSpiderUpdate(walletAddress, father);
    emitSpiderUpdate(walletAddress, mother);
    emitSpiderUpdate(walletAddress, offspring);
    emitPlayerUpdate(walletAddress, player);

    res.json({
      message: 'Breeding successful',
      offspring,
      parents: {
        father,
        mother
      },
      cost: breedingCost
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to breed spiders' });
  }
});

export default router; 