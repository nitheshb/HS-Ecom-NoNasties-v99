/**
 * Subscription Read Operations
 * 
 * This file contains all READ operations related to subscriptions
 */

import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../app/db';

// ============================================
// CONSTANTS
// ============================================

const SUBSCRIPTIONS_COLLECTION = 'subscriptions';

// ============================================
// INTERFACES
// ============================================

export interface SubscriptionRecord {
  id?: string;
  subscription_id: string;
  user_id: string;
  product_id: string;
  product_variant?: string;
  type: 'Daily' | 'Weekend' | 'Alternate' | 'Every 3 Days';
  status: 'active' | 'vacation' | 'paused' | 'cancelled';
  price: number;
  next_delivery_date: number | string; // timestamp
  vacation_start?: number | string;
  vacation_end?: number | string;
  is_paused: boolean;
  created_at?: number | string;
  updated_at?: number | string;
  delivery_start_time?: string;
  delivery_end_time?: string;
  [key: string]: unknown;
}

// Helper functions (these would typically be imported from utils)
function parseTimestamp(timestamp: number | string): Date {
  if (typeof timestamp === 'number') {
    return new Date(timestamp);
  }
  return new Date(timestamp);
}

function isInVacationPeriod(deliveryDate: Date, vacationStart?: number | string, vacationEnd?: number | string): boolean {
  if (!vacationStart || !vacationEnd) return false;
  
  const start = parseTimestamp(vacationStart);
  const end = parseTimestamp(vacationEnd);
  
  return deliveryDate >= start && deliveryDate <= end;
}

// ============================================
// SUBSCRIPTION READ OPERATIONS
// ============================================

/**
 * Get all active subscriptions (status 'active' or 'vacation')
 */
export async function getAllActiveSubscriptions() {
  // Get subscriptions with status 'active' or 'vacation'
  // Firestore 'in' operator supports up to 10 values, we only have 2 so it's fine
  const qActive = query(
    collection(db, SUBSCRIPTIONS_COLLECTION),
    where('status', 'in', ['active', 'vacation'])
  );
  const snap = await getDocs(qActive);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as SubscriptionRecord));
}

/**
 * Get active subscriptions scheduled for delivery today
 */
export async function getActiveSubscriptionsForToday(todayDateOnlyISO: string) {
  // Compare by date only (YYYY-MM-DD)
  const todayDate = new Date(todayDateOnlyISO).toISOString().slice(0,10);
  const qActive = query(collection(db, SUBSCRIPTIONS_COLLECTION), where('status','==','active'), where('is_paused','==',false));
  const snap = await getDocs(qActive);
  const subscriptions = snap.docs
    .map(d => ({ id: d.id, ...d.data() } as SubscriptionRecord))
    .filter(s => {
      const nextDelivery = parseTimestamp(s.next_delivery_date);
      const nextDeliveryDateOnly = nextDelivery.toISOString().slice(0,10);
      
      // Check if next_delivery_date matches today
      if (nextDeliveryDateOnly !== todayDate) return false;
      
      // Check if delivery date falls within vacation period
      if (isInVacationPeriod(nextDelivery, s.vacation_start, s.vacation_end)) {
        return false; // Skip if in vacation period
      }
      
      return true;
    });
  return subscriptions;
}

