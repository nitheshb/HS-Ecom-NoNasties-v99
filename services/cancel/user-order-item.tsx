import { cancelOrderItem } from '@/services/update/order';
import { getOrderItems } from '@/services/read/order';
import { getStocksByProductId } from '@/services/read/stock';
import { updateStockQuantity } from '@/services/update/product';

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

