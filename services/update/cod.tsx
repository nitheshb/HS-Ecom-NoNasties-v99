/**
 * COD (Cash on Delivery) Settings Update Operations
 * 
 * This file contains all UPDATE operations related to COD settings
 */

import { doc, setDoc } from 'firebase/firestore';
import { db } from '../../app/db';

// ============================================
// INTERFACES
// ============================================

export interface CODSettings {
  enabled: boolean;
  updated_at: string;
}

// ============================================
// CONSTANTS
// ============================================

const SETTINGS_COLLECTION = 'p_cod_settings';

// ============================================
// COD SETTINGS UPDATE OPERATIONS
// ============================================

/**
 * Update COD settings
 */
export const updateCODSettings = async (enabled: boolean): Promise<CODSettings> => {
  try {
    const settingsRef = doc(db, SETTINGS_COLLECTION, 'cod');
    const now = new Date().toISOString();
    
    const settingsData: CODSettings = {
      enabled,
      updated_at: now
    };
    
    await setDoc(settingsRef, settingsData);
    return settingsData;
  } catch (error) {
    console.error('Error updating COD settings:', error);
    throw error;
  }
};

