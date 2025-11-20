/**
 * Order Read Operations
 * 
 * This file contains all READ operations related to orders:
 * - Order retrieval
 * - Order items retrieval
 * - Real-time order subscriptions
 * - Shipment retrieval
 */

import { collection, doc, getDoc, getDocs, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '../../app/db';
import { OrderId, OrderItemId } from '../../types/order';
import { getUserData } from './user';

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
  address: Record<string, unknown>;
  commission_fee: number;
  created_at: string;
  currency: Record<string, unknown>;
  current: boolean;
  delivery_date: string;
  delivery_date_time: string;
  delivery_fee: number;
  delivery_time: string;
  delivery_type: string;
  deliveryman: unknown;
  location: Record<string, unknown>;
  order_items_count: number;
  order_items_status_count?: number;
  origin_price: number;
  otp: number;
  paid_by_split: boolean;
  shop: Record<string, unknown>;
  split: number;
  status: string;
  order_status?: string;
  subStatus?: string;
  total_price: number;
  updated_at: string;
  user: Record<string, unknown>;
  items?: OrderItem[];
  [key: string]: unknown;
}

export interface OrderItem {
  order_item_id?: OrderItemId;
  order_id: string;
  product_id: string;
  name?: string;
  variant_id?: string;
  stock_id?: string;
  quantity: number;
  subtotal: number;
  status?: string;
  cancellation_reason?: string;
  cancelled_at?: string;
  cancelled_by?: string;
  packing_status?: string;
  order_item_status?: string;
  order_item_substatus?: string;
  product?: Record<string, unknown>;
  is_free?: boolean;
  free_offer_id?: string;
  created_at?: string;
  updated_at?: string;
  delivery_date?: number;
  delivery_time?: string;
  delivery_time_start?: string;
  delivery_time_end?: string;
}

export interface Shipment {
  shipment_id?: string;
  order_item_id: OrderItemId;
  shipment_date?: string;
  carrier?: string;
  tracking_number?: string;
  status: string;
  subStatus?: string;
}

type OrderDoc = {
  id: string;
  order_status?: string;
  created_at?: string;
  updated_at?: string;
};

// ============================================
// ORDER READ OPERATIONS
// ============================================

/**
 * Get all orders with customer names fetched from users collection
 */
export const getAllOrders = async () => {
  const ordersCol = collection(db, ORDERS_COLLECTION);
  const snapshot = await getDocs(ordersCol);
  const orders: Order[] = [];
  
  // First, collect all orders and extract unique user IDs
  const userIds = new Set<string>();
  snapshot.forEach(docSnap => {
    const data = docSnap.data();
    const order = { ...data, id: docSnap.id } as Order;
    orders.push(order);
    
    // Extract user ID from order.user.id
    const user = order.user as Record<string, unknown> | undefined;
    if (user && typeof user.id === 'string') {
      userIds.add(user.id);
    }
  });
  
  // Fetch customer names for all unique user IDs
  const userNamesMap = new Map<string, string>();
  await Promise.all(
    Array.from(userIds).map(async (userId) => {
      try {
        const userData = await getUserData(userId);
        if (userData?.name) {
          userNamesMap.set(userId, userData.name);
        }
      } catch (error) {
        console.error(`Error fetching user data for ${userId}:`, error);
      }
    })
  );
  
  // Attach customer names to orders
  const ordersWithCustomerNames = orders.map(order => {
    const user = order.user as Record<string, unknown> | undefined;
    if (user && typeof user.id === 'string') {
      const customerName = userNamesMap.get(user.id);
      if (customerName) {
        return {
          ...order,
          user: {
            ...user,
            name: customerName,
          },
        };
      }
    }
    return order;
  });
  
  return ordersWithCustomerNames;
};

/**
 * Get order by ID, optionally with order items and customer name
 */
export const getOrderById = async (orderId: string, includeItems: boolean = false) => {
  const orderRef = doc(db, ORDERS_COLLECTION, orderId);
  const orderSnap = await getDoc(orderRef);
  if (!orderSnap.exists()) {
    return null;
  }
  const order = { ...orderSnap.data(), id: orderSnap.id } as Order;

  // Fetch customer name from users collection
  const user = order.user as Record<string, unknown> | undefined;
  if (user && typeof user.id === 'string') {
    try {
      const userData = await getUserData(user.id);
      if (userData?.name) {
        order.user = {
          ...user,
          name: userData.name,
        };
      }
    } catch (error) {
      console.error(`Error fetching user data for order ${orderId}:`, error);
    }
  }

  if (includeItems) {
    const itemsQuery = query(
      collection(db, ORDER_ITEMS_COLLECTION),
      where('order_id', '==', orderId)
    );
    const itemsSnap = await getDocs(itemsQuery);
    const items: OrderItem[] = [];
    itemsSnap.forEach(itemSnap => {
      items.push({ order_item_id: itemSnap.id, ...itemSnap.data() } as OrderItem);
    });
    return { ...order, items };
  }
  return order;
};

/**
 * Get order items for a specific order
 */
export const getOrderItems = async (orderId: string): Promise<OrderItem[]> => {
  const itemsQuery = query(
    collection(db, ORDER_ITEMS_COLLECTION),
    where('order_id', '==', orderId)
  );
  const itemsSnap = await getDocs(itemsQuery);
  
  const items = itemsSnap.docs.map(doc => {
    const data = { order_item_id: doc.id, ...doc.data() } as OrderItem;
    return data;
  });
  
  return items;
};

/**
 * Real-time order items listener
 */
export const subscribeToOrderItems = (
  orderId: string, 
  callback: (items: OrderItem[]) => void,
  onError?: (error: Error) => void
): (() => void) => {
  const itemsQuery = query(
    collection(db, ORDER_ITEMS_COLLECTION),
    where('order_id', '==', orderId)
  );
  
  const unsubscribe = onSnapshot(
    itemsQuery,
    (snapshot) => {
      const items: OrderItem[] = [];
      snapshot.forEach(doc => {
        const data = { order_item_id: doc.id, ...doc.data() } as OrderItem;
        items.push(data);
      });
      callback(items);
    },
    (error) => {
      console.error('Error in order items snapshot:', error);
      if (onError) {
        onError(error);
      }
    }
  );
  
  return unsubscribe;
};

/**
 * Subscribe to order events (new orders, cancelled orders)
 * Note: This function references handleOrderStatusChange and addNotificationOnce which should be imported or passed as dependencies
 */
export function subscribeToOrderEvents(
  onNew: (order: OrderDoc) => void,
  onCancelled: (order: OrderDoc) => void,
  dependencies?: {
    handleOrderStatusChange?: (orderId: string, oldStatus: string, newStatus: string) => Promise<void>;
    addNotificationOnce?: (notification: { title: string; body?: string; type?: string; source?: string; orderId?: string }) => Promise<void>;
  }
): () => void {
  const ordersCol = collection(db, "p_orders");
  const lastStatusById = new Map<string, string | undefined>();
  let initialLoaded = false;

  const unsubscribe = onSnapshot(ordersCol, (snap) => {
    if (!initialLoaded) {
      // Seed previous statuses to avoid spamming on initial load
      snap.docs.forEach((docSnap) => {
        const data = docSnap.data() as any;
        lastStatusById.set(docSnap.id, data?.order_status);
      });
      initialLoaded = true;
      return;
    }

    snap.docChanges().forEach(async (change) => {
      const data = change.doc.data() as any;
      const order: OrderDoc = { id: change.doc.id, order_status: data?.order_status, created_at: data?.created_at, updated_at: data?.updated_at };

      if (change.type === "added") {
        console.log("[OrdersRT] New order added:", order.id);
        onNew(order);
        if (dependencies?.addNotificationOnce) {
          void dependencies.addNotificationOnce({
            title: "New order placed",
            body: `Order ${order.id} created`,
            type: "order_created",
            source: "orders_listener",
            orderId: order.id,
          });
        }
        lastStatusById.set(order.id, order.order_status);
      } else if (change.type === "modified") {
        const prev = lastStatusById.get(order.id);
        const curr = order.order_status;
        
        if (prev !== curr) {
          // Handle status change to cancelled with automatic stock restoration
          if (curr?.toLowerCase() === "cancelled" && prev?.toLowerCase() !== "cancelled") {
            console.log("[OrdersRT] Order cancelled:", order.id);
            onCancelled(order);
            
            // Trigger automatic stock restoration
            if (dependencies?.handleOrderStatusChange) {
              try {
                await dependencies.handleOrderStatusChange(order.id, prev || '', curr);
                console.log(`[OrdersRT] Stock restoration completed for order ${order.id}`);
              } catch (error) {
                console.error(`[OrdersRT] Failed to restore stock for order ${order.id}:`, error);
              }
            }
            
            if (dependencies?.addNotificationOnce) {
              void dependencies.addNotificationOnce({
                title: "Order cancelled",
                body: `Order ${order.id} has been cancelled and inventory restored`,
                type: "order_cancelled",
                source: "orders_listener",
                orderId: order.id,
              });
            }
          }
          
          lastStatusById.set(order.id, curr);
        }
      } else if (change.type === "removed") {
        lastStatusById.delete(order.id);
      }
    });
  }, (error) => {
    console.error("[OrdersRT] onSnapshot error", error);
  });

  return unsubscribe;
}

// ============================================
// SHIPMENT READ OPERATIONS
// ============================================

/**
 * Get shipments by order item ID
 */
export const getShipmentsByOrderItem = async (orderItemId: string): Promise<Shipment[]> => {
  const shipmentsQuery = query(
    collection(db, 'shipments'),
    where('order_item_id', '==', orderItemId)
  );
  
  const snapshot = await getDocs(shipmentsQuery);
  return snapshot.docs.map(doc => ({ shipment_id: doc.id, ...doc.data() } as Shipment));
};

// ============================================
// HOUSE READ OPERATIONS (from orders data)
// ============================================

export interface House {
  value: string;
  label: string;
  count: number;
}

/**
 * Get all houses from order addresses
 */
export const getAllHouses = async (): Promise<{ success: boolean; data?: House[]; error?: string }> => {
  try {
    const ordersCol = collection(db, ORDERS_COLLECTION);
    const ordersQuery = query(ordersCol, orderBy('created_at', 'desc'));
    const snapshot = await getDocs(ordersQuery);
    
    const houseCounts: Record<string, number> = {};
    
    snapshot.forEach((doc) => {
      const data = doc.data();
      const address = data.address as Record<string, string> | undefined;
      
      if (address && address.street) {
        const streetValue = address.street.trim();
        if (streetValue) {
          houseCounts[streetValue] = (houseCounts[streetValue] || 0) + 1;
        }
      }
    });
    
    // Convert to array and sort by count (descending)
    const houses: House[] = Object.entries(houseCounts)
      .map(([value, count]) => ({
        value,
        label: value,
        count
      }))
      .sort((a, b) => b.count - a.count);
    
    console.log(`🏠 Loaded ${houses.length} unique houses from orders`);
    return { success: true, data: houses };
  } catch (error) {
    console.error('❌ Error fetching houses:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : String(error) 
    };
  }
};

