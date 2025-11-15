/**
 * Kitchen Create Operations
 * 
 * This file contains all CREATE operations related to kitchens
 */

import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '../../app/db';
import { v4 as uuidv4 } from 'uuid';

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
// KITCHEN CREATE OPERATIONS
// ============================================

/**
 * Create kitchen with multilingual support
 */
export const createKitchenDb = async (orgId: string, payload: { params: Record<string, unknown> }) => {
  const filesCollectionRef = collection(db, 'T_kitchen');
  const myId = uuidv4();
  const params = payload.params;
  const titleData: Record<string, string> = {};
  const descriptionData: Record<string, string> = {};
  const translations: Array<{ id: string; locale: string; title: string; description: string }> = [];
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
        id: myId,
        locale: locale,
        title: hasTitle ? titleData[locale] : "",
        description: hasDescription ? descriptionData[locale] : ""
      });
    }
  });
  
  const primaryLocale = locales[0];
  const primaryTitle = titleData[primaryLocale] || '';
  const primaryDescription = descriptionData[primaryLocale] || '';
  
  const input = {
    id: myId,
    active: (params.active === true || (typeof params.active === 'number' && params.active === 1)) ? 1 : 0,
    created_at: Timestamp.now().toMillis(),
    updated_at: Timestamp.now().toMillis(),
    title: titleData,
    description: descriptionData,
    translations: translations,
    translation: {
      id: myId,
      locale: primaryLocale,
      title: primaryTitle,
      description: primaryDescription
    },
    locales: locales,
    shop_id: params.shop_id as string,
  };
  
  const docRef = await addDoc(filesCollectionRef, input);
  return {
    id: docRef.id,
    active: input.active === 1,
    shop_id: input.shop_id,
    translation: {
      id: docRef.id,
      locale: input.translation.locale,
      title: input.translation.title,
      description: input.translation.description
    },
    locales: input.locales,
    created_at: input.created_at,
    updated_at: input.updated_at
  };
};

