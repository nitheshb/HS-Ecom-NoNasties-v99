/**
 * Delivery Schedule Update Operations
 * 
 * This file contains all UPDATE operations related to delivery schedules
 */

import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../../app/db';

// ============================================
// INTERFACES
// ============================================

export interface DeliverySchedule {
  id: string;
  category_id: string;
  product_ids?: string[];
  delivery_time_start: string;
  delivery_time_end?: string;
  createdAt: number;
  updatedAt: number;
}

export interface DeliveryScheduleFormData {
  category_id: string;
  product_ids?: string[];
  delivery_time_start: string;
  delivery_time_end?: string;
}

// ============================================
// DELIVERY SCHEDULE UPDATE OPERATIONS
// ============================================

/**
 * Update existing delivery schedule
 * Note: This function references syncSubscriptionsWithDeliverySchedule which should be imported
 */
export const updateDeliverySchedule = async (
  id: string, 
  data: Partial<DeliveryScheduleFormData>,
  dependencies?: {
    syncSubscriptionsWithDeliverySchedule?: (schedule: {
      category_id: string;
      product_ids?: string[];
      delivery_time_start: string;
      delivery_time_end?: string;
    }) => Promise<{ success: boolean; updatedCount: number; message: string }>;
  }
): Promise<void> => {
  try {
    const docRef = doc(db, 'delivery_schedules', id);
    
    // Get the existing schedule to check what changed
    const existingDoc = await getDoc(docRef);
    const existingData = existingDoc.data() as DeliverySchedule;
    
    // Update the schedule
    await updateDoc(docRef, {
      ...data,
      updatedAt: Date.now() // Store as milliseconds
    });
    
    // If delivery_time_start or delivery_time_end changed, sync subscriptions
    const deliveryTimeChanged = 
      (data.delivery_time_start && data.delivery_time_start !== existingData.delivery_time_start) ||
      (data.delivery_time_end !== undefined && data.delivery_time_end !== existingData.delivery_time_end);
    
    if (deliveryTimeChanged && dependencies?.syncSubscriptionsWithDeliverySchedule) {
      // Get the updated schedule data
      const updatedData = { ...existingData, ...data } as DeliveryScheduleFormData;
      
      // Sync subscriptions with the updated delivery times
      // Note: This runs asynchronously and errors are caught, so it won't block the update
      dependencies.syncSubscriptionsWithDeliverySchedule({
        category_id: updatedData.category_id,
        product_ids: updatedData.product_ids,
        delivery_time_start: updatedData.delivery_time_start,
        delivery_time_end: updatedData.delivery_time_end,
      }).then(syncResult => {
        console.log('Subscription sync result:', syncResult);
      }).catch(syncError => {
        // Log sync error but don't fail the update
        console.error('Error syncing subscriptions after schedule update:', syncError);
      });
    }
  } catch (error) {
    console.error('Error updating delivery schedule:', error);
    throw new Error('Failed to update delivery schedule');
  }
};

