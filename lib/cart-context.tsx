'use client';

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
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

  // Listen to auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUserId(user.uid);
        setIsLoading(true);
        try {
          const cart = await getCart(user.uid);
          if (cart) {
            setItems(cart.items);
            localStorage.removeItem('cart');
          } else {
            await getOrCreateCart(user.uid);
          }
        } catch (error) {
          console.error('Error loading cart from Firebase:', error);
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

  const addItem = async (item: CartItem) => {
    try {
      const stockCheck = await checkStockAvailability(item.id, item.quantity);
      if (!stockCheck.available) {
        alert(`Sorry, only ${stockCheck.availableQuantity} items available in stock.`);
        return;
      }

      if (userId) {
        const updatedCart = await addItemToCart(userId, item);
        setItems(updatedCart.items);
      } else {
        setItems((prevItems) => {
          const existingItem = prevItems.find((i) => i.id === item.id && i.size === item.size);
          
          if (existingItem) {
            const totalQuantity = existingItem.quantity + item.quantity;
            if (totalQuantity > stockCheck.availableQuantity) {
              alert(`Sorry, only ${stockCheck.availableQuantity} items available in stock.`);
              return prevItems;
            }
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
      alert('Failed to add item to cart. Please try again.');
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
        const stockCheck = await checkStockAvailability(id, quantity);
        if (!stockCheck.available) {
          alert(`Sorry, only ${stockCheck.availableQuantity} items available in stock.`);
          return;
        }
      }
    } catch (error) {
      console.error('Error checking stock:', error);
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
      }
    } else {
      setItems((prevItems) =>
        prevItems.map((item) =>
          item.id === id ? { ...item, quantity } : item
        )
      );
    }
  };

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

