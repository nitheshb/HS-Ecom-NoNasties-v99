/**
 * Warehouse Create Operations
 * 
 * This file contains all CREATE operations related to warehouses
 */

import { doc, setDoc, Timestamp } from 'firebase/firestore';
import { db } from '../../app/db';
import { v4 as uuidv4 } from 'uuid';

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
// WAREHOUSE CREATE OPERATIONS
// ============================================

/**
 * Create a new warehouse
 */
export const createWarehouse = async (orgId: string, params: Omit<Warehouse, 'id' | 'created_at' | 'updated_at' | 'orgId'>) => {
  const id = uuidv4();
  const warehouse: Warehouse = {
    id,
    orgId,
    ...params,
    created_at: Timestamp.now().toMillis(),
    updated_at: Timestamp.now().toMillis(),
  };
  try {
    await setDoc(doc(db, 'p_warehouse', id), warehouse);
    return { success: true, ...warehouse };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
};

