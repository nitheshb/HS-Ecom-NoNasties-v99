/**
 * Payment Delete Operations
 * 
 * This file contains all DELETE operations related to payments:
 * - UPI settings deletion
 * - Facebook catalog deletion
 */

import { doc, deleteDoc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../app/db';

// ============================================
// CONSTANTS
// ============================================

const UPI_SETTINGS_COLLECTION = 'upi_id';
const UPI_SETTINGS_DOC_ID = 'upi';
const FACEBOOK_CATALOG_COLLECTION = 'facebook_catalog';
const FACEBOOK_CONFIG_DOC_ID = 'config';

// ============================================
// UPI SETTINGS DELETE OPERATIONS
// ============================================

/**
 * Delete UPI settings
 */
export const deleteUPISettings = async (): Promise<void> => {
  try {
    const upiSettingsRef = doc(db, UPI_SETTINGS_COLLECTION, UPI_SETTINGS_DOC_ID);
    await deleteDoc(upiSettingsRef);
  } catch (error) {
    console.error('Error deleting UPI settings:', error);
    throw new Error('Failed to delete UPI settings');
  }
};

// ============================================
// FACEBOOK CATALOG DELETE OPERATIONS
// ============================================

/**
 * Delete Facebook catalog entry
 */
export const deleteFacebookCatalog = async (catalogId: string): Promise<void> => {
  try {
    const configRef = doc(db, FACEBOOK_CATALOG_COLLECTION, FACEBOOK_CONFIG_DOC_ID);
    const configSnap = await getDoc(configRef);
    
    if (!configSnap.exists()) {
      return;
    }

    const data = configSnap.data();
    const catalogs = data.catalogs || {};
    
    // Remove the catalog from the map
    delete catalogs[catalogId];
    
    // Update the config document
    await setDoc(
      configRef,
      {
        catalogs,
        updated_at: new Date().toISOString()
      },
      { merge: true }
    );
  } catch (error) {
    console.error('Error deleting Facebook catalog:', error);
    throw new Error('Failed to delete Facebook catalog');
  }
};

