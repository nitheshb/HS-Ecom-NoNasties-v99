'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import ProtectedRoute from '@/components/ProtectedRoute';
import { getUserOrders, getOrderItemsForOrder } from '@/services/read/user-orders';
import { Order, OrderItem } from '@/services/read/order';
import { cancelUserOrder } from '@/services/cancel/user-order';
import Link from 'next/link';

export default function OrdersPage() {
  const { user, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [orderItemsMap, setOrderItemsMap] = useState<Record<string, OrderItem[]>>({});
  const [cancellingOrderId, setCancellingOrderId] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && user) {
      fetchOrders();
    }
  }, [user, authLoading]);

  const fetchOrders = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const userOrders = await getUserOrders(user.uid);
      setOrders(userOrders);

      // Fetch order items for each order
      const itemsMap: Record<string, OrderItem[]> = {};
      for (const order of userOrders) {
        try {
          const items = await getOrderItemsForOrder(order.id);
          itemsMap[order.id] = items;
        } catch (error) {
          console.error(`Error fetching items for order ${order.id}:`, error);
          itemsMap[order.id] = [];
        }
      }
      setOrderItemsMap(itemsMap);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  const handleCancelOrder = async (orderId: string) => {
    if (!confirm('Are you sure you want to cancel this order? The stock will be restored.')) {
      return;
    }

    try {
      setCancellingOrderId(orderId);
      const result = await cancelUserOrder(orderId, 'Cancelled by user');
      
      if (result.success) {
        // Refresh orders list
        await fetchOrders();
        alert(`Order cancelled successfully. ${result.cancelledItems} items restored to inventory.`);
      } else {
        alert('Failed to cancel order. Please try again.');
      }
    } catch (error) {
      console.error('Error cancelling order:', error);
      alert('An error occurred while cancelling the order. Please try again.');
    } finally {
      setCancellingOrderId(null);
    }
  };

  const isOrderCancellable = (order: Order) => {
    const status = (order.order_status || order.status || '').toLowerCase();
    return status !== 'cancelled' && status !== 'delivered' && status !== 'completed';
  };

  if (authLoading || loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen flex items-center justify-center pt-24">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading orders...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Page Title */}
          <h1 className="text-4xl font-bold mb-8">Orders</h1>

          {/* Orders List */}
          {orders.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-12 text-center">
              <h2 className="text-2xl font-bold mb-2">No orders yet</h2>
              <p className="text-gray-600 mb-6">Go to store to place an order.</p>
              <Link
                href="/"
                className="inline-block bg-[#295A2A] text-white px-6 py-3 rounded-md font-semibold hover:bg-[#234624] transition"
              >
                Go to Store
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {orders.map((order) => {
                const items = orderItemsMap[order.id] || [];
                return (
                  <div key={order.id} className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-semibold">Order #{order.id}</h3>
                        <p className="text-sm text-gray-600 mt-1">
                          Placed on {formatDate(order.created_at)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold">{formatPrice(order.total_price)}</p>
                        <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-medium ${
                          order.status === 'new' || order.order_status === 'new'
                            ? 'bg-blue-100 text-blue-800'
                            : order.status === 'cancelled' || order.order_status === 'cancelled'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {order.order_status || order.status || 'Unknown'}
                        </span>
                      </div>
                    </div>

                    {/* Order Items */}
                    {items.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <h4 className="text-sm font-semibold mb-3">Items:</h4>
                        <div className="space-y-2">
                          {items.map((item, index) => (
                            <div key={item.order_item_id || index} className="flex justify-between text-sm">
                              <span>
                                {item.name || `Product ${item.product_id}`} × {item.quantity}
                              </span>
                              <span className="font-medium">{formatPrice(item.subtotal)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Order Details */}
                    <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between items-center">
                      <div className="text-sm text-gray-600">
                        <p>Items: {order.order_items_count || items.length}</p>
                        {order.delivery_date && (
                          <p className="mt-1">Delivery Date: {formatDate(order.delivery_date)}</p>
                        )}
                      </div>
                      
                      {/* Cancel Button */}
                      {isOrderCancellable(order) && (
                        <button
                          onClick={() => handleCancelOrder(order.id)}
                          disabled={cancellingOrderId === order.id}
                          className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {cancellingOrderId === order.id ? 'Cancelling...' : 'Cancel Order'}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}

