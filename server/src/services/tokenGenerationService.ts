import { db } from '../config/firebase';
import { logger } from '../utils/logger';

// Constants for token generation
const BASE_GENERATION_RATE = 10; // Base tokens per hour for a common spider
const RARITY_MULTIPLIERS = {
  'Common': 1,
  'Rare': 1.5,
  'Epic': 2.5,
  'Legendary': 4,
  'Mythical': 6
};
const OFFLINE_GENERATION_PENALTY = 0.5; // Offline players get 50% of normal generation rate
const MAX_OFFLINE_HOURS = 24; // Maximum hours of offline generation (24 hours)

/**
 * Generate tokens for all players
 * @param includeOffline Whether to include offline players
 */
export const generateTokensForAllPlayers = async (includeOffline: boolean): Promise<void> => {
  try {
    logger.info(`Generating tokens for ${includeOffline ? 'all' : 'active'} players`);
    
    // Get all active spiders
    const spidersSnapshot = await db()
      .collection('spiders')
      .where('isAlive', '==', true)
      .get();
    
    if (spidersSnapshot.empty) {
      logger.info('No active spiders found for token generation');
      return;
    }
    
    // Group spiders by owner
    const spidersByOwner: Record<string, any[]> = {};
    
    spidersSnapshot.forEach((doc) => {
      const spider = doc.data();
      if (!spidersByOwner[spider.ownerId]) {
        spidersByOwner[spider.ownerId] = [];
      }
      spidersByOwner[spider.ownerId].push({
        id: doc.id,
        ...spider
      });
    });
    
    // Process each owner's spiders
    const now = new Date();
    const batch = db().batch();
    let totalTokensGenerated = 0;
    let playersUpdated = 0;
    
    for (const [ownerId, spiders] of Object.entries(spidersByOwner)) {
      // Get player's last activity
      const playerDoc = await db().collection('gameProfiles').doc(ownerId).get();
      
      if (!playerDoc.exists) {
        logger.warn(`Player ${ownerId} not found but has spiders`);
        continue;
      }
      
      const player = playerDoc.data();
      if (!player) continue;
      
      // Check if player is offline and if we should process them
      const lastActivity = player.lastActivity ? new Date(player.lastActivity) : new Date(0);
      const isOffline = now.getTime() - lastActivity.getTime() > 15 * 60 * 1000; // 15 minutes
      
      if (isOffline && !includeOffline) {
        // Skip offline players if we're only processing active ones
        continue;
      }
      
      // Calculate tokens for each spider
      let tokensToAdd = 0;
      
      for (const spider of spiders) {
        // Skip hibernating spiders
        if (spider.isHibernating) continue;
        
        // Calculate base generation based on rarity
        const rarityMultiplier = RARITY_MULTIPLIERS[spider.rarity as keyof typeof RARITY_MULTIPLIERS] || 1;
        let spiderGeneration = BASE_GENERATION_RATE * rarityMultiplier;
        
        // Apply offline penalty if applicable
        if (isOffline) {
          spiderGeneration *= OFFLINE_GENERATION_PENALTY;
          
          // Limit offline generation based on time since last activity
          const hoursSinceLastActivity = Math.min(
            MAX_OFFLINE_HOURS,
            (now.getTime() - lastActivity.getTime()) / (1000 * 60 * 60)
          );
          
          // Adjust generation based on time offline (only for offline batch)
          if (includeOffline) {
            spiderGeneration *= (hoursSinceLastActivity / 3); // Divide by 3 because we run every 3 hours
          }
        }
        
        // Add to total
        tokensToAdd += spiderGeneration;
        
        // Update spider's last token generation timestamp
        batch.update(db().collection('spiders').doc(spider.id), {
          lastTokenGeneration: now.toISOString(),
          updatedAt: now
        });
      }
      
      // Round tokens to nearest integer
      tokensToAdd = Math.round(tokensToAdd);
      
      if (tokensToAdd > 0) {
        // Update player's balance
        batch.update(db().collection('gameProfiles').doc(ownerId), {
          'balance.SPIDER': player.balance.SPIDER + tokensToAdd,
          updatedAt: now
        });
        
        // Add to transaction history
        batch.set(db().collection('transactions').doc(), {
          userId: ownerId,
          type: 'generation',
          amount: tokensToAdd,
          description: `Token generation from ${spiders.length} spiders (${isOffline ? 'offline' : 'active'})`,
          createdAt: now,
          updatedAt: now
        });
        
        totalTokensGenerated += tokensToAdd;
        playersUpdated++;
      }
    }
    
    // Commit all updates
    await batch.commit();
    
    logger.info(`Generated ${totalTokensGenerated} tokens for ${playersUpdated} players`);
    
  } catch (error) {
    logger.error('Error generating tokens:', error);
    throw error;
  }
}; 