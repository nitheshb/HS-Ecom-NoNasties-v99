/**
 * Product Helper Functions
 * Simplified functions to fetch products from Firebase for the frontend
 */

'use client';

import { collection, query, where, getDocs, orderBy, limit as firestoreLimit, QueryConstraint } from 'firebase/firestore';
import { db } from '@/app/db';

export interface Product {
  id: string;
  title?: Record<string, string> | string;
  name?: string;
  description?: string;
  price?: number;
  strike_price?: number;
  img?: string;
  images?: string[];
  category_id?: string;
  category?: string;
  brand_id?: string;
  status?: string;
  active?: number | boolean;
  gender?: 'her' | 'him' | 'unisex';
  translation?: {
    title?: string;
    description?: string;
  };
  translations?: Array<{
    locale?: string;
    title?: string;
    description?: string;
  }>;
  [key: string]: unknown;
}

/**
 * Check if a string is a UUID
 */
function isUUID(str: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
}

/**
 * Get product name from title object or string
 * Never returns UUIDs or IDs
 */
function getProductName(product: Product): string {
  // Helper to check and return valid name
  const getValidName = (name: string | undefined): string | null => {
    if (!name || typeof name !== 'string') return null;
    const trimmed = name.trim();
    // Don't return if it's a UUID or looks like an ID
    if (isUUID(trimmed)) return null;
    if (trimmed.length > 50 && /^[0-9a-f-]+$/i.test(trimmed)) return null; // Long hex string might be ID
    return trimmed || null;
  };
  
  // Try different sources in order of preference
  if (typeof product.title === 'string') {
    const name = getValidName(product.title);
    if (name) return name;
  }
  
  if (product.title && typeof product.title === 'object') {
    const titles = [
      product.title['en'],
      product.title['en-US'],
      ...Object.values(product.title)
    ].filter(Boolean) as string[];
    
    for (const title of titles) {
      const name = getValidName(title);
      if (name) return name;
    }
  }
  
  if (product.name) {
    const name = getValidName(product.name);
    if (name) return name;
  }
  
  if (product.translation?.title) {
    const name = getValidName(product.translation.title);
    if (name) return name;
  }
  
  if (product.translations && product.translations.length > 0) {
    for (const translation of product.translations) {
      if (translation?.title) {
        const name = getValidName(translation.title);
        if (name) return name;
      }
    }
  }
  
  // Fallback - return generic name instead of ID
  return 'Product';
}

/**
 * Get product description
 */
function getProductDescription(product: Product): string {
  if (product.description) {
    return product.description;
  }
  if (product.translation?.description) {
    return product.translation.description;
  }
  if (product.translations && product.translations.length > 0) {
    return product.translations[0].description || '';
  }
  return 'Organic Cotton';
}

/**
 * Get product image
 */
function getProductImage(product: Product): string {
  // Try different possible field names for images
  // Check images array first
  if (product.images && Array.isArray(product.images) && product.images.length > 0) {
    const firstImage = product.images[0];
    if (typeof firstImage === 'string' && firstImage.trim()) {
      return firstImage.trim();
    }
  }
  
  // Check img field
  if (product.img && typeof product.img === 'string' && product.img.trim()) {
    return product.img.trim();
  }
  
  // Check other possible field names
  const possibleFields = ['image', 'image_url', 'imageUrl', 'photo', 'picture', 'thumbnail'];
  for (const field of possibleFields) {
    const value = (product as any)[field];
    if (value) {
      if (typeof value === 'string' && value.trim()) {
        return value.trim();
      }
      if (Array.isArray(value) && value.length > 0 && typeof value[0] === 'string') {
        return value[0].trim();
      }
    }
  }
  
  // Check if there's an image in stocks
  if ((product as any).stocks && Array.isArray((product as any).stocks)) {
    for (const stock of (product as any).stocks) {
      if (stock?.image && typeof stock.image === 'string') {
        return stock.image.trim();
      }
    }
  }
  
  return '';
}

/**
 * Get all products from Firebase for "her" section
 */
export async function getHerProducts(maxResults: number = 50): Promise<Product[]> {
  // Try different collection name variations (case-sensitive in Firestore)
  const collectionNames = ['T_products', 't_products'];
  
  for (const collectionName of collectionNames) {
    try {
      console.log(`Attempting to fetch from collection: ${collectionName}`);
      
      // Start with a simple query - no filters, just get all products
      let productsQuery = query(
        collection(db, collectionName),
        firestoreLimit(maxResults * 2)
      );
      
      // Try to add ordering if possible
      try {
        productsQuery = query(
          collection(db, collectionName),
          orderBy('created_at', 'desc'),
          firestoreLimit(maxResults * 2)
        );
      } catch (orderError) {
        // If ordering fails, continue with simple query
        console.log('Cannot order by created_at, using simple query');
        productsQuery = query(
          collection(db, collectionName),
          firestoreLimit(maxResults * 2)
        );
      }
      
      const querySnapshot = await getDocs(productsQuery);
      console.log(`✓ Found ${querySnapshot.docs.length} products in ${collectionName} collection`);
      
      if (querySnapshot.empty) {
        console.log(`Collection ${collectionName} is empty, trying next...`);
        continue; // Try next collection name
      }
      
      const products = querySnapshot.docs.map(doc => {
        const data = doc.data();
        // Log first product structure for debugging
        if (querySnapshot.docs.indexOf(doc) === 0) {
          console.log('Sample product structure:', {
            id: doc.id,
            fields: Object.keys(data),
            title: data.title,
            name: data.name,
            price: data.price,
            img: data.img,
            images: data.images,
            active: data.active
          });
        }
        return {
          id: doc.id,
          ...data
        };
      }) as Product[];
      
      // Filter for active products only if the field exists in some products
      let activeProducts = products;
      const hasActiveField = products.some(p => p.active !== undefined);
      
      if (hasActiveField) {
        // Filter: include products where active is true, 1, or not set
        activeProducts = products.filter(product => {
          const active = product.active;
          // Include if active is true, 1, or undefined/null
          return active === true || active === 1 || active === undefined || active === null;
        });
        console.log(`After filtering by active: ${activeProducts.length} products`);
      } else {
        console.log('No active field found, returning all products');
      }
      
      // Sort by created_at or updated_at if available
      activeProducts.sort((a, b) => {
        const aDate = (a.created_at as number) || (a.updated_at as number) || 0;
        const bDate = (b.created_at as number) || (b.updated_at as number) || 0;
        return bDate - aDate;
      });
      
      // Limit to requested number
      const result = activeProducts.slice(0, maxResults);
      console.log(`✓ Returning ${result.length} products`);
      
      if (result.length > 0) {
        return result;
      }
    } catch (error: any) {
      console.error(`Error fetching from ${collectionName}:`, error);
      // If it's a permissions error or collection doesn't exist, try next
      if (error?.code === 'permission-denied' || error?.code === 'not-found') {
        console.log(`Collection ${collectionName} not accessible, trying next...`);
        continue;
      }
      // For other errors, try the fallback
      break;
    }
  }
  
  // If all collection names failed, try a very basic query as last resort
  console.log('All collection name attempts failed, trying basic query...');
  try {
    const basicQuery = query(collection(db, 'T_products'), firestoreLimit(20));
    const snapshot = await getDocs(basicQuery);
    const products = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Product[];
    console.log(`Fallback query found ${products.length} products`);
    return products;
  } catch (fallbackError: any) {
    console.error('Fallback query also failed:', fallbackError);
    console.error('Error details:', {
      code: fallbackError?.code,
      message: fallbackError?.message
    });
    return [];
  }
}

/**
 * Get all products from Firebase for "him" section
 */
export async function getHimProducts(maxResults: number = 50): Promise<Product[]> {
  // Same logic as getHerProducts, but for "him" products
  const collectionNames = ['T_products', 't_products'];
  
  for (const collectionName of collectionNames) {
    try {
      console.log(`Attempting to fetch HIM products from collection: ${collectionName}`);
      
      // Start with a simple query - no filters, just get all products
      let productsQuery = query(
        collection(db, collectionName),
        firestoreLimit(maxResults * 2)
      );
      
      // Try to add ordering if possible
      try {
        productsQuery = query(
          collection(db, collectionName),
          orderBy('created_at', 'desc'),
          firestoreLimit(maxResults * 2)
        );
      } catch (orderError) {
        // If ordering fails, continue with simple query
        console.log('Cannot order by created_at, using simple query');
        productsQuery = query(
          collection(db, collectionName),
          firestoreLimit(maxResults * 2)
        );
      }
      
      const querySnapshot = await getDocs(productsQuery);
      console.log(`✓ Found ${querySnapshot.docs.length} products in ${collectionName} collection`);
      
      if (querySnapshot.empty) {
        console.log(`Collection ${collectionName} is empty, trying next...`);
        continue; // Try next collection name
      }
      
      const products = querySnapshot.docs.map(doc => {
        const data = doc.data();
        // Log first product structure for debugging
        if (querySnapshot.docs.indexOf(doc) === 0) {
          console.log('Sample HIM product structure:', {
            id: doc.id,
            fields: Object.keys(data),
            title: data.title,
            name: data.name,
            price: data.price,
            img: data.img,
            images: data.images,
            active: data.active,
            gender: data.gender
          });
        }
        return {
          id: doc.id,
          ...data
        };
      }) as Product[];
      
      // Filter for active products only if the field exists in some products
      let activeProducts = products;
      const hasActiveField = products.some(p => p.active !== undefined);
      
      if (hasActiveField) {
        // Filter: include products where active is true, 1, or not set
        activeProducts = products.filter(product => {
          const active = product.active;
          // Include if active is true, 1, or undefined/null
          return active === true || active === 1 || active === undefined || active === null;
        });
        console.log(`After filtering by active: ${activeProducts.length} products`);
      } else {
        console.log('No active field found, returning all products');
      }
      
      // Filter by gender if gender field exists (optional - can remove if you want all products)
      let genderProducts = activeProducts;
      const hasGenderField = activeProducts.some(p => p.gender !== undefined);
      
      if (hasGenderField) {
        // Try to filter for "him" products, but if no gender field or gender doesn't match, include all
        genderProducts = activeProducts.filter(product => {
          const gender = product.gender;
          // Include if gender is "him" or "unisex", or if gender field doesn't exist
          return !gender || gender === 'him' || gender === 'unisex' || gender === undefined;
        });
        console.log(`After filtering by gender: ${genderProducts.length} products`);
      } else {
        console.log('No gender field found, returning all active products');
      }
      
      // Sort by created_at or updated_at if available
      genderProducts.sort((a, b) => {
        const aDate = (a.created_at as number) || (a.updated_at as number) || 0;
        const bDate = (b.created_at as number) || (b.updated_at as number) || 0;
        return bDate - aDate;
      });
      
      // Limit to requested number
      const result = genderProducts.slice(0, maxResults);
      console.log(`✓ Returning ${result.length} HIM products`);
      
      if (result.length > 0) {
        return result;
      }
    } catch (error: any) {
      console.error(`Error fetching HIM products from ${collectionName}:`, error);
      // If it's a permissions error or collection doesn't exist, try next
      if (error?.code === 'permission-denied' || error?.code === 'not-found') {
        console.log(`Collection ${collectionName} not accessible, trying next...`);
        continue;
      }
      // For other errors, try the fallback
      break;
    }
  }
  
  // If all collection names failed, try a very basic query as last resort
  console.log('All collection name attempts failed for HIM products, trying basic query...');
  try {
    const basicQuery = query(collection(db, 'T_products'), firestoreLimit(20));
    const snapshot = await getDocs(basicQuery);
    const products = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Product[];
    console.log(`Fallback query found ${products.length} products`);
    return products;
  } catch (fallbackError: any) {
    console.error('Fallback query also failed:', fallbackError);
    console.error('Error details:', {
      code: fallbackError?.code,
      message: fallbackError?.message
    });
    return [];
  }
}

/**
 * Get products by category
 */
export async function getProductsByCategory(categoryId: string, maxResults: number = 50): Promise<Product[]> {
  try {
    const constraints: QueryConstraint[] = [];
    
    constraints.push(where('category_id', '==', categoryId));
    constraints.push(where('active', 'in', [true, 1]));
    constraints.push(orderBy('created_at', 'desc'));
    constraints.push(firestoreLimit(maxResults));
    
    const productsQuery = query(collection(db, 'T_products'), ...constraints);
    const querySnapshot = await getDocs(productsQuery);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Product[];
  } catch (error) {
    console.error('Error fetching products by category:', error);
    return [];
  }
}

/**
 * Get a single product by ID
 */
export async function getProductById(productId: string): Promise<Product | null> {
  try {
    const { getDoc, doc } = await import('firebase/firestore');
    const productDoc = await getDoc(doc(db, 'T_products', productId));
    
    if (productDoc.exists()) {
      return {
        id: productDoc.id,
        ...productDoc.data()
      } as Product;
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching product by ID:', error);
    return null;
  }
}

// Export helper functions
export { getProductName, getProductDescription, getProductImage };

