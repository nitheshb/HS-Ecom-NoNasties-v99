/**
 * Unit Read Operations
 * 
 * This file contains all READ operations related to units
 */

import { collection, doc, getDoc, getDocs, query } from 'firebase/firestore';
import { db } from '../../app/db';

// ============================================
// INTERFACES
// ============================================

export interface Unit {
  id: string;
  uuid: string;
  title: Record<string, string>;
  description?: Record<string, string>;
  active: boolean;
  created_at?: number;
  updated_at?: number;
  locales?: string[];
  [key: string]: unknown;
}

// ============================================
// UNIT READ OPERATIONS
// ============================================

/**
 * Get all units
 */
export const getAllUnits = async (orgId: string, params: unknown) => {
  const filesQuery = query(collection(db, `T_unit`));
  const querySnapshot = await getDocs(filesQuery);
  const files: Unit[] = querySnapshot.docs.map((docSnap) => {
    const x = docSnap.data() as Unit;
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
        { url: "https://single-api.foodyman.org/api/v1/dashboard/admin/units/paginate?page=1", label: "1", active: true },
        { url: null, label: "Next »", active: false }
      ],
      path: "https://single-api.foodyman.org/api/v1/dashboard/admin/units/paginate",
      per_page: "1000",
      to: files.length,
      total: files.length
    }
  };
};

/**
 * Get unit by ID
 */
export const getAllUnitsById = async (orgId: string, uid: string, payload?: unknown) => {
  const docRef = doc(db, `T_unit`, uid);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists() && docSnap.data()) {
    const x = docSnap.data() as Unit;
    x.id = docSnap.id;
    x.uuid = docSnap.id;
    return { data: x };
  } else {
    return { data: null };
  }
};

