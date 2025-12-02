/**
 * Brand Read Operations
 * 
 * This file contains all READ operations related to brands
 */

import { collection, doc, getDoc, getDocs, query } from 'firebase/firestore';
import { db } from '../../app/db';

// ============================================
// INTERFACES
// ============================================

export interface Brand {
  id: string;
  uuid: string;
  title: string;
  active: boolean;
  img?: string;
  products_count?: number;
  created_at?: number;
  updated_at?: number;
  [key: string]: unknown;
}

// ============================================
// BRAND READ OPERATIONS
// ============================================

/**
 * Get all brands
 */
export const getAllBrands = async (orgId: string, params: { params?: { status?: string } }) => {
  const filesQuery = query(collection(db, `P_brands`));
  const querySnapshot = await getDocs(filesQuery);
  const files: Brand[] = querySnapshot.docs.map((docSnap) => {
    const x = docSnap.data() as Brand;
    x.id = docSnap.id;
    x.uuid = docSnap.id;
    return x;
  });
  return {
    data: files,
    meta: {
      current_page: 1,
      from: 1,
      last_page: 1,
      links: [
        { url: null, label: "« Previous", active: false },
        { url: "https://single-api.foodyman.org/api/v1/dashboard/admin/brands/paginate?page=1", label: "1", active: true },
        { url: null, label: "Next »", active: false }
      ],
      path: "https://single-api.foodyman.org/api/v1/dashboard/admin/brands/paginate",
      per_page: "1000",
      to: files.length,
      total: files.length
    }
  };
};

/**
 * Get brand by ID
 */
export const getAllBrandsById = async (orgId: string, uid: string, payload?: unknown) => {
  const docRef = doc(db, `P_brands`, uid);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists() && docSnap.data()) {
    const x = docSnap.data() as Brand;
    x.id = docSnap.id;
    x.uuid = docSnap.id;
    const anyX = x as Record<string, unknown>;
    const firstImage = anyX['images[0]'];
    if (typeof firstImage === 'string' && firstImage) {
      x.img = firstImage;
    }
    return { data: x };
  } else {
    return { data: null };
  }
};

/**
 * Search brands
 */
export const searchByBrand = async (searchTerm: string) => {
  const filesQuery = query(collection(db, `P_brands`));
  const querySnapshot = await getDocs(filesQuery);
  const allBrands: Brand[] = querySnapshot.docs.map((docSnap) => {
    const x = docSnap.data() as Brand;
    x.id = docSnap.id;
    x.uuid = docSnap.id;
    return x;
  });
  
  const filteredBrands = searchTerm
    ? allBrands.filter((brand) =>
        brand.title?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : allBrands;
  
  return {
    data: filteredBrands,
    meta: {
      current_page: 1,
      from: 1,
      last_page: 1,
      to: filteredBrands.length,
      total: filteredBrands.length
    }
  };
};

