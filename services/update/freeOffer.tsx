/**
 * Free Offer Update Operations
 * 
 * This file contains all UPDATE operations related to free offers
 */

import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../../app/db';

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
  target_quantity?: number;
  target_variant_id?: string;
  free_product_id: string;
  free_variant_id?: string;
  free_quantity: number;
  max_orders: number;
  active: boolean;
  used_orders: string[];
  start_date?: number;
  end_date?: number;
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

const removeUndefinedFields = (obj: Record<string, unknown>) => {
  Object.keys(obj).forEach(key => {
    if (obj[key] === undefined) {
      delete obj[key];
    }
  });
};

// ============================================
// FREE OFFER UPDATE OPERATIONS
// ============================================

/**
 * Update free offer
 */
export const updateFreeOffer = async (id: string, updateData: Partial<FreeOfferPayload>) => {
  try {
    const offerRef = doc(db, 'P_FreeOffers', id);
    
    // Prepare update payload with Date to number conversion
    const baseUpdatePayload: Partial<FreeOffer> & { updated_at: number } = {
      updated_at: Date.now()
    };

    // Copy fields from updateData, excluding Date fields which we'll convert separately
    const { start_date, end_date, ...restUpdateData } = updateData;
    Object.assign(baseUpdatePayload, restUpdateData);

    // Convert Date objects to milliseconds if present
    if (start_date) {
      baseUpdatePayload.start_date = start_date.getTime();
    }
    if (end_date) {
      baseUpdatePayload.end_date = end_date.getTime();
    }

    // Handle target-specific fields
    const updatePayload: Partial<FreeOffer> & { updated_at: number } = { ...baseUpdatePayload };
    
    if (updateData.target_type === 'single') {
      updatePayload.target_product_id = updateData.target_product_id;
      delete updatePayload.target_product_ids;
    } else if (updateData.target_type === 'multiple') {
      updatePayload.target_product_ids = updateData.target_product_ids;
      delete updatePayload.target_product_id;
    } else if (updateData.target_type === 'all') {
      delete updatePayload.target_product_id;
      delete updatePayload.target_product_ids;
    }

    removeUndefinedFields(updatePayload as Record<string, unknown>);

    await updateDoc(offerRef, updatePayload);
    return { 
      success: true, 
      message: 'Free offer updated successfully' 
    };
  } catch (error) {
    console.error('Error updating free offer:', error);
    return { 
      success: false, 
      error: 'Failed to update free offer' 
    };
  }
};

/**
 * Toggle free offer active status
 */
export const toggleFreeOfferActive = async (id: string) => {
  try {
    const offerRef = doc(db, 'P_FreeOffers', id);
    const offerSnap = await getDoc(offerRef);
    
    if (!offerSnap.exists()) {
      return { 
        success: false, 
        error: 'Free offer not found' 
      };
    }
    
    const currentData = offerSnap.data() as FreeOffer;
    const newActive = !currentData.active;
    
    await updateDoc(offerRef, {
      active: newActive,
      updated_at: Date.now()
    });
    
    return { 
      success: true, 
      data: { active: newActive },
      message: `Free offer ${newActive ? 'activated' : 'deactivated'} successfully` 
    };
  } catch (error) {
    console.error('Error toggling free offer active status:', error);
    return { 
      success: false, 
      error: 'Failed to toggle free offer status' 
    };
  }
};

/**
 * Remove free offer from order (updates used_orders array)
 */
export const removeFreeOfferFromOrder = async (orderId: string, offerId: string) => {
  try {
    const offerRef = doc(db, 'P_FreeOffers', offerId);
    const offerSnap = await getDoc(offerRef);
    
    if (!offerSnap.exists()) {
      return { 
        success: false, 
        error: 'Free offer not found' 
      };
    }
    
    const offerData = offerSnap.data() as FreeOffer;
    const updatedUsedOrders = offerData.used_orders.filter(id => id !== orderId);
    
    await updateDoc(offerRef, {
      used_orders: updatedUsedOrders,
      updated_at: Date.now()
    });
    
    return { 
      success: true, 
      message: 'Free offer removed from order' 
    };
  } catch (error) {
    console.error('Error removing free offer from order:', error);
    return { 
      success: false, 
      error: 'Failed to remove free offer from order' 
    };
  }
};

