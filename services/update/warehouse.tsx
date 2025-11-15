/**
 * Warehouse Update Operations
 * 
 * This file contains all UPDATE operations related to warehouses
 */

import { doc, updateDoc, getDoc, Timestamp } from 'firebase/firestore';
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
// WAREHOUSE UPDATE OPERATIONS
// ============================================

/**
 * Update an existing warehouse
 */
export const updateWarehouse = async (id: string, params: Partial<Omit<Warehouse, 'id' | 'orgId' | 'created_at'>>) => {
  const docRef = doc(db, 'p_warehouse', id);
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) {
    throw new Error(`Warehouse with ID ${id} not found`);
  }
  const updateData = {
    ...params,
    updated_at: Timestamp.now().toMillis(),
  };
  await updateDoc(docRef, updateData);
  return { success: true, id };
};

