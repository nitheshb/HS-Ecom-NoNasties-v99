import { cancelOrder, cancelOrderItem } from './order';
import { getOrderItems } from '../read/order';
import { getStocksByProductId } from '../read/stock';
import { updateStockQuantity } from './product';
import { updateOrderItemStatus } from './order';

/**
 * Cancel a user's order and restore stock
 */
export const cancelUserOrder = async (orderId: string, reason: string = 'Cancelled by user') => {
  const dependencies = {
    getOrderItems,
    cancelOrderItem: async (orderItemId: string, reason: string, cancelledBy: string) => {
      return await cancelOrderItem(orderItemId, reason, cancelledBy, {
        getStocksByProductId: async (productId: string) => {
          const stocks = await getStocksByProductId(productId);
          return {
            data: stocks.map(stock => ({
              id: stock.id,
              quantity: stock.quantity || 0,
            })),
          };
        },
        updateStockQuantity: async (productId: string, stockId: string, delta: number) => {
          await updateStockQuantity(productId, stockId, delta);
        },
        getOrderItems,
      });
    },
  };

  return await cancelOrder(orderId, reason, 'User', dependencies);
};

/**
 * Cancel a single order item for a user
 */
export const cancelUserOrderItem = async (
  orderItemId: string, 
  reason: string = 'Cancelled by user'
) => {
  const dependencies = {
    getStocksByProductId: async (productId: string) => {
      const stocks = await getStocksByProductId(productId);
      return {
        data: stocks.map(stock => ({
          id: stock.id,
          quantity: stock.quantity || 0,
        })),
      };
    },
    updateStockQuantity: async (productId: string, stockId: string, delta: number) => {
      await updateStockQuantity(productId, stockId, delta);
    },
    getOrderItems,
  };

  await cancelOrderItem(orderItemId, reason, 'User', dependencies);
};

/**
 * Return a single order item for a user
 */
export const returnUserOrderItem = async (
  orderItemId: string,
  reason: string = 'Returned by user'
) => {
  const dependencies = {
    getStocksByProductId: async (productId: string) => {
      const stocks = await getStocksByProductId(productId);
      return {
        data: stocks.map(stock => ({
          id: stock.id,
          quantity: stock.quantity || 0,
        })),
      };
    },
    updateStockQuantity: async (productId: string, stockId: string, delta: number) => {
      await updateStockQuantity(productId, stockId, delta);
    },
    getOrderItems,
  };

  // Update order item status to 'return'
  await updateOrderItemStatus(orderItemId, 'return', 'Return requested', dependencies);
};

