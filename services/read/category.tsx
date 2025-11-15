/**
 * Category Read Operations
 * 
 * This file contains all READ operations related to categories
 */

import { collection, doc, getDoc, getDocs, query } from 'firebase/firestore';
import { db } from '../../app/db';

// ============================================
// INTERFACES
// ============================================

interface CategoryTranslation {
  id: string;
  locale: string;
  title: string;
  description: string;
}

interface CategoryQueryParams {
  params?: {
    status?: string;
    lang?: string;
    [key: string]: unknown;
  };
}

// ============================================
// CATEGORY READ OPERATIONS
// ============================================

/**
 * Get all categories with multilingual support
 */
export const getAllCategories = async (orgId = '', params: CategoryQueryParams = {}) => {
  const filesQuery = query(
    collection(db, `p_category`),
    // where('status', '==', params?.params?.status || 'published'),
  );
  const querySnapshot = await getDocs(filesQuery);
  const files = querySnapshot.docs.map((docSnap) => {
    const x = docSnap.data();
    x.id = docSnap.id;
    x.uuid = docSnap.id;
    if (!x.title && x.translations && x.translations.length > 0) {
      const preferredLang = params?.params?.lang || 'en';
      const preferredTranslation = x.translations.find((t: CategoryTranslation) => t.locale === preferredLang);
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
 * Get category by ID with multilingual display
 */
export const getAllCategoriesById = async (orgId = '', uid: string, payload: CategoryQueryParams = {}) => {
  const docRef = doc(db, `p_category`, uid);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists() && docSnap.data()) {
    const x = docSnap.data();
    x.id = docSnap.id;
    x.uuid = docSnap.id;
    
    // Handle multilingual title
    if (!x.title && x.translations && x.translations.length > 0) {
      const preferredLang = payload?.params?.lang || 'en';
      const preferredTranslation = x.translations.find((t: CategoryTranslation) => t.locale === preferredLang);
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

