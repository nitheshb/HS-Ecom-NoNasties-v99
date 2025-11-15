/**
 * Order Update Operations
 * 
 * This file contains all UPDATE operations related to orders:
 * - Order updates
 * - Order item updates
 * - Order status synchronization
 * - Shipment updates
 * - Order cancellation
 */

import { doc, updateDoc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../app/db';
import { getISTISOString } from '../../utils/dateUtils';
import { OrderId, OrderItemId } from '../../types/order';

// ============================================
// CONSTANTS
// ============================================

const ORDERS_COLLECTION = 'p_orders';
const ORDER_ITEMS_COLLECTION = 'p_order_items';
const STATUS_COLLECTIONS_COLLECTION = 'status_collections';

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

interface StatusCollection {
  id: string;
  label: string;
  value: string;
  default_key: boolean;
  groups: {
    [key: string]: {
      default_value: string;
      values: string[];
    };
  };
  created_at: number;
  updated_at: number;
}

// ============================================
// HELPER FUNCTIONS (These will need to be imported from other files)
// ============================================

// Note: These functions are referenced but need to be imported from their respective files
// - getOrderItems (from read operations)
// - getStocksByProductId (from product operations)
// - updateStockQuantity (from product operations)
// - getDefaultSubstatus (defined below)
// - handleOrderUpdated (from analytics - optional)

/**
 * Get status collection by value
 */
const getStatusCollection = async (statusValue: string): Promise<StatusCollection | null> => {
  try {
    const statusQuery = query(
      collection(db, STATUS_COLLECTIONS_COLLECTION),
      where('value', '==', statusValue)
    );
    const snapshot = await getDocs(statusQuery);
    
    if (snapshot.empty) {
      return null;
    }
    
    const data = snapshot.docs[0].data();
    return {
      id: snapshot.docs[0].id,
      ...data,
      created_at: data.created_at?.toMillis() || Date.now(),
      updated_at: data.updated_at?.toMillis() || Date.now(),
    } as StatusCollection;
  } catch (error) {
    console.error('Error getting status collection:', error);
    return null;
  }
};

/**
 * Get default substatus for a given status value
 */
const getDefaultSubstatus = async (statusValue: string): Promise<string> => {
  const statusCollection = await getStatusCollection(statusValue);
  if (!statusCollection) {
    return 'Pending Confirmation'; // Default fallback
  }
  
  // Get the first group's default value
  const groups = statusCollection.groups;
  const firstGroup = Object.values(groups)[0];
  return firstGroup?.default_value || 'Pending Confirmation';
};

// ============================================
// ORDER UPDATE OPERATIONS
// ============================================

/**
 * Update an order (main document only)
 * Note: This function references handleOrderUpdated and updateOrderItemsStatusFromOrder
 * which should be imported or defined elsewhere
 */
export const updateOrder = async (
  orderId: string, 
  updates: Partial<Order>,
  dependencies?: {
    updateOrderItemsStatusFromOrder?: (orderId: string, status: string, subStatus?: string) => Promise<void>;
    handleOrderUpdated?: (orderId: string, oldOrder: Partial<Order>, newOrder: Partial<Order>) => Promise<void>;
  }
): Promise<Order> => {
  const orderRef = doc(db, ORDERS_COLLECTION, orderId);
  
  // Get the current order data before updating
  const currentSnap = await getDoc(orderRef);
  const oldOrder = currentSnap.exists() ? currentSnap.data() as Order : {};
  
  const now = getISTISOString();
  await updateDoc(orderRef, { ...updates, updated_at: now });
  
  const updatedSnap = await getDoc(orderRef);
  const newOrder = updatedSnap.exists() ? updatedSnap.data() as Order : {};
  
  // Check if order_status or subStatus changed and sync to order items
  const orderStatusChanged = updates.order_status && updates.order_status !== (oldOrder as Order).order_status;
  const subStatusChanged = updates.subStatus && updates.subStatus !== (oldOrder as Order).subStatus;
  
  if (orderStatusChanged || subStatusChanged) {
    try {
      let orderStatus: string = '';
      if (typeof updates.order_status === 'string') {
        orderStatus = updates.order_status;
      } else {
        const oldOrderStatus = (oldOrder as Order).order_status;
        if (typeof oldOrderStatus === 'string') {
          orderStatus = oldOrderStatus;
        }
      }
      
      const subStatus: string | undefined = typeof updates.subStatus === 'string' 
        ? updates.subStatus 
        : undefined;
      
      if (dependencies?.updateOrderItemsStatusFromOrder) {
        await dependencies.updateOrderItemsStatusFromOrder(orderId, orderStatus, subStatus);
      }
    } catch (error) {
      console.error('Error syncing order status to order items:', error);
    }
  }
  
  // Update analytics if handler is provided
  if (dependencies?.handleOrderUpdated) {
    try {
      await dependencies.handleOrderUpdated(orderId, oldOrder, newOrder);
    } catch (error) {
      console.error('Failed to update order analytics:', error);
    }
  }
  
  return { ...newOrder, id: updatedSnap.id } as Order;
};

/**
 * Update order_item_status for all items in an order when order_status changes
 */
export const updateOrderItemsStatusFromOrder = async (
  orderId: string, 
  newOrderStatus: string, 
  newSubStatus?: string,
  dependencies?: {
    getOrderItems?: (orderId: string) => Promise<OrderItem[]>;
    getStocksByProductId?: (productId: string) => Promise<{ data?: Array<{ id: string; quantity: number }> }>;
    updateStockQuantity?: (productId: string, stockId: string, delta: number) => Promise<void>;
  }
): Promise<void> => {
  try {
    if (!dependencies?.getOrderItems) {
      throw new Error('getOrderItems dependency is required');
    }
    
    const orderItems = await dependencies.getOrderItems(orderId);
    
    if (orderItems.length === 0) {
      return;
    }
    
    const defaultSubStatus = newSubStatus || await getDefaultSubstatus(newOrderStatus);
    
    // Update each order item's order_item_status and order_item_substatus
    const updatePromises = orderItems.map(async (item) => {
      if (!item.order_item_id) return;
      
      const oldStatus = item.order_item_status || 'new';
      
      // Handle stock management for bulk status changes
      if (dependencies.getStocksByProductId && dependencies.updateStockQuantity) {
        try {
          const { data: stocks } = await dependencies.getStocksByProductId(item.product_id);
          if (stocks && stocks.length > 0) {
            const stockId = (item.stock_id as string) || stocks[0].id;
            
            let stockAction: 'reduce' | 'restore' | 'none' = 'none';
            
            if (newOrderStatus.toLowerCase() === 'orderreceived' && oldStatus.toLowerCase() !== 'orderreceived') {
              stockAction = 'reduce';
            } else if (oldStatus.toLowerCase() === 'orderreceived' && newOrderStatus.toLowerCase() !== 'orderreceived') {
              stockAction = 'restore';
            } else if (newOrderStatus.toLowerCase() === 'cancelled' && oldStatus.toLowerCase() !== 'cancelled') {
              stockAction = 'restore';
            }
            
            if (stockAction !== 'none') {
              const stockDelta = stockAction === 'reduce' ? -item.quantity : +item.quantity;
              await dependencies.updateStockQuantity(item.product_id, stockId, stockDelta);
            }
          }
        } catch (stockError) {
          console.error(`Error managing stock for item ${item.order_item_id}:`, stockError);
        }
      }
      
      const itemRef = doc(db, ORDER_ITEMS_COLLECTION, item.order_item_id);
      await updateDoc(itemRef, {
        order_item_status: newOrderStatus,
        order_item_substatus: defaultSubStatus,
        updated_at: getISTISOString()
      });
    });
    
    await Promise.all(updatePromises);
  } catch (error) {
    console.error('Error updating order items status from order:', error);
    throw error;
  }
};

/**
 * Update order_status based on order_item_status aggregation
 */
export const updateOrderStatusFromItems = async (
  orderId: string,
  dependencies?: {
    getOrderItems?: (orderId: string) => Promise<OrderItem[]>;
  }
): Promise<void> => {
  try {
    if (!dependencies?.getOrderItems) {
      throw new Error('getOrderItems dependency is required');
    }
    
    const orderItems = await dependencies.getOrderItems(orderId);
    
    if (orderItems.length === 0) {
      return;
    }
    
    // Group items by their order_item_status
    const statusGroups: { [key: string]: OrderItem[] } = {};
    orderItems.forEach(item => {
      const status = (item.order_item_status || 'new').toLowerCase();
      if (!statusGroups[status]) {
        statusGroups[status] = [];
      }
      statusGroups[status].push(item);
    });
    
    // Determine the overall order status based on item statuses
    const statusPriority: { [key: string]: number } = {
      'cancelled': 1,
      'return': 2,
      'delivered': 3,
      'delivery': 4,
      'orderreceived': 5,
      'new': 6,
    };
    
    const uniqueStatuses = Object.keys(statusGroups);
    const sortedStatuses = uniqueStatuses.sort((a, b) => {
      const priorityA = statusPriority[a] || 999;
      const priorityB = statusPriority[b] || 999;
      return priorityA - priorityB;
    });
    
    const statusMapping: { [key: string]: string } = {
      'cancelled': 'cancelled',
      'return': 'return',
      'delivered': 'delivered',
      'delivery': 'delivery',
      'orderreceived': 'orderReceived',
      'new': 'new',
    };
    
    let newOrderStatus: string;
    let newSubStatus: string;
    
    if (uniqueStatuses.length === 1) {
      const singleStatus = uniqueStatuses[0];
      newOrderStatus = statusMapping[singleStatus] || singleStatus;
      
      if (singleStatus === 'cancelled') {
        newSubStatus = 'Cancelled by Admin';
      } else if (singleStatus === 'return') {
        newSubStatus = 'Return requested';
      } else if (singleStatus === 'delivered') {
        newSubStatus = 'All items delivered';
      } else if (singleStatus === 'delivery') {
        newSubStatus = 'All items in delivery';
      } else if (singleStatus === 'orderreceived') {
        newSubStatus = 'Order Confirmed';
      } else {
        newSubStatus = 'Pending Confirmation';
      }
    } else {
      const cancelledItemsCount = statusGroups['cancelled']?.length || 0;
      const totalItemsCount = orderItems.length;
      
      if (cancelledItemsCount === totalItemsCount) {
        newOrderStatus = 'cancelled';
        newSubStatus = 'Cancelled by Admin';
      } else {
        const nonCancelledStatuses = uniqueStatuses.filter(status => status !== 'cancelled');
        if (nonCancelledStatuses.length > 0) {
          const highestPriorityStatus = nonCancelledStatuses[0];
          newOrderStatus = statusMapping[highestPriorityStatus] || highestPriorityStatus;
          newSubStatus = await getDefaultSubstatus(newOrderStatus);
        } else {
          newOrderStatus = 'new';
          newSubStatus = 'Pending Confirmation';
        }
      }
    }
    
    // Update the order document
    const orderRef = doc(db, ORDERS_COLLECTION, orderId);
    await updateDoc(orderRef, {
      order_status: newOrderStatus,
      subStatus: newSubStatus,
      updated_at: getISTISOString()
    });
  } catch (error) {
    console.error('Error updating order status from items:', error);
    throw error;
  }
};

/**
 * Update individual order item status and trigger order status aggregation
 */
export const updateOrderItemStatus = async (
  orderItemId: string, 
  newStatus: string, 
  newSubStatus?: string,
  dependencies?: {
    getStocksByProductId?: (productId: string) => Promise<{ data?: Array<{ id: string; quantity: number }> }>;
    updateStockQuantity?: (productId: string, stockId: string, delta: number) => Promise<void>;
    getOrderItems?: (orderId: string) => Promise<OrderItem[]>;
  }
): Promise<void> => {
  try {
    const itemRef = doc(db, ORDER_ITEMS_COLLECTION, orderItemId);
    const itemSnap = await getDoc(itemRef);
    
    if (!itemSnap.exists()) {
      throw new Error('Order item not found');
    }
    
    const itemData = itemSnap.data() as OrderItem;
    const oldStatus = itemData.order_item_status || 'new';
    
    // Handle stock management based on status changes
    if (dependencies?.getStocksByProductId && dependencies?.updateStockQuantity) {
      try {
        const { data: stocks } = await dependencies.getStocksByProductId(itemData.product_id);
        if (stocks && stocks.length > 0) {
          const stockId = (itemData.stock_id as string) || stocks[0].id;
          
          let stockAction: 'reduce' | 'restore' | 'none' = 'none';
          
          if (newStatus.toLowerCase() === 'orderreceived' && oldStatus.toLowerCase() !== 'orderreceived') {
            stockAction = 'reduce';
          } else if (oldStatus.toLowerCase() === 'orderreceived' && newStatus.toLowerCase() !== 'orderreceived') {
            stockAction = 'restore';
          } else if (newStatus.toLowerCase() === 'cancelled' && oldStatus.toLowerCase() !== 'cancelled') {
            stockAction = 'restore';
          }
          
          if (stockAction !== 'none') {
            const stockDelta = stockAction === 'reduce' ? -itemData.quantity : +itemData.quantity;
            await dependencies.updateStockQuantity(itemData.product_id, stockId, stockDelta);
          }
        }
      } catch (stockError) {
        console.error('Error managing stock during status change:', stockError);
      }
    }
    
    const defaultSubStatus = newSubStatus || await getDefaultSubstatus(newStatus);
    
    // Update the order item status
    await updateDoc(itemRef, {
      order_item_status: newStatus,
      order_item_substatus: defaultSubStatus,
      updated_at: getISTISOString()
    });
    
    // Trigger order status aggregation
    if (dependencies?.getOrderItems) {
      await updateOrderStatusFromItems(itemData.order_id, dependencies);
    }
  } catch (error) {
    console.error('Error updating order item status:', error);
    throw error;
  }
};

/**
 * Update an existing order item
 */
export const updateOrderItem = async (
  orderId: string, 
  item: OrderItem,
  dependencies?: {
    getOrderItems?: (orderId: string) => Promise<OrderItem[]>;
    handleOrderUpdated?: (orderId: string, oldOrder: Partial<Order>, newOrder: Partial<Order>) => Promise<void>;
  }
): Promise<OrderItem> => {
  if (!item.order_item_id) {
    throw new Error('Order item ID is required for update');
  }
  
  const orderRef = doc(db, ORDERS_COLLECTION, orderId);
  const currentOrderSnap = await getDoc(orderRef);
  const oldOrder = currentOrderSnap.exists() ? currentOrderSnap.data() as Order : {};
  
  const itemRef = doc(db, ORDER_ITEMS_COLLECTION, item.order_item_id);
  const currentItemSnap = await getDoc(itemRef);
  const oldItem = currentItemSnap.exists() ? currentItemSnap.data() as OrderItem : {};
  
  const updateData = { 
    ...item, 
    order_id: orderId,
    updated_at: getISTISOString()
  };
  delete (updateData as Record<string, unknown>).order_item_id;
  await updateDoc(itemRef, updateData);
  
  // Check if order_item_status changed and sync to order
  if (item.order_item_status && item.order_item_status !== (oldItem as OrderItem).order_item_status) {
    try {
      if (dependencies?.getOrderItems) {
        await updateOrderStatusFromItems(orderId, dependencies);
      }
    } catch (error) {
      console.error('Error syncing order item status to order:', error);
    }
  }
  
  // Recalculate order total after item update
  if (dependencies?.getOrderItems) {
    const allOrderItems = await dependencies.getOrderItems(orderId);
    const activeItems = allOrderItems.filter(item => item.status?.toLowerCase() !== 'cancelled');
    const newTotalPrice = activeItems.reduce((sum, item) => sum + (item.subtotal || 0), 0);
    
    const deliveryItemsCount = allOrderItems.filter(item => {
      const status = item.order_item_status?.toLowerCase() || item.status?.toLowerCase();
      return status === 'delivery' || status === 'delivered';
    }).length;
    
    await updateDoc(orderRef, { 
      total_price: newTotalPrice,
      order_items_status_count: deliveryItemsCount,
      order_items_count: allOrderItems.length,
      updated_at: getISTISOString()
    });
    
    const updatedOrderSnap = await getDoc(orderRef);
    const newOrder = updatedOrderSnap.exists() ? updatedOrderSnap.data() as Order : {};
    
    if (dependencies?.handleOrderUpdated) {
      try {
        await dependencies.handleOrderUpdated(orderId, oldOrder, newOrder);
      } catch (error) {
        console.error('Failed to update order analytics after item update:', error);
      }
    }
  }
  
  return item;
};

/**
 * Cancel an individual order item
 */
export const cancelOrderItem = async (
  orderItemId: string, 
  reason: string, 
  cancelledBy: string = 'Admin',
  dependencies?: {
    getStocksByProductId?: (productId: string) => Promise<{ data?: Array<{ id: string; quantity: number }> }>;
    updateStockQuantity?: (productId: string, stockId: string, delta: number) => Promise<void>;
    getOrderItems?: (orderId: string) => Promise<OrderItem[]>;
  }
): Promise<void> => {
  const itemRef = doc(db, ORDER_ITEMS_COLLECTION, orderItemId);
  const itemSnap = await getDoc(itemRef);
  
  if (!itemSnap.exists()) {
    throw new Error('Order item not found');
  }
  
  const itemData = itemSnap.data() as OrderItem;
  
  await updateDoc(itemRef, {
    status: 'cancelled',
    order_item_status: 'cancelled',
    order_item_substatus: 'Cancelled by Admin',
    cancellation_reason: reason,
    cancelled_at: getISTISOString(),
    cancelled_by: cancelledBy,
    updated_at: getISTISOString(),
  });

  // Trigger order status aggregation
  if (dependencies?.getOrderItems) {
    try {
      await updateOrderStatusFromItems(itemData.order_id, dependencies);
    } catch (error) {
      console.error('Error updating order status after item cancellation:', error);
    }
  }
  
  // Restore stock quantity
  if (dependencies?.getStocksByProductId && dependencies?.updateStockQuantity) {
    try {
      const { data: stocks } = await dependencies.getStocksByProductId(itemData.product_id);
      if (stocks && stocks.length > 0) {
        const stockId = (itemData.stock_id as string) || stocks[0].id;
        await dependencies.updateStockQuantity(itemData.product_id, stockId, +itemData.quantity);
      }
    } catch (error) {
      console.error('Error restoring stock after item cancellation:', error);
    }
  }
};

/**
 * Cancel an entire order and restore all stock quantities
 */
export const cancelOrder = async (
  orderId: string, 
  reason: string, 
  cancelledBy: string = 'Admin',
  dependencies?: {
    getOrderItems?: (orderId: string) => Promise<OrderItem[]>;
    cancelOrderItem?: (orderItemId: string, reason: string, cancelledBy: string) => Promise<void>;
    handleOrderUpdated?: (orderId: string, oldOrder: Partial<Order>, newOrder: Partial<Order>) => Promise<void>;
  }
): Promise<{ success: boolean; orderId: string; cancelledItems: number; totalCancelledValue: number; message: string }> => {
  try {
    const orderRef = doc(db, ORDERS_COLLECTION, orderId);
    const orderSnap = await getDoc(orderRef);
    
    if (!orderSnap.exists()) {
      throw new Error('Order not found');
    }
    
    const orderData = orderSnap.data() as Order;
    
    if (typeof orderData.order_status === 'string' && orderData.order_status.toLowerCase() === 'cancelled') {
      return { success: true, orderId, cancelledItems: 0, totalCancelledValue: 0, message: 'Order already cancelled' };
    }
    
    if (!dependencies?.getOrderItems || !dependencies?.cancelOrderItem) {
      throw new Error('Required dependencies not provided');
    }
    
    const orderItems = await dependencies.getOrderItems(orderId);
    
    let totalCancelledValue = 0;
    let restoredItems = 0;
    
    for (const item of orderItems) {
      if (item.order_item_id && item.status?.toLowerCase() !== 'cancelled') {
        try {
          await dependencies.cancelOrderItem(item.order_item_id, reason, cancelledBy);
          totalCancelledValue += item.subtotal || 0;
          restoredItems++;
        } catch (error) {
          console.error(`Failed to cancel order item ${item.order_item_id}:`, error);
        }
      }
    }
    
    await updateDoc(orderRef, {
      order_status: 'cancelled',
      subStatus: 'Cancelled by Admin',
      cancellation_reason: reason,
      cancelled_at: getISTISOString(),
      cancelled_by: cancelledBy,
      updated_at: getISTISOString()
    });
    
    if (dependencies?.handleOrderUpdated) {
      try {
        await dependencies.handleOrderUpdated(
          orderId,
          { 
            total_price: orderData.total_price, 
            status: (orderData.status as string) || 'new', 
            order_status: (orderData.order_status as string) || 'new',
            created_at: orderData.created_at 
          },
          { 
            total_price: orderData.total_price, 
            status: 'cancelled', 
            order_status: 'cancelled',
            created_at: orderData.created_at 
          }
        );
      } catch (error) {
        console.error('Failed to update order analytics after cancellation:', error);
      }
    }
    
    return {
      success: true,
      orderId,
      cancelledItems: restoredItems,
      totalCancelledValue,
      message: `Order cancelled successfully. ${restoredItems} items restored to inventory.`
    };
  } catch (error) {
    console.error('Error cancelling order:', error);
    throw error;
  }
};

/**
 * Update shipment
 */
export const updateShipment = async (shipmentId: string, updates: Partial<Shipment>): Promise<Shipment> => {
  try {
    const shipmentRef = doc(db, 'shipments', shipmentId);
    
    const shipmentSnap = await getDoc(shipmentRef);
    if (!shipmentSnap.exists()) {
      throw new Error(`Shipment with ID ${shipmentId} not found`);
    }
    
    const updateData = {
      ...updates,
      updated_at: getISTISOString()
    };
    
    await updateDoc(shipmentRef, updateData);
    
    const updatedSnap = await getDoc(shipmentRef);
    return { shipment_id: shipmentId, ...updatedSnap.data() } as Shipment;
  } catch (error) {
    console.error('Error updating shipment:', error);
    throw error;
  }
};

/**
 * Manually trigger order status aggregation (useful for debugging)
 */
export const triggerOrderStatusAggregation = async (
  orderId: string,
  dependencies?: {
    getOrderItems?: (orderId: string) => Promise<OrderItem[]>;
  }
): Promise<void> => {
  try {
    if (dependencies?.getOrderItems) {
      await updateOrderStatusFromItems(orderId, dependencies);
    }
  } catch (error) {
    console.error('Error in manual order status aggregation:', error);
    throw error;
  }
};

/**
 * Add or update an order item with shipment
 * Note: This function performs both create and update operations
 */
export const addOrUpdateOrderItem = async (
  orderId: string, 
  item: OrderItem,
  dependencies?: {
    generateNextOrderItemId?: () => Promise<string>;
    getAllProductsById?: (lang: string, id: string) => Promise<{ data?: unknown }>;
    getShipmentsByOrderItem?: (orderItemId: string) => Promise<Shipment[]>;
    createShipment?: (orderItemId: string, shipmentData: Partial<Shipment>) => Promise<void>;
    getOrderItems?: (orderId: string) => Promise<OrderItem[]>;
    handleOrderUpdated?: (orderId: string, oldOrder: Partial<Order>, newOrder: Partial<Order>) => Promise<void>;
  }
): Promise<OrderItem> => {
  if (!dependencies?.generateNextOrderItemId) {
    throw new Error('generateNextOrderItemId dependency is required');
  }
  
  const itemId = item.order_item_id || await dependencies.generateNextOrderItemId();
  const itemRef = doc(db, ORDER_ITEMS_COLLECTION, itemId);
  
  const orderRef = doc(db, ORDERS_COLLECTION, orderId);
  const currentOrderSnap = await getDoc(orderRef);
  const oldOrder = currentOrderSnap.exists() ? currentOrderSnap.data() as Order : {};
  
  // Helper function to get product name
  const getProductName = (product: unknown): string => {
    if (!product) return '';
    const p = product as Record<string, unknown>;
    if (p.translation && typeof p.translation === 'object' && (p.translation as Record<string, unknown>).title) {
      return (p.translation as Record<string, unknown>).title as string;
    }
    if (p.title && typeof p.title === 'object') {
      const titleValues = Object.values(p.title as Record<string, string>);
      if (titleValues.length > 0) return titleValues[0];
    }
    if (typeof p.title === 'string') return p.title;
    return '';
  };
  
  // Fetch product data to get product name
  let productName = item.name || '';
  if (!productName && item.product_id && dependencies.getAllProductsById) {
    try {
      const { data: productData } = await dependencies.getAllProductsById('', item.product_id);
      productName = getProductName(productData);
    } catch (error) {
      console.error(`Error fetching product name for ${item.product_id}:`, error);
    }
  }
  
  const now = getISTISOString();
  const orderItemData = {
    ...item,
    order_item_id: itemId,
    order_id: orderId,
    name: productName,
    created_at: item.created_at || now,
    updated_at: now,
  };
  
  const { setDoc } = await import('firebase/firestore');
  await setDoc(itemRef, orderItemData);
  
  // Always ensure a shipment exists for this order item
  if (dependencies?.getShipmentsByOrderItem && dependencies?.createShipment) {
    const existingShipments = await dependencies.getShipmentsByOrderItem(itemId);
    if (existingShipments.length === 0) {
      await dependencies.createShipment(itemId, { 
        status: 'Order received',
        subStatus: 'Pending Confirmation',
        shipment_date: now
      });
    }
  }
  
  // Recalculate order total after item addition/update
  if (dependencies?.getOrderItems) {
    const allOrderItems = await dependencies.getOrderItems(orderId);
    const activeItems = allOrderItems.filter(item => item.status?.toLowerCase() !== 'cancelled');
    const newTotalPrice = activeItems.reduce((sum, item) => sum + (item.subtotal || 0), 0);
    
    const deliveryItemsCount = allOrderItems.filter(item => {
      const status = item.order_item_status?.toLowerCase() || item.status?.toLowerCase();
      return status === 'delivery' || status === 'delivered';
    }).length;
    
    await updateDoc(orderRef, { 
      total_price: newTotalPrice,
      order_items_status_count: deliveryItemsCount,
      order_items_count: allOrderItems.length,
      updated_at: now
    });
    
    const updatedOrderSnap = await getDoc(orderRef);
    const newOrder = updatedOrderSnap.exists() ? updatedOrderSnap.data() as Order : {};
    
    if (dependencies?.handleOrderUpdated) {
      try {
        await dependencies.handleOrderUpdated(orderId, oldOrder, newOrder);
      } catch (error) {
        console.error('Failed to update order analytics after item update:', error);
      }
    }
  }
  
  return orderItemData;
};

/**
 * Database trigger function for automatic stock restoration when order status changes
 */
export const handleOrderStatusChange = async (
  orderId: string, 
  oldStatus: string, 
  newStatus: string,
  dependencies?: {
    getOrderItems?: (orderId: string) => Promise<OrderItem[]>;
  }
): Promise<{ success: boolean; restoredItems?: number; message?: string }> => {
  try {
    // Only process when status changes to cancelled
    if (newStatus?.toLowerCase() === 'cancelled' && oldStatus?.toLowerCase() !== 'cancelled') {
      if (!dependencies?.getOrderItems) {
        throw new Error('getOrderItems dependency is required');
      }
      
      const orderItems = await dependencies.getOrderItems(orderId);
      
      let restoredItems = 0;
      
      for (const item of orderItems) {
        if (item.status?.toLowerCase() !== 'cancelled') {
          try {
            // Update order item status to cancelled (but don't restore stock)
            // Stock is now handled by cancelOrderItem function
            if (item.order_item_id) {
              await updateDoc(doc(db, ORDER_ITEMS_COLLECTION, item.order_item_id), {
                status: 'cancelled',
                cancellation_reason: 'Order cancelled',
                cancelled_at: getISTISOString(),
                cancelled_by: 'System',
                updated_at: getISTISOString()
              });
            }
            
            restoredItems++;
          } catch (error) {
            console.error(`Failed to update order item ${item.order_item_id}:`, error);
          }
        }
      }
      
      return { success: true, restoredItems };
    }
    
    return { success: true, message: 'No action needed for this status change' };
  } catch (error) {
    console.error('Error in handleOrderStatusChange:', error);
    throw error;
  }
};

