/**
 * Kitchen Delete Operations
 * 
 * This file contains all DELETE operations related to kitchens
 */

import { doc, deleteDoc } from 'firebase/firestore';
import { db } from '../../app/db';

// ============================================
// KITCHEN DELETE OPERATIONS
// ============================================

/**
 * Delete kitchen(s) - supports single or multiple deletion
 */
export const deleteKitchen = async (params: string[] | Record<string, string | number | boolean>) => {
  const ids = Array.isArray(params) ? params : Object.values(params);
  if (Array.isArray(ids)) {
    await Promise.all(
      ids.map(async (item) => {
        await deleteDoc(doc(db, 'T_kitchen', String(item)));
      })
    );
    return true;
  } else {
    throw new Error('Invalid parameter format for deletion');
  }
};

