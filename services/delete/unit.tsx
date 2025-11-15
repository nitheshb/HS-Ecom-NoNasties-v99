/**
 * Unit Delete Operations
 * 
 * This file contains all DELETE operations related to units
 */

import { doc, deleteDoc } from 'firebase/firestore';
import { db } from '../../app/db';

// ============================================
// UNIT DELETE OPERATIONS
// ============================================

/**
 * Delete unit(s) - supports single or multiple deletion
 */
export const deleteUnits = async (params: string[] | Record<string, string | number | boolean>) => {
  const ids = Array.isArray(params) ? params : Object.values(params);
  if (Array.isArray(ids)) {
    await Promise.all(
      ids.map(async (item) => {
        await deleteDoc(doc(db, 'T_unit', String(item)));
      })
    );
    return true;
  } else {
    throw new Error('Invalid parameter format for deletion');
  }
};

