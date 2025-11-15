/**
 * Delivery Schedule Delete Operations
 * 
 * This file contains all DELETE operations related to delivery schedules
 */

import { doc, deleteDoc } from 'firebase/firestore';
import { db } from '../../app/db';

// ============================================
// CONSTANTS
// ============================================

const COLLECTION_NAME = 'delivery_schedules';

// ============================================
// DELIVERY SCHEDULE DELETE OPERATIONS
// ============================================

/**
 * Delete delivery schedule by ID
 */
export async function deleteDeliverySchedule(id: string): Promise<void> {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Error deleting delivery schedule:', error);
    throw new Error('Failed to delete delivery schedule');
  }
}

