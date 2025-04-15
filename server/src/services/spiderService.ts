import { db } from '../config/firebase';
import { logger } from '../utils/logger';

// Constants for condition decrease rates
const HUNGER_DECREASE_RATE = 5; // Decrease by 5 points every update
const HYDRATION_DECREASE_RATE = 7; // Decrease by 7 points every update
const HEALTH_DECREASE_THRESHOLD = 20; // Start decreasing health when hunger or hydration below 20
const HEALTH_DECREASE_RATE = 3; // Decrease health by 3 points when conditions are met

/**
 * Update conditions (hunger, hydration, health) for all spiders
 * This is called by the cron job
 */
export const updateSpiderConditions = async (): Promise<void> => {
  try {
    logger.info('Updating conditions for all spiders');
    
    // Get all active spiders (not hibernating and alive)
    const spidersSnapshot = await db()
      .collection('spiders')
      .where('isHibernating', '==', false)
      .where('isAlive', '==', true)
      .get();
    
    if (spidersSnapshot.empty) {
      logger.info('No active spiders found to update conditions');
      return;
    }
    
    const batch = db().batch();
    let updatedCount = 0;
    
    spidersSnapshot.forEach((doc) => {
      const spider = doc.data();
      const spiderRef = doc.ref;
      
      // Calculate new condition values
      let newHunger = Math.max(0, spider.condition.hunger - HUNGER_DECREASE_RATE);
      let newHydration = Math.max(0, spider.condition.hydration - HYDRATION_DECREASE_RATE);
      let newHealth = spider.condition.health;
      
      // Decrease health if hunger or hydration is below threshold
      if (newHunger < HEALTH_DECREASE_THRESHOLD || newHydration < HEALTH_DECREASE_THRESHOLD) {
        newHealth = Math.max(0, newHealth - HEALTH_DECREASE_RATE);
      }
      
      // Check if spider has died
      const isAlive = newHealth > 0;
      
      // Update the spider document
      batch.update(spiderRef, {
        'condition.hunger': newHunger,
        'condition.hydration': newHydration,
        'condition.health': newHealth,
        isAlive: isAlive,
        updatedAt: new Date()
      });
      
      updatedCount++;
      
      // If spider died, log it
      if (!isAlive && spider.isAlive) {
        logger.info(`Spider ${doc.id} (${spider.name}) has died due to neglect`);
      }
    });
    
    // Commit the batch update
    await batch.commit();
    logger.info(`Updated conditions for ${updatedCount} spiders`);
    
  } catch (error) {
    logger.error('Error updating spider conditions:', error);
    throw error;
  }
};

/**
 * Feed a spider to increase its hunger level
 * @param spiderId The ID of the spider to feed
 * @param amount The amount to increase hunger by
 */
export const feedSpider = async (spiderId: string, amount: number): Promise<boolean> => {
  try {
    const spiderRef = db().collection('spiders').doc(spiderId);
    const spiderDoc = await spiderRef.get();
    
    if (!spiderDoc.exists) {
      logger.error(`Spider ${spiderId} not found`);
      return false;
    }
    
    const spider = spiderDoc.data();
    
    if (!spider) {
      logger.error(`Spider ${spiderId} data is null`);
      return false;
    }
    
    if (!spider.isAlive) {
      logger.error(`Cannot feed spider ${spiderId} because it is not alive`);
      return false;
    }
    
    // Calculate new hunger value (max 100)
    const newHunger = Math.min(100, spider.condition.hunger + amount);
    
    // Update the spider
    await spiderRef.update({
      'condition.hunger': newHunger,
      lastFed: new Date().toISOString(),
      updatedAt: new Date()
    });
    
    logger.info(`Fed spider ${spiderId}, hunger increased by ${amount} to ${newHunger}`);
    return true;
    
  } catch (error) {
    logger.error(`Error feeding spider ${spiderId}:`, error);
    return false;
  }
};

/**
 * Hydrate a spider to increase its hydration level
 * @param spiderId The ID of the spider to hydrate
 * @param amount The amount to increase hydration by
 */
export const hydrateSpider = async (spiderId: string, amount: number): Promise<boolean> => {
  try {
    const spiderRef = db().collection('spiders').doc(spiderId);
    const spiderDoc = await spiderRef.get();
    
    if (!spiderDoc.exists) {
      logger.error(`Spider ${spiderId} not found`);
      return false;
    }
    
    const spider = spiderDoc.data();
    
    if (!spider) {
      logger.error(`Spider ${spiderId} data is null`);
      return false;
    }
    
    if (!spider.isAlive) {
      logger.error(`Cannot hydrate spider ${spiderId} because it is not alive`);
      return false;
    }
    
    // Calculate new hydration value (max 100)
    const newHydration = Math.min(100, spider.condition.hydration + amount);
    
    // Update the spider
    await spiderRef.update({
      'condition.hydration': newHydration,
      lastHydrated: new Date().toISOString(),
      updatedAt: new Date()
    });
    
    logger.info(`Hydrated spider ${spiderId}, hydration increased by ${amount} to ${newHydration}`);
    return true;
    
  } catch (error) {
    logger.error(`Error hydrating spider ${spiderId}:`, error);
    return false;
  }
};

/**
 * Heal a spider to increase its health level
 * @param spiderId The ID of the spider to heal
 * @param amount The amount to increase health by
 */
export const healSpider = async (spiderId: string, amount: number): Promise<boolean> => {
  try {
    const spiderRef = db().collection('spiders').doc(spiderId);
    const spiderDoc = await spiderRef.get();
    
    if (!spiderDoc.exists) {
      logger.error(`Spider ${spiderId} not found`);
      return false;
    }
    
    const spider = spiderDoc.data();
    
    if (!spider) {
      logger.error(`Spider ${spiderId} data is null`);
      return false;
    }
    
    if (!spider.isAlive) {
      logger.error(`Cannot heal spider ${spiderId} because it is not alive`);
      return false;
    }
    
    // Calculate new health value (max 100)
    const newHealth = Math.min(100, spider.condition.health + amount);
    
    // Update the spider
    await spiderRef.update({
      'condition.health': newHealth,
      updatedAt: new Date()
    });
    
    logger.info(`Healed spider ${spiderId}, health increased by ${amount} to ${newHealth}`);
    return true;
    
  } catch (error) {
    logger.error(`Error healing spider ${spiderId}:`, error);
    return false;
  }
}; 