'use client';

import { useCart } from '@/lib/cart-context';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function CheckoutPage() {
  const { items, getTotal, clearCart } = useCart();
  const router = useRouter();

  useEffect(() => {
    if (items.length === 0) {
      router.push('/');
    }
  }, [items, router]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const total = getTotal();

  const handlePlaceOrder = () => {
    alert('Order placed successfully! (This is a demo)');
    clearCart();
    router.push('/');
  };

  if (items.length === 0) {
    return null;
  }

  return (
    <div className="min-h-screen pb-12 pt-24 bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8">Checkout</h1>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Order Summary */}
          <div className="md:col-span-2 bg-white p-6 rounded shadow-sm">
            <h2 className="text-2xl font-bold mb-6">Order Summary</h2>
            
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.id} className="flex gap-4 border-b pb-4">
                  <div className="w-20 h-24 bg-gray-200 rounded shrink-0"></div>
                  <div className="flex-1">
                    <h3 className="font-semibold">{item.name}</h3>
                    <p className="text-sm text-gray-600">Size: {item.size}</p>
                    <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                    <p className="text-lg font-bold mt-2">{formatPrice(item.price * item.quantity)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Shipping & Payment */}
          <div className="space-y-6">
            {/* Order Total */}
            <div className="bg-white p-6 rounded shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <span className="text-lg font-semibold">Total</span>
                <span className="text-2xl font-bold">{formatPrice(total)}</span>
              </div>
              <p className="text-xs text-gray-500 mb-4">
                Tax included. Shipping calculated at checkout.
              </p>
              <button
                onClick={handlePlaceOrder}
                className="w-full bg-green-600 text-white py-3 px-6 rounded font-semibold hover:bg-green-700 transition"
              >
                PLACE ORDER
              </button>
            </div>

            {/* Payment Info */}
            <div className="bg-white p-6 rounded shadow-sm">
              <h3 className="font-semibold mb-3">Payment Information</h3>
              <p className="text-sm text-gray-600">
                In a real implementation, this would integrate with a payment gateway like Razorpay, Stripe, or other payment processors.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

