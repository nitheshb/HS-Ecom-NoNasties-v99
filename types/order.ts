// Order ID type and validation functions
export type OrderId = string;

/**
 * Validates if a string is a valid order ID format (ORD + 10-digit number)
 * @param id - The ID to validate
 * @returns boolean - True if valid order ID format
 */
export const isValidOrderId = (id: string): id is OrderId => {
  if (typeof id !== 'string') return false;
  
  // Check if it starts with 'ORD' and has exactly 10 digits after
  const orderIdRegex = /^ORD\d{10}$/;
  return orderIdRegex.test(id);
};

/**
 * Extracts the numeric part from an order ID
 * @param orderId - The order ID (e.g., "ORD1000000001")
 * @returns number - The numeric part (e.g., 1000000001)
 */
export const extractOrderIdNumber = (orderId: OrderId): number => {
  if (!isValidOrderId(orderId)) {
    throw new Error(`Invalid order ID format: ${orderId}`);
  }
  
  const numericPart = orderId.substring(3); // Remove 'ORD' prefix
  return parseInt(numericPart, 10);
};

/**
 * Creates an order ID from a numeric value
 * @param number - The numeric value (e.g., 1000000001)
 * @returns OrderId - The formatted order ID (e.g., "ORD1000000001")
 */
export const createOrderIdFromNumber = (number: number): OrderId => {
  if (number < 1000000001) {
    throw new Error(`Order ID number must be at least 1000000001, got: ${number}`);
  }
  
  const paddedNumber = number.toString().padStart(10, '0');
  return `ORD${paddedNumber}` as OrderId;
};

// Order Item ID type and validation functions
export type OrderItemId = string;

/**
 * Validates if a string is a valid order item ID format (ITM + 10-digit number)
 * @param id - The ID to validate
 * @returns boolean - True if valid order item ID format
 */
export const isValidOrderItemId = (id: string): id is OrderItemId => {
  if (typeof id !== 'string') return false;
  
  // Check if it starts with 'ITM' and has exactly 10 digits after
  const orderItemIdRegex = /^ITM\d{10}$/;
  return orderItemIdRegex.test(id);
};

/**
 * Extracts the numeric part from an order item ID
 * @param orderItemId - The order item ID (e.g., "ITM1000000001")
 * @returns number - The numeric part (e.g., 1000000001)
 */
export const extractOrderItemIdNumber = (orderItemId: OrderItemId): number => {
  if (!isValidOrderItemId(orderItemId)) {
    throw new Error(`Invalid order item ID format: ${orderItemId}`);
  }
  
  const numericPart = orderItemId.substring(3); // Remove 'ITM' prefix
  return parseInt(numericPart, 10);
};

/**
 * Creates an order item ID from a numeric value
 * @param number - The numeric value (e.g., 1000000001)
 * @returns OrderItemId - The formatted order item ID (e.g., "ITM1000000001")
 */
export const createOrderItemIdFromNumber = (number: number): OrderItemId => {
  if (number < 1000000001) {
    throw new Error(`Order item ID number must be at least 1000000001, got: ${number}`);
  }
  
  const paddedNumber = number.toString().padStart(10, '0');
  return `ITM${paddedNumber}` as OrderItemId;
};

