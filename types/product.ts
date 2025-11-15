// Product-related types consolidated from forms and product logic

// --- Product Information Form Types ---
export type ProductInformationFormState = {
  name: string;
  description: string;
  brand_id: string;
  category_id: string;
  unit_id: string;
  unit_name: string;
  active: boolean;
};

export interface ProductInformationFormRef {
  getValues: () => ProductInformationFormState;
}

// --- Inventory Form Types ---
export interface StockType {
  sku: string;
  quantity: number | "";
  strike_price: number | "";
  price: number | "";
  tax: number | "";
  total_price: number | "";
  addons: string;
  extras: { id: string; value: string }[];
}

export interface StockRowState {
  sku: string;
  quantity: number | "";
  strike_price: number | "";
  price: number | "";
  tax: number | "";
  total_price: number | "";
  addons: string;
}

// --- Product Types from q_products.ts (placeholders, fill in actual definitions later) ---
export type Product = unknown; // TODO: Replace with actual Product interface
export type Stock = unknown; // TODO: Replace with actual Stock interface
export type ProductPayload = unknown; // TODO: Replace with actual ProductPayload interface
export type Translation = unknown; // TODO: Replace with actual Translation interface
export type ProductStatus = string;

// --- Product ID Types ---
export type ProductId = string; // Format: PRD1000000001, PRD1000000002, etc.

/**
 * Validates if a string is a valid product ID format
 * @param id - The ID to validate
 * @returns boolean - True if valid product ID format
 */
export const isValidProductId = (id: string): boolean => {
  return /^PRD\d{10}$/.test(id);
};

/**
 * Extracts the numeric part from a product ID
 * @param productId - The product ID (e.g., "PRD1000000001")
 * @returns number - The numeric part (e.g., 1000000001)
 */
export const extractProductIdNumber = (productId: string): number => {
  if (!isValidProductId(productId)) {
    throw new Error(`Invalid product ID format: ${productId}`);
  }
  return parseInt(productId.substring(3), 10);
}; 