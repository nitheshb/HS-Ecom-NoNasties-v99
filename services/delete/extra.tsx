/**
 * Extra Groups and Values Delete Operations
 * 
 * This file contains all DELETE operations related to extra groups and extra values
 */

import { doc, deleteDoc } from 'firebase/firestore';
import { db } from '../../app/db';

// ============================================
// EXTRA GROUP DELETE OPERATIONS
// ============================================

/**
 * Delete extra group(s) - supports multiple deletion
 */
export const deleteExtraGroup = async (params: Record<string, string | number | boolean>) => {
  const ids = Object.values(params);
  if (Array.isArray(ids)) {
    try {
      await Promise.all(
        ids.map(async (item) => {
          await deleteDoc(doc(db, 'T_extra_groups', String(item)));
        })
      );
      return { success: true };
    } catch (error) {
      return { success: false, error };
    }
  } else {
    return { success: false, error: 'Invalid params' };
  }
};

// ============================================
// EXTRA VALUE DELETE OPERATIONS
// ============================================

/**
 * Delete extra value(s) - supports multiple deletion
 */
export const deleteExtraValue = async (params: Record<string, string | number | boolean>) => {
  const ids = Object.values(params);
  if (Array.isArray(ids)) {
    try {
      await Promise.all(
        ids.map(async (item) => {
          await deleteDoc(doc(db, 'T_extra_values', String(item)));
        })
      );
      return { success: true };
    } catch (error) {
      return { success: false, error };
    }
  } else {
    return { success: false, error: 'Invalid params' };
  }
};

