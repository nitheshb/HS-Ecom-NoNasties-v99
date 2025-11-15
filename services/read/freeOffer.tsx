/**
 * Free Offer Read Operations
 * 
 * This file contains all READ operations related to free offers
 */

import { collection, doc, getDoc, getDocs, query, orderBy, where } from 'firebase/firestore';
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

// ============================================
// FREE OFFER READ OPERATIONS
// ============================================

/**
 * Get all free offers
 */
export const getAllFreeOffers = async () => {
  try {
    const offersQuery = query(
      collection(db, 'P_FreeOffers'),
      orderBy('created_at', 'desc')
    );
    const querySnapshot = await getDocs(offersQuery);
    
    const offers = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as FreeOffer[];

    return {
      success: true,
      data: offers,
      meta: {
        current_page: 1,
        from: 1,
        last_page: 1,
        to: offers.length,
        total: offers.length,
      }
    };
  } catch (error) {
    console.error('Error fetching free offers:', error);
    return { 
      success: false, 
      error: 'Failed to fetch free offers',
      data: [],
      meta: {
        current_page: 1,
        from: 0,
        last_page: 1,
        to: 0,
        total: 0,
      }
    };
  }
};

/**
 * Get free offer by ID
 */
export const getFreeOfferById = async (id: string) => {
  try {
    const offerRef = doc(db, 'P_FreeOffers', id);
    const offerSnap = await getDoc(offerRef);
    
    if (!offerSnap.exists()) {
      return { 
        success: false, 
        error: 'Free offer not found' 
      };
    }
    
    const offerData = { id: offerSnap.id, ...offerSnap.data() } as FreeOffer;
    return { 
      success: true, 
      data: offerData 
    };
  } catch (error) {
    console.error('Error fetching free offer:', error);
    return { 
      success: false, 
      error: 'Failed to fetch free offer' 
    };
  }
};

/**
 * Get active free offers
 */
export const getActiveFreeOffers = async () => {
  try {
    const now = Date.now();
    const offersQuery = query(
      collection(db, 'P_FreeOffers'),
      where('active', '==', true)
    );
    const querySnapshot = await getDocs(offersQuery);
    
    const offers = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as FreeOffer[];

    // Filter by date range if specified
    const validOffers = offers.filter(offer => {
      if (offer.start_date && offer.start_date > now) return false;
      if (offer.end_date && offer.end_date < now) return false;
      return true;
    });

    return {
      success: true,
      data: validOffers
    };
  } catch (error) {
    console.error('Error fetching active free offers:', error);
    return { 
      success: false, 
      error: 'Failed to fetch active free offers',
      data: []
    };
  }
};

