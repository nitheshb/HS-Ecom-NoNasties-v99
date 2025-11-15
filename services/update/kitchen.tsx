/**
 * Kitchen Update Operations
 * 
 * This file contains all UPDATE operations related to kitchens
 */

import { doc, updateDoc, getDoc, Timestamp } from 'firebase/firestore';
import { db } from '../../app/db';

// ============================================
// INTERFACES
// ============================================

export interface Kitchen {
  id: string;
  uuid: string;
  title: Record<string, string>;
  description?: Record<string, string>;
  active: boolean;
  created_at?: number;
  updated_at?: number;
  locales?: string[];
  shop_id?: string;
  [key: string]: unknown;
}

// ============================================
// KITCHEN UPDATE OPERATIONS
// ============================================

/**
 * Update kitchen with multilingual support
 */
export const updateKitchen = async (uid: string, payload: { params: Record<string, unknown> }) => {
  const params = payload.params;
  const titleData: Record<string, string> = {};
  const descriptionData: Record<string, string> = {};
  const translations: Array<{ locale: string; title: string; description: string }> = [];
  const locales: string[] = [];
  
  if (typeof params.title === 'object' && params.title !== null) {
    Object.keys(params.title as Record<string, string>).forEach(locale => {
      const value = (params.title as Record<string, string>)[locale];
      if (value !== undefined && value !== null && value.trim() !== '') {
        titleData[locale] = value;
        if (!locales.includes(locale)) {
          locales.push(locale);
        }
      }
    });
  }
  
  if (typeof params.description === 'object' && params.description !== null) {
    Object.keys(params.description as Record<string, string>).forEach(locale => {
      const value = (params.description as Record<string, string>)[locale];
      if (value !== undefined && value !== null && value.trim() !== '') {
        descriptionData[locale] = value;
        if (!locales.includes(locale)) {
          locales.push(locale);
        }
      }
    });
  }
  
  Object.keys(params).forEach(key => {
    const titleMatch = key.match(/^title\[(.*)\]$/);
    const descriptionMatch = key.match(/^description\[(.*)\]$/);
    if (titleMatch && titleMatch[1]) {
      const locale = titleMatch[1];
      const value = params[key] as string;
      if (value !== undefined && value !== null && value.trim() !== '') {
        titleData[locale] = value;
        if (!locales.includes(locale)) {
          locales.push(locale);
        }
      }
    }
    if (descriptionMatch && descriptionMatch[1]) {
      const locale = descriptionMatch[1];
      const value = params[key] as string;
      if (value !== undefined && value !== null && value.trim() !== '') {
        descriptionData[locale] = value;
        if (!locales.includes(locale)) {
          locales.push(locale);
        }
      }
    }
  });
  
  if (locales.length === 0) {
    locales.push('en');
  }
  
  locales.forEach(locale => {
    const hasTitle = locale in titleData;
    const hasDescription = locale in descriptionData;
    if (hasTitle || hasDescription) {
      translations.push({
        locale: locale,
        title: hasTitle ? titleData[locale] : "",
        description: hasDescription ? descriptionData[locale] : ""
      });
    }
  });
  
  const updateData: Record<string, unknown> = {
    active: (params.active === true || (typeof params.active === 'number' && params.active === 1)) ? 1 : 0,
    updated_at: Timestamp.now().toMillis(),
    locales: locales,
    shop_id: params.shop_id as string,
  };
  
  if (Object.keys(titleData).length > 0) {
    updateData.title = titleData;
  }
  if (Object.keys(descriptionData).length > 0) {
    updateData.description = descriptionData;
  }
  if (translations.length > 0) {
    updateData.translations = translations;
    updateData.translation = {
      locale: translations[0].locale,
      title: translations[0].title || "",
      description: translations[0].description || ""
    };
  }
  
  await updateDoc(doc(db, `T_kitchen`, uid), updateData);
  return { success: true };
};

/**
 * Set active status for kitchen
 */
export const setActiveKitchen = async (id: string) => {
  const kitchenId = id.includes('/') ? id.split('/').pop() : id;
  const docRef = doc(db, 'T_kitchen', kitchenId!);
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) {
    throw new Error(`Kitchen with ID ${kitchenId} not found`);
  }
  const kitchenData = docSnap.data() as Kitchen;
  const currentActive = (typeof kitchenData.active === 'number' && kitchenData.active === 1) || kitchenData.active === true;
  const newActive = !currentActive;
  await updateDoc(docRef, {
    active: newActive ? 1 : 0,
    updated_at: Timestamp.now().toMillis()
  });
  return {
    timestamp: new Date().toISOString(),
    status: true,
    data: {
      id: kitchenId,
      active: newActive,
      position: kitchenData.position || "before",
      created_at: Timestamp.now().toMillis(),
      updated_at: Timestamp.now().toMillis(),
      locales: kitchenData.locales || ["en"]
    }
  };
};

