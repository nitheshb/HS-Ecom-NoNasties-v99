/**
 * Status Delete Operations
 * 
 * This file contains all DELETE operations related to statuses
 */

import { doc, deleteDoc } from 'firebase/firestore';
import { db } from '../../app/db';

// ============================================
// STATUS DELETE OPERATIONS
// ============================================

/**
 * Delete status by ID
 */
export const deleteStatus = async (id: string) => {
  try {
    await deleteDoc(doc(db, 'T_Status', id));
    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
};

