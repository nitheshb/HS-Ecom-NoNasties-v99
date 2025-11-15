/**
 * Charges Update Operations
 * 
 * This file contains all UPDATE operations related to shipping rules and surge rules
 */

import { doc, updateDoc, getDoc, Timestamp } from 'firebase/firestore';
import { db } from '../../app/db';

// ============================================
// INTERFACES
// ============================================

export interface UpdateShippingRuleData {
  min_price?: number;
  max_price?: number | null;
  location?: string;
  shipping_fee?: number;
  active?: boolean;
}

export interface UpdateSurgeRuleData {
  start_time?: number; // milliseconds
  end_time?: number; // milliseconds
  surge_multiplier?: number;
  active?: boolean;
}

// ============================================
// SHIPPING RULE UPDATE OPERATIONS
// ============================================

/**
 * Update shipping rule
 */
export const updateShippingRule = async (id: string, params: UpdateShippingRuleData) => {
  const docRef = doc(db, 'shipping_rules', id);
  const docSnap = await getDoc(docRef);
  
  if (!docSnap.exists()) {
    return { success: false, error: `Shipping rule with ID ${id} not found` };
  }
  
  const updateData = {
    ...params,
    updated_at: Timestamp.fromMillis(Date.now()),
  };
  
  try {
    await updateDoc(docRef, updateData);
    return { success: true, id };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
};

// ============================================
// SURGE RULE UPDATE OPERATIONS
// ============================================

/**
 * Update surge rule
 */
export const updateSurgeRule = async (id: string, params: UpdateSurgeRuleData) => {
  const docRef = doc(db, 'surge_rules', id);
  const docSnap = await getDoc(docRef);
  
  if (!docSnap.exists()) {
    return { success: false, error: `Surge rule with ID ${id} not found` };
  }
  
  const updateData: any = {
    ...params,
    updated_at: Timestamp.fromMillis(Date.now()),
  };
  
  // Convert millisecond timestamps to Firestore Timestamps if they exist
  if (params.start_time) {
    updateData.start_time = Timestamp.fromMillis(params.start_time);
  }
  if (params.end_time) {
    updateData.end_time = Timestamp.fromMillis(params.end_time);
  }
  
  try {
    await updateDoc(docRef, updateData);
    return { success: true, id };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
};

