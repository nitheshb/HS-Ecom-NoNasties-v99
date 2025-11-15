/**
 * Product Update Operations
 * 
 * This file contains all UPDATE operations related to products:
 * - Product updates
 * - Product status updates
 * - Stock quantity updates
 * - Product active status toggles
 * - Show in homescreen toggles
 */

import { doc, updateDoc, getDoc, Timestamp } from 'firebase/firestore';
import { db } from '../../app/db';
import { v4 as uuidv4 } from 'uuid';

// ============================================
// INTERFACES
// ============================================

export interface Product {
  uuid: string;
  id: string;
  img: string;
  images: string[];
  tax: number;
  interval: number;
  min_qty: number;
  max_qty: number;
  brand_id: string | null;
  category_id: string | null;
  sub_category_id: string | null;
  unit_id: string | null;
  kitchen_id: string | null;
  active: number;
  subscription_enabled?: boolean;
  is_show_in_homescreen: boolean;
  show_in: string[];
  status: string;
  type: string;
  created_at: number;
  updated_at: number;
  title: Record<string, string>;
  translations: Array<{
    locale: string;
    title: string;
    description: string;
  }>;
  translation: {
    id: string;
    locale: string;
    title: string;
    description: string;
  };
  locales: string[];
  price: number;
  strike_price?: number;
  discount_percent?: number;
  sku?: string;
  shopTitle?: string;
  category?: string;
  default?: string;
  stocks?: Stock[];
  categoryData?: Record<string, unknown>;
  brandData?: Record<string, unknown>;
  unitData?: Record<string, unknown>;
  kitchenData?: Record<string, unknown>;
  extras?: unknown;
  extraGroups?: Record<string, unknown>[];
  extraValues?: Record<string, unknown>[];
  active_sku?: {
    sku: string;
    variant_name: string;
    quantity: number;
    price: number;
    strike_price: number;
  } | null;
  [key: string]: unknown;
}

export interface Stock {
  id: string;
  countable_id: string;
  sku: string;
  price: number;
  strike_price: number;
  discount_percent: number;
  quantity: number;
  tax: number;
  total_price: number;
  addon: boolean;
  addons: unknown[];
  extras: string[] | Array<{
    id: string;
    value: string;
    extra_group_id?: string;
    group?: {
      id: string;
      translation?: { title: string };
    } | null;
  }>;
  bonus: unknown | null;
  created_at: number;
  updated_at: number;
  [key: string]: unknown;
}

const PRODUCT_STATUS = {
  PUBLISHED: 'published',
  DRAFT: 'draft',
  ARCHIVED: 'archived',
} as const;

type ProductStatus = typeof PRODUCT_STATUS[keyof typeof PRODUCT_STATUS];

const isValidStatus = (status: unknown): status is ProductStatus => {
  return typeof status === 'string' && Object.values(PRODUCT_STATUS).includes(status as ProductStatus);
};

// ============================================
// PRODUCT UPDATE OPERATIONS
// ============================================

/**
 * Update product
 */
export const updateProducts = async (productId: string, updateData: Partial<Product>) => {
  const productRef = doc(db, 'T_products', productId);
  
  // Clean the update data to avoid Firestore field path issues
  const cleanUpdateData = { ...updateData };
  
  // Remove any properties that might cause field path issues
  const problematicFields = ['translations'];
  problematicFields.forEach(field => {
    if (cleanUpdateData[field] && typeof cleanUpdateData[field] === 'object') {
      delete cleanUpdateData[field];
    }
  });
  
  // Process title and description fields
  const titleData: Record<string, string> = {};
  const descriptionData: Record<string, string> = {};
  const translations: Array<{ locale: string; title: string; description: string }> = [];
  const locales: string[] = [];
  
  // Extract title and description from the update data
  Object.keys(cleanUpdateData).forEach(key => {
    const titleMatch = key.match(/^title\[(.*)\]$/);
    if (titleMatch && titleMatch[1] && cleanUpdateData[key] !== undefined && typeof cleanUpdateData[key] === 'string' && (cleanUpdateData[key] as string).trim() !== '') {
      const locale = titleMatch[1];
      titleData[locale] = cleanUpdateData[key] as string;
      translations.push({
        locale: locale,
        title: cleanUpdateData[key] as string,
        description: descriptionData[locale] || '',
      });
      if (!locales.includes(locale)) {
        locales.push(locale);
      }
      delete cleanUpdateData[key];
    }
    
    const descriptionMatch = key.match(/^description\[(.*)\]$/);
    if (descriptionMatch && descriptionMatch[1] && cleanUpdateData[key] !== undefined && typeof cleanUpdateData[key] === 'string' && (cleanUpdateData[key] as string).trim() !== '') {
      const locale = descriptionMatch[1];
      descriptionData[locale] = cleanUpdateData[key] as string;
      const translationIndex = translations.findIndex(t => t.locale === locale);
      if (translationIndex !== -1) {
        translations[translationIndex].description = cleanUpdateData[key] as string;
      } else {
        translations.push({
          locale: locale,
          title: titleData[locale] || '',
          description: cleanUpdateData[key] as string,
        });
      }
      if (!locales.includes(locale)) {
        locales.push(locale);
      }
      delete cleanUpdateData[key];
    }
  });
  
  // Default to 'en' if no locales found
  if (locales.length === 0) {
    locales.push('en');
  }
  
  // Use first locale as primary translation
  const primaryLocale = locales[0];
  const primaryTitle = titleData[primaryLocale] || '';
  const primaryDescription = descriptionData[primaryLocale] || '';
  
  // Process images
  let orderedImages: string[] = [];
  if (Array.isArray((cleanUpdateData as Record<string, unknown>)?.images)) {
    orderedImages = ((cleanUpdateData as Record<string, unknown>).images as unknown[])
      .filter((v) => typeof v === 'string' && (v as string).trim() !== '') as string[];
    delete (cleanUpdateData as Record<string, unknown>).images;
  } else {
    const imageIndexesToValue: Record<number, string> = {};
    Object.keys(cleanUpdateData).forEach((key) => {
      const imageMatch = key.match(/^images\[(\d+)\]$/);
      if (imageMatch) {
        const index = parseInt(imageMatch[1], 10);
        const value = cleanUpdateData[key];
        if (typeof value === 'string' && value.trim() !== '') {
          imageIndexesToValue[index] = value;
        }
        delete cleanUpdateData[key];
      }
    });
    orderedImages = Object.keys(imageIndexesToValue)
      .map((k) => parseInt(k, 10))
      .sort((a, b) => a - b)
      .map((idx) => imageIndexesToValue[idx])
      .filter((v) => typeof v === 'string' && v.trim() !== '');
  }

  // Only include simple fields that are safe for Firestore
  const safeFields = ['active', 'subscription_enabled', 'status', 'price', 'strike_price', 'discount_percent', 'quantity', 'sku', 'category_id', 'sub_category_id', 'brand_id', 'unit_id', 'stocks', 'show_in', 'default', 'active_sku'];
  const safeUpdateData: Record<string, unknown> = {};
  
  safeFields.forEach(field => {
    if (cleanUpdateData[field] !== undefined) {
      safeUpdateData[field] = cleanUpdateData[field];
    }
  });
  
  const updatePayload: Record<string, unknown> = {
    ...safeUpdateData,
    updated_at: Timestamp.now().toMillis()
  };
  
  // Add title and description if they were processed
  if (Object.keys(titleData).length > 0) {
    updatePayload.title = titleData;
    updatePayload.translation = {
      id: uuidv4(),
      locale: primaryLocale,
      title: primaryTitle,
      description: primaryDescription,
    };
    updatePayload.locales = locales;
  }

  // If images were provided, set both images array and primary img
  if (orderedImages.length > 0) {
    updatePayload.images = orderedImages;
    updatePayload.img = orderedImages[0];
  }
  
  try {
    await updateDoc(productRef, updatePayload);
    return { success: true };
  } catch (error) {
    console.error("Error updating product:", error);
    throw error;
  }
};

/**
 * Update product status
 */
export const updateProductStatus = async (uuid: string, status: string) => {
  if (!isValidStatus(status)) {
    throw new Error(`Invalid status: ${status}. Must be one of: ${Object.values(PRODUCT_STATUS).join(', ')}`);
  }
  const docRef = doc(db, 'T_products', uuid);
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) {
    throw new Error(`Product with UUID ${uuid} not found`);
  }
  const updateData = {
    status: status,
    updated_at: Timestamp.now().toMillis()
  };
  await updateDoc(docRef, updateData);
  return {
    timestamp: new Date().toISOString(),
    status: true,
    message: "web.record_has_been_successfully_updated",
    data: {
      uuid: uuid,
      status: status,
      updated_at: updateData.updated_at
    }
  };
};

/**
 * Update stock quantity (e.g., deduct when order is placed, add back if canceled)
 */
export const updateStockQuantity = async (productId: string, stockId: string, delta: number) => {
  const stockRef = doc(db, 'T_stocks', stockId);
  const stockSnap = await getDoc(stockRef);
  if (!stockSnap.exists() || stockSnap.data().countable_id !== productId) {
    throw new Error(`Stock ${stockId} not found for product ${productId}`);
  }
  const currentQuantity = stockSnap.data().quantity || 0;
  const newQuantity = Math.max(0, currentQuantity + delta);
  
  await updateDoc(stockRef, {
    quantity: newQuantity,
    updated_at: Timestamp.now().toMillis()
  });
  
  // Update the stocks array in the product document
  const productRef = doc(db, 'T_products', productId);
  const productSnap = await getDoc(productRef);
  
  if (productSnap.exists()) {
    const productData = productSnap.data();
    const stocks = productData.stocks || [];
    
    // Update the specific stock in the array
    const updatedStocks = stocks.map((stock: Stock) => 
      stock.id === stockId ? { ...stock, quantity: newQuantity, updated_at: Timestamp.now().toMillis() } : stock
    );

    // Update active_sku quantity if it matches this stock
    let updatedActiveSku = productData.active_sku || null;
    const matchingStock = updatedStocks.find((stock: Stock) => stock.id === stockId);
    if (
      updatedActiveSku &&
      typeof updatedActiveSku === 'object' &&
      matchingStock &&
      typeof updatedActiveSku.sku === 'string' &&
      updatedActiveSku.sku === (matchingStock.sku || '')
    ) {
      updatedActiveSku = {
        ...updatedActiveSku,
        quantity: newQuantity
      };
    }
    
    await updateDoc(productRef, {
      stocks: updatedStocks,
      ...(updatedActiveSku ? { active_sku: updatedActiveSku } : {}),
      updated_at: Timestamp.now().toMillis()
    });
  }
  
  return { success: true, newQuantity };
};

/**
 * Set active status for product
 */
export const setActiveProducts = async (id: string) => {
  const productId = id.includes('/') ? id.split('/').pop() : id;
  const docRef = doc(db, 'T_products', productId!);
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) {
    throw new Error(`Product with ID ${productId} not found`);
  }
  const productData = docSnap.data();
  const currentActive = (typeof productData.active === 'number' && productData.active === 1) || productData.active === true;
  const newActive = !currentActive;
  await updateDoc(docRef, {
    active: newActive ? 1 : 0,
    updated_at: Timestamp.now().toMillis()
  });
  const response = {
    timestamp: new Date().toISOString(),
    status: true,
    data: {
      id: parseInt(productId!) || productId,
      active: newActive,
      position: productData.position || "before",
      created_at: Timestamp.now().toMillis(),
      updated_at: Timestamp.now().toMillis(),
      locales: productData.locales || ["en"]
    }
  };
  return response;
};

/**
 * Set show in homescreen status for product
 */
export const setShowInHomescreenProducts = async (id: string) => {
  const productId = id.includes('/') ? id.split('/').pop() : id;
  const docRef = doc(db, 'T_products', productId!);
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) {
    throw new Error(`Product with ID ${productId} not found`);
  }
  const productData = docSnap.data();
  const currentShowInHomescreen = productData.is_show_in_homescreen === true;
  const newShowInHomescreen = !currentShowInHomescreen;
  await updateDoc(docRef, {
    is_show_in_homescreen: newShowInHomescreen,
    updated_at: Timestamp.now().toMillis()
  });
  const response = {
    timestamp: new Date().toISOString(),
    status: true,
    data: {
      id: parseInt(productId!) || productId,
      is_show_in_homescreen: newShowInHomescreen,
      position: productData.position || "before",
      created_at: Timestamp.now().toMillis(),
      updated_at: Timestamp.now().toMillis(),
      locales: productData.locales || ["en"]
    }
  };
  return response;
};

