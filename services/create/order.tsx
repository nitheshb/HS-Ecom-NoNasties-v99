/**
 * Order Create Operations
 * 
 * This file contains all CREATE operations related to orders:
 * - Order creation
 * - Order item creation (addOrUpdateOrderItem)
 * - Shipment creation
 */

import { doc, setDoc, collection, addDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../app/db';
import { getISTISOString } from '../../utils/dateUtils';
import { OrderId, OrderItemId } from '../../types/order';
import { v4 as uuidv4 } from 'uuid';

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
  products?: Record<string, number>; // Legacy support
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

// ============================================
// HELPER FUNCTIONS
// ============================================

const cleanUndefinedValues = <T,>(obj: T): T => {
  if (obj === null || obj === undefined) return null as T;
  if (typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(cleanUndefinedValues) as T;
  
  const cleaned: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
    if (value !== undefined) {
      cleaned[key] = cleanUndefinedValues(value);
    }
  }
  return cleaned as T;
};

// ============================================
// ORDER CREATE OPERATIONS
// ============================================

/**
 * Create order with proper order items and shipments
 * Note: This function references many dependencies which should be imported or passed as parameters
 */
export const createOrder = async (
  payload: Partial<Order>,
  dependencies?: {
    generateNextOrderId?: () => Promise<OrderId>;
    getAllProductsById?: (lang: string, id: string) => Promise<{ data?: unknown }>;
    getStocksByProductId?: (productId: string) => Promise<{ data?: Array<{ id: string; quantity: number; price: number }> }>;
    updateStockQuantity?: (productId: string, stockId: string, delta: number) => Promise<void>;
    generateNextOrderItemId?: () => Promise<string>;
    addOrUpdateOrderItem?: (orderId: string, item: OrderItem) => Promise<OrderItem>;
    getOrderItems?: (orderId: string) => Promise<OrderItem[]>;
    handleOrderCreated?: (order: Partial<Order>) => Promise<void>;
  }
): Promise<Order> => {
  if (!dependencies?.generateNextOrderId) {
    throw new Error('generateNextOrderId dependency is required');
  }
  
  const orderId = payload.id || await dependencies.generateNextOrderId();
  const now = getISTISOString();
  
  // Create main order (without products object)
  const { products, ...orderData } = payload;
  const order: Order = {
    ...orderData,
    id: orderId,
    order_items_status_count: 0,
    created_at: now,
    updated_at: now,
  } as Order;
  
  // Clean undefined values before saving
  const cleanedOrder = cleanUndefinedValues(order);
  await setDoc(doc(db, ORDERS_COLLECTION, orderId), cleanedOrder);

  // Create order items and shipments from products
  if (products && dependencies.getAllProductsById && dependencies.getStocksByProductId && dependencies.updateStockQuantity && dependencies.generateNextOrderItemId && dependencies.addOrUpdateOrderItem) {
    for (const [productId, quantity] of Object.entries(products)) {
      // Get product price for subtotal calculation
      const { data: productData } = await dependencies.getAllProductsById('', productId);
      const price = (productData as { stocks?: Array<{ price?: number }> })?.stocks?.[0]?.price || 0;
      
      // Reduce stock quantity
      const { data: stocks } = await dependencies.getStocksByProductId(productId);
      if (stocks && stocks.length > 0) {
        const stock = stocks[0];
        const newQty = Math.max(0, (stock.quantity || 0) - Number(quantity));
        await dependencies.updateStockQuantity(productId, stock.id, -Number(quantity));
      }
      
      const orderItem: OrderItem = {
        order_item_id: await dependencies.generateNextOrderItemId(),
        order_id: orderId,
        product_id: productId,
        quantity: Number(quantity),
        subtotal: price * Number(quantity),
        status: 'Active',
        order_item_status: 'new',
        order_item_substatus: 'Pending Confirmation',
      };
      
      await dependencies.addOrUpdateOrderItem(orderId, orderItem);
    }
    
    // Calculate and update order_items_status_count after all items are created
    if (dependencies.getOrderItems) {
      const allOrderItems = await dependencies.getOrderItems(orderId);
      const deliveryItemsCount = allOrderItems.filter(item => {
        const status = item.order_item_status?.toLowerCase() || item.status?.toLowerCase();
        return status === 'delivery' || status === 'delivered';
      }).length;
      
      const productsPrice = allOrderItems.reduce((sum, item) => sum + (item.subtotal || 0), 0);
      const orderTotal = cleanedOrder.total_price || 0;
      const otherCharges = Math.max(0, orderTotal - productsPrice);
      
      await updateDoc(doc(db, ORDERS_COLLECTION, orderId), {
        order_items_status_count: deliveryItemsCount,
        products_price: productsPrice,
        other_charges: otherCharges,
        updated_at: now
      });
    }
  }
  
  // Trigger analytics update for order creation
  if (dependencies?.handleOrderCreated) {
    try {
      await dependencies.handleOrderCreated(cleanedOrder);
    } catch (err) {
      console.error('Failed to update order analytics:', err);
    }
  }

  return order;
};

/**
 * Create shipment for an order item
 */
export const createShipment = async (orderItemId: string, shipmentData: Partial<Shipment>): Promise<Shipment> => {
  const shipmentId = uuidv4();
  const shipmentRef = doc(db, 'shipments', shipmentId);
  
  const shipment: Shipment = {
    shipment_id: shipmentId,
    order_item_id: orderItemId as OrderItemId,
    status: 'Order received',
    subStatus: 'Pending Confirmation',
    carrier: '',
    tracking_number: '',
    shipment_date: getISTISOString(),
    ...shipmentData,
  };
  
  await setDoc(shipmentRef, shipment);
  return shipment;
};

