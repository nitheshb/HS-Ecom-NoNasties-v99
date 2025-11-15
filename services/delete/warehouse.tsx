/**
 * Warehouse Delete Operations
 * 
 * This file contains all DELETE operations related to warehouses
 */

import { doc, deleteDoc } from 'firebase/firestore';
import { db } from '../../app/db';

// ============================================
// WAREHOUSE DELETE OPERATIONS
// ============================================

/**
 * Delete warehouse by ID
 */
export const deleteWarehouse = async (id: string) => {
  try {
    await deleteDoc(doc(db, 'p_warehouse', id));
    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
};

