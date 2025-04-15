import { Spider, Player } from '../types/spider';
import { RARITY_LEVELS, FEEDER_CONSUMPTION, EXP_REQUIREMENTS, POWER_RANGES, COMBAT_STAT_INCREASE_PER_LEVEL } from '../constants/game';

// Constants
const TOKEN_GENERATION_RATE = 0.1; // Tokens generated per power point per hour
const BASE_XP_PER_FEED = 1; // Each feed counts as exactly 1 feed
const XP_PER_HYDRATE = 1; // Each hydration counts as exactly 1 feed
const HUNGER_DECREASE_RATE = 0.0231; // % per minute (100% in 72 hours)
const HYDRATION_DECREASE_RATE = 0.0231; // % per minute (100% in 72 hours)
const HEALTH_DECREASE_RATE = 0.0231; // % per minute (100% in 72 hours)

// Helper: Get feeders needed based on level
export const getFeedersNeeded = (level: number): number => {
  if (level <= 10) return FEEDER_CONSUMPTION['1-10'];
  if (level <= 20) return FEEDER_CONSUMPTION['11-20'];
  if (level <= 25) return FEEDER_CONSUMPTION['21-25'];
  if (level <= 30) return FEEDER_CONSUMPTION['26-30'];
  if (level <= 45) return FEEDER_CONSUMPTION['31-45'];
  if (level <= 60) return FEEDER_CONSUMPTION['46-60'];
  if (level <= 80) return FEEDER_CONSUMPTION['61-80'];
  return FEEDER_CONSUMPTION['81-100']; // Level 81-100
};

// Helper: Get feeding cost based on level - now using the same values as feeder consumption
export const getFeedingCost = (level: number): number => {
  if (level <= 10) return FEEDER_CONSUMPTION['1-10'];
  if (level <= 20) return FEEDER_CONSUMPTION['11-20'];
  if (level <= 25) return FEEDER_CONSUMPTION['21-25'];
  if (level <= 30) return FEEDER_CONSUMPTION['26-30'];
  if (level <= 45) return FEEDER_CONSUMPTION['31-45'];
  if (level <= 60) return FEEDER_CONSUMPTION['46-60'];
  if (level <= 80) return FEEDER_CONSUMPTION['61-80'];
  return FEEDER_CONSUMPTION['81-100']; // Level 81-100
};

// Helper: Get experience needed for next level based on current level
export const getExpRequiredForLevel = (level: number): number => {
  if (level <= 4) return EXP_REQUIREMENTS['1-4'];
  if (level <= 10) return EXP_REQUIREMENTS['5-10'];
  if (level <= 20) return EXP_REQUIREMENTS['11-20'];
  if (level <= 30) return EXP_REQUIREMENTS['21-30'];
  if (level <= 40) return EXP_REQUIREMENTS['31-40'];
  if (level <= 50) return EXP_REQUIREMENTS['41-50'];
  if (level <= 60) return EXP_REQUIREMENTS['51-60'];
  if (level <= 70) return EXP_REQUIREMENTS['61-70'];
  if (level <= 80) return EXP_REQUIREMENTS['71-80'];
  if (level <= 90) return EXP_REQUIREMENTS['81-90'];
  return EXP_REQUIREMENTS['91-100']; // Level 91-100
};

// Helper: Calculate experience needed for the current level
export const experienceForCurrentLevel = (level: number): number => {
  if (level <= 1) return 0;
  
  let totalExp = 0;
  for (let i = 1; i < level; i++) {
    totalExp += getExpRequiredForLevel(i);
  }
  
  return totalExp;
};

// Helper: Calculate experience needed for next level
export const experienceForNextLevel = (level: number): number => {
  return experienceForCurrentLevel(level) + getExpRequiredForLevel(level);
};

// Helper: Check if spider can level up based on rarity
export const canLevelUp = (spider: Spider): boolean => {
  const maxLevel = RARITY_LEVELS[spider.rarity];
  return spider.level < maxLevel;
};

// Helper: Calculate level from experience
export const calculateLevel = (experience: number): number => {
  let level = 1;
  let totalExpNeeded = 0;
  
  while (level <= 100) {
    const expForThisLevel = getExpRequiredForLevel(level);
    totalExpNeeded += expForThisLevel;
    
    if (experience < totalExpNeeded) {
      return level;
    }
    
    level++;
  }
  
  return 100; // Cap at level 100
};

// Helper: Calculate power increase for level up based on rarity
export const calculatePowerIncrease = (rarity: string): number => {
  const powerRange = POWER_RANGES[rarity as keyof typeof POWER_RANGES];
  if (!powerRange) return POWER_RANGES.Common.min; // Fallback to Common minimum if rarity not found
  
  // Use the rarity's power range directly for the increase
  return Math.floor(Math.random() * (powerRange.max - powerRange.min + 1)) + powerRange.min;
};

// Helper: Calculate stat increases for level up based on rarity
export const calculateStatIncrease = (rarity: string): { health: number; hunger: number; hydration: number } => {
  const statIncrease = STAT_INCREASE_PER_LEVEL[rarity as keyof typeof STAT_INCREASE_PER_LEVEL];
  if (!statIncrease) return STAT_INCREASE_PER_LEVEL.Common; // Fallback to Common if rarity not found
  
  return statIncrease;
};

// Helper: Calculate combat stat increase based on power increase
export const calculateCombatStatIncrease = (powerIncrease: number): { attack: number; defense: number; agility: number; luck: number } => {
  // Generate random weights for each stat
  const weights = {
    attack: Math.random(),
    defense: Math.random(),
    agility: Math.random(),
    luck: Math.random(),
  };
  
  // Calculate total weight
  const totalWeight = weights.attack + weights.defense + weights.agility + weights.luck;
  
  // Distribute power proportionally based on weights
  const stats = {
    attack: Math.floor((weights.attack / totalWeight) * powerIncrease),
    defense: Math.floor((weights.defense / totalWeight) * powerIncrease),
    agility: Math.floor((weights.agility / totalWeight) * powerIncrease),
    luck: Math.floor((weights.luck / totalWeight) * powerIncrease),
  };
  
  // Add any remaining power due to rounding to a random stat
  const distributedPower = stats.attack + stats.defense + stats.agility + stats.luck;
  const remaining = powerIncrease - distributedPower;
  
  if (remaining > 0) {
    const stats_array = ['attack', 'defense', 'agility', 'luck'] as const;
    const randomStat = stats_array[Math.floor(Math.random() * stats_array.length)];
    stats[randomStat] += remaining;
  }
  
  return stats;
};

// Core System: Update spider condition based on time elapsed
export const updateSpiderCondition = (spider: Spider): Spider => {
  const now = new Date();
  const lastUpdate = new Date(Math.max(
    new Date(spider.lastFed).getTime(),
    new Date(spider.lastHydrated).getTime()
  ));
  
  const minutesElapsed = (now.getTime() - lastUpdate.getTime()) / (1000 * 60);
  
  // Calculate new hunger and hydration values
  const newHunger = Math.max(0, spider.condition.hunger - (HUNGER_DECREASE_RATE * minutesElapsed));
  const newHydration = Math.max(0, spider.condition.hydration - (HYDRATION_DECREASE_RATE * minutesElapsed));
  
  // Only decrease health if BOTH hunger and hydration are at 0
  let newHealth = spider.condition.health;
  if (newHunger === 0 && newHydration === 0) {
    newHealth = Math.max(0, newHealth - (HEALTH_DECREASE_RATE * minutesElapsed));
  }
  
  return {
    ...spider,
    condition: {
      health: newHealth,
      hunger: newHunger,
      hydration: newHydration
    },
    isAlive: newHealth > 0
  };
};

// Core System: Feed a spider
export const feedSpider = (spider: Spider, availableFeeders: number): Spider | null => {
  const feedersNeeded = getFeedingCost(spider.level);
  if (availableFeeders < feedersNeeded) {
    return null;
  }

  // Check if spider can level up based on rarity
  if (!canLevelUp(spider) && spider.level >= RARITY_LEVELS[spider.rarity]) {
    // Still allow feeding for hunger but no XP gain
    return {
      ...spider,
      condition: {
        ...spider.condition,
        hunger: Math.min(100, spider.condition.hunger + 20),
      },
      lastFed: new Date().toISOString(),
    };
  }

  // Each feed counts as 1 full feed toward level up
  const xpGained = BASE_XP_PER_FEED;
  const newExperience = spider.experience + xpGained;
  const newLevel = calculateLevel(newExperience);
  
  // Calculate power and combat stat increases if the spider leveled up
  let newPower = spider.power;
  let newStats = { ...spider.stats };
  
  if (newLevel > spider.level) {
    // Add power and combat stats for each level gained
    for (let i = 0; i < newLevel - spider.level; i++) {
      // Calculate power increase first
      const powerIncrease = calculatePowerIncrease(spider.rarity);
      newPower += powerIncrease;
      
      // Calculate combat stat increases based on power increase
      const combatStatIncrease = calculateCombatStatIncrease(powerIncrease);
      
      // Increase combat stats based on power increase
      newStats.attack += combatStatIncrease.attack;
      newStats.defense += combatStatIncrease.defense;
      newStats.agility += combatStatIncrease.agility;
      newStats.luck += combatStatIncrease.luck;
    }
  }

  return {
    ...spider,
    condition: {
      ...spider.condition,
      hunger: Math.min(100, spider.condition.hunger + 20), // Increase hunger by 20%
    },
    stats: newStats,
    experience: newExperience,
    level: Math.min(newLevel, RARITY_LEVELS[spider.rarity]), // Cap level based on rarity
    power: newPower,
    lastFed: new Date().toISOString(),
  };
};

// Core System: Hydrate a spider
export const hydrateSpider = (spider: Spider): Spider => {
  // Check if spider can level up based on rarity
  if (!canLevelUp(spider) && spider.level >= RARITY_LEVELS[spider.rarity]) {
    // Still allow hydration for thirst but no XP gain
    return {
      ...spider,
      condition: {
        ...spider.condition,
        hydration: Math.min(100, spider.condition.hydration + 20),
      },
      lastHydrated: new Date().toISOString(),
    };
  }

  // Each hydration counts as 1 full feed toward level up
  const xpGained = XP_PER_HYDRATE;
  const newExperience = spider.experience + xpGained;
  const newLevel = calculateLevel(newExperience);
  
  // Calculate power and combat stat increases if the spider leveled up
  let newPower = spider.power;
  let newStats = { ...spider.stats };
  
  if (newLevel > spider.level) {
    // Add power and combat stats for each level gained
    for (let i = 0; i < newLevel - spider.level; i++) {
      // Calculate power increase first
      const powerIncrease = calculatePowerIncrease(spider.rarity);
      newPower += powerIncrease;
      
      // Calculate combat stat increases based on power increase
      const combatStatIncrease = calculateCombatStatIncrease(powerIncrease);
      
      // Increase combat stats based on power increase
      newStats.attack += combatStatIncrease.attack;
      newStats.defense += combatStatIncrease.defense;
      newStats.agility += combatStatIncrease.agility;
      newStats.luck += combatStatIncrease.luck;
    }
  }

  return {
    ...spider,
    condition: {
      ...spider.condition,
      hydration: Math.min(100, spider.condition.hydration + 20), // Increase hydration by 20%
    },
    stats: newStats,
    experience: newExperience,
    level: Math.min(newLevel, RARITY_LEVELS[spider.rarity]), // Cap level based on rarity
    power: newPower,
    lastHydrated: new Date().toISOString(),
  };
};

// Core System: Calculate tokens generated by a spider
export const calculateTokensGenerated = (spider: Spider): number => {
  if (spider.isHibernating) {
    return 0; // No tokens generated during hibernation
  }

  const now = new Date();
  const lastGenerationTime = new Date(spider.lastTokenGeneration);
  const timeElapsed = (now.getTime() - lastGenerationTime.getTime()) / (1000 * 60 * 60); // Time in hours

  const tokensGenerated = spider.power * TOKEN_GENERATION_RATE * timeElapsed;
  return Math.floor(tokensGenerated * 100) / 100; // Round to 2 decimal places
};

// Core System: Update player tokens based on all spiders
export const updatePlayerTokens = (player: Player): Player => {
  let totalTokensGenerated = 0;

  // Check if player.spiders exists and has items
  if (!player.spiders || player.spiders.length === 0) {
    // Return player unchanged if there are no spiders
    return player;
  }

  const updatedSpiders = player.spiders.map((spider) => {
    const tokensGenerated = calculateTokensGenerated(spider);
    totalTokensGenerated += tokensGenerated;

    // Update spider condition while we're at it
    const updatedSpider = updateSpiderCondition(spider);

    return {
      ...updatedSpider,
      lastTokenGeneration: new Date().toISOString(),
    };
  });

  return {
    ...player,
    balance: {
      ...player.balance,
      SPIDER: Math.floor((player.balance.SPIDER + totalTokensGenerated) * 100) / 100,
    },
    spiders: updatedSpiders,
  };
};