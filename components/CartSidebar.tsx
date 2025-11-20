'use client';

import { X, ShoppingBag, Plus, Minus } from 'lucide-react';
import Image from 'next/image';
import { useCart } from '@/lib/cart-context';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function CartSidebar() {
  const { items, isCartOpen, setIsCartOpen, updateQuantity, removeItem, getTotal, getMaxAvailableQuantity } = useCart();
  const [isMounted, setIsMounted] = useState(false);
  const [maxQuantities, setMaxQuantities] = useState<Record<string, number>>({});
  const [loadingQuantities, setLoadingQuantities] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Load max quantities for all items
  useEffect(() => {
    if (items.length > 0) {
      const loadMaxQuantities = async () => {
        console.log('[CartSidebar] Loading max quantities for items:', items.map(i => ({ id: i.id, name: i.name, quantity: i.quantity })));
        const quantities: Record<string, number> = {};
        const loading: Record<string, boolean> = {};
        
        for (const item of items) {
          loading[item.id] = true;
          try {
            const maxQty = await getMaxAvailableQuantity(item.id);
            quantities[item.id] = maxQty;
            console.log(`[CartSidebar] Max quantity for ${item.id} (${item.name}): ${maxQty}`);
          } catch (error) {
            console.error(`Error loading max quantity for ${item.id}:`, error);
            quantities[item.id] = 0;
          } finally {
            loading[item.id] = false;
          }
        }
        
        console.log('[CartSidebar] Final max quantities:', quantities);
        setMaxQuantities(quantities);
        setLoadingQuantities(loading);
      };
      
      loadMaxQuantities();
    } else {
      // Clear quantities when cart is empty
      setMaxQuantities({});
    }
  }, [items, getMaxAvailableQuantity]);

  if (!isMounted) {
    return null;
  }

  const handleQuantityChange = async (id: string, currentQuantity: number, change: number) => {
    const newQuantity = currentQuantity + change;
    
    // Get max available quantity for this item
    const maxQty = maxQuantities[id] ?? await getMaxAvailableQuantity(id);
    
    // Block if trying to exceed max quantity
    if (change > 0 && newQuantity > maxQty) {
      const message = maxQty > 0
        ? `Sorry, only ${maxQty} item(s) available in stock.`
        : 'Sorry, this item is out of stock.';
      alert(message);
      return;
    }
    
    await updateQuantity(id, newQuantity);
    
    // Refresh max quantity after update
    try {
      const updatedMax = await getMaxAvailableQuantity(id);
      setMaxQuantities(prev => ({ ...prev, [id]: updatedMax }));
    } catch (error) {
      console.error('Error refreshing max quantity:', error);
    }
  };

  const handleRemove = (id: string) => {
    removeItem(id);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const total = getTotal();

  return (
    <>
      {/* Backdrop overlay with blur */}
      {isCartOpen && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
          onClick={() => setIsCartOpen(false)}
        />
      )}

      {/* Cart sidebar */}
      <div
        className={`fixed top-0 right-0 h-full w-[40%] bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${
          isCartOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        style={{ width: '40%' }}
      >
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <div className="flex items-center gap-2">
              <ShoppingBag size={24} />
              <h2 className="text-xl font-semibold">Cart ({items.length})</h2>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="hover:opacity-70 transition"
              aria-label="Close cart"
            >
              <X size={24} />
            </button>
          </div>

          {/* Cart items */}
          <div className="flex-1 overflow-y-auto px-6 py-4">
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <ShoppingBag size={48} className="text-gray-300 mb-4" />
                <p className="text-gray-600 text-lg mb-4">Your cart is empty</p>
                <Link
                  href="/her"
                  className="inline-block border-2 border-black px-6 py-2 rounded hover:bg-black hover:text-white transition font-semibold"
                  onClick={() => setIsCartOpen(false)}
                >
                  Continue Shopping
                </Link>
              </div>
            ) : (
              <div className="space-y-6">
                {items.map((item) => (
                  <div key={item.id} className="border-b pb-6 last:border-0">
                    <div className="flex gap-4">
                      {/* Product image */}
                      <div className="w-24 h-32 flex-shrink-0 bg-gray-100 rounded overflow-hidden">
                        {item.image ? (
                          <Image
                            src={item.image}
                            alt={item.name}
                            width={96}
                            height={128}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-200" />
                        )}
                      </div>

                      {/* Product details */}
                      <div className="flex-1">
                        <h3 className="font-semibold mb-1 text-sm">{item.name}</h3>
                        <p className="text-gray-600 text-xs mb-2">Size: {item.size}</p>

                        {/* Quantity controls */}
                        <div className="flex items-center gap-3 mb-3">
                          <button
                            onClick={() => handleQuantityChange(item.id, item.quantity, -1)}
                            disabled={item.quantity <= 1}
                            className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded hover:bg-gray-100 transition disabled:opacity-50 disabled:cursor-not-allowed"
                            aria-label="Decrease quantity"
                          >
                            <Minus size={16} />
                          </button>
                          <div className="flex flex-col items-center">
                            <span className="text-sm font-medium w-8 text-center">
                              {item.quantity}
                            </span>
                            {maxQuantities[item.id] !== undefined && (
                              <span className="text-xs text-gray-500">
                                Max: {maxQuantities[item.id]}
                              </span>
                            )}
                          </div>
                          <button
                            onClick={() => handleQuantityChange(item.id, item.quantity, 1)}
                            disabled={
                              loadingQuantities[item.id] ||
                              (maxQuantities[item.id] !== undefined && item.quantity >= maxQuantities[item.id])
                            }
                            className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded hover:bg-gray-100 transition disabled:opacity-50 disabled:cursor-not-allowed"
                            aria-label="Increase quantity"
                            title={
                              maxQuantities[item.id] !== undefined && item.quantity >= maxQuantities[item.id]
                                ? 'Maximum quantity reached'
                                : 'Increase quantity'
                            }
                          >
                            <Plus size={16} />
                          </button>
                        </div>

                        {/* Price and remove */}
                        <div className="flex items-center justify-between">
                          <p className="text-base font-bold">{formatPrice(item.price)}</p>
                          <button
                            onClick={() => handleRemove(item.id)}
                            className="text-red-600 hover:text-red-800 text-sm font-medium"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer with total and checkout */}
          {items.length > 0 && (
            <div className="border-t p-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-lg font-semibold">TOTAL</span>
                <span className="text-xl font-bold">{formatPrice(total)}</span>
              </div>
              <p className="text-xs text-gray-500 text-center">
                Tax included. Shipping calculated at checkout.
              </p>
              <Link
                href="/checkout"
                className="block w-full bg-green-600 text-white py-3 px-6 rounded text-center font-semibold hover:bg-green-700 transition"
                onClick={() => setIsCartOpen(false)}
              >
                CHECKOUT
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

