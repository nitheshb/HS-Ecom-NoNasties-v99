/**
 * Charges Read Operations
 * 
 * This file contains all READ operations related to shipping rules and surge rules
 */

import { collection, doc, getDoc, getDocs, query, orderBy, where, onSnapshot, Timestamp } from 'firebase/firestore';
import { db } from '../../app/db';

// ============================================
// INTERFACES
// ============================================

export interface ShippingRule {
  id: string;
  min_price: number;
  max_price: number | null;
  shipping_fee: number;
  location: string;
  is_active: boolean;
  created_at: number;
  updated_at: number;
}

export interface SurgeRule {
  id: string;
  start_time: number;
  end_time: number;
  multiplier: number;
  is_active: boolean;
  created_at: number;
  updated_at: number;
}

export type Unsubscribe = () => void;

// ============================================
// SHIPPING RULE READ OPERATIONS
// ============================================

/**
 * Get all shipping rules
 */
export const getShippingRules = async () => {
  try {
    const shippingRulesQuery = query(
      collection(db, 'shipping_rules'),
      orderBy('min_price', 'asc')
    );
    const querySnapshot = await getDocs(shippingRulesQuery);
    const shippingRules: ShippingRule[] = querySnapshot.docs.map((docSnap) => {
      const data = docSnap.data();
      return {
        ...data,
        created_at: data.created_at?.toMillis() || Date.now(),
        updated_at: data.updated_at?.toMillis() || Date.now(),
      } as ShippingRule;
    });
    
    return { success: true, data: shippingRules };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
};

/**
 * Get shipping rule by ID
 */
export const getShippingRuleById = async (id: string) => {
  try {
    const docRef = doc(db, 'shipping_rules', id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      return { 
        success: true, 
        data: {
          ...data,
          created_at: data.created_at?.toMillis() || Date.now(),
          updated_at: data.updated_at?.toMillis() || Date.now(),
        } as ShippingRule 
      };
    } else {
      return { success: false, error: 'Shipping rule not found' };
    }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
};

/**
 * Get active shipping rules
 */
export const getActiveShippingRules = async () => {
  try {
    const shippingRulesQuery = query(
      collection(db, 'shipping_rules'),
      where('is_active', '==', true),
      orderBy('min_price', 'asc')
    );
    const querySnapshot = await getDocs(shippingRulesQuery);
    const shippingRules: ShippingRule[] = querySnapshot.docs.map((docSnap) => {
      const data = docSnap.data();
      return {
        ...data,
        created_at: data.created_at?.toMillis() || Date.now(),
        updated_at: data.updated_at?.toMillis() || Date.now(),
      } as ShippingRule;
    });
    
    return { success: true, data: shippingRules };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
};

/**
 * Real-time listener for shipping rules
 */
export const subscribeToShippingRules = (callback: (rules: ShippingRule[]) => void): Unsubscribe => {
  const shippingRulesQuery = query(
    collection(db, 'shipping_rules'),
    orderBy('min_price', 'asc')
  );
  
  return onSnapshot(shippingRulesQuery, (snapshot) => {
    const rules: ShippingRule[] = snapshot.docs.map((docSnap) => {
      const data = docSnap.data();
      return {
        ...data,
        created_at: data.created_at?.toMillis() || Date.now(),
        updated_at: data.updated_at?.toMillis() || Date.now(),
      } as ShippingRule;
    });
    callback(rules);
  });
};

// ============================================
// SURGE RULE READ OPERATIONS
// ============================================

/**
 * Get all surge rules
 */
export const getSurgeRules = async () => {
  try {
    const surgeRulesQuery = query(
      collection(db, 'surge_rules'),
      orderBy('created_at', 'desc')
    );
    const querySnapshot = await getDocs(surgeRulesQuery);
    const surgeRules: SurgeRule[] = querySnapshot.docs.map((docSnap) => {
      const data = docSnap.data();
      return {
        ...data,
        created_at: data.created_at?.toMillis() || Date.now(),
        updated_at: data.updated_at?.toMillis() || Date.now(),
        start_time: data.start_time?.toMillis() || Date.now(),
        end_time: data.end_time?.toMillis() || Date.now(),
      } as SurgeRule;
    });
    
    return { success: true, data: surgeRules };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
};

/**
 * Get surge rule by ID
 */
export const getSurgeRuleById = async (id: string) => {
  try {
    const docRef = doc(db, 'surge_rules', id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      return { 
        success: true, 
        data: {
          ...data,
          created_at: data.created_at?.toMillis() || Date.now(),
          updated_at: data.updated_at?.toMillis() || Date.now(),
          start_time: data.start_time?.toMillis() || Date.now(),
          end_time: data.end_time?.toMillis() || Date.now(),
        } as SurgeRule 
      };
    } else {
      return { success: false, error: 'Surge rule not found' };
    }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
};

/**
 * Get active surge rules
 */
export const getActiveSurgeRules = async () => {
  try {
    const now = Date.now();
    const surgeRulesQuery = query(
      collection(db, 'surge_rules'),
      where('is_active', '==', true),
      where('start_time', '<=', Timestamp.fromMillis(now)),
      where('end_time', '>=', Timestamp.fromMillis(now))
    );
    const querySnapshot = await getDocs(surgeRulesQuery);
    const surgeRules: SurgeRule[] = querySnapshot.docs.map((docSnap) => {
      const data = docSnap.data();
      return {
        ...data,
        created_at: data.created_at?.toMillis() || Date.now(),
        updated_at: data.updated_at?.toMillis() || Date.now(),
        start_time: data.start_time?.toMillis() || Date.now(),
        end_time: data.end_time?.toMillis() || Date.now(),
      } as SurgeRule;
    });
    
    return { success: true, data: surgeRules };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
};

/**
 * Real-time listener for surge rules
 */
export const subscribeToSurgeRules = (callback: (rules: SurgeRule[]) => void): Unsubscribe => {
  const surgeRulesQuery = query(
    collection(db, 'surge_rules'),
    orderBy('created_at', 'desc')
  );
  
  return onSnapshot(surgeRulesQuery, (snapshot) => {
    const rules: SurgeRule[] = snapshot.docs.map((docSnap) => {
      const data = docSnap.data();
      return {
        ...data,
        created_at: data.created_at?.toMillis() || Date.now(),
        updated_at: data.updated_at?.toMillis() || Date.now(),
        start_time: data.start_time?.toMillis() || Date.now(),
        end_time: data.end_time?.toMillis() || Date.now(),
      } as SurgeRule;
    });
    callback(rules);
  });
};

