import { cancelOrder } from '@/services/update/order';
import { getOrderItems } from '@/services/read/order';
import { cancelOrderItem } from '@/services/update/order';
import { getStocksByProductId } from '@/services/read/stock';
import { updateStockQuantity } from '@/services/update/product';

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

