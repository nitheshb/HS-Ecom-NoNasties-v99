/**
 * Cart Update Operations
 * 
 * This file contains all UPDATE operations related to carts:
 * - Update cart items
 * - Update item quantity
 * - Remove item from cart
 * - Clear cart
 */

import { doc, setDoc } from 'firebase/firestore';
import { db } from '../../app/db';
import { getCart } from '../read/cart';
import type { CartItem } from '@/types/cart';

// ============================================
// CONSTANTS
// ============================================

const CARTS_COLLECTION = 'T_carts';

// ============================================
// CART UPDATE OPERATIONS
// ============================================

/**
 * Update cart items
 */
export const updateCartItems = async (
  userId: string,
  items: CartItem[]
): Promise<void> => {
  try {
    const cartRef = doc(db, CARTS_COLLECTION, userId);
    await setDoc(
      cartRef,
      {
        items,
        updated_at: Date.now(),
      },
      { merge: true }
    );
  } catch (error) {
    console.error('Error updating cart items:', error);
    throw new Error('Failed to update cart items');
  }
};

/**
 * Update item quantity in cart
 */
export const updateCartItemQuantity = async (
  userId: string,
  productId: string,
  size: string,
  quantity: number
): Promise<void> => {
  try {
    const cart = await getCart(userId);
    if (!cart) {
      throw new Error('Cart not found');
    }

    if (quantity <= 0) {
      // Remove item if quantity is 0 or less
      await removeCartItem(userId, productId, size);
      return;
    }

    const updatedItems = cart.items.map((item) =>
      item.id === productId && item.size === size
        ? { ...item, quantity }
        : item
    );

    await updateCartItems(userId, updatedItems);
  } catch (error) {
    console.error('Error updating cart item quantity:', error);
    throw new Error('Failed to update cart item quantity');
  }
};

/**
 * Remove item from cart
 */
export const removeCartItem = async (
  userId: string,
  productId: string,
  size: string
): Promise<void> => {
  try {
    const cart = await getCart(userId);
    if (!cart) {
      return; // Cart doesn't exist, nothing to remove
    }

    const updatedItems = cart.items.filter(
      (item) => !(item.id === productId && item.size === size)
    );

    await updateCartItems(userId, updatedItems);
  } catch (error) {
    console.error('Error removing cart item:', error);
    throw new Error('Failed to remove cart item');
  }
};

/**
 * Clear cart
 */
export const clearCart = async (userId: string): Promise<void> => {
  try {
    await updateCartItems(userId, []);
  } catch (error) {
    console.error('Error clearing cart:', error);
    throw new Error('Failed to clear cart');
  }
};

