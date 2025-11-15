/**
 * Charges Create Operations
 * 
 * This file contains all CREATE operations related to shipping rules and surge rules
 */

import { doc, setDoc, Timestamp } from 'firebase/firestore';
import { db } from '../../app/db';

// ============================================
// INTERFACES
// ============================================

import { 
  ShippingRule, 
  CreateShippingRuleData,
  SurgeRule,
  CreateSurgeRuleData 
} from '../../types/charges';

// ============================================
// SHIPPING RULE CREATE OPERATIONS
// ============================================

/**
 * Create shipping rule
 */
export const createShippingRule = async (params: CreateShippingRuleData) => {
  const id = Date.now().toString();
  const now = Date.now();
  
  const shippingRule: ShippingRule = {
    id,
    ...params,
    created_at: now,
    updated_at: now,
  };
  
  try {
    await setDoc(doc(db, 'shipping_rules', id), {
      ...shippingRule,
      created_at: Timestamp.fromMillis(now),
      updated_at: Timestamp.fromMillis(now),
    });
    return { success: true, id, data: shippingRule };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
};

// ============================================
// SURGE RULE CREATE OPERATIONS
// ============================================

/**
 * Create surge rule
 */
export const createSurgeRule = async (params: CreateSurgeRuleData) => {
  const id = Date.now().toString();
  const now = Date.now();
  
  const surgeRule: SurgeRule = {
    id,
    ...params,
    created_at: now,
    updated_at: now,
  };
  
  try {
    await setDoc(doc(db, 'surge_rules', id), {
      ...surgeRule,
      created_at: Timestamp.fromMillis(now),
      updated_at: Timestamp.fromMillis(now),
      start_time: Timestamp.fromMillis(surgeRule.start_time),
      end_time: Timestamp.fromMillis(surgeRule.end_time),
    });
    return { success: true, id, data: surgeRule };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
};

