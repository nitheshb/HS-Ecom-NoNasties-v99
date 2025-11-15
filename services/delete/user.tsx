/**
 * User Delete Operations
 * 
 * This file contains all DELETE operations related to users:
 * - User deletion
 * - Address location deletion
 */

import { doc, deleteDoc } from 'firebase/firestore';
import { db } from '../../app/db';

// ============================================
// USER DELETE OPERATIONS
// ============================================

/**
 * Delete Users (single or multiple)
 */
export const deleteUsers = async (params: string[] | { [key: string]: string }) => {
  const values = Array.isArray(params) ? params : Object.values(params);
  await Promise.all(values.map(async (item) => {
    await deleteDoc(doc(db, 'users', item));
  }));
};

// ============================================
// ADDRESS LOCATION DELETE OPERATIONS
// ============================================

/**
 * Delete address locations (single or multiple)
 */
export const deleteAddressLocations = async (params: string[] | Record<string, string | number | boolean>) => {
  const ids = Array.isArray(params) ? params : Object.values(params);
  
  if (Array.isArray(ids)) {
    await Promise.all(
      ids.map(async (item) => {
        await deleteDoc(doc(db, 'delivery-addresses', String(item)));
      })
    );
    return true;
  } else {
    throw new Error('Invalid parameter format for deletion');
  }
};

