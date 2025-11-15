/**
 * Extra Groups and Values Read Operations
 * 
 * This file contains all READ operations related to extra groups and extra values
 */

import { collection, doc, getDoc, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../app/db';

// ============================================
// INTERFACES
// ============================================

interface ExtraGroupTranslation {
  id: string;
  locale: string;
  title: string;
}

interface ExtraGroupQueryParams {
  params?: {
    status?: string;
    lang?: string;
    [key: string]: unknown;
  };
}

export interface ExtraGroup {
  id: string;
  uuid: string;
  type: string;
  active: boolean;
  created_at: number;
  updated_at: number;
  shop: unknown;
  title: string;
  translation: {
    id: string;
    locale: string;
    title: string;
  };
  translations: Array<{
    id: string;
    locale: string;
    title: string;
  }>;
  locales: string[];
}

export interface ExtraValue {
  id: string;
  uuid: string;
  extra_group_id: string;
  value: string;
  active: boolean;
  group?: unknown;
  created_at: number;
  updated_at: number;
}

interface ExtraValueQueryParams {
  params?: {
    status?: string;
    [key: string]: unknown;
  };
}

// ============================================
// EXTRA GROUP READ OPERATIONS
// ============================================

/**
 * Get all extra groups with multilingual support
 */
export const getAllExtraGroups = async (orgId = '', params: ExtraGroupQueryParams = {}) => {
  const filesQuery = query(
    collection(db, 'T_extra_groups'),
    // where('status', '==', params?.params?.status || 'published'),
  );
  const querySnapshot = await getDocs(filesQuery);
  const files = querySnapshot.docs.map((docSnap) => {
    const x = docSnap.data();
    x.id = docSnap.id;
    x.uuid = docSnap.id;
    if (!x.title && x.translations && x.translations.length > 0) {
      const preferredLang = params?.params?.lang || 'en';
      const preferredTranslation = x.translations.find((t: ExtraGroupTranslation) => t.locale === preferredLang);
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
        { url: "https://single-api.foodyman.org/api/v1/dashboard/admin/T_extra_groups/paginate?page=1", label: "1", active: true },
        { url: null, label: "Next »", active: false }
      ],
      path: "https://single-api.foodyman.org/api/v1/dashboard/admin/T_extra_groups/paginate",
      per_page: "1000",
      to: files.length,
      total: files.length
    }
  };
};

/**
 * Get extra group by ID with multilingual display
 */
export const getAllExtraGroupsById = async (orgId = '', uid: string, payload: ExtraGroupQueryParams = {}) => {
  const docRef = doc(db, 'T_extra_groups', uid);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists() && docSnap.data()) {
    const x = docSnap.data();
    x.id = docSnap.id;
    x.uuid = docSnap.id;
    if (!x.title && x.translations && x.translations.length > 0) {
      const preferredLang = payload?.params?.lang || 'en';
      const preferredTranslation = x.translations.find((t: ExtraGroupTranslation) => t.locale === preferredLang);
      if (preferredTranslation) {
        x.title = preferredTranslation.title;
      } else {
        x.title = x.translations[0].title;
      }
    }
    return { data: x };
  } else {
    return { data: null };
  }
};

// ============================================
// EXTRA VALUE READ OPERATIONS
// ============================================

/**
 * Get all extra values
 */
export const getAllExtraValues = async (orgId = '', params: ExtraValueQueryParams = {}) => {
  const filesQuery = query(
    collection(db, 'T_extra_values'),
    // where('status', '==', params?.params?.status || 'published'),
  );
  const querySnapshot = await getDocs(filesQuery);
  const files = querySnapshot.docs.map((docSnap) => {
    const x = docSnap.data();
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
        { url: "https://single-api.foodyman.org/api/v1/dashboard/admin/T_extra_values/paginate?page=1", label: "1", active: true },
        { url: null, label: "Next »", active: false }
      ],
      path: "https://single-api.foodyman.org/api/v1/dashboard/admin/T_extra_values/paginate",
      per_page: "1000",
      to: files.length,
      total: files.length
    }
  };
};

/**
 * Get extra value by ID
 */
export const getAllExtraValuesById = async (orgId = '', uid: string, payload: ExtraValueQueryParams = {}) => {
  const docRef = doc(db, 'T_extra_values', uid);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists() && docSnap.data()) {
    const x = docSnap.data();
    x.id = docSnap.id;
    x.uuid = docSnap.id;
    return { data: x };
  } else {
    return { data: null };
  }
};

/**
 * Get active extra groups (legacy function)
 */
export const ExtrasGroupsDb = async (url: string, params: unknown) => {
  const extrasCollectionRef = collection(db, 'T_extras_groups');
  const extrasQuery = query(extrasCollectionRef, where('active', '==', 1));
  const querySnapshot = await getDocs(extrasQuery);
  const extrasData = querySnapshot.docs.map((doc) => {
    const data = doc.data();
    data.id = doc.id;
    return data;
  });
  return { data: extrasData };
};

