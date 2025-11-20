'use client';

import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/app/db';
import { CartItem } from '@/types/cart';
import { getCart } from '@/services/read/cart';
import { addItemToCart, getOrCreateCart } from '@/services/create/cart';
import { updateCartItems, removeCartItem as removeCartItemFromDb, clearCart as clearCartFromDb, updateCartItemQuantity } from '@/services/update/cart';
import { checkStockAvailability } from '@/services/read/stock';

interface CartContextType {
  items: CartItem[];
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  addItem: (item: CartItem) => Promise<void>;
  removeItem: (id: string) => Promise<void>;
  updateQuantity: (id: string, quantity: number) => Promise<void>;
  getTotal: () => number;
  getItemCount: () => number;
  clearCart: () => Promise<void>;
  isLoading: boolean;
  getMaxAvailableQuantity: (productId: string) => Promise<number>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

function loadCartFromStorage(): CartItem[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      return JSON.parse(savedCart);
    }
  } catch (error) {
    console.error('Error loading cart from localStorage:', error);
  }
  return [];
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(loadCartFromStorage);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const isSyncingRef = useRef(false);

  // Listen to auth state changes and load cart on mount
  useEffect(() => {
    // Load cart from localStorage immediately on mount (for persistence)
    const localCart = loadCartFromStorage();
    if (localCart.length > 0) {
      setItems(localCart);
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUserId(user.uid);
        setIsLoading(true);
        try {
          const cart = await getCart(user.uid);
          if (cart && cart.items.length > 0) {
            // If Firebase cart has items, use it (merge with local if needed)
            setItems(cart.items);
            localStorage.removeItem('cart');
          } else {
            // If no Firebase cart, check if we have local cart to migrate
            const localCart = loadCartFromStorage();
            if (localCart.length > 0) {
              // Migrate local cart to Firebase
              await updateCartItems(user.uid, localCart);
              setItems(localCart);
              localStorage.removeItem('cart');
            } else {
              await getOrCreateCart(user.uid);
            }
          }
        } catch (error) {
          console.error('Error loading cart from Firebase:', error);
          // Fallback to local cart if Firebase fails
          const localCart = loadCartFromStorage();
          if (localCart.length > 0) {
            setItems(localCart);
          }
        } finally {
          setIsLoading(false);
        }
      } else {
        setUserId(null);
        const localCart = loadCartFromStorage();
        setItems(localCart);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!userId) {
      localStorage.setItem('cart', JSON.stringify(items));
    }
  }, [items, userId]);

  useEffect(() => {
    if (userId && !isLoading && !isSyncingRef.current) {
      isSyncingRef.current = true;
      const syncToFirebase = async () => {
        try {
          await updateCartItems(userId, items);
        } catch (error) {
          console.error('Error syncing cart to Firebase:', error);
        } finally {
          isSyncingRef.current = false;
        }
      };
      syncToFirebase();
    }
  }, [items, userId, isLoading]);

  // Helper function to check stock considering items already in cart
  const checkStockWithCart = async (
    productId: string,
    requestedQuantity: number,
    currentCartItems: CartItem[]
  ): Promise<{ available: boolean; availableQuantity: number; maxAllowed: number }> => {
    const stockCheck = await checkStockAvailability(productId, requestedQuantity);
    
    // Sum ALL quantities in cart for this product ID (regardless of size)
    // This is important because stock is tracked per product, not per size
    const totalQuantityInCart = currentCartItems
      .filter((i) => i.id === productId)
      .reduce((sum, item) => sum + item.quantity, 0);
    
    // Calculate max allowed quantity (available stock - already in cart)
    const maxAllowed = Math.max(0, stockCheck.availableQuantity - totalQuantityInCart);
    
    // Check if requested quantity is available considering cart
    const available = requestedQuantity <= maxAllowed;
    
    return {
      available,
      availableQuantity: stockCheck.availableQuantity,
      maxAllowed,
    };
  };

  const addItem = async (item: CartItem) => {
    try {
      // Calculate total quantity that will be in cart after adding this item
      const existingItem = items.find((i) => i.id === item.id && i.size === item.size);
      const currentQuantityInCart = existingItem ? existingItem.quantity : 0;
      const totalQuantityAfterAdd = currentQuantityInCart + item.quantity;
      
      // Check stock considering items already in cart (excluding the item we're adding)
      const otherCartItems = items.filter((i) => !(i.id === item.id && i.size === item.size));
      const stockCheck = await checkStockWithCart(item.id, totalQuantityAfterAdd, otherCartItems);
      
      if (!stockCheck.available) {
        const message = stockCheck.maxAllowed > 0
          ? `Sorry, only ${stockCheck.maxAllowed} more item(s) available in stock.`
          : `Sorry, this item is out of stock.`;
        alert(message);
        return;
      }

      if (userId) {
        const updatedCart = await addItemToCart(userId, item);
        setItems(updatedCart.items);
      } else {
        setItems((prevItems) => {
          if (existingItem) {
            return prevItems.map((i) =>
              i.id === item.id && i.size === item.size
                ? { ...i, quantity: i.quantity + item.quantity }
                : i
            );
          }
          
          return [...prevItems, item];
        });
      }
    } catch (error) {
      console.error('Error adding item to cart:', error);
      if (error instanceof Error && error.message.includes('stock')) {
        alert(error.message);
      } else {
        alert('Failed to add item to cart. Please try again.');
      }
    }
  };

  const removeItem = async (id: string) => {
    if (userId) {
      try {
        const itemToRemove = items.find((item) => item.id === id);
        if (itemToRemove) {
          await removeCartItemFromDb(userId, id, itemToRemove.size);
        }
        setItems((prevItems) => prevItems.filter((item) => item.id !== id));
      } catch (error) {
        console.error('Error removing item from cart:', error);
      }
    } else {
      setItems((prevItems) => prevItems.filter((item) => item.id !== id));
    }
  };

  const updateQuantity = async (id: string, quantity: number) => {
    if (quantity <= 0) {
      await removeItem(id);
      return;
    }

    try {
      const item = items.find((i) => i.id === id);
      if (item) {
        // Check stock considering items already in cart (excluding current item being updated)
        // We need to exclude items with the same ID AND size as the current item
        const otherCartItems = items.filter((i) => !(i.id === id && i.size === item.size));
        const stockCheck = await checkStockWithCart(id, quantity, otherCartItems);
        
        if (!stockCheck.available) {
          const message = stockCheck.maxAllowed > 0
            ? `Sorry, only ${stockCheck.maxAllowed} item(s) available in stock.`
            : `Sorry, this item is out of stock.`;
          alert(message);
          return;
        }
      }
    } catch (error) {
      console.error('Error checking stock:', error);
      if (error instanceof Error && error.message.includes('stock')) {
        alert(error.message);
      } else {
        alert('Failed to check stock availability. Please try again.');
      }
      return;
    }
    
    if (userId) {
      try {
        const item = items.find((i) => i.id === id);
        if (item) {
          await updateCartItemQuantity(userId, id, item.size, quantity);
        }
        setItems((prevItems) =>
          prevItems.map((item) =>
            item.id === id ? { ...item, quantity } : item
          )
        );
      } catch (error) {
        console.error('Error updating quantity:', error);
        if (error instanceof Error && error.message.includes('stock')) {
          alert(error.message);
        } else {
          alert('Failed to update quantity. Please try again.');
        }
      }
    } else {
      setItems((prevItems) =>
        prevItems.map((item) =>
          item.id === id ? { ...item, quantity } : item
        )
      );
    }
  };

  // Helper function to get max available quantity for an item
  // Wrapped in useCallback to ensure it always uses the latest items state
  const getMaxAvailableQuantity = useCallback(async (productId: string): Promise<number> => {
    try {
      const stockCheck = await checkStockAvailability(productId, 1);
      
      // Find all cart items with this product ID (regardless of size)
      // Stock is tracked per product, not per size
      // Use items directly from state (useCallback ensures latest state)
      const cartItemsForProduct = items.filter((i) => i.id === productId);
      const totalQuantityInCart = cartItemsForProduct.reduce(
        (sum, item) => sum + item.quantity,
        0
      );
      
      // Calculate max available: total stock minus what's already in cart
      const maxAvailable = Math.max(0, stockCheck.availableQuantity - totalQuantityInCart);
      
      // Enhanced debug logging
      console.log(`[Max Available Qty] Product ID: ${productId}`);
      console.log(`[Max Available Qty] Total stock from DB: ${stockCheck.availableQuantity}`);
      console.log(`[Max Available Qty] Current cart items (all):`, items.map(i => ({
        id: i.id,
        name: i.name,
        size: i.size,
        quantity: i.quantity
      })));
      console.log(`[Max Available Qty] Cart items for this product:`, cartItemsForProduct.map(i => ({
        id: i.id,
        name: i.name,
        size: i.size,
        quantity: i.quantity
      })));
      console.log(`[Max Available Qty] Total quantity in cart: ${totalQuantityInCart}`);
      console.log(`[Max Available Qty] Max available (stock - cart): ${maxAvailable}`);
      console.log(`[Max Available Qty] Calculation: ${stockCheck.availableQuantity} - ${totalQuantityInCart} = ${maxAvailable}`);
      
      return maxAvailable;
    } catch (error) {
      console.error('Error getting max available quantity:', error);
      return 0;
    }
  }, [items]); // Depend on items so it always uses latest state

  const getTotal = () => {
    return items.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const getItemCount = () => {
    return items.reduce((count, item) => count + item.quantity, 0);
  };

  const clearCart = async () => {
    if (userId) {
      try {
        await clearCartFromDb(userId);
      } catch (error) {
        console.error('Error clearing cart:', error);
      }
    }
    setItems([]);
  };

  return (
    <CartContext.Provider
      value={{
        items,
        isCartOpen,
        setIsCartOpen,
        addItem,
        removeItem,
        updateQuantity,
        getTotal,
        getItemCount,
        clearCart,
        isLoading,
        getMaxAvailableQuantity,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}

