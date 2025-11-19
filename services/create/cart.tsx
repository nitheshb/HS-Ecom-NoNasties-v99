/**
 * Cart Create Operations
 * 
 * This file contains all CREATE operations related to carts:
 * - Create cart for user
 * - Add item to cart
 */

import { doc, setDoc, getDoc } from 'firebase/firestore';
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
// CART CREATE OPERATIONS
// ============================================

/**
 * Create or get user's cart
 */
export const getOrCreateCart = async (userId: string): Promise<Cart> => {
  try {
    const cartRef = doc(db, CARTS_COLLECTION, userId);
    const cartSnap = await getDoc(cartRef);

    if (cartSnap.exists()) {
      const data = cartSnap.data();
      return {
        id: cartSnap.id,
        user_id: userId,
        items: data.items || [],
        created_at: data.created_at || Date.now(),
        updated_at: data.updated_at || Date.now(),
      };
    }

    // Create new cart
    const newCart: Omit<Cart, 'id'> = {
      user_id: userId,
      items: [],
      created_at: Date.now(),
      updated_at: Date.now(),
    };

    await setDoc(cartRef, newCart);

    return {
      id: userId,
      ...newCart,
    };
  } catch (error) {
    console.error('Error creating/getting cart:', error);
    throw new Error('Failed to create/get cart');
  }
};

/**
 * Add item to cart
 */
export const addItemToCart = async (
  userId: string,
  item: CartItem
): Promise<Cart> => {
  try {
    const cart = await getOrCreateCart(userId);
    
    // Check if item already exists (same product ID and size)
    const existingItemIndex = cart.items.findIndex(
      (i) => i.id === item.id && i.size === item.size
    );

    let updatedItems: CartItem[];

    if (existingItemIndex >= 0) {
      // Update quantity if item exists
      updatedItems = cart.items.map((i, index) =>
        index === existingItemIndex
          ? { ...i, quantity: i.quantity + item.quantity }
          : i
      );
    } else {
      // Add new item
      updatedItems = [...cart.items, item];
    }

    // Update cart in Firebase
    const cartRef = doc(db, CARTS_COLLECTION, userId);
    await setDoc(
      cartRef,
      {
        items: updatedItems,
        updated_at: Date.now(),
      },
      { merge: true }
    );

    return {
      ...cart,
      items: updatedItems,
      updated_at: Date.now(),
    };
  } catch (error) {
    console.error('Error adding item to cart:', error);
    throw new Error('Failed to add item to cart');
  }
};

