/**
 * Subscription Create Operations
 * 
 * This file contains all CREATE operations related to subscriptions:
 * - Activate subscription
 */

import { collection, doc, setDoc } from 'firebase/firestore';
import { db } from '../../app/db';

// ============================================
// CONSTANTS
// ============================================

const SUBSCRIPTIONS_COLLECTION = 'p_subscriptions';

// ============================================
// INTERFACES
// ============================================

export type SubscriptionType = 'Daily' | 'Weekend' | 'Alternate' | 'Every 3 Days';

export interface SubscriptionRecord {
  id?: string;
  subscription_id: string;
  user_id: string;
  product_id: string;
  product_variant?: string;
  price: number;
  type: SubscriptionType;
  status: 'active' | 'inactive' | 'paused' | 'vacation' | string;
  is_paused: boolean;
  start_date: string; // ISO
  start_timestamp?: string; // Unix timestamp in milliseconds
  next_delivery_date: string; // Unix timestamp in milliseconds (as string)
  delivery_start_time: string; // e.g., "08:00"
  delivery_end_time?: string; // Optional: e.g., "10:00" - synced from delivery schedules
  subscription_days: string[]; // ['Mon', 'Tue', ...] or timestamp array
  cancelled_at?: string | null;
  vacation_start?: string; // Unix timestamp in milliseconds
  vacation_end?: string; // Unix timestamp in milliseconds
}

// ============================================
// HELPER FUNCTIONS
// ============================================

function getSubscriptionDays(type: SubscriptionType): string[] {
  switch (type) {
    case 'Daily':
      return ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    case 'Weekend':
      return ['Sat', 'Sun'];
    case 'Alternate':
      return ['Mon', 'Wed', 'Fri'];
    case 'Every 3 Days':
      return ['Mon', 'Thu', 'Sun'];
    default:
      return ['Mon'];
  }
}

function parseTimestamp(timestamp: string | number | Date): Date {
  if (timestamp instanceof Date) {
    return timestamp;
  }
  if (typeof timestamp === 'number') {
    return new Date(timestamp);
  }
  if (typeof timestamp === 'string') {
    // Try parsing as milliseconds first
    const millis = parseInt(timestamp, 10);
    if (!isNaN(millis)) {
      return new Date(millis);
    }
    // Try ISO string
    return new Date(timestamp);
  }
  return new Date();
}

// ============================================
// SUBSCRIPTION CREATE OPERATIONS
// ============================================

/**
 * Activate subscription
 */
export async function activateSubscription(input: Omit<SubscriptionRecord,
  'subscription_days' | 'is_paused' | 'status'> & { start_date: string; next_delivery_date?: string; }) {
  const start = new Date(input.start_date);
  const next = input.next_delivery_date ? parseTimestamp(input.next_delivery_date) : start;
  const record: Record<string, unknown> = {
    ...input,
    next_delivery_date: next.getTime().toString(),
    // Map from input's delivery_time_start/delivery_time_end to subscription's delivery_start_time/delivery_end_time
    delivery_start_time: (input as Record<string, unknown>).delivery_start_time || (input as Record<string, unknown>).delivery_time_start,
    delivery_end_time: (input as Record<string, unknown>).delivery_end_time || (input as Record<string, unknown>).delivery_time_end,
    start_date: start.toISOString(),
    status: 'active',
    is_paused: false,
    subscription_days: getSubscriptionDays(input.type),
  } as SubscriptionRecord;

  await setDoc(doc(collection(db, SUBSCRIPTIONS_COLLECTION), input.subscription_id), record);
  return { success: true, data: record };
}

