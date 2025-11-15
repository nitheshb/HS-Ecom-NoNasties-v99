/**
 * Delivery Schedule Read Operations
 * 
 * This file contains all READ operations related to delivery schedules
 */

import { collection, getDocs, query, where, QueryDocumentSnapshot, DocumentData } from 'firebase/firestore';
import { db } from '../../app/db';

// ============================================
// CONSTANTS
// ============================================

const COLLECTION_NAME = 'delivery_schedules';

// ============================================
// INTERFACES
// ============================================

export interface DeliverySchedule {
  id: string;
  category_id: string;
  day_of_week: string;
  start_time: string;
  end_time: string;
  is_active: boolean;
  createdAt?: number;
  updatedAt?: number;
  [key: string]: unknown;
}

// ============================================
// DELIVERY SCHEDULE READ OPERATIONS
// ============================================

/**
 * Get all delivery schedules
 */
export async function getAllDeliverySchedules(): Promise<DeliverySchedule[]> {
  try {
    const querySnapshot = await getDocs(collection(db, COLLECTION_NAME));
    
    return querySnapshot.docs.map((doc: QueryDocumentSnapshot<DocumentData>) => ({
      id: doc.id,
      ...doc.data()
    })) as DeliverySchedule[];
  } catch (error) {
    console.error('Error fetching delivery schedules:', error);
    throw new Error('Failed to fetch delivery schedules');
  }
}

/**
 * Get delivery schedules by category
 */
export async function getDeliverySchedulesByCategory(categoryId: string): Promise<DeliverySchedule[]> {
  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      where('category_id', '==', categoryId)
    );
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map((doc: QueryDocumentSnapshot<DocumentData>) => ({
      id: doc.id,
      ...doc.data()
    })) as DeliverySchedule[];
  } catch (error) {
    console.error('Error fetching delivery schedules by category:', error);
    throw new Error('Failed to fetch delivery schedules by category');
  }
}

