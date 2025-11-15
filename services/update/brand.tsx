/**
 * Brand Update Operations
 * 
 * This file contains all UPDATE operations related to brands
 */

import { doc, updateDoc, getDoc, Timestamp } from 'firebase/firestore';
import { db } from '../../app/db';

// ============================================
// INTERFACES
// ============================================

export interface Brand {
  id: string;
  uuid: string;
  title: string;
  active: boolean;
  img?: string;
  products_count?: number;
  created_at?: number;
  updated_at?: number;
  [key: string]: unknown;
}

// ============================================
// BRAND UPDATE OPERATIONS
// ============================================

/**
 * Update brand
 */
export const updateBrand = async (uid: string, params: Record<string, unknown>) => {
  await updateDoc(doc(db, `P_brands`, uid), params);
  return { success: true };
};

/**
 * Set active status for brand
 */
export const setActiveBrand = async (id: string) => {
  const brandId = id.includes('/') ? id.split('/').pop() : id;
  const docRef = doc(db, `P_brands`, brandId!);
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) {
    throw new Error(`Brand with ID ${brandId} not found`);
  }
  const brandData = docSnap.data() as Brand;
  const currentActive = brandData.active === true;
  const newActive = !currentActive;
  await updateDoc(docRef, {
    active: newActive,
    updated_at: Timestamp.now().toMillis()
  });
  return {
    timestamp: new Date().toISOString(),
    status: true,
    data: {
      id: brandId,
      uuid: brandId,
      active: newActive,
      created_at: brandData.created_at || Timestamp.now().toMillis(),
      updated_at: Timestamp.now().toMillis(),
      title: brandData.title,
    }
  };
};

