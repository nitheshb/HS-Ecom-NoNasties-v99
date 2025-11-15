/**
 * Store Update Operations
 * 
 * This file contains all UPDATE operations related to stores
 */

import { doc, updateDoc, getDoc, Timestamp } from 'firebase/firestore';
import { db } from '../../app/db';

// ============================================
// INTERFACES
// ============================================

export interface StoreDetails {
  id: string;
  name: string;
  link: string;
  mobileNumber: string;
  mobileCountry: string;
  emailAddress: string;
  country: string;
  address: string;
  logoUrl?: string;
  type?: string;
  created_at: number;
  updated_at: number;
}

// ============================================
// STORE UPDATE OPERATIONS
// ============================================

/**
 * Update store
 */
export const updateStore = async (id: string, params: Partial<Omit<StoreDetails, 'id' | 'created_at'>>) => {
  const docRef = doc(db, 'p_store', id);
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) {
    throw new Error(`Store with ID ${id} not found`);
  }
  const updateData = {
    ...params,
    updated_at: Timestamp.now().toMillis(),
  };
  await updateDoc(docRef, updateData);
  return { success: true, id };
};

