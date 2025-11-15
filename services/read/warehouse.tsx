/**
 * Warehouse Read Operations
 * 
 * This file contains all READ operations related to warehouses
 */

import { collection, doc, getDoc, getDocs, query } from 'firebase/firestore';
import { db } from '../../app/db';

// ============================================
// INTERFACES
// ============================================

export interface Warehouse {
  id: string;
  orgId?: string;
  name: string;
  contactPerson: string;
  mobileNumber: string;
  address: string;
  area?: string;
  pinCode: string;
  city: string;
  state: string;
  gstNumber?: string;
  created_at: number;
  updated_at: number;
}

// ============================================
// WAREHOUSE READ OPERATIONS
// ============================================

/**
 * Get all warehouses
 */
export const getAllWarehouses = async (orgId: string) => {
  try {
    const warehousesQuery = query(collection(db, 'p_warehouse'));
    const querySnapshot = await getDocs(warehousesQuery);
    const warehouses: Warehouse[] = querySnapshot.docs.map((docSnap) => ({
      id: docSnap.id,
      ...docSnap.data()
    })) as Warehouse[];
    
    // Filter by orgId if provided
    const filteredWarehouses = orgId
      ? warehouses.filter(wh => wh.orgId === orgId)
      : warehouses;
    
    return { success: true, data: filteredWarehouses };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
};

/**
 * Get warehouse by ID
 */
export const getWarehouseById = async (id: string) => {
  try {
    const docRef = doc(db, 'p_warehouse', id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { success: true, data: { id: docSnap.id, ...docSnap.data() } as Warehouse };
    } else {
      return { success: false, error: 'Warehouse not found' };
    }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
};

