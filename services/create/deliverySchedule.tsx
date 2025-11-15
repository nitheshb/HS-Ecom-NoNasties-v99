/**
 * Delivery Schedule Create Operations
 * 
 * This file contains all CREATE operations related to delivery schedules
 */

import { collection, addDoc } from 'firebase/firestore';
import { db } from '../../app/db';

// ============================================
// INTERFACES
// ============================================

export interface DeliveryScheduleFormData {
  category_id: string;
  product_ids?: string[];
  delivery_time_start: string;
  delivery_time_end?: string;
}

// ============================================
// CONSTANTS
// ============================================

const COLLECTION_NAME = 'delivery_schedules';

// ============================================
// DELIVERY SCHEDULE CREATE OPERATIONS
// ============================================

/**
 * Create delivery schedule
 */
export const createDeliverySchedule = async (data: DeliveryScheduleFormData): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
      ...data,
      createdAt: Date.now(), // Store as milliseconds
      updatedAt: Date.now()  // Store as milliseconds
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating delivery schedule:', error);
    throw new Error('Failed to create delivery schedule');
  }
};

