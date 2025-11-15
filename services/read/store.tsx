/**
 * Store Read Operations
 * 
 * This file contains all READ operations related to stores
 */

import { collection, doc, getDoc, getDocs } from 'firebase/firestore';
import { db } from '../../app/db';

// ============================================
// INTERFACES
// ============================================

export interface StoreDetails {
  id?: string;
  name: string;
  description?: string;
  address?: string;
  phone?: string;
  email?: string;
  logo?: string;
  active?: boolean;
  created_at?: string;
  updated_at?: string;
  [key: string]: unknown;
}

// ============================================
// STORE READ OPERATIONS
// ============================================

/**
 * Get all stores
 */
export async function getAllStores() {
  const storesQuery = collection(db, 'p_store');
  const querySnapshot = await getDocs(storesQuery);
  const stores: StoreDetails[] = querySnapshot.docs.map((docSnap) => docSnap.data() as StoreDetails);
  return { data: stores };
}

/**
 * Get store by ID
 */
export const getStoreById = async (id: string) => {
  const docRef = doc(db, 'p_store', id);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return { data: docSnap.data() as StoreDetails };
  } else {
    return { data: null };
  }
};

