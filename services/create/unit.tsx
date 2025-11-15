/**
 * Unit Create Operations
 * 
 * This file contains all CREATE operations related to units
 */

import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '../../app/db';
import { v4 as uuidv4 } from 'uuid';

// ============================================
// INTERFACES
// ============================================

export interface Unit {
  id: string;
  uuid: string;
  title: Record<string, string>;
  active: boolean;
  position?: string;
  created_at?: number;
  updated_at?: number;
  locales?: string[];
  [key: string]: unknown;
}

// ============================================
// UNIT CREATE OPERATIONS
// ============================================

/**
 * Create unit with multilingual support
 */
export const createUnitsDb = async (orgId: string, payload: { params: Record<string, unknown> }) => {
  const filesCollectionRef = collection(db, 'T_unit');
  const myId = uuidv4();
  const params = payload.params;
  const translations: Array<{ locale: string; title: string }> = [];
  const locales: string[] = [];
  const titleData: Record<string, string> = {};
  
  Object.keys(params).forEach(key => {
    const match = key.match(/^title\[(.*)\]$/);
    if (match && match[1] && params[key] !== undefined && params[key].toString().trim() !== '') {
      const locale = match[1];
      titleData[locale] = params[key] as string;
      translations.push({
        locale: locale,
        title: params[key] as string
      });
      if (!locales.includes(locale)) {
        locales.push(locale);
      }
    }
  });
  
  if (locales.length === 0) {
    locales.push('en');
  }
  
  const primaryLocale = locales[0];
  const primaryTitle = titleData[primaryLocale] || '';
  
  const input = {
    id: myId,
    active: (params.active === true || params.active === 1 || params.active === '1') ? 1 : 0,
    position: params.position as string || 'after',
    created_at: Timestamp.now().toMillis(),
    updated_at: Timestamp.now().toMillis(),
    title: titleData,
    translations: translations,
    translation: {
      id: myId,
      locale: primaryLocale,
      title: primaryTitle,
    },
    locales: locales,
  };
  
  const docRef = await addDoc(filesCollectionRef, input);
  return docRef.id;
};

