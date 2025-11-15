/**
 * Store Delete Operations
 * 
 * This file contains all DELETE operations related to stores
 */

import { doc, deleteDoc } from 'firebase/firestore';
import { db } from '../../app/db';

// ============================================
// STORE DELETE OPERATIONS
// ============================================

/**
 * Delete store by ID
 */
export const deleteStore = async (id: string) => {
  try {
    await deleteDoc(doc(db, 'p_store', id));
    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
};

