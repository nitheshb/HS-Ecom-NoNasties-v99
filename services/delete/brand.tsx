/**
 * Brand Delete Operations
 * 
 * This file contains all DELETE operations related to brands
 */

import { doc, deleteDoc } from 'firebase/firestore';
import { db } from '../../app/db';

// ============================================
// BRAND DELETE OPERATIONS
// ============================================

/**
 * Delete brand(s) - supports single or multiple deletion
 */
export const deleteBrand = async (params: string[] | Record<string, string | number | boolean>) => {
  const ids = Array.isArray(params) ? params : Object.values(params);
  if (Array.isArray(ids)) {
    await Promise.all(
      ids.map(async (item) => {
        await deleteDoc(doc(db, 'P_brands', String(item)));
      })
    );
    return true;
  } else {
    throw new Error('Invalid parameter format for deletion');
  }
};

