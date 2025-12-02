/**
 * Free Offer Create Operations
 * 
 * This file contains all CREATE operations related to free offers
 */

import { collection, doc, setDoc } from 'firebase/firestore';
import { db } from '../../app/db';
import { v4 as uuidv4 } from 'uuid';

// ============================================
// INTERFACES
// ============================================

export type TargetType = 'single' | 'multiple' | 'all';

export interface FreeOffer {
  id: string;
  title: string;
  target_type: TargetType;
  target_product_id?: string;
  target_product_ids?: string[];
  target_quantity?: number | null;
  target_variant_id?: string | null;
  free_product_id: string;
  free_variant_id?: string | null;
  free_quantity: number;
  max_orders: number;
  active: boolean;
  used_orders: string[];
  start_date?: number | null;
  end_date?: number | null;
  created_at: number;
  updated_at: number;
}

export interface FreeOfferPayload {
  title: string;
  target_type: TargetType;
  target_product_id?: string;
  target_product_ids?: string[];
  target_quantity?: number;
  target_variant_id?: string;
  free_product_id: string;
  free_variant_id?: string;
  free_quantity: number;
  max_orders: number;
  active: boolean;
  start_date?: Date;
  end_date?: Date;
  used_orders?: string[];
}

// ============================================
// HELPER FUNCTIONS
// ============================================

const removeUndefinedFields = (obj: Record<string, any>) => {
  Object.keys(obj).forEach((key) => {
    const value = obj[key];
    if (value === undefined) {
      delete obj[key];
    } else if (value && typeof value === 'object' && !Array.isArray(value)) {
      removeUndefinedFields(value);
    }
  });
  return obj;
};

// ============================================
// FREE OFFER CREATE OPERATIONS
// ============================================

/**
 * Create free offer
 */
export const createFreeOffer = async (payload: FreeOfferPayload) => {
  const offersCollectionRef = collection(db, 'P_FreeOffers');
  const offerId = uuidv4();
  
  const now = Date.now();
  
  // Build the offer data based on target type
  const baseOfferData = {
    id: offerId,
    title: payload.title,
    target_type: payload.target_type,
    target_quantity: payload.target_quantity ?? null,
    target_variant_id: payload.target_variant_id ?? null,
    free_product_id: payload.free_product_id,
    free_variant_id: payload.free_variant_id ?? null,
    free_quantity: payload.free_quantity,
    max_orders: payload.max_orders,
    active: payload.active,
    used_orders: [],
    start_date: payload.start_date ? payload.start_date.getTime() : null,
    end_date: payload.end_date ? payload.end_date.getTime() : null,
    created_at: now,
    updated_at: now,
  };

  // Add target-specific fields
  let offerData: FreeOffer;
  if (payload.target_type === 'single') {
    offerData = {
      ...baseOfferData,
      target_product_id: payload.target_product_id,
    };
  } else if (payload.target_type === 'multiple') {
    offerData = {
      ...baseOfferData,
      target_product_ids: payload.target_product_ids,
    };
  } else { // 'all'
    offerData = {
      ...baseOfferData,
      // No target fields needed for 'all' type
    };
  }

  removeUndefinedFields(offerData);

  try {
    await setDoc(doc(offersCollectionRef, offerId), offerData);
    return { 
      success: true, 
      data: { id: offerId },
      message: 'Free offer created successfully' 
    };
  } catch (error) {
    console.error('Error creating free offer:', error);
    return { 
      success: false, 
      error: 'Failed to create free offer' 
    };
  }
};

