'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/lib/auth-context';
import ProtectedRoute from '@/components/ProtectedRoute';
import { getUserOrders, getOrderItemsForOrder } from '@/services/read/user-orders';
import { Order, OrderItem } from '@/services/read/order';
import { cancelUserOrder, cancelUserOrderItem, returnUserOrderItem } from '@/services/update/user-order';
import Link from 'next/link';
import { getStatusBadgeClasses, getDefaultBadgeClasses } from '@/utils/statusColors';
import OrderStatusProgress from '@/components/OrderStatusProgress';
import { generateInvoicePDF } from '@/utils/generateInvoice';
import { Download } from 'lucide-react';

export default function OrdersPage() {
  const { user, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [orderItemsMap, setOrderItemsMap] = useState<Record<string, OrderItem[]>>({});
  const [cancellingOrderId, setCancellingOrderId] = useState<string | null>(null);
  const [cancellingItemId, setCancellingItemId] = useState<string | null>(null);
  const [returningItemId, setReturningItemId] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
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
  }, [user]);

  useEffect(() => {
    if (!authLoading && user) {
      fetchOrders();
    }
  }, [user, authLoading, fetchOrders]);

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

  const handleCancelOrderItem = async (orderItemId: string, itemName: string) => {
    if (!confirm(`Are you sure you want to cancel "${itemName}"? The stock will be restored.`)) {
      return;
    }

    try {
      setCancellingItemId(orderItemId);
      await cancelUserOrderItem(orderItemId, 'Cancelled by user');
      
      // Refresh orders list
      await fetchOrders();
      alert('Item cancelled successfully. Stock has been restored.');
    } catch (error) {
      console.error('Error cancelling order item:', error);
      alert('An error occurred while cancelling the item. Please try again.');
    } finally {
      setCancellingItemId(null);
    }
  };

  const handleReturnOrderItem = async (orderItemId: string, itemName: string) => {
    if (!confirm(`Are you sure you want to return "${itemName}"?`)) {
      return;
    }

    try {
      setReturningItemId(orderItemId);
      await returnUserOrderItem(orderItemId, 'Returned by user');
      
      // Refresh orders list
      await fetchOrders();
      alert('Return request submitted successfully.');
    } catch (error) {
      console.error('Error returning order item:', error);
      alert('An error occurred while processing the return. Please try again.');
    } finally {
      setReturningItemId(null);
    }
  };

  // Check if order can be cancelled (only Placed or Packed)
  const isOrderCancellable = (order: Order) => {
    const status = (order.order_status || order.status || '').toLowerCase();
    return status === 'placed' || status === 'packed' || status === 'new' || status === 'orderreceived' || status === 'order received';
  };

  // Check if order item can be cancelled (only Placed or Packed)
  const isOrderItemCancellable = (item: OrderItem) => {
    const status = (item.order_item_status || item.status || '').toLowerCase();
    return status === 'placed' || status === 'packed' || status === 'new' || status === 'orderreceived' || status === 'order received';
  };

  // Check if order item can be returned (Delivered and within return window)
  const isOrderItemReturnable = (item: OrderItem, order: Order) => {
    const status = (item.order_item_status || item.status || '').toLowerCase();
    const orderStatus = (order.order_status || order.status || '').toLowerCase();
    
    // Must be delivered
    if (status !== 'delivered' && orderStatus !== 'delivered') {
      return false;
    }

    // Check return window (7 days from delivery date)
    const RETURN_WINDOW_DAYS = 7;
    const deliveryDate = item.delivery_date 
      ? new Date(typeof item.delivery_date === 'number' ? item.delivery_date : item.delivery_date)
      : order.delivery_date 
        ? new Date(order.delivery_date)
        : null;

    if (!deliveryDate) {
      return false; // Can't return if we don't know delivery date
    }

    const now = new Date();
    const daysSinceDelivery = Math.floor((now.getTime() - deliveryDate.getTime()) / (1000 * 60 * 60 * 24));
    
    return daysSinceDelivery <= RETURN_WINDOW_DAYS;
  };

  // Format status label for display (e.g., "orderReceived" -> "Order Received")
  const formatStatusLabel = (status: string | undefined): string => {
    if (!status) return 'Unknown';
    
    // Handle common status variations
    const statusLower = status.toLowerCase();
    
    // Map status values to display labels
    const statusLabels: Record<string, string> = {
      'new': 'Placed',
      'placed': 'Placed',
      'packed': 'Packed',
      'shipped': 'Shipped',
      'delivered': 'Delivered',
      'cancelled': 'Cancelled',
      'delivery': 'Delivery',
      'orderreceived': 'Placed',
      'order received': 'Placed',
      'order-received': 'Placed',
      'order_received': 'Placed',
      'return': 'Return',
      'completed': 'Delivered',
      'fulfilled': 'Delivered',
      'pending': 'Placed',
      'processing': 'Processing',
    };
    
    // Check if we have a specific label for this status
    if (statusLabels[statusLower]) {
      return statusLabels[statusLower];
    }
    
    // Fallback: Capitalize first letter of each word
    return status
      .split(/[\s_-]+/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  // Get status badge classes
  const getStatusBadgeClass = (status: string | undefined): string => {
    if (!status) return getDefaultBadgeClasses();
    return getStatusBadgeClasses(status);
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
                
                // If no items, show order card anyway
                if (items.length === 0) {
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
                          <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(order.order_status || order.status)}`}>
                            {formatStatusLabel(order.order_status || order.status)}
                          </span>
                        </div>
                      </div>
                      <div className="mt-6 pt-6 border-t border-gray-200">
                        <OrderStatusProgress 
                          status={order.order_status || order.status || 'placed'} 
                          className="w-full"
                        />
                      </div>

                      {/* Download Invoice Button for orders without items */}
                      <div className="mt-4 pt-4 border-t border-gray-200 flex justify-end">
                        <button
                          onClick={async () => {
                            try {
                              await generateInvoicePDF(order, []);
                            } catch (error) {
                              console.error('Error generating invoice:', error);
                              alert('Failed to generate invoice. Please try again.');
                            }
                          }}
                          className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 transition flex items-center gap-2"
                        >
                          <Download size={16} />
                          Download Invoice
                        </button>
                      </div>
                    </div>
                  );
                }
                
                // Group items by product_id to show one card per product
                // Same product with different quantities should be in one card
                const groupedItems = items.reduce((acc, item) => {
                  const productId = item.product_id;
                  if (!acc[productId]) {
                    acc[productId] = {
                      product_id: productId,
                      name: item.name || `Product ${productId}`,
                      quantity: 0,
                      subtotal: 0,
                      items: [],
                      order_item_status: item.order_item_status,
                      delivery_date: item.delivery_date,
                    };
                  }
                  acc[productId].quantity += item.quantity;
                  acc[productId].subtotal += item.subtotal;
                  acc[productId].items.push(item);
                  return acc;
                }, {} as Record<string, {
                  product_id: string;
                  name: string;
                  quantity: number;
                  subtotal: number;
                  items: OrderItem[];
                  order_item_status?: string;
                  delivery_date?: number;
                }>);

                // Create a separate card for each unique product
                return Object.values(groupedItems).map((groupedItem, productIndex) => {
                  // Calculate average price per unit
                  const pricePerUnit = groupedItem.quantity > 0 
                    ? groupedItem.subtotal / groupedItem.quantity 
                    : 0;

                  return (
                    <div 
                      key={`${order.id}-${groupedItem.product_id}-${productIndex}`} 
                      className="bg-white rounded-lg shadow-sm p-6"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-lg font-semibold">Order #{order.id}</h3>
                          <p className="text-sm text-gray-600 mt-1">
                            Placed on {formatDate(order.created_at)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold">{formatPrice(groupedItem.subtotal)}</p>
                          <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(order.order_status || order.status)}`}>
                            {formatStatusLabel(order.order_status || order.status)}
                          </span>
                        </div>
                      </div>

                      {/* Product Details */}
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <div className="flex items-start gap-4">
                          <div className="flex-1">
                            <h4 className="text-base font-semibold mb-1">
                              {groupedItem.name}
                            </h4>
                            <p className="text-sm text-gray-600">
                              Quantity: {groupedItem.quantity}
                            </p>
                            {groupedItem.order_item_status && (
                              <p className="text-xs text-gray-500 mt-1">
                                Item Status: {formatStatusLabel(groupedItem.order_item_status)}
                              </p>
                            )}
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold">{formatPrice(groupedItem.subtotal)}</p>
                            <p className="text-sm text-gray-500 mt-1">
                              {formatPrice(pricePerUnit)} each
                            </p>
                          </div>
                        </div>
                        
                        {/* Item-level Action Buttons */}
                        <div className="mt-4 flex flex-wrap gap-2">
                          {/* Cancel Item Button - Show for each cancellable item */}
                          {groupedItem.items
                            .filter(item => isOrderItemCancellable(item) && item.order_item_id)
                            .map((item) => (
                              <button
                                key={`cancel-${item.order_item_id}`}
                                onClick={() => handleCancelOrderItem(item.order_item_id!, groupedItem.name)}
                                disabled={cancellingItemId !== null}
                                className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {cancellingItemId === item.order_item_id ? 'Cancelling...' : 'Cancel Item'}
                              </button>
                            ))}
                          
                          {/* Return Item Button - Show for each returnable item */}
                          {groupedItem.items
                            .filter(item => isOrderItemReturnable(item, order) && item.order_item_id)
                            .map((item) => (
                              <button
                                key={`return-${item.order_item_id}`}
                                onClick={() => handleReturnOrderItem(item.order_item_id!, groupedItem.name)}
                                disabled={returningItemId !== null}
                                className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {returningItemId === item.order_item_id ? 'Processing...' : 'Return Item'}
                              </button>
                            ))}
                        </div>
                      </div>

                      {/* Order Status Progress Bar */}
                      <div className="mt-6 pt-6 border-t border-gray-200">
                        <OrderStatusProgress 
                          status={order.order_status || order.status || 'placed'} 
                          className="w-full"
                        />
                      </div>

                      {/* Order Details */}
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <div className="flex justify-between items-start mb-4">
                          <div className="text-sm text-gray-600">
                            {order.delivery_date && (
                              <p>Delivery Date: {formatDate(order.delivery_date)}</p>
                            )}
                            {groupedItem.delivery_date && (
                              <p className="mt-1">Item Delivery: {formatDate(String(groupedItem.delivery_date))}</p>
                            )}
                          </div>
                          
                          {/* Download Invoice Button */}
                          <button
                            onClick={async () => {
                              try {
                                await generateInvoicePDF(order, items);
                              } catch (error) {
                                console.error('Error generating invoice:', error);
                                alert('Failed to generate invoice. Please try again.');
                              }
                            }}
                            className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 transition flex items-center gap-2"
                          >
                            <Download size={16} />
                            Download Invoice
                          </button>
                        </div>
                        
                        {/* Cancel Entire Order Button - Only show if order is cancellable (Placed/Packed) */}
                        {isOrderCancellable(order) && (
                          <div className="flex justify-end">
                            <button
                              onClick={() => handleCancelOrder(order.id)}
                              disabled={cancellingOrderId === order.id}
                              className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {cancellingOrderId === order.id ? 'Cancelling...' : 'Cancel Entire Order'}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                });
              })}
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}

