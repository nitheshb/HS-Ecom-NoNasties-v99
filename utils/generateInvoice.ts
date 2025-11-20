import { Order, OrderItem } from '@/services/read/order';

/**
 * Generate and download invoice PDF for an order
 */
export const generateInvoicePDF = async (
  order: Order,
  orderItems: OrderItem[]
): Promise<void> => {
  // Dynamically import jsPDF to avoid SSR issues
  const { default: jsPDF } = await import('jspdf');
  
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  let yPos = margin;

  // Helper function to add a new page if needed
  const checkPageBreak = (requiredSpace: number) => {
    if (yPos + requiredSpace > doc.internal.pageSize.getHeight() - margin) {
      doc.addPage();
      yPos = margin;
    }
  };

  // Helper function to format price
  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  // Helper function to format date
  const formatDate = (dateString: string | number | undefined): string => {
    if (!dateString) return 'N/A';
    try {
      const date = typeof dateString === 'number' 
        ? new Date(dateString) 
        : new Date(dateString);
      return date.toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return String(dateString);
    }
  };

  // Header
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('INVOICE', pageWidth / 2, yPos, { align: 'center' });
  yPos += 15;

  // Company/Store Info
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text('No Nasties', margin, yPos);
  yPos += 6;
  doc.setFontSize(10);
  doc.text('Sustainable Fashion Store', margin, yPos);
  yPos += 15;

  // Order Details Section
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Order Details', margin, yPos);
  yPos += 8;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Order ID: ${order.id}`, margin, yPos);
  yPos += 6;
  doc.text(`Order Date: ${formatDate(order.created_at)}`, margin, yPos);
  yPos += 6;
  
  if (order.order_status || order.status) {
    doc.text(`Status: ${order.order_status || order.status}`, margin, yPos);
    yPos += 6;
  }

  if (order.delivery_date) {
    doc.text(`Delivery Date: ${formatDate(order.delivery_date)}`, margin, yPos);
    yPos += 6;
  }

  yPos += 5;

  // Customer Information
  if (order.user) {
    checkPageBreak(20);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Bill To', margin, yPos);
    yPos += 8;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const userName = (order.user as { name?: string }).name || 
                     (order.user as { email?: string }).email || 
                     'Customer';
    doc.text(`Name: ${userName}`, margin, yPos);
    yPos += 6;

    const userEmail = (order.user as { email?: string }).email;
    if (userEmail) {
      doc.text(`Email: ${userEmail}`, margin, yPos);
      yPos += 6;
    }

    // Address
    if (order.address) {
      const address = order.address as Record<string, unknown>;
      if (address.street || address.city || address.state) {
        yPos += 3;
        doc.text('Address:', margin, yPos);
        yPos += 6;
        
        if (address.street) {
          doc.text(String(address.street), margin, yPos);
          yPos += 6;
        }
        
        const cityState = [
          address.city,
          address.state,
          address.zipCode || address.pincode,
        ].filter(Boolean).join(', ');
        
        if (cityState) {
          doc.text(cityState, margin, yPos);
          yPos += 6;
        }
        
        if (address.country) {
          doc.text(String(address.country), margin, yPos);
          yPos += 6;
        }
      }
    }

    yPos += 5;
  }

  // Items Table Header
  checkPageBreak(30);
  yPos += 5;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Items', margin, yPos);
  yPos += 10;

  // Table Headers
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('Item', margin, yPos);
  doc.text('Qty', margin + 80, yPos);
  doc.text('Price', margin + 110, yPos);
  doc.text('Subtotal', margin + 150, yPos);
  yPos += 6;

  // Draw line under headers
  doc.setLineWidth(0.5);
  doc.line(margin, yPos, pageWidth - margin, yPos);
  yPos += 8;

  // Order Items
  doc.setFont('helvetica', 'normal');
  let totalItems = 0;
  let totalAmount = 0;

  // Group items by product_id (same as in the UI)
  const groupedItems = orderItems.reduce((acc, item) => {
    const productId = item.product_id;
    if (!acc[productId]) {
      acc[productId] = {
        name: item.name || `Product ${productId}`,
        quantity: 0,
        subtotal: 0,
      };
    }
    acc[productId].quantity += item.quantity;
    acc[productId].subtotal += item.subtotal;
    return acc;
  }, {} as Record<string, { name: string; quantity: number; subtotal: number }>);

  for (const item of Object.values(groupedItems)) {
    checkPageBreak(15);
    
    const itemName = item.name.length > 40 ? item.name.substring(0, 37) + '...' : item.name;
    doc.text(itemName, margin, yPos);
    doc.text(String(item.quantity), margin + 80, yPos);
    
    const pricePerUnit = item.quantity > 0 ? item.subtotal / item.quantity : 0;
    doc.text(formatPrice(pricePerUnit), margin + 110, yPos);
    doc.text(formatPrice(item.subtotal), margin + 150, yPos);
    
    totalItems += item.quantity;
    totalAmount += item.subtotal;
    yPos += 8;
  }

  // Draw line after items
  yPos += 2;
  doc.line(margin, yPos, pageWidth - margin, yPos);
  yPos += 10;

  // Totals Section
  checkPageBreak(40);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  
  // Subtotal
  doc.text('Subtotal:', margin + 110, yPos);
  doc.text(formatPrice(totalAmount), margin + 150, yPos);
  yPos += 8;

  // Delivery Fee
  if (order.delivery_fee && order.delivery_fee > 0) {
    doc.text('Delivery Fee:', margin + 110, yPos);
    doc.text(formatPrice(order.delivery_fee), margin + 150, yPos);
    yPos += 8;
  }

  // Commission Fee (if applicable)
  if (order.commission_fee && order.commission_fee > 0) {
    doc.text('Service Fee:', margin + 110, yPos);
    doc.text(formatPrice(order.commission_fee), margin + 150, yPos);
    yPos += 8;
  }

  // Total
  yPos += 3;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.line(margin + 110, yPos - 2, pageWidth - margin, yPos - 2);
  yPos += 8;
  doc.text('Total:', margin + 110, yPos);
  doc.text(formatPrice(order.total_price), margin + 150, yPos);

  // Footer
  yPos = doc.internal.pageSize.getHeight() - 30;
  doc.setFontSize(8);
  doc.setFont('helvetica', 'italic');
  doc.text('Thank you for your purchase!', pageWidth / 2, yPos, { align: 'center' });
  yPos += 5;
  doc.text('This is a computer-generated invoice.', pageWidth / 2, yPos, { align: 'center' });

  // Download the PDF
  const fileName = `Invoice_${order.id}_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
};

