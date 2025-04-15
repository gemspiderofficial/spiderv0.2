import * as admin from 'firebase-admin';
import dotenv from 'dotenv';
import { logger } from '../utils/logger';

dotenv.config();

/**
 * Initialize Firebase Admin SDK
 */
export const initializeFirebaseAdmin = (): void => {
  try {
    // Check if Firebase Admin is already initialized
    if (admin.apps.length === 0) {
      // Initialize with service account if provided
      if (process.env.FIREBASE_SERVICE_ACCOUNT) {
        const serviceAccount = JSON.parse(
          Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT, 'base64').toString()
        );
        
        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
          databaseURL: process.env.FIREBASE_DATABASE_URL,
        });
      } else {
        // Initialize with application default credentials
        admin.initializeApp({
          databaseURL: process.env.FIREBASE_DATABASE_URL,
        });
      }
      
      logger.info('Firebase Admin SDK initialized successfully');
    }
  } catch (error) {
    logger.error('Error initializing Firebase Admin SDK:', error);
    throw error;
  }
};

// Export Firebase services
export const db = () => admin.firestore();
export const auth = () => admin.auth();
export const realtimeDb = () => admin.database();
export const storage = () => admin.storage();

export default admin; 