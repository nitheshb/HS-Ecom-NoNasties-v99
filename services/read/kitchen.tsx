/**
 * Kitchen Read Operations
 * 
 * This file contains all READ operations related to kitchens
 */

import { collection, doc, getDoc, getDocs, query } from 'firebase/firestore';
import { db } from '../../app/db';

// ============================================
// INTERFACES
// ============================================

export interface Kitchen {
  id: string;
  uuid: string;
  title: Record<string, string>;
  description?: Record<string, string>;
  active: boolean;
  created_at?: number;
  updated_at?: number;
  locales?: string[];
  shop_id?: string;
  [key: string]: unknown;
}

// ============================================
// KITCHEN READ OPERATIONS
// ============================================

/**
 * Get all kitchens
 */
export const getAllKitchens = async (orgId: string, params: unknown) => {
  const filesQuery = query(collection(db, `T_kitchen`));
  const querySnapshot = await getDocs(filesQuery);
  const files: Kitchen[] = querySnapshot.docs.map((docSnap) => {
    const x = docSnap.data() as Kitchen;
    x.id = docSnap.id;
    x.uuid = docSnap.id;
    return x;
  });
  return {
    data: files,
    meta: {
      current_page: 1,
      from: 1,
      last_page: 1,
      links: [
        { url: null, label: "« Previous", active: false },
        { url: "https://single-api.foodyman.org/api/v1/dashboard/seller/kitchen/paginate?page=1", label: "1", active: true },
        { url: null, label: "Next »", active: false }
      ],
      path: "https://single-api.foodyman.org/api/v1/dashboard/seller/kitchen/paginate",
      per_page: "1000",
      to: files.length,
      total: files.length
    }
  };
};

/**
 * Get kitchen by ID
 */
export const getKitchenById = async (orgId: string, uid: string) => {
  const docRef = doc(db, `T_kitchen`, uid);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists() && docSnap.data()) {
    const x = docSnap.data() as Kitchen;
    x.id = docSnap.id;
    x.uuid = docSnap.id;
    return { data: x };
  } else {
    return { data: null };
  }
};

