/**
 * Cart Read Operations
 * 
 * This file contains all READ operations related to carts:
 * - Get user's cart
 * - Get cart items
 */

import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../app/db';
import type { CartItem } from '@/types/cart';

// ============================================
// CONSTANTS
// ============================================

const CARTS_COLLECTION = 'T_carts';

// ============================================
// INTERFACES
// ============================================

export interface Cart {
  id: string;
  user_id: string;
  items: CartItem[];
  created_at: number;
  updated_at: number;
}

// ============================================
// CART READ OPERATIONS
// ============================================

/**
 * Get user's cart
 */
export const getCart = async (userId: string): Promise<Cart | null> => {
  try {
    const cartRef = doc(db, CARTS_COLLECTION, userId);
    const cartSnap = await getDoc(cartRef);

    if (!cartSnap.exists()) {
      return null;
    }

    const data = cartSnap.data();
    return {
      id: cartSnap.id,
      user_id: data.user_id || userId,
      items: data.items || [],
      created_at: data.created_at || Date.now(),
      updated_at: data.updated_at || Date.now(),
    };
  } catch (error) {
    console.error('Error getting cart:', error);
    throw new Error('Failed to get cart');
  }
};

