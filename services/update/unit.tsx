/**
 * Unit Update Operations
 * 
 * This file contains all UPDATE operations related to units
 */

import { doc, updateDoc, getDoc, Timestamp } from 'firebase/firestore';
import { db } from '../../app/db';

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
// UNIT UPDATE OPERATIONS
// ============================================

/**
 * Update unit with multilingual support
 */
export const updateUnits = async (uid: string, params: Record<string, unknown>) => {
  const titleData: Record<string, string> = {};
  const translations: Array<{ locale: string; title: string }> = [];
  const locales: string[] = [];
  
  Object.keys(params).forEach(key => {
    const match = key.match(/^title\[(.*)\]$/);
    if (match && match[1] && params[key] !== undefined) {
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
  
  const updateData: Record<string, unknown> = {
    position: params.position,
    active: params.active === true || params.active === 1 ? 1 : 0,
    updated_at: Timestamp.now().toMillis(),
    locales: locales.length > 0 ? locales : ['en']
  };
  
  if (Object.keys(titleData).length > 0) {
    updateData.title = titleData;
    updateData.translations = translations;
    if (translations.length > 0) {
      updateData.translation = {
        locale: translations[0].locale,
        title: translations[0].title
      };
    }
  }
  
  await updateDoc(doc(db, `T_unit`, uid), updateData);
  return { success: true };
};

/**
 * Set active status for unit
 */
export const setActiveUnits = async (id: string) => {
  const unitId = id.includes('/') ? id.split('/').pop() : id;
  const docRef = doc(db, 'T_unit', unitId!);
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) {
    throw new Error(`Unit with ID ${unitId} not found`);
  }
  const unitData = docSnap.data() as Unit;
  const currentActive = (typeof unitData.active === 'number' && unitData.active === 1) || unitData.active === true;
  const newActive = !currentActive;
  await updateDoc(docRef, {
    active: newActive ? 1 : 0,
    updated_at: Timestamp.now().toMillis()
  });
  return {
    timestamp: new Date().toISOString(),
    status: true,
    data: {
      id: unitId,
      active: newActive,
      position: unitData.position || "before",
      created_at: Timestamp.now().toMillis(),
      updated_at: Timestamp.now().toMillis(),
      locales: unitData.locales || ["en"]
    }
  };
};

