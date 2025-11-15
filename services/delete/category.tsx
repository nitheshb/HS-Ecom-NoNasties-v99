/**
 * Category Delete Operations
 * 
 * This file contains all DELETE operations related to categories
 */

import { doc, deleteDoc } from 'firebase/firestore';
import { db } from '../../app/db';

// ============================================
// CATEGORY DELETE OPERATIONS
// ============================================

/**
 * Delete category(ies) - supports multiple deletion
 */
export const deleteCategory = async (params: Record<string, string | number | boolean>) => {
  const ids = Object.values(params);
  if (Array.isArray(ids)) {
    await Promise.all(
      ids.map(async (item) => {
        await deleteDoc(doc(db, 'p_category', String(item)));
      })
    );
    return true;
  } else {
    throw new Error('Invalid parameter format for deletion');
  }
};

