/**
 * Free Offer Delete Operations
 * 
 * This file contains all DELETE operations related to free offers
 */

import { doc, deleteDoc } from 'firebase/firestore';
import { db } from '../../app/db';

// ============================================
// FREE OFFER DELETE OPERATIONS
// ============================================

/**
 * Delete free offer by ID
 */
export const deleteFreeOffer = async (id: string) => {
  try {
    const offerRef = doc(db, 'P_FreeOffers', id);
    await deleteDoc(offerRef);
    return { 
      success: true, 
      message: 'Free offer deleted successfully' 
    };
  } catch (error) {
    console.error('Error deleting free offer:', error);
    return { 
      success: false, 
      error: 'Failed to delete free offer' 
    };
  }
};

