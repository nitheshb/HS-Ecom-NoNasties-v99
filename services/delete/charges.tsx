/**
 * Charges Delete Operations
 * 
 * This file contains all DELETE operations related to shipping rules and surge rules
 */

import { doc, deleteDoc } from 'firebase/firestore';
import { db } from '../../app/db';

// ============================================
// SHIPPING RULE DELETE OPERATIONS
// ============================================

/**
 * Delete shipping rule by ID
 */
export const deleteShippingRule = async (id: string) => {
  try {
    await deleteDoc(doc(db, 'shipping_rules', id));
    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
};

// ============================================
// SURGE RULE DELETE OPERATIONS
// ============================================

/**
 * Delete surge rule by ID
 */
export const deleteSurgeRule = async (id: string) => {
  try {
    await deleteDoc(doc(db, 'surge_rules', id));
    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
};

