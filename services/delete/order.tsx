/**
 * Order Delete Operations
 * 
 * This file contains all DELETE operations related to orders:
 * - Order deletion
 * - Order item deletion
 */

import { doc, deleteDoc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../app/db';
import { OrderId, OrderItemId } from '../../types/order';

// ============================================
// CONSTANTS
// ============================================

const ORDERS_COLLECTION = 'p_orders';
const ORDER_ITEMS_COLLECTION = 'p_order_items';

// ============================================
// INTERFACES
// ============================================

export interface Order {
  id: OrderId;
  [key: string]: unknown;
}

// ============================================
// ORDER DELETE OPERATIONS
// ============================================

/**
 * Delete order by ID
 * Also deletes all associated order items
 */
export const deleteOrder = async (
  orderId: string,
  dependencies?: {
    handleOrderDeleted?: (order: Order) => Promise<void>;
  }
) => {
  // Get the order data before deletion for analytics
  const orderRef = doc(db, ORDERS_COLLECTION, orderId);
  const orderSnap = await getDoc(orderRef);
  const orderToDelete = orderSnap.exists() ? orderSnap.data() as Order : {};
  
  // Delete order items from separate collection first
  const itemsQuery = query(
    collection(db, ORDER_ITEMS_COLLECTION),
    where('order_id', '==', orderId)
  );
  const itemsSnap = await getDocs(itemsQuery);
  for (const itemDoc of itemsSnap.docs) {
    await deleteDoc(doc(db, ORDER_ITEMS_COLLECTION, itemDoc.id));
  }
  
  // Then delete the main order document
  await deleteDoc(doc(db, ORDERS_COLLECTION, orderId));
  
  // Update analytics for order deletion
  if (dependencies?.handleOrderDeleted) {
    try {
      await dependencies.handleOrderDeleted({ ...orderToDelete, id: orderId });
    } catch (error) {
      console.error('Failed to update order deletion analytics:', error);
      // Don't throw here to avoid breaking the order deletion
    }
  }
  
  return true;
};

