/**
 * Stock Read Operations
 * 
 * This file contains all READ operations related to stock/inventory:
 * - Get stock by product ID
 * - Check stock availability
 */

import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../app/db';

// ============================================
// CONSTANTS
// ============================================

const STOCKS_COLLECTION = 'T_stocks';

// ============================================
// INTERFACES
// ============================================

export interface Stock {
  id: string;
  countable_id: string;
  sku: string;
  price: number;
  strike_price: number;
  discount_percent: number;
  quantity: number;
  tax: number;
  total_price: number;
  addon: boolean;
  addons: unknown[];
  extras: string[] | unknown[];
  bonus: unknown | null;
  created_at: number;
  updated_at: number;
  [key: string]: unknown;
}

// ============================================
// STOCK READ OPERATIONS
// ============================================

/**
 * Get stocks by product ID
 */
export const getStocksByProductId = async (productId: string): Promise<Stock[]> => {
  try {
    const stocksQuery = query(
      collection(db, STOCKS_COLLECTION),
      where('countable_id', '==', productId)
    );
    const stocksSnapshot = await getDocs(stocksQuery);
    
    return stocksSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Stock[];
  } catch (error) {
    console.error('Error getting stocks by product ID:', error);
    throw new Error('Failed to get stocks');
  }
};

/**
 * Check if product has available stock
 */
export const checkStockAvailability = async (
  productId: string,
  requestedQuantity: number
): Promise<{ available: boolean; availableQuantity: number; stocks: Stock[] }> => {
  try {
    const stocks = await getStocksByProductId(productId);
    
    if (stocks.length === 0) {
      return {
        available: false,
        availableQuantity: 0,
        stocks: [],
      };
    }

    // Sum up all available quantities
    const totalAvailableQuantity = stocks.reduce(
      (sum, stock) => sum + (Number(stock.quantity) || 0),
      0
    );

    return {
      available: totalAvailableQuantity >= requestedQuantity,
      availableQuantity: totalAvailableQuantity,
      stocks,
    };
  } catch (error) {
    console.error('Error checking stock availability:', error);
    throw new Error('Failed to check stock availability');
  }
};

