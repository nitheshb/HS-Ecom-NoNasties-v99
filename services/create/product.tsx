/**
 * Product Create Operations
 * 
 * This file contains all CREATE operations related to products:
 * - Product creation
 * - Stock creation
 */

import { collection, doc, setDoc, getDoc, deleteDoc, Timestamp, updateDoc, query, orderBy, getDocs, runTransaction } from 'firebase/firestore';
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
  stock_id?: string;
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

export interface PopulatedExtra {
  id: string;
  value: string;
  extra_group_id?: string;
  group?: {
    id: string;
    translation?: { title: string };
  } | null;
}

interface ActiveSku {
  sku: string;
  variant_name: string;
  quantity: number;
  price: number;
  strike_price: number;
}

const PRODUCT_STATUS = {
  PUBLISHED: 'published',
  DRAFT: 'draft',
  ARCHIVED: 'archived',
  PENDING: 'pending',
} as const;

type ProductStatus = typeof PRODUCT_STATUS[keyof typeof PRODUCT_STATUS];

const isValidStatus = (status: unknown): status is ProductStatus => {
  return typeof status === 'string' && Object.values(PRODUCT_STATUS).includes(status as ProductStatus);
};

// ============================================
// HELPER FUNCTIONS
// ============================================

const BASE_PRODUCT_NUMBER = 1;

/**
 * Generate next sequential product ID
 * Note: This function references runTransaction which should be imported
 */
const generateNextProductId = async (
  dependencies?: {
    runTransaction?: (db: unknown, updateFunction: (transaction: unknown) => Promise<string>) => Promise<string>;
  }
): Promise<string> => {
  if (!dependencies?.runTransaction) {
    // Fallback: use timestamp-based ID if transaction not available
    return `PROD${Date.now()}`;
  }
  
  return await dependencies.runTransaction(db, async (transaction: any) => {
    const productsRef = collection(db, 'T_products');
    const latestProductQuery = query(
      productsRef,
      orderBy('id', 'desc')
    );
    
    const snapshot = await getDocs(latestProductQuery);
    
    let nextNumber = BASE_PRODUCT_NUMBER;
    
    if (!snapshot.empty) {
      snapshot.forEach((docSnap: any) => {
        const data = docSnap.data();
        const productId = data.id || docSnap.id;
        
        if (typeof productId === 'string' && /^\d+$/.test(productId)) {
          const numericId = parseInt(productId, 10);
          if (!isNaN(numericId) && numericId >= nextNumber) {
            nextNumber = numericId + 1;
          }
        }
      });
    }
    
    return nextNumber.toString();
  });
};

// ============================================
// PRODUCT CREATE OPERATIONS
// ============================================

/**
 * Create product with multilingual support
 * Note: This function references generateNextProductId which needs runTransaction
 */
export const createProductsDb = async (
  orgId: unknown,
  payload: { params: Record<string, unknown> },
  dependencies?: {
    generateNextProductId?: () => Promise<string>;
  }
) => {
  const filesCollectionRef = collection(db, 'T_products');
  const { params } = payload;
  
  // Generate the new sequential product ID
  let productId: string;
  if (dependencies?.generateNextProductId) {
    productId = await dependencies.generateNextProductId();
  } else {
    // Fallback: use timestamp-based ID
    productId = `PROD${Date.now()}`;
  }
  
  const translationId = uuidv4();
  const translations: Array<{ locale: string; title: string; description: string }> = [];
  const locales: string[] = [];
  const titleData: Record<string, string> = {};
  const descriptionData: Record<string, string> = {};
  
  // Process all title and description fields with patterns title[locale] and description[locale]
  Object.keys(params).forEach(key => {
    const titleMatch = key.match(/^title\[(.*)\]$/);
    if (titleMatch && titleMatch[1] && params[key] !== undefined && typeof params[key] === 'string' && (params[key] as string).trim() !== '') {
      const locale = titleMatch[1];
      titleData[locale] = params[key] as string;
      translations.push({
        locale: locale,
        title: params[key] as string,
        description: descriptionData[locale] || '',
      });
      if (!locales.includes(locale)) {
        locales.push(locale);
      }
    }
    const descriptionMatch = key.match(/^description\[(.*)\]$/);
    if (descriptionMatch && descriptionMatch[1] && params[key] !== undefined && typeof params[key] === 'string' && (params[key] as string).trim() !== '') {
      const locale = descriptionMatch[1];
      descriptionData[locale] = params[key] as string;
      const translationIndex = translations.findIndex(t => t.locale === locale);
      if (translationIndex !== -1) {
        translations[translationIndex].description = params[key] as string;
      } else {
        translations.push({
          locale: locale,
          title: titleData[locale] || '',
          description: params[key] as string,
        });
      }
      if (!locales.includes(locale)) {
        locales.push(locale);
      }
    }
  });
  
  // Default to 'en' if no locales found
  if (locales.length === 0) {
    locales.push('en');
  }
  
  const primaryLocale = locales[0];
  const primaryTitle = titleData[primaryLocale] || '';
  const primaryDescription = descriptionData[primaryLocale] || '';
  
  // Process images: support either images array or images[0], images[1], ... keys
  let cleanedImages: string[] = [];
  if (Array.isArray((params as Record<string, unknown>)?.images)) {
    cleanedImages = ((params as Record<string, unknown>).images as unknown[])
      .filter((v) => typeof v === 'string' && (v as string).trim() !== '') as string[];
  } else {
    const images: string[] = [];
    Object.keys(params).forEach(key => {
      const imageMatch = key.match(/^images\[(\d+)\]$/);
      if (imageMatch && params[key]) {
        const value = params[key];
        if (typeof value === 'string' && value.trim() !== '') {
          images[parseInt(imageMatch[1])] = value;
        }
      }
    });
    cleanedImages = images.filter(img => img !== undefined);
  }
  
  const imageUrl = cleanedImages.length > 0 ? cleanedImages[0] : '';
  const input = {
    uuid: productId,
    id: productId,
    img: imageUrl,
    images: cleanedImages,
    tax: Number(params.tax) || 0,
    interval: Number(params.interval) || 0,
    min_qty: Number(params.min_qty) || 0,
    max_qty: Number(params.max_qty) || 0,
    brand_id: params.brand_id || null,
    category_id: params.category_id || null,
    sub_category_id: params.sub_category_id || null,
    unit_id: params.unit_id || null,
    kitchen_id: params.kitchen_id || null,
    active: params.active === true || params.active === 1 ? 1 : 0,
    subscription_enabled: params.subscription_enabled === true,
    is_show_in_homescreen: params.is_show_in_homescreen === true || params.is_show_in_homescreen === 1 ? true : false,
    show_in: Array.isArray(params.show_in) ? params.show_in : [],
    status: params.status && isValidStatus(params.status) ? params.status : PRODUCT_STATUS.PENDING,
    type: 'product',
    created_at: Timestamp.now().toMillis(),
    updated_at: Timestamp.now().toMillis(),
    title: titleData,
    translations: translations,
    translation: {
      id: translationId,
      locale: primaryLocale,
      title: primaryTitle,
      description: primaryDescription,
    },
    locales: locales,
    price: 0,
    strike_price: 0,
    discount_percent: 0,
    default: typeof (params as Record<string, unknown>)?.default === 'string' ? (params as Record<string, string>).default : '',
    stocks: [],
    active_sku: null
  };
  
  try {
    await setDoc(doc(filesCollectionRef, productId), input);
    return { 
      data: {
        uuid: productId
      }
    };
  } catch (error) {
    console.error('Error saving product to Firestore:', error);
    throw error;
  }
};

/**
 * Create stocks for a product
 * Note: This function references updateProducts which should be imported from update operations
 */
export const createStocksDb = async (
  productId: string, 
  data: { extras: Stock[]; delete_ids?: string[] },
  dependencies?: {
    updateProducts?: (productId: string, updateData: Partial<Product>) => Promise<void>;
  }
) => {
  const collectionRef = collection(db, 'T_stocks');
  const { extras, delete_ids } = data;
  
  const resolveExtraValueNames = async (extrasList: (string | PopulatedExtra)[]): Promise<string[]> => {
    const names: string[] = [];
    for (const extra of extrasList) {
      const extraId = typeof extra === 'string' ? extra : extra?.id;
      if (!extraId) {
        continue;
      }
      try {
        const extraValueDoc = await getDoc(doc(db, 'T_extra_values', extraId));
        if (extraValueDoc.exists()) {
          const extraValueData = extraValueDoc.data() as { value?: unknown };
          if (typeof extraValueData.value === 'string' && extraValueData.value.trim() !== '') {
            names.push(extraValueData.value);
          }
        }
      } catch (error) {
        console.warn('Unable to resolve extra value name:', error);
      }
    }
    return names;
  };

  // Delete existing stocks if provided
  if (delete_ids && delete_ids.length > 0) {
    for (const stockId of delete_ids) {
      await deleteDoc(doc(collectionRef, stockId));
    }
  }
  
  const processedStocks: Stock[] = [];
  
  for (const stock of extras) {
    if (typeof stock.price === 'undefined' || typeof stock.quantity === 'undefined') {
      throw new Error('Stock must have price and quantity');
    }
    const id = (stock.stock_id as string) || uuidv4();
    const docRef = doc(collectionRef, id);
    const tax = Number(stock.tax || 0);
    const strike_price = Number(stock.strike_price);
    const price = Number(stock.price || strike_price);
    let discount_percent = 0;
    if (strike_price > 0 && price < strike_price) {
      discount_percent = Math.round(((strike_price - price) / strike_price) * 100);
    }
    
    // Process extras properly - convert IDs to full extra value IDs
    let extrasIds: string[] = [];
    if (Array.isArray(stock.extras)) {
      extrasIds = stock.extras.map((extra: unknown) => {
        if (typeof extra === 'string') {
          return extra;
        } else if (typeof extra === 'object' && extra !== null && 'id' in extra) {
          return (extra as { id: string }).id;
        }
        return '';
      }).filter(Boolean);
    }
    
    const total_price = price + (price * tax / 100);
    
    const stockData: Stock = {
      id,
      countable_id: productId,
      sku: stock.sku as string || '',
      price: price,
      strike_price: strike_price,
      discount_percent: discount_percent,
      quantity: Number(stock.quantity),
      tax: tax,
      total_price: total_price,
      addon: Boolean(stock.addon),
      addons: Array.isArray(stock.addons) ? stock.addons : [],
      extras: extrasIds,
      bonus: stock.bonus || null,
      created_at: Timestamp.now().toMillis(),
      updated_at: Timestamp.now().toMillis()
    };
    
    await setDoc(docRef, stockData);
    processedStocks.push(stockData);
  }
  
  // Update product with price info AND stocks array
  const lowestPriceStock = processedStocks.reduce((min, current) => 
    current.price < min.price ? current : min
  );
  
  // Determine default variant label from the lowest priced stock's extras
  let defaultVariantLabel = '';
  const activeSkuPayload: ActiveSku = {
    sku: lowestPriceStock.sku || '',
    variant_name: '',
    quantity: Number(lowestPriceStock.quantity) || 0,
    price: Number(lowestPriceStock.price) || 0,
    strike_price: Number(lowestPriceStock.strike_price) || 0
  };
  
  try {
    const extrasArray = Array.isArray(lowestPriceStock.extras) ? lowestPriceStock.extras : [];
    const extraNames = await resolveExtraValueNames(extrasArray);
    if (extraNames.length > 0) {
      defaultVariantLabel = extraNames[0];
    }
    activeSkuPayload.variant_name = extraNames.join(' / ');
  } catch (err) {
    console.warn('Unable to resolve default variant label from extras:', err);
  }

  if (dependencies?.updateProducts) {
    await dependencies.updateProducts(productId, { 
      price: lowestPriceStock.price, 
      strike_price: lowestPriceStock.strike_price, 
      discount_percent: Math.round(lowestPriceStock.discount_percent || 0),
      stocks: processedStocks,
      ...(defaultVariantLabel ? { default: defaultVariantLabel } : {}),
      active_sku: activeSkuPayload
    });
  }
  
  return { success: true, message: 'Stocks created successfully' };
};

