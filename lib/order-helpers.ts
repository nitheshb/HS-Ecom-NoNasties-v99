/**
 * Order Creation Helper Functions
 * These functions provide the dependencies needed for createOrder
 */

import { collection, query, orderBy, getDocs, runTransaction } from 'firebase/firestore';
import { db } from '@/app/db';
import { OrderId, createOrderIdFromNumber, extractOrderIdNumber, OrderItemId, createOrderItemIdFromNumber, extractOrderItemIdNumber } from '@/types/order';
import { getStocksByProductId } from '@/services/read/stock';
import { getAllProductsById } from '@/services/read/product';
import { updateStockQuantity as updateStockQuantityOriginal } from '@/services/update/product';
import { addOrUpdateOrderItem } from '@/services/update/order';
import { OrderItem } from '@/services/read/order';
import { getOrderItems } from '@/services/read/order';

const ORDERS_COLLECTION = 'p_orders';
const ORDER_ITEMS_COLLECTION = 'p_order_items';

/**
 * Generate next sequential order ID
 */
export const generateNextOrderId = async (): Promise<OrderId> => {
  return await runTransaction(db, async () => {
    const ordersRef = collection(db, ORDERS_COLLECTION);
    const latestOrderQuery = query(
      ordersRef,
      orderBy('id', 'desc')
    );
    
    const snapshot = await getDocs(latestOrderQuery);
    
    let nextNumber = 1000000001;
    
    if (!snapshot.empty) {
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        const orderId = data.id || docSnap.id;
        
        if (typeof orderId === 'string' && orderId.startsWith('ORD')) {
          try {
            const numericId = extractOrderIdNumber(orderId as OrderId);
            if (numericId >= nextNumber) {
              nextNumber = numericId + 1;
            }
          } catch {
            // Invalid order ID format, skip
          }
        }
      });
    }
    
    return createOrderIdFromNumber(nextNumber);
  });
};

/**
 * Generate next sequential order item ID
 */
export const generateNextOrderItemId = async (): Promise<string> => {
  return await runTransaction(db, async () => {
    const orderItemsRef = collection(db, ORDER_ITEMS_COLLECTION);
    const latestItemQuery = query(
      orderItemsRef,
      orderBy('order_item_id', 'desc')
    );
    
    const snapshot = await getDocs(latestItemQuery);
    
    let nextNumber = 1000000001;
    
    if (!snapshot.empty) {
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        const itemId = data.order_item_id || docSnap.id;
        
        if (typeof itemId === 'string' && itemId.startsWith('ITM')) {
          try {
            const numericId = extractOrderItemIdNumber(itemId as OrderItemId);
            if (numericId >= nextNumber) {
              nextNumber = numericId + 1;
            }
          } catch {
            // Invalid order item ID format, skip
          }
        }
      });
    }
    
    return createOrderItemIdFromNumber(nextNumber);
  });
};

/**
 * Wrapper for getStocksByProductId to match createOrder interface
 */
export const getStocksByProductIdWrapper = async (productId: string) => {
  const stocks = await getStocksByProductId(productId);
  return {
    data: stocks.map(stock => ({
      id: stock.id,
      quantity: stock.quantity,
      price: stock.price,
    })),
  };
};

/**
 * Wrapper for updateStockQuantity to match createOrder interface (returns void)
 */
const updateStockQuantityWrapper = async (productId: string, stockId: string, delta: number): Promise<void> => {
  await updateStockQuantityOriginal(productId, stockId, delta);
};

/**
 * Get all dependencies needed for createOrder
 */
export const getOrderDependencies = () => {
  return {
    generateNextOrderId,
    getAllProductsById,
    getStocksByProductId: getStocksByProductIdWrapper,
    updateStockQuantity: updateStockQuantityWrapper,
    generateNextOrderItemId,
    addOrUpdateOrderItem: async (orderId: string, item: OrderItem) => {
      return await addOrUpdateOrderItem(orderId, item, {
        generateNextOrderItemId,
        getAllProductsById,
        getOrderItems,
      });
    },
    getOrderItems,
  };
};

