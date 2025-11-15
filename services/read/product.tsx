/**
 * Product Read Operations
 * 
 * This file contains all READ operations related to products:
 * - Product retrieval
 * - Stock retrieval
 * - Real-time product subscriptions
 */

import { collection, doc, getDoc, getDocs, query, where, orderBy, onSnapshot, getCountFromServer, QueryConstraint } from 'firebase/firestore';
import { db } from '../../app/db';

// ============================================
// INTERFACES
// ============================================

export interface Translation {
  locale: string;
  title: string;
  description: string;
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
  extras: string[] | PopulatedExtra[];
  bonus: unknown | null;
  created_at: number;
  updated_at: number;
  [key: string]: unknown;
}

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
  translations: Translation[];
  translation: Translation & { id: string };
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

// ============================================
// PRODUCT READ OPERATIONS
// ============================================

/**
 * Get all products with filtering options
 */
export const getAllProducts = async (orgId: string, params: { params?: Record<string, unknown> }) => {
  const filterParams = params?.params || {};
  const constraints: QueryConstraint[] = [];
  if (filterParams.category_id && filterParams.category_id !== 'undefined' && filterParams.category_id !== '') {
    constraints.push(where('category_id', '==', filterParams.category_id));
  }
  if (filterParams.sub_category_id && filterParams.sub_category_id !== 'undefined' && filterParams.sub_category_id !== '') {
    constraints.push(where('sub_category_id', '==', filterParams.sub_category_id));
  }
  if (filterParams.brand_id && filterParams.brand_id !== 'undefined' && filterParams.brand_id !== '') {
    constraints.push(where('brand_id', '==', filterParams.brand_id));
  }
  if (filterParams.shop_id && filterParams.shop_id !== 'undefined' && filterParams.shop_id !== '') {
    constraints.push(where('shop_id', '==', filterParams.shop_id));
  }
  if (filterParams.status && filterParams.status !== 'undefined' && filterParams.status !== '') {
    constraints.push(where('status', '==', filterParams.status));
  }
  const productsQuery = query(collection(db, 'T_products'), ...constraints);
  const querySnapshot = await getDocs(productsQuery);
  if (querySnapshot.empty) {
    return {
      data: [],
      meta: {
        current_page: 1,
        from: 0,
        last_page: 1,
        to: 0,
        total: 0,
      },
    };
  }
  // Fetch stocks for each product and attach as 'stocks' array
  let files = await Promise.all(
    querySnapshot.docs.map(async docSnap => {
    const data = docSnap.data();
      // Fetch stocks for this product
      const stocksQuery = query(
        collection(db, 'T_stocks'),
        where('countable_id', '==', docSnap.id)
      );
      const stocksSnapshot = await getDocs(stocksQuery);
      const stocks: Stock[] = [];
      
      for (const stockDoc of stocksSnapshot.docs) {
        const stockData = { id: stockDoc.id, ...stockDoc.data() } as Stock;
        
        // Process extras for each stock
        if (Array.isArray(stockData.extras) && stockData.extras.length > 0) {
          const populatedExtras: PopulatedExtra[] = [];
          
          for (const extraId of stockData.extras) {
            if (typeof extraId === 'string') {
              try {
                // Fetch the extra value
                const extraValueDoc = await getDoc(doc(db, 'T_extra_values', extraId));
                if (extraValueDoc.exists()) {
                  const extraValueData = extraValueDoc.data();
                  
                  // Fetch the extra group
                  let extraGroupData = null;
                  if (extraValueData?.extra_group_id) {
                    const extraGroupDoc = await getDoc(doc(db, 'T_extra_groups', extraValueData.extra_group_id));
                    if (extraGroupDoc.exists()) {
                      extraGroupData = extraGroupDoc.data();
                    }
                  }
                  
                  populatedExtras.push({
                    id: extraValueDoc.id,
                    value: extraValueData?.value || '',
                    extra_group_id: extraValueData?.extra_group_id,
                    group: extraGroupData ? {
                      id: extraValueData.extra_group_id,
                      translation: extraGroupData.translation || { title: extraGroupData.title || 'Unknown Group' }
                    } : null
                  });
                }
              } catch (error) {
                console.error('Error fetching extra data:', error);
              }
            }
          }
          
          stockData.extras = populatedExtras;
        } else {
          stockData.extras = [];
        }
        
        stocks.push(stockData);
      }
    return {
      uuid: data.uuid || docSnap.id,
      id: data.id || docSnap.id,
      img: data.img || '',
      images: data.images || [],
      tax: data.tax ?? 0,
      interval: data.interval ?? 0,
      min_qty: data.min_qty ?? 0,
      max_qty: data.max_qty ?? 0,
      brand_id: data.brand_id ?? null,
      category_id: data.category_id ?? null,
      sub_category_id: data.sub_category_id ?? null,
      unit_id: data.unit_id ?? null,
      kitchen_id: data.kitchen_id ?? null,
      active: data.active ?? 0,
        subscription_enabled: Boolean(data.subscription_enabled),
      is_show_in_homescreen: data.is_show_in_homescreen ?? false,
      show_in: data.show_in ?? [],
      status: data.status || '',
      type: data.type || '',
      created_at: data.created_at ?? 0,
      updated_at: data.updated_at ?? 0,
      title: data.title || {},
      translations: data.translations || [{ locale: 'en', title: data.translation?.title || 'N/A', description: '' }],
      translation: data.translation || { id: '', locale: 'en', title: '', description: '' },
      locales: data.locales || ['en'],
      price: data.price ?? 0,
      strike_price: data.strike_price ?? 0,
      discount_percent: Math.round(data.discount_percent ?? 0),
      sku: data.sku ?? '',
      shopTitle: data.shopTitle ?? '',
      category: data.category ?? '',
      ...data,
        stocks, // Attach stocks array here
    };
    })
  );
  files.sort((a, b) => b.created_at - a.created_at);
  if (filterParams.search && filterParams.search !== 'undefined' && filterParams.search !== '') {
    const searchTerm = (filterParams.search as string).toLowerCase();
    files = files.filter(product => {
      const translationMatch = product.translations?.some((trans: Translation) =>
        trans.title?.toLowerCase().includes(searchTerm) ||
        trans.description?.toLowerCase().includes(searchTerm)
      );
      const titleMatch = Object.values(product.title || {}).some((title: string) =>
        title.toLowerCase().includes(searchTerm)
      );
      const otherFieldsMatch =
        (product.sku as string)?.toLowerCase().includes(searchTerm);
      return translationMatch || titleMatch || otherFieldsMatch;
    });
  }
  console.log("files", files);
  return {
    data: files,
    meta: {
      current_page: 1,
      from: files.length > 0 ? 1 : 0,
      last_page: 1,
      to: files.length,
      total: files.length,
    },
  };
};

/**
 * Get product by ID with stocks
 */
export const getAllProductsById = async (lang: string, id: string) => {
  try {
    const docRef = doc(db, 'T_products', id);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      throw new Error('Product not found');
    }
    
    const product = { id: docSnap.id, ...docSnap.data() } as Product & { stocks?: Stock[] };
    
    // Fetch stocks for this product
    const stocksQuery = query(
      collection(db, 'T_stocks'),
      where('countable_id', '==', id)
    );
    const stocksSnapshot = await getDocs(stocksQuery);
    const stocks: Stock[] = [];
    
    for (const stockDoc of stocksSnapshot.docs) {
      const stockData = { id: stockDoc.id, ...stockDoc.data() } as Stock;
      
      // Process extras for each stock
      if (Array.isArray(stockData.extras) && stockData.extras.length > 0) {
        const populatedExtras: PopulatedExtra[] = [];
        
        for (const extraId of stockData.extras) {
          if (typeof extraId === 'string') {
            try {
              // Fetch the extra value
              const extraValueDoc = await getDoc(doc(db, 'T_extra_values', extraId));
              if (extraValueDoc.exists()) {
                const extraValueData = extraValueDoc.data();
                
                // Fetch the extra group
                let extraGroupData = null;
                if (extraValueData?.extra_group_id) {
                  const extraGroupDoc = await getDoc(doc(db, 'T_extra_groups', extraValueData.extra_group_id));
                  if (extraGroupDoc.exists()) {
                    extraGroupData = extraGroupDoc.data();
                  }
                }
                
                populatedExtras.push({
                  id: extraValueDoc.id,
                  value: extraValueData?.value || '',
                  extra_group_id: extraValueData?.extra_group_id,
                  group: extraGroupData ? {
                    id: extraValueData.extra_group_id,
                    translation: extraGroupData.translation || { title: extraGroupData.title || 'Unknown Group' }
                  } : null
                });
              }
            } catch (error) {
              console.error('Error fetching extra data:', error);
            }
          }
        }
        
        stockData.extras = populatedExtras;
      } else {
        stockData.extras = [];
      }
      
      stocks.push(stockData);
    }
    
    // Add stocks to product
    product.stocks = stocks;
    
    return { success: true, data: product };
  } catch (error) {
    console.error('Error fetching product:', error);
    return { success: false, message: (error as Error).message };
  }
};

/**
 * Get all products with real-time snapshot
 */
export const getAllProductsSnap = async (
  params: { params?: { status?: string } },
  callback: (response: unknown) => void
) => {
  const filesQuery1 = query(
    collection(db, `T_products`),
    where("status", "==", params?.params?.status || "published")
  );
  const unsubscribe = onSnapshot(filesQuery1, (querySnapshot) => {
    const files = querySnapshot.docs.map((doc) => {
      const x = doc.data();
      x.id = doc.id;
      x.uuid = doc.id;
      return x;
    });
    const response = {
      data: files,
      meta: {
        current_page: 1,
        from: 1,
        last_page: 1,
        links: [
          { url: null, label: "&laquo; Previous", active: false },
          {
            url: "https://single-api.foodyman.org/api/v1/dashboard/admin/T_products/paginate?page=1",
            label: "1",
            active: true,
          },
          { url: null, label: "Next &raquo;", active: false },
        ],
        path: "https://single-api.foodyman.org/api/v1/dashboard/admin/T_products/paginate",
        per_page: "10",
        to: files.length,
        total: files.length,
      },
    };
    callback(response);
  });
  return unsubscribe;
};

// ============================================
// STOCK READ OPERATIONS
// ============================================

/**
 * Get stocks by product ID
 */
export const getStocksByProductId = async (productId: string) => {
  const stocksQuery = query(
    collection(db, "T_stocks"),
    where("countable_id", "==", productId)
  );
  const stocksSnapshot = await getDocs(stocksQuery);
  return { data: stocksSnapshot.docs.map(doc => doc.data()) };
};

/**
 * Get products basic info (image, quantity, price, variant label) for multiple products
 */
export const getProductsBasicInfo = async (
  productIds: string[],
): Promise<Record<string, { image?: string; totalQuantity: number; price?: string; variantLabel?: string }>> => {
  const uniqueIds = Array.from(
    new Set(
      productIds
        .map((id) => (typeof id === "string" ? id.trim() : ""))
        .filter((id): id is string => id.length > 0),
    ),
  );

  if (!uniqueIds.length) {
    return {};
  }

  const formatPrice = (value: unknown): string | undefined => {
    const numericValue = typeof value === "string" ? Number(value) : Number(value);
    if (!Number.isFinite(numericValue)) {
      return undefined;
    }
    return numericValue.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const extractVariantLabel = (stock: Stock | undefined): string | undefined => {
    if (!stock) {
      return undefined;
    }

    const parts: string[] = [];

    if (typeof stock.sku === "string" && stock.sku.trim() !== "") {
      parts.push(stock.sku.trim());
    }

    if (Array.isArray(stock.extras)) {
      stock.extras.forEach((extra) => {
        if (typeof extra === "string") {
          return;
        }
        if (extra && typeof extra === "object" && "value" in extra && typeof extra.value === "string") {
          const value = extra.value.trim();
          if (value) {
            parts.push(value);
          }
        }
      });
    }

    if (parts.length === 0) {
      return undefined;
    }

    return parts.join(" / ");
  };

  const results: Record<string, { image?: string; totalQuantity: number; price?: string; variantLabel?: string }> = {};

  await Promise.all(
    uniqueIds.map(async (productId) => {
      try {
        const productRef = doc(db, "T_products", productId);
        const productSnap = await getDoc(productRef);

        if (!productSnap.exists()) {
          return;
        }

        const productData = productSnap.data() as {
          img?: unknown;
          images?: unknown[];
          stocks?: Array<Stock>;
          price?: unknown;
        };

        const imageCandidates: string[] = [];
        if (typeof productData.img === "string" && productData.img.trim() !== "") {
          imageCandidates.push(productData.img.trim());
        }
        if (Array.isArray(productData.images)) {
          productData.images.forEach((img) => {
            if (typeof img === "string" && img.trim() !== "") {
              imageCandidates.push(img.trim());
            }
          });
        }

        let totalQuantity = 0;
        let formattedPrice: string | undefined;
        let variantLabel: string | undefined;

        if (Array.isArray(productData.stocks) && productData.stocks.length > 0) {
          totalQuantity = productData.stocks.reduce((sum, stock) => {
            const qty = Number(stock?.quantity ?? 0);
            return Number.isFinite(qty) ? sum + qty : sum;
          }, 0);

          const firstStock = productData.stocks[0];
          formattedPrice = formatPrice(firstStock?.price ?? productData.price);
          variantLabel = extractVariantLabel(firstStock);
        } else {
          const stocksQuery = query(
            collection(db, "T_stocks"),
            where("countable_id", "==", productId),
          );
          const stocksSnapshot = await getDocs(stocksQuery);
          const stocks: Stock[] = stocksSnapshot.docs.map((stockDoc) => ({
            id: stockDoc.id,
            ...stockDoc.data(),
          })) as Stock[];

          totalQuantity = stocks.reduce((sum, stock) => {
            const qty = Number(stock?.quantity ?? 0);
            return Number.isFinite(qty) ? sum + qty : sum;
          }, 0);

          if (stocks.length > 0) {
            const firstStock = stocks[0];
            formattedPrice = formatPrice(firstStock?.price ?? productData.price);
            variantLabel = extractVariantLabel(firstStock);
          } else {
            formattedPrice = formatPrice(productData.price);
          }
        }

        results[productId] = {
          image: imageCandidates[0],
          totalQuantity,
          price: formattedPrice,
          variantLabel,
        };
      } catch (error) {
        console.warn(`Unable to fetch basic info for product ${productId}:`, error);
      }
    }),
  );

  return results;
};

/**
 * Get product price and stock for order calculations
 */
export const getProductPriceAndStock = async (productId: string) => {
  const product = await getAllProductsById('', productId);
  if (!product.data) {
    throw new Error(`Product ${productId} not found`);
  }
  
  const productData = product.data as Product & { stocks?: Stock[] };
  
  // Get the first available stock or default price
  const stock = productData.stocks?.[0];
  const price = stock?.price || productData.price || 0;
  const quantity = stock?.quantity || 0;
  
  return {
    price,
    quantity,
    stock_id: stock?.id,
  };
};

/**
 * Get total products count
 */
export const getTotalProductsCount = async (): Promise<number> => {
  try {
    const productsRef = collection(db, 'T_products');
    const snapshot = await getCountFromServer(productsRef);
    return snapshot.data().count ?? 0;
  } catch (error) {
    console.error('Error fetching total products count:', error);
    throw new Error('Failed to get total products count');
  }
};

