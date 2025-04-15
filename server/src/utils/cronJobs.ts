import cron from 'node-cron';
import { logger } from './logger';
import { updateSpiderConditions } from '../services/spiderService';
import { generateTokensForAllPlayers } from '../services/tokenGenerationService';

/**
 * Setup all cron jobs for game mechanics
 */
export const setupCronJobs = (): void => {
  logger.info('Setting up cron jobs for game mechanics');
  
  // Update spider conditions (hunger, hydration, health) every 30 minutes
  cron.schedule('*/30 * * * *', async () => {
    try {
      logger.info('Running cron job: Update spider conditions');
      await updateSpiderConditions();
    } catch (error) {
      logger.error('Error in spider conditions cron job:', error);
    }
  });
  
  // Generate tokens for active players every hour
  cron.schedule('0 * * * *', async () => {
    try {
      logger.info('Running cron job: Generate tokens for active players');
      await generateTokensForAllPlayers(false); // false = only active players
    } catch (error) {
      logger.error('Error in token generation cron job:', error);
    }
  });
  
  // Generate tokens for offline players every 3 hours (at a reduced rate)
  cron.schedule('0 */3 * * *', async () => {
    try {
      logger.info('Running cron job: Generate tokens for offline players');
      await generateTokensForAllPlayers(true); // true = include offline players
    } catch (error) {
      logger.error('Error in offline token generation cron job:', error);
    }
  });
  
  // Daily maintenance tasks at midnight
  cron.schedule('0 0 * * *', async () => {
    try {
      logger.info('Running cron job: Daily maintenance tasks');
      // Add any daily maintenance tasks here
    } catch (error) {
      logger.error('Error in daily maintenance cron job:', error);
    }
  });
  
  logger.info('All cron jobs have been scheduled');
}; 