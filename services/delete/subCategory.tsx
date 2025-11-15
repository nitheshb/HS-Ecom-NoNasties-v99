/**
 * Sub-Category Delete Operations
 * 
 * This file contains all DELETE operations related to sub-categories
 */

import { doc, deleteDoc } from 'firebase/firestore';
import { db } from '../../app/db';

// ============================================
// SUB-CATEGORY DELETE OPERATIONS
// ============================================

/**
 * Delete sub-category(ies) - supports multiple deletion
 */
export const deleteSubCategory = async (params: Record<string, string | number | boolean>) => {
  const ids = Object.values(params);
  if (Array.isArray(ids)) {
    await Promise.all(
      ids.map(async (item) => {
        await deleteDoc(doc(db, 'p_subcategory', String(item)));
      })
    );
    return true;
  } else {
    throw new Error('Invalid parameter format for deletion');
  }
};

