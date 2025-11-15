/**
 * Sub-Category Read Operations
 * 
 * This file contains all READ operations related to sub-categories
 */

import { collection, doc, getDoc, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../app/db';

// ============================================
// INTERFACES
// ============================================

interface SubCategoryTranslation {
  id: string;
  locale: string;
  title: string;
  description: string;
}

interface SubCategoryQueryParams {
  params?: {
    status?: string;
    lang?: string;
    category_id?: string;
    [key: string]: unknown;
  };
}

// ============================================
// SUB-CATEGORY READ OPERATIONS
// ============================================

/**
 * Get all sub-categories with multilingual support and optional filtering
 */
export const getAllSubCategories = async (orgId = '', params: SubCategoryQueryParams = {}) => {
  const constraints = [];
  
  // Filter by category if specified
  if (params?.params?.category_id && params.params.category_id !== 'undefined' && params.params.category_id !== '') {
    constraints.push(where('category_id', '==', params.params.category_id));
  }
  
  const filesQuery = query(
    collection(db, `p_subcategory`),
    ...constraints
  );
  
  const querySnapshot = await getDocs(filesQuery);
  const files = querySnapshot.docs.map((docSnap) => {
    const x = docSnap.data();
    x.id = docSnap.id;
    x.uuid = docSnap.id;
    if (!x.title && x.translations && x.translations.length > 0) {
      const preferredLang = params?.params?.lang || 'en';
      const preferredTranslation = x.translations.find((t: SubCategoryTranslation) => t.locale === preferredLang);
      if (preferredTranslation) {
        x.title = preferredTranslation.title;
      } else {
        x.title = x.translations[0].title;
      }
    }
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
        { url: "https://single-api.foodyman.org/api/v1/dashboard/admin/subcategories/paginate?page=1", label: "1", active: true },
        { url: null, label: "Next »", active: false }
      ],
      path: "https://single-api.foodyman.org/api/v1/dashboard/admin/subcategories/paginate",
      per_page: "1000",
      to: files.length,
      total: files.length
    }
  };
};

/**
 * Get sub-category by ID with multilingual display
 */
export const getAllSubCategoriesById = async (orgId = '', uid: string, payload: SubCategoryQueryParams = {}) => {
  const docRef = doc(db, `p_subcategory`, uid);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists() && docSnap.data()) {
    const x = docSnap.data();
    x.id = docSnap.id;
    x.uuid = docSnap.id;
    x.img = x['images[0]'] || x.img;
    if (!x.title && x.translations && x.translations.length > 0) {
      const preferredLang = payload?.params?.lang || 'en';
      const preferredTranslation = x.translations.find((t: SubCategoryTranslation) => t.locale === preferredLang);
      if (preferredTranslation) {
        x.title = preferredTranslation.title;
        x.description = preferredTranslation.description;
      } else {
        x.title = x.translations[0].title;
        x.description = x.translations[0].description;
      }
    }
    return { data: x };
  } else {
    return { data: null };
  }
};

