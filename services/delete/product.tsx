/**
 * Product Delete Operations
 * 
 * This file contains all DELETE operations related to products:
 * - Product deletion
 * - Stock deletion
 */

import { doc, deleteDoc, collection } from 'firebase/firestore';
import { db } from '../../app/db';

// ============================================
// PRODUCT DELETE OPERATIONS
// ============================================

/**
 * Delete products by IDs
 */
export const deleteProducts = async (ids: string[]) => {
  if (Array.isArray(ids)) {
    await Promise.all(
      ids.map(async (item) => {
        await deleteDoc(doc(db, 'T_products', item));
      })
    );
  } else {
    throw new Error('Expected an array of IDs');
  }
};

// ============================================
// STOCK DELETE OPERATIONS
// ============================================

/**
 * Delete stock by ID
 * Note: This is typically called as part of stock management operations
 */
export const deleteStock = async (productId: string, stockId: string) => {
  try {
    const collectionRef = collection(db, 'T_stocks');
    await deleteDoc(doc(collectionRef, stockId));
    return { success: true };
  } catch (error) {
    console.error('Error deleting stock:', error);
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
};

