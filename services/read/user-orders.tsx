import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/app/db';
import { Order, OrderItem } from './order';

const ORDERS_COLLECTION = 'p_orders';
const ORDER_ITEMS_COLLECTION = 'p_order_items';

/**
 * Get all orders for a specific user
 */
export const getUserOrders = async (userId: string): Promise<Order[]> => {
  try {
    // Query without orderBy to avoid needing a composite index
    // We'll sort in JavaScript instead
    const ordersQuery = query(
      collection(db, ORDERS_COLLECTION),
      where('user.id', '==', userId)
    );
    
    const snapshot = await getDocs(ordersQuery);
    const orders: Order[] = [];
    
    snapshot.forEach((doc) => {
      const data = doc.data();
      orders.push({ ...data, id: doc.id } as Order);
    });
    
    // Sort by created_at descending in JavaScript
    orders.sort((a, b) => {
      const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
      const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
      return dateB - dateA; // Descending order (newest first)
    });
    
    return orders;
  } catch (error) {
    console.error('Error fetching user orders:', error);
    throw error;
  }
};

/**
 * Get order items for a specific order
 */
export const getOrderItemsForOrder = async (orderId: string): Promise<OrderItem[]> => {
  try {
    const itemsQuery = query(
      collection(db, ORDER_ITEMS_COLLECTION),
      where('order_id', '==', orderId)
    );
    
    const snapshot = await getDocs(itemsQuery);
    const items: OrderItem[] = [];
    
    snapshot.forEach((doc) => {
      const data = doc.data();
      items.push({ order_item_id: doc.id, ...data } as OrderItem);
    });
    
    return items;
  } catch (error) {
    console.error('Error fetching order items:', error);
    throw error;
  }
};

