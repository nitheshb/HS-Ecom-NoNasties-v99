import { ExportColumn } from '@/services/exportService';
import { Order } from '@/pages/orders/AllOrders';

export const getOrderExportColumns = (): ExportColumn[] => [
  {
    key: 'customer',
    label: 'Customer',
    width: 15,
    align: 'left'
  },
  {
    key: 'id',
    label: 'Order ID',
    width: 15,
    align: 'left'
  },
  {
    key: 'email',
    label: 'Email',
    width: 20,
    align: 'left'
  },
  {
    key: 'createdAt',
    label: 'Created At',
    width: 10,
    align: 'center'
  },
  {
    key: 'totalPrice',
    label: 'Total Amount',
    width: 12,
    align: 'right'
  },
  {
    key: 'status',
    label: 'Status',
    width: 15,
    align: 'center'
  },
  {
    key: 'deliveryDate',
    label: 'Delivery Date',
    width: 12,
    align: 'center'
  },
  {
    key: 'address',
    label: 'Address',
    width: 30,
    align: 'left'
  },
  {
    key: 'itemsCount',
    label: 'Items Count',
    width: 10,
    align: 'center'
  },
  {
    key: 'deliveredCount',
    label: 'Delivered',
    width: 10,
    align: 'center'
  }
];

export const transformOrdersForExport = (orders: Order[]): any[] => {

  return orders.map(order => {
    const address = order.address as Record<string, string> | undefined;
    const addressString = address ? 
      [
        address.house,
        address.street,
        address.landmark,
        address.pincode
      ].filter(Boolean).join(', ') : 'N/A';

    // Handle delivery dates from order's delivery_dates array
    let deliveryDateString = 'N/A';
    if (order.delivery_dates && Array.isArray(order.delivery_dates) && order.delivery_dates.length > 0) {
      const deliveryDates = order.delivery_dates
        .filter(entry => entry.delivery_date)
        .map(entry => {
          const date = new Date(entry.delivery_date);
          // Use delivery_time_start if available, fallback to delivery_time for backward compatibility
          const timeStr = entry.delivery_time_start || entry.delivery_time;
          const time = timeStr ? 
            (() => {
              const [hours, minutes] = timeStr.split(':');
              const hour = parseInt(hours);
              const ampm = hour >= 12 ? 'PM' : 'AM';
              const displayHour = hour % 12 || 12;
              return `${displayHour}:${minutes} ${ampm}`;
            })() : null;
          return `${date.toLocaleDateString()}${time ? ` (${time})` : ''}`;
        });
      deliveryDateString = deliveryDates.join(', ');
    } else if (order.delivery_date) {
      deliveryDateString = new Date(order.delivery_date).toLocaleDateString();
    }

    return {
      id: order.id,
      customer: order.user?.firstname || order.user?.name || 'Unknown',
      email: order.user?.email || 'N/A',
      deliveryDate: deliveryDateString,
      totalPrice: order.total_price || 0,
      status: order.order_status || order.status || 'Unknown',
      itemsCount: order.order_details_count || 0,
      deliveredCount: order.order_items_status_count || 0,
      createdAt: order.created_at ? new Date(order.created_at).toLocaleDateString() : 'N/A',
      address: addressString
    };
  });
};

export const getOrderExportTitle = (filteredCount: number, totalCount: number, hasFilters: boolean = false): string => {
  if (filteredCount === totalCount && !hasFilters) {
    return `All Orders (${totalCount} records)`;
  }
  return `Orders Export (${filteredCount} records)`;
};

export const getOrderExportFilename = (filteredCount: number, totalCount: number, hasFilters: boolean = false): string => {
  const timestamp = new Date().toISOString().split('T')[0];
  if (filteredCount === totalCount && !hasFilters) {
    return `all_orders_${timestamp}`;
  }
  return `orders_export_${timestamp}`;
};
