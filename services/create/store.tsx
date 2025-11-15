/**
 * Store Create Operations
 * 
 * This file contains all CREATE operations related to stores
 */

import { doc, setDoc, Timestamp } from 'firebase/firestore';
import { db } from '../../app/db';
import { v4 as uuidv4 } from 'uuid';

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
// STORE CREATE OPERATIONS
// ============================================

/**
 * Create store
 */
export const createStore = async (params: Omit<StoreDetails, 'id' | 'created_at' | 'updated_at'>) => {
  const id = uuidv4();
  const store: StoreDetails = {
    id,
    ...params,
    created_at: Timestamp.now().toMillis(),
    updated_at: Timestamp.now().toMillis(),
  };
  try {
    await setDoc(doc(db, 'p_store', id), store);
    return { success: true, id, ...store };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
};

